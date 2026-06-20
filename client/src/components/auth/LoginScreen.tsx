import { useState } from 'react';
import { useAuth } from '../../web3/useAuth';

const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

export const LoginScreen: React.FC = () => {
  const { isLoggedIn, login, busy, error, id } = useAuth();

  if (isLoggedIn) return null;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '90vh', padding: 20, gap: 28,
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 8 }}>⚽</div>
        <h1 style={{
          fontSize: 48, fontWeight: 900,
          background: 'linear-gradient(135deg, #c8a227, #ffd700)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          letterSpacing: -1,
        }}>CardClash</h1>
        <p style={{ color: 'var(--text2)', fontSize: 16, marginTop: 8 }}>
          Football cards. Live data. Real stakes.
        </p>
      </div>

      <div style={{
        background: 'var(--bg2)', border: '1px solid var(--bg3)',
        borderRadius: 16, padding: 32, width: 320, textAlign: 'center',
        display: 'flex', flexDirection: 'column', gap: 16,
      }}>
        <h3 style={{ color: 'var(--gold)' }}>Sign in with your wallet</h3>
        <p style={{ color: 'var(--text2)', fontSize: 13, lineHeight: 1.5 }}>
          Your wallet address is your CardClash ID — no signup, no password, no server.
          Connect on <strong>Sepolia</strong> testnet to play.
        </p>
        <button
          onClick={login}
          disabled={busy}
          style={{
            background: 'linear-gradient(135deg, #c8a227, #ffd700)',
            color: '#000', padding: '14px 24px', borderRadius: 10,
            fontSize: 16, fontWeight: 800, opacity: busy ? 0.7 : 1,
          }}
        >
          {busy ? 'Check your wallet…' : '🦊 Connect Wallet'}
        </button>
        {id && !isLoggedIn && (
          <div style={{ fontSize: 12, color: 'var(--text2)' }}>Detected {short(id)} — sign to continue</div>
        )}
        {error && <div style={{ color: '#ef4444', fontSize: 12 }}>{error}</div>}
        <a
          href="https://sepoliafaucet.com"
          target="_blank"
          rel="noreferrer"
          style={{ fontSize: 11, color: 'var(--text2)', textDecoration: 'underline' }}
        >
          Need test ETH? Get some from a Sepolia faucet →
        </a>
      </div>
    </div>
  );
};
