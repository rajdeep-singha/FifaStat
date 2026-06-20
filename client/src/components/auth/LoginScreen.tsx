import { useAuth } from '../../web3/useAuth';

const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

export const LoginScreen: React.FC<{ onPreview?: () => void }> = ({ onPreview }) => {
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
        <h3 style={{ color: 'var(--live)' }}>plug in your wallet</h3>
        <p style={{ color: 'var(--text2)', fontSize: 13, lineHeight: 1.5 }}>
          your wallet = your whole identity, no cap. no signup, no password, no server,
          <strong> zero test ETH</strong>. just connect + sign and you're in — signing is free fr.
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
          <div style={{ fontSize: 12, color: 'var(--text2)' }}>spotted {short(id)} — sign to lock in</div>
        )}
        {error && <div style={{ color: '#ef4444', fontSize: 12 }}>{error}</div>}
        {onPreview && (
          <button
            onClick={onPreview}
            style={{
              background: 'transparent', border: '1px solid var(--line)',
              color: 'var(--text)', padding: '11px 18px', borderRadius: 999,
              fontFamily: "'Oswald', sans-serif", fontWeight: 600, letterSpacing: 1, fontSize: 13,
            }}
          >
            ⚡ rip a pack first — no wallet needed
          </button>
        )}
        <span style={{ fontSize: 11, color: 'var(--text2)' }}>
          connect, sign, ball out. it's free, no gas no stress.
        </span>
      </div>
    </div>
  );
};
