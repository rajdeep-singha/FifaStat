# CardClash ⚽

Football card battler where every card is a **real player** with live stats, a real match photo, and a meme tagline scraped off football Twitter — all updated after every game. 1-v-1 Top-Trumps duels, positional counter triangle, wallet-based identity, P2P multiplayer. No backend to deploy.

---

## How live data works — powered by Anakin

CardClash uses the **[Anakin](https://anakin.ai) Search API** as its real-time data layer. Here's exactly what happens:

### The pipeline

```
Anakin Search API
       │
       │  One prompt per player, e.g.:
       │  "Haaland latest match Sofascore rating,
       │   opponent, and funny fan reactions 2026"
       │
       ▼
  anakin-feed.ts  (Vite dev middleware — server-side only)
       │
       ├─ Extracts latest match opponent + Sofascore rating
       ├─ Pulls up to 5 real fan-reaction snippets (the meme taglines)
       ├─ Re-rates the card: form delta (±5 OVR) based on last 5 ratings
       └─ Returns enriched card JSON at  GET /api/squad
              │
              ▼
        React client
        (cards displayed with live photo, rating, meme)
```

### What Anakin provides

| Data point | How it's used |
|---|---|
| **Sofascore match rating** | Drives the form delta (avg ≥ 7.5 → +5 OVR, avg ≤ 5.5 → −5 OVR) |
| **Last opponent** | Shown on the card back as the most recent match entry |
| **Fan reaction snippets** | Become the meme taglines on each card face + match history |
| **`last_updated` timestamp** | Used as the match date on the card back |

### Why Anakin

A single Anakin search prompt returns structured results (snippets + timestamps) in one API call. That means:

- **One call per player per 30-minute TTL window** — cheap on credits, fast on cold start.
- The API key lives **server-side only** in the Vite dev middleware — it is never bundled into the browser.
- The fallback (no key / API error) is the bundled `demo_pack.json` — the game always works.

---

## How it works (no backend)

| Concern | Solution |
|---|---|
| **Login / identity** | Connect a wallet on Ethereum Sepolia. Your address is your permanent ID. Signing a message logs you in. |
| **On-chain usernames** | A tiny Solidity contract (`CardClashIdentity`) on Sepolia. Deploy once — not a server you run. |
| **Real-time multiplayer** | PeerJS / WebRTC. A free public broker handles the handshake; game data flows browser-to-browser. The host runs the authoritative game engine (TS port of `round_resolver.go`). |
| **Card data (offline)** | Bundled `src/data/demo_pack.json` — works without any API key. |
| **Card data (live)** | Anakin Search API via Vite dev middleware → `/api/squad`. |

---

## Quickstart

```bash
# 1. Clone & install
cd client
npm install

# 2. Set up environment
cp .env.example .env
# → Add your ANAKIN_API_KEY (get one at https://anakin.ai)
# → Optionally add VITE_IDENTITY_ADDRESS after deploying the contract

# 3. Run
npm run dev        # http://localhost:5173
```

> **Without `ANAKIN_API_KEY`:** the app loads the bundled demo pack. Cards are fully
> playable — stats and memes just won't refresh from live match data.

---

## Deploy

| Field | Value |
|---|---|
| **Root directory** | `client` |
| **Install command** | `npm install` |
| **Build command** | `npm run build` |
| **Output directory** | `dist` |
| **Environment variable** | `ANAKIN_API_KEY` (set in your hosting platform's env settings) |

> Note: the Anakin-powered `/api/squad` endpoint only works in the **Vite dev server**
> (it's a Vite middleware). For a production deployment you'd need a small edge
> function or serverless route that proxies the Anakin call. The client falls back
> to the bundled demo pack gracefully if the endpoint is absent.

---

## Play

1. Both players open the app and **connect their wallet** (Sepolia).
2. Player A clicks **New Game** → gets a 5-char room code.
3. Player B enters the code → **Join**.
4. Each round: pick a card, pick a stat. Higher effective value wins. An attacking position that counters the opponent's gets **×1.2**. First to 3 wins.

---

## Project layout

```
client/
  src/
    components/    React UI (landing, auth, lobby, game, cards, pack)
    data/          demo_pack.json — bundled fallback squad
    game/          pure TS game engine (port of round_resolver.go)
    net/           PeerJS P2P multiplayer
    styles/        CSS modules per feature
    web3/          wagmi/viem wallet auth + identity contract binding
  anakin-feed.ts   Vite middleware — Anakin API integration (server-side)
  .env.example     Environment variable reference

server/            original Go reference backend (not required to run)
contracts/         Foundry — CardClashIdentity.sol (Sepolia)
```

---

## Tech stack

- **Frontend:** React 19 + TypeScript + Vite
- **Wallet:** wagmi v3 + viem (MetaMask, Phantom)
- **Multiplayer:** PeerJS (WebRTC)
- **Live data:** [Anakin](https://anakin.ai) Search API
- **State:** Zustand
- **Chain:** Ethereum Sepolia (identity contract only)
