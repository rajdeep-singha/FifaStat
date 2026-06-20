import { useStore } from '../../store';
import { useAuth } from '../../web3/useAuth';
import { CardFace } from '../card/CardFace';

const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

interface Props { onOpenPack: () => void; onPlay: () => void; onBuildTeam: () => void }

export const HomeScreen: React.FC<Props> = ({ onOpenPack, onPlay, onBuildTeam }) => {
  const { id } = useAuth();
  const owned = useStore((s) => s.owned);
  const team = useStore((s) => s.team);
  const hasCards = owned.length > 0;

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto', padding: '28px 20px 60px', width: '100%' }}>
      <span style={{ fontFamily: "'Oswald',sans-serif", letterSpacing: 3, fontSize: 12, color: 'var(--text2)' }}>
        GM — YOUR ID
      </span>
      <h1 className="display" style={{
        fontSize: 40, letterSpacing: 1, lineHeight: 1,
        background: 'linear-gradient(135deg,#fff,var(--live))',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      }} title={id ?? ''}>
        {id ? short(id) : '—'}
      </h1>
      <p style={{ color: 'var(--text2)', fontSize: 12, marginTop: 4 }}>
        wallet = identity, that's the whole login fr · World Cup 2026
      </p>

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', margin: '30px 0 12px' }}>
        <h2 style={{ fontFamily: "'Oswald',sans-serif", letterSpacing: 2, fontSize: 16, textTransform: 'uppercase' }}>
          your squad <span style={{ color: 'var(--text2)' }}>· {owned.length}</span>
          {team.length ? <span style={{ color: 'var(--live)', fontSize: 13 }}> · team of {team.length} set</span> : null}
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
          no cards yet — rip a pack to build your squad
        </div>
      )}

      <div style={{ display: 'flex', gap: 14, marginTop: 34, flexWrap: 'wrap' }}>
        <button onClick={onOpenPack} style={cta('var(--social)', 'rgba(160,107,255,0.22)')}>
          <div className="display" style={{ fontSize: 22, color: 'var(--social)' }}>OPEN PACK</div>
          <div style={ctaSub}>rip 5 cards · keep 1</div>
        </button>

        <button onClick={onBuildTeam} disabled={!hasCards} style={cta(hasCards ? 'var(--accent)' : 'var(--line)', hasCards ? 'rgba(56,189,248,0.18)' : 'transparent', !hasCards)}>
          <div className="display" style={{ fontSize: 22, color: hasCards ? 'var(--accent)' : 'var(--text2)' }}>BUILD TEAM</div>
          <div style={ctaSub}>{hasCards ? 'pick your XI from packed cards' : 'pack cards first'}</div>
        </button>

        <button onClick={onPlay} disabled={!hasCards} style={cta(hasCards ? 'var(--live)' : 'var(--line)', hasCards ? 'rgba(43,245,154,0.22)' : 'transparent', !hasCards)}>
          <div className="display" style={{ fontSize: 22, color: hasCards ? 'var(--live)' : 'var(--text2)' }}>PLAY</div>
          <div style={ctaSub}>{hasCards ? 'create or join a room · 1v1' : 'pack cards first'}</div>
        </button>
      </div>
    </div>
  );
};

const cta = (border: string, bg: string, disabled = false): React.CSSProperties => ({
  flex: 1, minWidth: 220, padding: '22px 24px', borderRadius: 18, textAlign: 'left',
  background: `linear-gradient(135deg, ${bg}, transparent)`, border: `1px solid ${border}`,
  color: '#fff', opacity: disabled ? 0.55 : 1,
});
const ctaSub: React.CSSProperties = { color: 'var(--text2)', fontSize: 13, marginTop: 4 };
