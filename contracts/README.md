# CardClash — Identity contract (Sepolia)

`CardClashIdentity.sol` is the minimal on-chain identity layer. A player's wallet
address **is** their account; this contract just lets them claim a username and
records wins. There is **no backend** — the wallet + a public RPC are everything.

## Build & test

```bash
forge build
forge test           # 5 tests, all passing
```

## Deploy to Sepolia

1. Get a throwaway wallet + test ETH from a [Sepolia faucet](https://sepoliafaucet.com).
2. `cp .env.example .env` and fill in `PRIVATE_KEY` and `SEPOLIA_RPC_URL`.
3. Deploy:

```bash
source .env
forge script script/Deploy.s.sol:Deploy \
  --rpc-url "$SEPOLIA_RPC_URL" \
  --broadcast
```

4. Copy the printed address (`CardClashIdentity deployed at: 0x...`) into
   `client/.env` as `VITE_IDENTITY_ADDRESS`.

That's it — restart the client and on-chain usernames are live.

## Contract surface

| Function | Purpose |
|---|---|
| `setUsername(string)` | claim/change username (first call registers you) |
| `getProfile(address)` | `(username, wins, losses, registered)` |
| `recordWin(address loser)` | winner records a result (honor-system for the hackathon) |
| `isAvailable(string)` | is a username free (case-insensitive) |

### Next layer (from the vision doc §8)
Swap this for / extend with an ERC-721 `CardClash.sol` (NFT cards) + escrowed
wager matches resolved by a signed-result oracle. The identity mapping here is
the foundation that layer builds on.
