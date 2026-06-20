// Server-side (Node) live data builder. Runs inside the Vite dev middleware so
// the ANAKIN_API_KEY never reaches the browser. Calls the anakin.io Search API
// to pull each player's latest real match (opponent + Sofascore rating), then
// re-rates the bundled card live — new form, new overall, fresh gen-z meme.
import baseSquad from './src/data/demo_pack.json' with { type: 'json' };

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

async function anakinSearch(prompt: string, key: string): Promise<{ snippet?: string; url?: string; last_updated?: string }[]> {
  const res = await fetch(ANAKIN_URL, {
    method: 'POST',
    headers: { 'X-API-Key': key, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });
  if (!res.ok) return [];
  const data = await res.json() as { results?: { snippet?: string; url?: string; last_updated?: string }[] };
  return data.results || [];
}

// Turn a long search snippet into a short, punchy — but REAL — meme line.
function cleanMeme(snippet: string): string | null {
  let s = snippet.replace(/\s+/g, ' ').replace(/^[-•\s]+/, '').trim();
  s = s.split(/(?<=[.!?])\s/)[0]; // first sentence/clause
  if (/sofascore rating|^\d|^\||matches\b/i.test(s)) return null; // skip stat-table noise
  if (s.length > 90) s = s.slice(0, 87).replace(/\s\S*$/, '') + '…';
  return s.length >= 14 ? s : null;
}

// ONE search per card (saves credits): pulls latest rating + opponent AND real
// fan-reaction memes from the same result set.
async function fetchPlayerLive(card: Card, key: string): Promise<{ latest: Omit<Form, 'meme'> | null; memes: string[] }> {
  try {
    const results = await anakinSearch(
      `${card.player_name} latest match Sofascore rating, opponent, and funny fan reactions 2026`, key);
    const text = results.map((r) => r.snippet || '').join('\n');

    const ratingM = text.match(/([\d.]+)\s*Sofascore rating/i);
    const matchM = text.match(/last player match was\s+([A-Za-z .'-]+?)\s*[-–]\s*([A-Za-z .'-]+?)\s*\((\d+)\s*[-–]\s*(\d+)\)/i);
    let latest: Omit<Form, 'meme'> | null = null;
    if (ratingM) {
      const rating = parseFloat(ratingM[1]);
      let opponent = 'latest opponent';
      if (matchM) {
        const a = matchM[1].trim(), b = matchM[2].trim();
        opponent = [a, b].find((t) => t.toLowerCase() !== card.nation.toLowerCase() && t.toLowerCase() !== card.club.toLowerCase()) || b;
      }
      latest = { match_date: results[0]?.last_updated || new Date().toISOString().slice(0, 10), opponent, rating, stage: 'LIVE' };
    }

    const memes: string[] = [];
    for (const r of results) {
      const m = cleanMeme(r.snippet || '');
      if (m && !memes.includes(m)) memes.push(m);
      if (memes.length >= 5) break;
    }
    return { latest, memes };
  } catch { return { latest: null, memes: [] }; }
}

// Build the live squad: real latest match + real memes, re-rated live.
export async function buildLiveSquad(key: string): Promise<Card[]> {
  const cards = baseSquad as Card[];
  const out = await Promise.all(
    cards.map(async (card) => {
      const { latest, memes: realMemes } = await fetchPlayerLive(card, key);
      if (!latest && !realMemes.length) return card; // total miss → keep bundled

      // form: real latest match on top of prior games
      const rawForm = latest ? [{ ...latest } as Form, ...card.form] : [...card.form];
      // assign ONLY real memes (cycling if fewer than games); empty if none found
      const form = rawForm.slice(0, 5).map((g, i) => ({
        ...g,
        meme: realMemes.length ? realMemes[i % realMemes.length] : '',
      }));

      const baseOverall = card.overall - card.form_delta;
      const delta = formDelta(form);
      const overall = clamp(baseOverall + delta, 1, 99);
      return {
        ...card,
        form,
        form_delta: delta,
        overall,
        eff_stats: effStats(card.base_stats, delta),
        rarity: rarity(overall),
        meme_tagline: realMemes[0] || '',
      };
    }),
  );
  return out;
}
