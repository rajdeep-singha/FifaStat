# CardClash ⚽

Football card battler where cards are **real players** with live stats. 1-v-1
Top-Trumps duels with a positional counter triangle. Identity is **on-chain**
(your wallet is your account) and multiplayer is **peer-to-peer** — so the whole
thing runs with **no backend to deploy**.

## How it works (no backend)

| Concern | How it's solved without a server |
|---|---|
| **Login / logout / your own ID** | Connect a wallet on **Ethereum Sepolia**. Your address is your permanent ID; signing a message logs you in; disconnect logs out. |
| **Username + win record** | A tiny Solidity contract (`CardClashIdentity`) on Sepolia. Deploy once — it's not a server you run. |
| **Real-time multiplayer** | **PeerJS / WebRTC**. A free public broker only does the handshake; game data flows browser-to-browser. The host runs the authoritative game engine (ported from the original Go `round_resolver`). |
| **Card data** | The demo pack ships bundled in the client (`src/data/demo_pack.json`). |

> The original Go server (`/server`) is kept as the reference implementation and
> the path to the live-Anakin-scraping + on-chain-wager vision. None of it needs
> to run for the game to be playable.

## Run it

```bash
# 1. Frontend
cd client
npm install
cp .env.example .env        # optional: set VITE_IDENTITY_ADDRESS after deploying
npm run dev                 # http://localhost:5173

# 2. (Optional) Identity contract — enables on-chain usernames
cd ../contracts
forge test                  # all pass
# follow contracts/README.md to deploy to Sepolia, then put the
# address in client/.env as VITE_IDENTITY_ADDRESS
```

Login works immediately (wallet = ID). On-chain usernames activate once
`VITE_IDENTITY_ADDRESS` points at your deployed contract.

## Play

1. Both players open the app and **connect their wallet** (Sepolia).
2. Player A clicks **New Game** -> gets a 5-char room code.
3. Player B enters the code -> **Join**.
4. Each round: pick a card, pick a stat. Higher effective value wins; an
   attacking position that counters the opponent's gets **x1.2**. First to 3 wins.

## Project layout

```
client/      React + TS + Vite frontend
  src/web3/    wallet auth (wagmi/viem) + identity contract binding
  src/net/     PeerJS P2P multiplayer
  src/game/    pure game engine (TS port of round_resolver.go)
contracts/   Foundry project - CardClashIdentity.sol (Sepolia)
server/      original Go reference backend (not required to run)
```
