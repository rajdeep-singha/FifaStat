// Server-side (Node) live data builder. Runs inside the Vite dev middleware so
// the ANAKIN_API_KEY never reaches the browser. Calls the anakin.io Search API
// to pull each player's latest real match (opponent + Sofascore rating), then
// re-rates the bundled card live — new form, new overall, fresh gen-z meme.
import baseSquad from './src/data/demo_pack.json' assert { type: 'json' };

const ANAKIN_URL = 'https://api.anakin.io/v1/search';

interface Stats { pac: number; sho: number; pas: number; dri: number; def: number; phy: number }
interface Form { match_date: string; opponent: string; rating: number; meme?: string; stage?: string }
interface Card {
  id: string; player_name: string; club: string; nation: string; position: string;
  photo_url: string; base_stats: Stats; overall: number; form: Form[];
  form_delta: number; eff_stats: Stats; meme_tagline: string; rarity: string; created_at: string;
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

function formDelta(form: Form[]): number {
  if (!form.length) return 0;
  const avg = form.reduce((s, f) => s + f.rating, 0) / form.length;
  if (avg >= 7.5) return 5;
  if (avg <= 5.5) return -5;
  return Math.round(((avg - 5.5) / 2) * 10 - 5);
}
function effStats(base: Stats, delta: number): Stats {
  const b = (v: number) => clamp(v + Math.round((v * delta) / 99), 1, 99);
  return { pac: b(base.pac), sho: b(base.sho), pas: b(base.pas), dri: b(base.dri), def: b(base.def), phy: b(base.phy) };
}
function rarity(o: number): string { return o >= 85 ? 'gold' : o >= 75 ? 'silver' : 'bronze'; }

function genzMeme(rating: number, opp: string): string {
  const t = rating >= 9 ? ['he is HIM, {o} cooked', 'GOATED vs {o}', '{o} caught lacking fr']
    : rating >= 8 ? ['bro was him vs {o}', 'lowkey carried vs {o}', '{o} got cooked ngl']
    : rating >= 7 ? ['solid shift vs {o}', 'quietly cooked {o}', 'kept it a buck vs {o}']
    : rating >= 6 ? ['mid vs {o}', 'NPC energy vs {o}', '{o} had him pressed']
    : ['skill issue vs {o}', 'took the L to {o}', 'ratioed by {o} fr'];
  return t[Math.floor(Math.random() * t.length)].replace(/{o}/g, opp);
}

// Pull the latest real match for a player from the Search API.
async function fetchLatestMatch(card: Card, key: string): Promise<Form | null> {
  try {
    const res = await fetch(ANAKIN_URL, {
      method: 'POST',
      headers: { 'X-API-Key': key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: `${card.player_name} last match Sofascore rating and opponent latest game 2026` }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const text: string = (data.results || []).map((r: { snippet?: string }) => r.snippet || '').join('\n');

    const ratingM = text.match(/([\d.]+)\s*Sofascore rating/i);
    const matchM = text.match(/last player match was\s+([A-Za-z .'-]+?)\s*[-–]\s*([A-Za-z .'-]+?)\s*\((\d+)\s*[-–]\s*(\d+)\)/i);
    if (!ratingM) return null;

    const rating = parseFloat(ratingM[1]);
    let opponent = 'latest opponent';
    if (matchM) {
      const a = matchM[1].trim(), b = matchM[2].trim();
      // opponent is whichever side isn't the player's nation/club
      opponent = [a, b].find((t) => t.toLowerCase() !== card.nation.toLowerCase() && t.toLowerCase() !== card.club.toLowerCase()) || b;
    }
    const date = (data.results?.[0]?.last_updated as string) || new Date().toISOString().slice(0, 10);
    return { match_date: date, opponent, rating, meme: genzMeme(rating, opponent), stage: 'LIVE' };
  } catch {
    return null;
  }
}

// Build the live squad: re-rate each bundled card with its newest real match.
export async function buildLiveSquad(key: string): Promise<Card[]> {
  const cards = baseSquad as Card[];
  const out = await Promise.all(
    cards.map(async (card) => {
      const latest = await fetchLatestMatch(card, key);
      if (!latest) return card; // keep bundled card if scrape misses

      const form = [latest, ...card.form].slice(0, 5);
      const baseOverall = card.overall - card.form_delta; // recover pre-form base
      const delta = formDelta(form);
      const overall = clamp(baseOverall + delta, 1, 99);
      return {
        ...card,
        form,
        form_delta: delta,
        overall,
        eff_stats: effStats(card.base_stats, delta),
        rarity: rarity(overall),
        meme_tagline: latest.meme || card.meme_tagline,
      };
    }),
  );
  return out;
}
