import type { Card } from '../types';
import bundled from './demo_pack.json';

/**
 * Loads the World Cup squad of cards.
 *
 * LIVE DATA PLUGS IN HERE. Browsers can't safely hold a football-API key and
 * most APIs block CORS, so point VITE_LIVE_FEED_URL at a tiny proxy (a
 * serverless function or the Go server) that:
 *   1. calls a football API (API-Football / football-data.org) for current
 *      World Cup fixtures + player match ratings,
 *   2. computes form delta + effective stats (same math as card_builder.go),
 *   3. returns Card[] JSON.
 * Until that URL is set, we ship the bundled World Cup pack so the app is fully
 * playable offline.
 */
export async function loadSquad(): Promise<Card[]> {
  const url = import.meta.env.VITE_LIVE_FEED_URL;
  if (url) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const cards = (data.cards ?? data) as Card[];
        if (Array.isArray(cards) && cards.length) return cards;
      }
    } catch {
      /* fall through to bundled pack */
    }
  }
  return bundled as Card[];
}
