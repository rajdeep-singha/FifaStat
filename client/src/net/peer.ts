// Peer-to-peer multiplayer with NO backend to deploy. PeerJS uses a free public
// broker only for the initial handshake (signaling); all game data flows
// directly browser-to-browser over WebRTC. The host is the authoritative game
// engine (mirrors the old Go ws/hub.go + round_resolver); the guest is a thin
// client, exactly like the previous WebSocket client.
import Peer, { type DataConnection } from 'peerjs';
import type { Card, StatKey, RoundResult } from '../types';
import { dealHands, resolveRound, checkGameOver, type Choice } from '../game/engine';

const PREFIX = 'cardclash-'; // namespaces our ids on the shared public broker

export interface PeerDispatch {
  onRoomReady: () => void;
  onDealHand: (hand: Card[], slot: number) => void;
  onOpponentReady: () => void;
  onRoundResult: (result: RoundResult, p1Score: number, p2Score: number) => void;
  onGameOver: (winnerSlot: number, p1Score: number, p2Score: number) => void;
  onError: (msg: string) => void;
}

type WireMessage =
  | { type: 'room_ready' }
  | { type: 'deal_hand'; payload: { hand: Card[]; player_slot: number } }
  | { type: 'submit_choice'; payload: { card_id: string; stat_key: StatKey } }
  | { type: 'round_result'; payload: { result: RoundResult; p1_score: number; p2_score: number } }
  | { type: 'game_over'; payload: { winner_slot: number; final_p1_score: number; final_p2_score: number } };

function shortCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

class PeerNet {
  private peer?: Peer;
  private conn?: DataConnection;
  private dispatch?: PeerDispatch;
  isHost = false;
  roomCode = '';

  // Authoritative state (host only)
  private pool: Card[] = [];
  private p1Hand: Card[] = [];
  private p2Hand: Card[] = [];
  private p1Score = 0;
  private p2Score = 0;
  private round = 1;
  private p1Choice?: Choice;
  private p2Choice?: Choice;

  setDispatch(d: PeerDispatch) {
    this.dispatch = d;
  }

  /** Create a room. Returns the short code to share. Resolves once the broker is ready. */
  host(pool: Card[]): Promise<string> {
    this.cleanup();
    this.isHost = true;
    this.pool = pool;

    return new Promise((resolve, reject) => {
      const tryOpen = (attempt: number) => {
        const code = shortCode();
        const peer = new Peer(PREFIX + code);
        this.peer = peer;

        peer.on('open', () => {
          this.roomCode = code;
          resolve(code);
        });

        peer.on('connection', (conn) => {
          this.conn = conn;
          conn.on('open', () => this.startMatch());
          conn.on('data', (d) => this.handleHostData(d as WireMessage));
          conn.on('close', () => this.dispatch?.onError('Opponent disconnected'));
        });

        peer.on('error', (err) => {
          // id already taken on the shared broker -> retry with a new code
          if (err.type === 'unavailable-id' && attempt < 5) {
            peer.destroy();
            tryOpen(attempt + 1);
          } else if (attempt >= 5) {
            reject(err);
          } else {
            this.dispatch?.onError(err.message || 'Connection error');
          }
        });
      };
      tryOpen(0);
    });
  }

  /** Join an existing room by its short code. */
  join(code: string) {
    this.cleanup();
    this.isHost = false;
    this.roomCode = code.toUpperCase();

    const peer = new Peer();
    this.peer = peer;

    peer.on('open', () => {
      const conn = peer.connect(PREFIX + this.roomCode, { reliable: true });
      this.conn = conn;
      conn.on('open', () => this.dispatch?.onOpponentReady());
      conn.on('data', (d) => this.handleGuestData(d as WireMessage));
      conn.on('close', () => this.dispatch?.onError('Host disconnected'));
      conn.on('error', () => this.dispatch?.onError('Could not reach room ' + this.roomCode));
    });

    peer.on('error', (err) => {
      this.dispatch?.onError(
        err.type === 'peer-unavailable' ? `Room ${this.roomCode} not found` : err.message,
      );
    });
  }

  /** Local player picks a card+stat. Host resolves locally; guest sends to host. */
  submitChoice(cardId: string, statKey: StatKey) {
    if (this.isHost) {
      this.p1Choice = { cardId, statKey };
      this.tryResolve();
    } else {
      this.send({ type: 'submit_choice', payload: { card_id: cardId, stat_key: statKey } });
    }
  }

  disconnect() {
    this.cleanup();
  }

  // ---- host authoritative logic ----

  private startMatch() {
    const { p1, p2 } = dealHands(this.pool);
    this.p1Hand = p1;
    this.p2Hand = p2;
    this.p1Score = 0;
    this.p2Score = 0;
    this.round = 1;
    this.p1Choice = undefined;
    this.p2Choice = undefined;

    // Tell the guest, then deal both sides.
    this.send({ type: 'room_ready' });
    this.send({ type: 'deal_hand', payload: { hand: p2, player_slot: 2 } });

    // Host's own (local) view:
    this.dispatch?.onRoomReady();
    this.dispatch?.onOpponentReady();
    this.dispatch?.onDealHand(p1, 1);
  }

  private handleHostData(msg: WireMessage) {
    if (msg.type === 'submit_choice') {
      this.p2Choice = { cardId: msg.payload.card_id, statKey: msg.payload.stat_key };
      this.tryResolve();
    }
  }

  private tryResolve() {
    if (!this.p1Choice || !this.p2Choice) return;

    const p1Card = this.p1Hand.find((c) => c.id === this.p1Choice!.cardId);
    const p2Card = this.p2Hand.find((c) => c.id === this.p2Choice!.cardId);
    if (!p1Card || !p2Card) return;

    const result = resolveRound(p1Card, p2Card, this.p1Choice, this.p2Choice, this.round);
    if (result.winner_player === 1) this.p1Score += 1;
    else if (result.winner_player === 2) this.p2Score += 1;

    // Broadcast + apply locally
    this.send({ type: 'round_result', payload: { result, p1_score: this.p1Score, p2_score: this.p2Score } });
    this.dispatch?.onRoundResult(result, this.p1Score, this.p2Score);

    const winner = checkGameOver(this.p1Score, this.p2Score, this.round);
    this.p1Choice = undefined;
    this.p2Choice = undefined;
    this.round += 1;

    if (winner !== null) {
      // delay so the final round-result overlay shows before the end screen
      const p1 = this.p1Score, p2 = this.p2Score;
      setTimeout(() => {
        this.send({ type: 'game_over', payload: { winner_slot: winner, final_p1_score: p1, final_p2_score: p2 } });
        this.dispatch?.onGameOver(winner, p1, p2);
      }, 2900);
    }
  }

  // ---- guest thin-client logic ----

  private handleGuestData(msg: WireMessage) {
    switch (msg.type) {
      case 'room_ready':
        this.dispatch?.onRoomReady();
        break;
      case 'deal_hand':
        this.dispatch?.onDealHand(msg.payload.hand, msg.payload.player_slot);
        break;
      case 'round_result':
        this.dispatch?.onRoundResult(msg.payload.result, msg.payload.p1_score, msg.payload.p2_score);
        break;
      case 'game_over':
        this.dispatch?.onGameOver(msg.payload.winner_slot, msg.payload.final_p1_score, msg.payload.final_p2_score);
        break;
    }
  }

  private send(msg: WireMessage) {
    if (this.conn?.open) this.conn.send(msg);
  }

  private cleanup() {
    this.conn?.close();
    this.peer?.destroy();
    this.conn = undefined;
    this.peer = undefined;
  }
}

export const peerNet = new PeerNet();
