import { useState } from 'react';
import { useStore } from '../../store';
import { CardFace } from '../card/CardFace';

const MAX = 5; // a starting XI is the stretch goal; 5 matches a match hand

export const CreateTeam: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const { owned, team, setTeam } = useStore();
  const [picked, setPicked] = useState<string[]>(team.map((c) => c.id));

  const toggle = (id: string) => {
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length < MAX ? [...p, id] : p));
  };

  const save = () => {
    setTeam(owned.filter((c) => picked.includes(c.id)));
    onDone();
  };

  const rating = picked.length
    ? Math.round(owned.filter((c) => picked.includes(c.id)).reduce((s, c) => s + c.overall, 0) / picked.length)
    : 0;

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto', padding: '24px 20px 60px', width: '100%' }}>
      <button onClick={onDone} style={{
        background: 'var(--panel2)', color: 'var(--text)', padding: '7px 16px',
        borderRadius: 999, fontSize: 13, marginBottom: 18,
      }}>back</button>

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <h1 className="display" style={{ fontSize: 34, letterSpacing: 1 }}>BUILD YOUR TEAM</h1>
        <div style={{ fontFamily: "'Oswald',sans-serif", letterSpacing: 1, color: 'var(--text2)' }}>
          <span style={{ color: 'var(--live)' }}>{picked.length}</span>/{MAX} picked
          {rating ? <> · team rating <b style={{ color: 'var(--gold)' }}>{rating}</b></> : null}
        </div>
      </div>
      <p style={{ color: 'var(--text2)', fontSize: 13, margin: '4px 0 22px' }}>
        pick up to {MAX} from the cards you packed
      </p>

      {owned.length === 0 ? (
        <div style={{ border: '1px dashed var(--line)', borderRadius: 16, padding: 40, textAlign: 'center', color: 'var(--text2)' }}>
          no cards yet — rip a pack first
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'flex-start' }}>
          {owned.map((c) => (
            <div
              key={c.id}
              onClick={() => toggle(c.id)}
              style={{
                cursor: 'pointer', borderRadius: 18, padding: 6,
                outline: picked.includes(c.id) ? '2px solid var(--live)' : '2px solid transparent',
                boxShadow: picked.includes(c.id) ? '0 0 24px rgba(43,245,154,0.25)' : 'none',
              }}
            >
              <CardFace card={c} size="hand" flippable={false} />
            </div>
          ))}
        </div>
      )}

      <button
        onClick={save}
        disabled={picked.length === 0}
        style={{
          marginTop: 28, padding: '14px 36px', borderRadius: 12,
          fontFamily: "'Oswald',sans-serif", fontWeight: 700, letterSpacing: 1, fontSize: 16,
          background: 'linear-gradient(135deg,var(--live),#19c47b)', color: '#04130b',
          opacity: picked.length === 0 ? 0.5 : 1,
        }}
      >
        SAVE TEAM
      </button>
    </div>
  );
};
