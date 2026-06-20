import { useAuth } from '../../web3/useAuth';

const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

/** Top bar: your wallet (your id) + logout. */
export const ProfileBar: React.FC = () => {
  const { id, logout, onWrongNetwork } = useAuth();
  if (!id) return null;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 12, padding: '8px 16px', background: 'var(--panel)',
      borderBottom: '1px solid var(--line)', fontSize: 13,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 18 }}>⚽</span>
        <strong style={{ color: 'var(--live)', fontFamily: "'Oswald', sans-serif", letterSpacing: 0.5 }} title={id}>
          {short(id)}
        </strong>
        <span style={{ color: 'var(--text2)', fontSize: 11 }}>that's you fr</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {onWrongNetwork && <span style={{ color: '#f59e0b', fontSize: 11 }}>⚠ switch to Sepolia</span>}
        <button
          onClick={logout}
          style={{
            background: 'var(--panel2)', color: 'white', padding: '6px 14px',
            borderRadius: 8, fontSize: 12, fontWeight: 600,
          }}
        >
          Log out
        </button>
      </div>
    </div>
  );
};
