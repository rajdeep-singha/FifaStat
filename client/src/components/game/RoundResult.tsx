import { useEffect, useState } from 'react';
import type { RoundResult as RoundResultType } from '../../types';

interface Props {
  result: RoundResultType;
  playerSlot: number;
  onContinue: () => void;
}

export const RoundResult: React.FC<Props> = ({ result, playerSlot, onContinue }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShow(true), 100);
    const t2 = setTimeout(onContinue, 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onContinue]);

  const iWon = result.winner_player === playerSlot;
  const isDraw = result.winner_player === 0;

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 100,
    }}>
      <div className={show ? 'slide-up' : ''} style={{
        background: 'var(--bg2)',
        border: `3px solid ${isDraw ? 'var(--text2)' : iWon ? 'var(--win)' : '#ef4444'}`,
        borderRadius: 20, padding: '32px 48px', textAlign: 'center', maxWidth: 360,
      }}>
        <div style={{
          fontSize: 32, fontWeight: 900,
          color: isDraw ? 'var(--text2)' : iWon ? 'var(--win)' : '#ef4444',
          marginBottom: 12,
        }}>
          {isDraw ? 'DRAW' : iWon ? 'YOU WIN!' : 'YOU LOSE'}
        </div>
        <div style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 8 }}>
          Round {result.round} · {result.p1_choice.stat_key.toUpperCase()}
        </div>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 12 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--text2)' }}>P1</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: result.winner_player === 1 ? 'var(--win)' : 'white' }}>
              {result.p1_eff_value.toFixed(1)}
            </div>
          </div>
          <div style={{ fontSize: 20, alignSelf: 'center', color: 'var(--text2)' }}>vs</div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--text2)' }}>P2</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: result.winner_player === 2 ? 'var(--win)' : 'white' }}>
              {result.p2_eff_value.toFixed(1)}
            </div>
          </div>
        </div>
        {result.counter_bonus && (
          <div className="counter-badge" style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, #16a34a, #15803d)',
            color: 'white', padding: '6px 16px', borderRadius: 99,
            fontSize: 12, fontWeight: 800,
          }}>
            COUNTER BONUS ×1.2
          </div>
        )}
      </div>
    </div>
  );
};
