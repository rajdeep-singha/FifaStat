// Pure game logic — a TypeScript port of server/services/round_resolver.go.
// Runs client-side so matches need no backend. The host peer is authoritative.
import type { Card, Position, StatKey, RoundResult } from '../types';

export const ROUNDS_TO_WIN = 3; // best-of: first to win majority of 3 rounds
export const HAND_SIZE = 5;

// Positional counter triangle: ATK > MID > DEF > ATK (attacker gets ×1.2).
const COUNTERS: Record<Position, Position> = { ATK: 'MID', MID: 'DEF', DEF: 'ATK' };

export function counterMultiplier(attacker: Position, defender: Position): number {
  return COUNTERS[attacker] === defender ? 1.2 : 1.0;
}

export function getStatValue(card: Card, key: StatKey): number {
  return card.eff_stats[key] ?? 0;
}

/** Deal two non-overlapping hands of HAND_SIZE from the card pool. */
export function dealHands(pool: Card[]): { p1: Card[]; p2: Card[] } {
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return {
    p1: shuffled.slice(0, HAND_SIZE),
    p2: shuffled.slice(HAND_SIZE, HAND_SIZE * 2),
  };
}

export interface Choice {
  cardId: string;
  statKey: StatKey;
}

/**
 * Resolve a round. P1 is the challenger who picks the stat; P2 defends with the
 * same stat on their chosen card. Counter bonus applies to P1 vs P2 positions.
 * Mirrors ResolveRound in round_resolver.go exactly.
 */
export function resolveRound(
  p1Card: Card,
  p2Card: Card,
  p1Choice: Choice,
  p2Choice: Choice,
  roundNum: number,
): RoundResult {
  const statKey = p1Choice.statKey; // challenger picks the stat for both

  const p1Mult = counterMultiplier(p1Card.position, p2Card.position);
  const p1Eff = getStatValue(p1Card, statKey) * p1Mult;
  const p2Eff = getStatValue(p2Card, statKey); // defender gets no multiplier

  let winner = 2;
  if (p1Eff > p2Eff) winner = 1;
  else if (p1Eff === p2Eff) winner = 0; // draw — nobody scores

  return {
    round: roundNum,
    p1_choice: { card_id: p1Choice.cardId, stat_key: statKey },
    p2_choice: { card_id: p2Choice.cardId, stat_key: p2Choice.statKey },
    p1_eff_value: p1Eff,
    p2_eff_value: p2Eff,
    winner_player: winner,
    counter_bonus: p1Mult > 1.0,
  };
}

/** Returns the winning slot (1 or 2) once someone reaches the round target, else null. */
export function checkGameOver(p1Score: number, p2Score: number, roundsPlayed: number): number | null {
  if (p1Score >= ROUNDS_TO_WIN) return 1;
  if (p2Score >= ROUNDS_TO_WIN) return 2;
  if (roundsPlayed >= HAND_SIZE) return p1Score >= p2Score ? 1 : 2; // exhausted hands
  return null;
}
