import { useCallback, useEffect, useState } from 'react';
import {
  useAccount,
  useConnect,
  useDisconnect,
  useSignMessage,
  useReadContract,
  useWriteContract,
} from 'wagmi';
import { injected } from 'wagmi/connectors';
import { identityAbi, IDENTITY_ADDRESS, isContractConfigured } from './registry';

const SESSION_KEY = 'cardclash.session'; // { address, signature } proving wallet ownership

interface Session {
  address: string;
  signature: string;
}

function loadSession(): Session | null {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
  } catch {
    return null;
  }
}

/**
 * Wallet-based identity. No backend:
 *  - login()    -> connect injected wallet + sign a message (proves ownership)
 *  - logout()   -> clear signature + disconnect
 *  - id         -> the wallet address (permanent, cross-device)
 *  - username   -> read from the on-chain identity contract
 *  - register() -> writes username on-chain (Sepolia)
 */
export function useAuth() {
  const { address, isConnected, chainId } = useAccount();
  const { connectAsync, isPending: connecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const { writeContractAsync, isPending: writing } = useWriteContract();

  const [session, setSession] = useState<Session | null>(loadSession);
  const [error, setError] = useState<string | null>(null);

  // Session is valid only if the stored signature matches the connected wallet.
  const isLoggedIn =
    isConnected && !!session && session.address.toLowerCase() === address?.toLowerCase();

  // Read on-chain profile (username/wins/losses) for the connected address.
  const { data: profile, refetch: refetchProfile } = useReadContract({
    address: IDENTITY_ADDRESS,
    abi: identityAbi,
    functionName: 'getProfile',
    args: address ? [address] : undefined,
    query: { enabled: isLoggedIn && isContractConfigured && !!address },
  });

  const username = profile?.[0] || '';
  const wins = profile ? Number(profile[1]) : 0;
  const losses = profile ? Number(profile[2]) : 0;
  const registered = profile?.[3] ?? false;

  const login = useCallback(async () => {
    setError(null);
    try {
      let acct = address;
      if (!isConnected) {
        const res = await connectAsync({ connector: injected() });
        acct = res.accounts[0];
      }
      if (!acct) throw new Error('No wallet account found');

      const message = `Sign in to CardClash\n\nAddress: ${acct}\nNonce: ${Date.now()}`;
      const signature = await signMessageAsync({ message });
      const next = { address: acct, signature };
      localStorage.setItem(SESSION_KEY, JSON.stringify(next));
      setSession(next);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Login failed';
      // user rejected signature / no wallet installed
      setError(/no provider|not found|getethereum/i.test(msg) ? 'No wallet detected. Install MetaMask.' : msg);
    }
  }, [address, isConnected, connectAsync, signMessageAsync]);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
    disconnect();
  }, [disconnect]);

  const register = useCallback(
    async (name: string) => {
      setError(null);
      if (!isContractConfigured) {
        setError('Identity contract not deployed yet. Set VITE_IDENTITY_ADDRESS.');
        return false;
      }
      try {
        await writeContractAsync({
          address: IDENTITY_ADDRESS,
          abi: identityAbi,
          functionName: 'setUsername',
          args: [name],
        });
        await refetchProfile();
        return true;
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Could not set username');
        return false;
      }
    },
    [writeContractAsync, refetchProfile],
  );

  // If wallet disconnects underneath us, drop the session.
  useEffect(() => {
    if (!isConnected && session) {
      localStorage.removeItem(SESSION_KEY);
      setSession(null);
    }
  }, [isConnected, session]);

  const onWrongNetwork = isLoggedIn && chainId !== undefined && chainId !== 11155111;

  return {
    id: address ?? null,
    isLoggedIn,
    username,
    wins,
    losses,
    registered,
    onWrongNetwork,
    busy: connecting || writing,
    error,
    contractConfigured: isContractConfigured,
    login,
    logout,
    register,
    refetchProfile,
  };
}
