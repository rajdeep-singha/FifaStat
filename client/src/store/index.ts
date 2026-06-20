import { create } from 'zustand';
import { type Card, type GameState, type GameStatus, type StatKey, type RoundResult } from '../types';

interface Store {
  demoCards: Card[];
  isLoadingDemo: boolean;
  fetchDemoCards: () => Promise<void>;

  game: GameState;
  setRoomId: (id: string) => void;
  setPlayerSlot: (slot: number) => void;
  dealHand: (hand: Card[], slot: number) => void;
  selectCard: (card: Card) => void;
  selectStat: (stat: StatKey) => void;
  applyRoundResult: (result: RoundResult, p1Score: number, p2Score: number) => void;
  setGameStatus: (status: GameStatus) => void;
  setOpponentReady: () => void;
  setGameOver: (winnerSlot: number, transferredCard: Card | null, p1Score: number, p2Score: number) => void;
  resetGame: () => void;

  ws: WebSocket | null;
  connectWS: (roomId: string) => void;
  disconnectWS: () => void;
  sendChoice: (cardId: string, statKey: string) => void;

  error: string | null;
  setError: (msg: string | null) => void;
}

const initialGame: GameState = {
  roomId: null,
  playerSlot: 1,
  hand: [],
  opponentCardCount: 5,
  p1Score: 0,
  p2Score: 0,
  currentRound: 1,
  rounds: [],
  status: 'idle',
  selectedCard: null,
  selectedStat: null,
  lastResult: null,
  opponentPosition: null,
  winnerSlot: null,
  transferredCard: null,
};

export const useStore = create<Store>((set, get) => ({
  demoCards: [],
  isLoadingDemo: false,
  error: null,

  fetchDemoCards: async () => {
    set({ isLoadingDemo: true });
    try {
      const res = await fetch('http://localhost:8080/api/cards/demo');
      const data = await res.json();
      set({ demoCards: data.cards || [], isLoadingDemo: false });
    } catch {
      set({ isLoadingDemo: false, error: 'Failed to load cards' });
    }
  },

  game: initialGame,

  setRoomId: (id) => set((s) => ({ game: { ...s.game, roomId: id } })),
  setPlayerSlot: (slot) => set((s) => ({ game: { ...s.game, playerSlot: slot } })),

  dealHand: (hand, slot) =>
    set((s) => ({
      game: {
        ...s.game,
        hand,
        playerSlot: slot,
        status: 'choosing',
        opponentCardCount: 5,
      },
    })),

  selectCard: (card) => set((s) => ({ game: { ...s.game, selectedCard: card } })),

  selectStat: (stat) => {
    const { game, sendChoice } = get();
    set((s) => ({ game: { ...s.game, selectedStat: stat, status: 'waiting_choice' } }));
    if (game.selectedCard) {
      sendChoice(game.selectedCard.id, stat);
    }
  },

  applyRoundResult: (result, p1Score, p2Score) =>
    set((s) => ({
      game: {
        ...s.game,
        lastResult: result,
        p1Score,
        p2Score,
        currentRound: s.game.currentRound + 1,
        rounds: [...s.game.rounds, result],
        selectedCard: null,
        selectedStat: null,
        status: 'resolving',
      },
    })),

  setGameStatus: (status) => set((s) => ({ game: { ...s.game, status } })),

  setOpponentReady: () =>
    set((s) => ({
      game: {
        ...s.game,
        status: s.game.status === 'idle' ? 'waiting_opponent' : s.game.status,
      },
    })),

  setGameOver: (winnerSlot, transferredCard, p1Score, p2Score) =>
    set((s) => ({
      game: {
        ...s.game,
        status: 'finished',
        winnerSlot,
        transferredCard,
        p1Score,
        p2Score,
      },
    })),

  resetGame: () => set({ game: initialGame }),
  setError: (msg) => set({ error: msg }),

  ws: null,

  connectWS: (roomId) => {
    const existing = get().ws;
    if (existing) existing.close();

    const ws = new WebSocket(`ws://localhost:8080/ws?room_id=${roomId}`);

    ws.onopen = () => console.log('WS connected');

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        const { dealHand, applyRoundResult, setGameStatus, setOpponentReady, setGameOver, setError } = get();
        switch (msg.type) {
          case 'room_ready':
            setGameStatus('dealing');
            break;
          case 'deal_hand':
            dealHand(msg.payload.hand, msg.payload.player_slot);
            break;
          case 'opponent_ready':
            setOpponentReady();
            break;
          case 'round_result':
            applyRoundResult(msg.payload.result, msg.payload.p1_score, msg.payload.p2_score);
            break;
          case 'game_over':
            setGameOver(
              msg.payload.winner_slot,
              msg.payload.transferred_card || null,
              msg.payload.final_p1_score,
              msg.payload.final_p2_score
            );
            break;
          case 'error':
            setError(msg.payload.message);
            break;
        }
      } catch (e) {
        console.error('WS parse error', e);
      }
    };

    ws.onclose = () => {
      console.log('WS disconnected');
      set({ ws: null });
    };

    ws.onerror = (e) => console.error('WS error', e);

    set({ ws });
  },

  disconnectWS: () => {
    get().ws?.close();
    set({ ws: null });
  },

  sendChoice: (cardId, statKey) => {
    const ws = get().ws;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'submit_choice', payload: { card_id: cardId, stat_key: statKey } }));
    }
  },
}));
