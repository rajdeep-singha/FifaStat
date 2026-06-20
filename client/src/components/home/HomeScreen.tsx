import { useStore } from '../../store';
import { useAuth } from '../../web3/useAuth';
import { CardFace } from '../card/CardFace';

const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

export const HomeScreen: React.FC<{ onOpenPack: () => void; onPlay: () => void }> = ({ onOpenPack, onPlay }) => {
  const { id } = useAuth();
  const owned = useStore((s) => s.owned);
  const hasCards = owned.length > 0;

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto', padding: '28px 20px 60px', width: '100%' }}>
      {/* your id */}
      <div style={{ marginBottom: 6 }}>
        <span style={{ fontFamily: "'Oswald',sans-serif", letterSpacing: 3, fontSize: 12, color: 'var(--text2)' }}>
          GM — YOUR ID
        </span>
      </div>
      <h1 className="display" style={{
        fontSize: 40, letterSpacing: 1, lineHeight: 1,
        background: 'linear-gradient(135deg,#fff,var(--live))',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      }} title={id ?? ''}>
        {id ? short(id) : '—'}
      </h1>
      <p style={{ color: 'var(--text2)', fontSize: 12, marginTop: 4 }}>
        wallet = identity, that's the whole login fr 🏆 World Cup 2026
      </p>

      {/* your cards */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', margin: '30px 0 12px' }}>
        <h2 style={{ fontFamily: "'Oswald',sans-serif", letterSpacing: 2, fontSize: 16, textTransform: 'uppercase' }}>
          your squad <span style={{ color: 'var(--text2)' }}>· {owned.length}</span>
        </h2>
      </div>

      {hasCards ? (
        <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 12 }}>
          {owned.map((c) => <CardFace key={c.id} card={c} size="hand" />)}
        </div>
      ) : (
        <div style={{
          border: '1px dashed var(--line)', borderRadius: 16, padding: 36, textAlign: 'center',
          color: 'var(--text2)', background: 'var(--panel)',
        }}>
          <div style={{ fontSize: 34, marginBottom: 8 }}>📭</div>
          no cards yet — rip a pack to build your squad
        </div>
      )}

      {/* two options */}
      <div style={{ display: 'flex', gap: 16, marginTop: 34, flexWrap: 'wrap' }}>
        <button onClick={onOpenPack} style={{
          flex: 1, minWidth: 240, padding: '22px 24px', borderRadius: 18, textAlign: 'left',
          background: 'linear-gradient(135deg, rgba(160,107,255,0.22), rgba(160,107,255,0.06))',
          border: '1px solid var(--social)', color: '#fff',
        }}>
          <div className="display" style={{ fontSize: 24, color: 'var(--social)' }}>OPEN PACK ⚡</div>
          <div style={{ color: 'var(--text2)', fontSize: 13, marginTop: 4 }}>5 living cards, scraped fresh · goat lands last</div>
        </button>

        <button onClick={onPlay} disabled={!hasCards} style={{
          flex: 1, minWidth: 240, padding: '22px 24px', borderRadius: 18, textAlign: 'left',
          background: hasCards ? 'linear-gradient(135deg, rgba(43,245,154,0.22), rgba(43,245,154,0.06))' : 'var(--panel)',
          border: `1px solid ${hasCards ? 'var(--live)' : 'var(--line)'}`,
          color: '#fff', opacity: hasCards ? 1 : 0.55,
        }}>
          <div className="display" style={{ fontSize: 24, color: hasCards ? 'var(--live)' : 'var(--text2)' }}>PLAY 🥊</div>
          <div style={{ color: 'var(--text2)', fontSize: 13, marginTop: 4 }}>
            {hasCards ? 'create or join a room · 1v1 duel' : 'open a pack first to unlock'}
          </div>
        </button>
      </div>
    </div>
  );
};
