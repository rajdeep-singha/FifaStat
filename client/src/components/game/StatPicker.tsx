import type { Card, StatKey, Position } from '../../types';

const STATS: { key: StatKey; label: string }[] = [
  { key: 'pac', label: 'PAC' },
  { key: 'sho', label: 'SHO' },
  { key: 'pas', label: 'PAS' },
  { key: 'dri', label: 'DRI' },
  { key: 'def', label: 'DEF' },
  { key: 'phy', label: 'PHY' },
];

const counterMap: Record<Position, Position> = { ATK: 'MID', MID: 'DEF', DEF: 'ATK' };

interface StatPickerProps {
  card: Card;
  opponentPosition: Position | null;
  onStatSelect: (stat: StatKey) => void;
  disabled?: boolean;
}

export const StatPicker: React.FC<StatPickerProps> = ({ card, opponentPosition, onStatSelect, disabled }) => {
  const counters = opponentPosition ? counterMap[card.position] === opponentPosition : false;

  return (
    <div style={{ padding: '12px 0' }}>
      <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 8, textAlign: 'center' }}>
        Pick a stat to challenge with
        {counters && (
          <span style={{
            display: 'inline-block', marginLeft: 8,
            background: '#16a34a', color: 'white',
            padding: '2px 8px', borderRadius: 99, fontSize: 10, fontWeight: 700,
          }}>
            ×1.2 COUNTER BONUS
          </span>
        )}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {STATS.map(({ key, label }) => {
          const val = card.eff_stats[key];
          const base = card.base_stats[key];
          const diff = val - base;
          return (
            <button
              key={key}
              onClick={() => !disabled && onStatSelect(key)}
              disabled={disabled}
              style={{
                background: 'var(--bg3)', border: '2px solid rgba(255,255,255,0.1)',
                borderRadius: 10, padding: '10px 8px', color: 'white',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s', opacity: disabled ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (!disabled) {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--gold)';
                  (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)';
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)';
                (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
              }}
            >
              <span style={{ fontSize: 10, color: 'var(--gold)', fontWeight: 700 }}>{label}</span>
              <span style={{ fontSize: 22, fontWeight: 900 }}>{val}</span>
              {diff !== 0 && (
                <span style={{ fontSize: 10, color: diff > 0 ? '#22c55e' : '#ef4444', fontWeight: 700 }}>
                  {diff > 0 ? `+${diff}` : diff}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
