import { useCallback, useEffect, useState } from 'react';
import { useAccount, useConnect, useDisconnect, useSignMessage } from 'wagmi';
import { injected } from 'wagmi/connectors';

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
 * Wallet-based identity. No backend, no contract:
 *  - login()  -> connect injected wallet + sign a message (FREE, no gas)
 *  - logout() -> clear signature + disconnect
 *  - id       -> the wallet address (your permanent, cross-device id)
 */
export function useAuth() {
  const { address, isConnected, chainId } = useAccount();
  const { connectAsync, isPending: connecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();

  const [session, setSession] = useState<Session | null>(loadSession);
  const [error, setError] = useState<string | null>(null);

  const isLoggedIn =
    isConnected && !!session && session.address.toLowerCase() === address?.toLowerCase();

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
      setError(/no provider|not found|getethereum/i.test(msg) ? 'No wallet detected. Install MetaMask.' : msg);
    }
  }, [address, isConnected, connectAsync, signMessageAsync]);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
    disconnect();
  }, [disconnect]);

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
    onWrongNetwork,
    busy: connecting,
    error,
    login,
    logout,
  };
}
