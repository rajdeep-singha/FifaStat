import { useState } from 'react';
import { useAuth } from '../../web3/useAuth';

const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

/** Optional: claim an on-chain username. Reachable from the profile bar — not a
 *  gate. Login already works without this (and without any test ETH). */
export const UsernamePrompt: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const { id, register, busy, error, contractConfigured } = useAuth();
  const [name, setName] = useState('');

  const submit = async () => {
    const n = name.trim();
    if (n.length < 2 || n.length > 24) return;
    const ok = await register(n);
    if (ok) onClose?.();
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '90vh', padding: 20, gap: 24,
    }}>
      <div style={{
        background: 'var(--bg2)', border: '1px solid var(--bg3)',
        borderRadius: 16, padding: 32, width: 340, textAlign: 'center',
        display: 'flex', flexDirection: 'column', gap: 16,
      }}>
        <div style={{ fontSize: 40 }}>🏷️</div>
        <h3 style={{ color: 'var(--gold)' }}>Claim your name (optional)</h3>
        <p style={{ color: 'var(--text2)', fontSize: 13, lineHeight: 1.5 }}>
          {id && <>Wallet <strong>{short(id)}</strong> is connected. </>}
          Register a username on-chain (Sepolia) so opponents see a name instead of your
          address. This one action needs a little test ETH for gas — playing doesn't.
        </p>
        {!contractConfigured && (
          <div style={{ color: '#f59e0b', fontSize: 12 }}>
            Contract not deployed yet — deploy it and set VITE_IDENTITY_ADDRESS, or
            <button onClick={onClose} style={{ color: 'var(--accent)', textDecoration: 'underline', marginLeft: 4 }}>
              go back
            </button>
          </div>
        )}
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. CaptainTsubasa"
          maxLength={24}
          disabled={!contractConfigured}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          style={{
            background: 'var(--bg3)', border: '2px solid var(--bg3)',
            borderRadius: 8, padding: '12px 16px', color: 'white',
            fontSize: 16, textAlign: 'center', outline: 'none',
          }}
        />
        <button
          onClick={submit}
          disabled={busy || name.trim().length < 2 || !contractConfigured}
          style={{
            background: 'linear-gradient(135deg, #c8a227, #ffd700)',
            color: '#000', padding: '14px 24px', borderRadius: 10,
            fontSize: 16, fontWeight: 800,
            opacity: busy || name.trim().length < 2 || !contractConfigured ? 0.6 : 1,
          }}
        >
          {busy ? 'Confirm in wallet…' : 'Register on-chain →'}
        </button>
        {error && <div style={{ color: '#ef4444', fontSize: 12 }}>{error}</div>}
        <button onClick={onClose} style={{ color: 'var(--text2)', fontSize: 12 }}>Skip — play without a name</button>
      </div>
    </div>
  );
};
