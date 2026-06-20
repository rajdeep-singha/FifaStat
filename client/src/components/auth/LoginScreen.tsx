import { useAuth } from '../../web3/useAuth';

const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

const walletBtn = (accent: string): React.CSSProperties => ({
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
  padding: '14px 24px', borderRadius: 12, fontFamily: "'Oswald', sans-serif",
  fontSize: 15, fontWeight: 700, letterSpacing: 1, color: '#04130b',
  background: accent,
});

export const LoginScreen: React.FC<{ onPreview?: () => void }> = ({ onPreview }) => {
  const { isLoggedIn, login, busy, error, id } = useAuth();

  if (isLoggedIn) return null;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '90vh', padding: 20, gap: 28,
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 className="display" style={{
          fontSize: 64,
          background: 'linear-gradient(135deg,#fff,var(--live))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>CARDCLASH</h1>
        <p style={{
          color: 'var(--live)', fontSize: 13, marginTop: 4,
          fontFamily: "'Oswald', sans-serif", letterSpacing: 4, textTransform: 'uppercase',
        }}>World Cup 2026 · real players · real stakes</p>
      </div>

      <div style={{
        background: 'var(--panel)', border: '1px solid var(--line)',
        borderRadius: 16, padding: 32, width: 330, textAlign: 'center',
        display: 'flex', flexDirection: 'column', gap: 14,
      }}>
        <h3 style={{ color: 'var(--live)', fontFamily: "'Oswald',sans-serif", letterSpacing: 1 }}>plug in your wallet</h3>
        <p style={{ color: 'var(--text2)', fontSize: 13, lineHeight: 1.5 }}>
          your wallet = your whole identity, no cap. no signup, no password, <strong>zero gas</strong>.
          connect, sign, ball out.
        </p>

        <button onClick={() => login('metaMask')} disabled={busy} style={walletBtn('linear-gradient(135deg,#f6a623,#e2761b)')}>
          MetaMask
        </button>
        <button onClick={() => login('phantom')} disabled={busy} style={walletBtn('linear-gradient(135deg,#ab9ff2,#7b5bf0)')}>
          Phantom
        </button>

        {busy && <div style={{ fontSize: 12, color: 'var(--text2)' }}>check your wallet…</div>}
        {id && !isLoggedIn && (
          <div style={{ fontSize: 12, color: 'var(--text2)' }}>spotted {short(id)} — sign to lock in</div>
        )}
        {error && <div style={{ color: 'var(--loss)', fontSize: 12 }}>{error}</div>}
        {onPreview && (
          <button
            onClick={onPreview}
            style={{
              background: 'transparent', border: '1px solid var(--line)',
              color: 'var(--text)', padding: '11px 18px', borderRadius: 999,
              fontFamily: "'Oswald', sans-serif", fontWeight: 600, letterSpacing: 1, fontSize: 13,
            }}
          >
            rip a pack first — no wallet needed
          </button>
        )}
      </div>
    </div>
  );
};
