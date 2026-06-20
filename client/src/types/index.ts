export type Position = 'ATK' | 'MID' | 'DEF';
export type Rarity = 'gold' | 'silver' | 'bronze';
export type StatKey = 'pac' | 'sho' | 'pas' | 'dri' | 'def' | 'phy';
export type GameStatus = 'idle' | 'lobby' | 'waiting_opponent' | 'dealing' | 'choosing' | 'waiting_choice' | 'resolving' | 'finished';

export interface Stats {
  pac: number;
  sho: number;
  pas: number;
  dri: number;
  def: number;
  phy: number;
}

export interface FormRating {
  match_date: string;
  opponent: string;
  rating: number;
}

export interface Card {
  id: string;
  player_name: string;
  club: string;
  nation: string;
  position: Position;
  photo_url: string;
  base_stats: Stats;
  overall: number;
  form: FormRating[];
  form_delta: number;
  eff_stats: Stats;
  meme_tagline: string;
  rarity: Rarity;
  created_at: string;
}

export interface RoundResult {
  round: number;
  p1_choice: { card_id: string; stat_key: string };
  p2_choice: { card_id: string; stat_key: string };
  p1_eff_value: number;
  p2_eff_value: number;
  winner_player: number;
  counter_bonus: boolean;
}

export interface GameState {
  roomId: string | null;
  playerSlot: number;
  hand: Card[];
  opponentCardCount: number;
  p1Score: number;
  p2Score: number;
  currentRound: number;
  rounds: RoundResult[];
  status: GameStatus;
  selectedCard: Card | null;
  selectedStat: StatKey | null;
  lastResult: RoundResult | null;
  opponentPosition: Position | null;
  winnerSlot: number | null;
  transferredCard: Card | null;
}
