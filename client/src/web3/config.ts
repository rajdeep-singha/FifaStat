import { http, createConfig } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

// Wallet-based identity on Ethereum Sepolia. No backend: the wallet is the
// account, a public RPC reads/writes the identity contract. "Login" = connect
// + sign, "logout" = disconnect. Address is the player's permanent id.
export const wagmiConfig = createConfig({
  chains: [sepolia],
  connectors: [injected()],
  transports: {
    // Public Sepolia RPC. Override with VITE_SEPOLIA_RPC_URL for reliability.
    [sepolia.id]: http(import.meta.env.VITE_SEPOLIA_RPC_URL ?? 'https://rpc.sepolia.org'),
  },
});

export const SEPOLIA_CHAIN_ID = sepolia.id;
