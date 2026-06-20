import { useAuth } from '../../web3/useAuth';

const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

/** Top bar: who you are (on-chain username + address), W/L, and logout. */
export const ProfileBar: React.FC = () => {
  const { id, username, wins, losses, logout, onWrongNetwork } = useAuth();
  if (!id) return null;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 12, padding: '8px 16px', background: 'var(--bg2)',
      borderBottom: '1px solid var(--bg3)', fontSize: 13,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 18 }}>⚽</span>
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
          <strong style={{ color: 'var(--gold)' }}>{username || 'Unnamed'}</strong>
          <span style={{ color: 'var(--text2)', fontSize: 11 }} title={id}>{short(id)}</span>
        </div>
        <span style={{ color: 'var(--text2)', fontSize: 12, marginLeft: 8 }}>
          {wins}W · {losses}L
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {onWrongNetwork && (
          <span style={{ color: '#f59e0b', fontSize: 11 }}>⚠ Switch to Sepolia</span>
        )}
        <button
          onClick={logout}
          style={{
            background: 'var(--bg3)', color: 'white', padding: '6px 14px',
            borderRadius: 8, fontSize: 12, fontWeight: 600,
          }}
        >
          Log out
        </button>
      </div>
    </div>
  );
};
