import { create } from 'zustand';
import { type Card, type GameState, type GameStatus, type StatKey, type RoundResult } from '../types';
import demoPack from '../data/demo_pack.json';
import { peerNet } from '../net/peer';

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

  // Peer-to-peer multiplayer (no backend). roomId is the short room code.
  hostRoom: () => Promise<void>;
  joinRoom: (code: string) => void;
  disconnect: () => void;
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

export const useStore = create<Store>((set, get) => {
  // Wire the P2P layer's events to store actions (once).
  peerNet.setDispatch({
    onRoomReady: () => get().setGameStatus('dealing'),
    onDealHand: (hand, slot) => get().dealHand(hand, slot),
    onOpponentReady: () => get().setOpponentReady(),
    onRoundResult: (result, p1, p2) => get().applyRoundResult(result, p1, p2),
    onGameOver: (winnerSlot, p1, p2) => get().setGameOver(winnerSlot, null, p1, p2),
    onError: (msg) => get().setError(msg),
  });

  return {
    demoCards: [],
    isLoadingDemo: false,
    error: null,

    // No backend: the demo pack ships with the client.
    fetchDemoCards: async () => {
      set({ demoCards: demoPack as Card[], isLoadingDemo: false });
    },

    game: initialGame,

    setRoomId: (id) => set((s) => ({ game: { ...s.game, roomId: id } })),
    setPlayerSlot: (slot) => set((s) => ({ game: { ...s.game, playerSlot: slot } })),

    dealHand: (hand, slot) =>
      set((s) => ({
        game: { ...s.game, hand, playerSlot: slot, status: 'choosing', opponentCardCount: 5 },
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
        game: { ...s.game, status: 'finished', winnerSlot, transferredCard, p1Score, p2Score },
      })),

    resetGame: () => {
      peerNet.disconnect();
      set({ game: initialGame });
    },
    setError: (msg) => set({ error: msg }),

    // ---- P2P room control ----

    hostRoom: async () => {
      set({ error: null });
      try {
        const code = await peerNet.host(demoPack as Card[]);
        set((s) => ({ game: { ...s.game, roomId: code, playerSlot: 1, status: 'idle' } }));
      } catch (e) {
        set({ error: 'Could not create room. Try again.' });
        console.error(e);
      }
    },

    joinRoom: (code) => {
      set({ error: null });
      peerNet.join(code);
      set((s) => ({ game: { ...s.game, roomId: code.toUpperCase(), playerSlot: 2 } }));
    },

    disconnect: () => {
      peerNet.disconnect();
    },

    sendChoice: (cardId, statKey) => {
      peerNet.submitChoice(cardId, statKey as StatKey);
    },
  };
});
