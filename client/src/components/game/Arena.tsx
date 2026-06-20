import { useStore } from '../../store';
import { CardFace } from '../card/CardFace';
import { StatPicker } from './StatPicker';
import { RoundResult } from './RoundResult';
import type { StatKey } from '../../types';

export const Arena: React.FC = () => {
  const { game, selectCard, selectStat, setGameStatus } = useStore();
  const { hand, status, selectedCard, p1Score, p2Score, currentRound, lastResult, playerSlot, winnerSlot, opponentPosition } = game;

  const myScore = playerSlot === 1 ? p1Score : p2Score;
  const oppScore = playerSlot === 1 ? p2Score : p1Score;

  const handleStatSelect = (stat: StatKey) => selectStat(stat);
  const handleContinue = () => setGameStatus('choosing');

  if (status === 'finished') {
    const iWon = winnerSlot === playerSlot;
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: '100vh', gap: 24, padding: 20,
      }}>
        <h2 className="display" style={{ fontSize: 72, color: iWon ? 'var(--win)' : 'var(--loss)' }}>
          {winnerSlot === 0 ? 'DRAW' : iWon ? 'VICTORY' : 'DEFEAT'}
        </h2>
        <div style={{ fontSize: 20, color: 'var(--text2)' }}>
          Final: {myScore} – {oppScore}
        </div>
        <button
          onClick={() => window.location.reload()}
          style={{
            background: 'var(--gold)', color: '#000',
            padding: '14px 32px', borderRadius: 12, fontSize: 16, fontWeight: 800,
          }}
        >
          Play Again
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* Score bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 20px', background: 'var(--bg2)',
        borderBottom: '1px solid var(--bg3)',
      }}>
        <div style={{ fontSize: 14, color: 'var(--text2)' }}>Round {Math.min(currentRound, 3)} / 3</div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <span style={{ fontSize: 24, fontWeight: 900, color: myScore > oppScore ? 'var(--win)' : 'white' }}>
            {myScore}
          </span>
          <span style={{ color: 'var(--text2)' }}>–</span>
          <span style={{ fontSize: 24, fontWeight: 900, color: oppScore > myScore ? 'var(--win)' : 'white' }}>
            {oppScore}
          </span>
        </div>
        <div style={{ fontSize: 14, color: 'var(--text2)' }}>
          {status === 'waiting_choice' ? 'waiting…' : status === 'choosing' ? 'your turn' : ''}
        </div>
      </div>

      {/* Opponent zone */}
      <div style={{
        padding: '12px 20px', background: 'rgba(0,0,0,0.3)',
        borderBottom: '1px solid var(--bg3)',
        display: 'flex', gap: 8, alignItems: 'center',
      }}>
        <span style={{ fontSize: 12, color: 'var(--text2)', marginRight: 4 }}>Opponent:</span>
        {Array.from({ length: game.opponentCardCount }).map((_, i) => (
          <div key={i} style={{
            width: 40, height: 56,
            background: 'var(--bg3)', border: '2px solid var(--bg3)',
            borderRadius: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text2)', fontSize: 10,
          }}>?</div>
        ))}
      </div>

      {/* Stat picker */}
      {selectedCard && status === 'choosing' && (
        <div style={{ padding: '8px 16px', background: 'var(--bg2)', borderBottom: '1px solid var(--bg3)' }}>
          <StatPicker
            card={selectedCard}
            opponentPosition={opponentPosition}
            onStatSelect={handleStatSelect}
            disabled={false}
          />
        </div>
      )}

      {/* Hand */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        <div>
          <div style={{ padding: '8px 16px', fontSize: 12, color: 'var(--text2)' }}>
            {status === 'choosing' && !selectedCard && 'Select a card to play'}
            {selectedCard && status === 'choosing' && `${selectedCard.player_name} selected — pick a stat above`}
            {status === 'waiting_choice' && 'Waiting for opponent...'}
          </div>
          <div style={{
            display: 'flex', gap: 10, padding: '8px 16px 16px',
            overflowX: 'auto', WebkitOverflowScrolling: 'touch',
          }}>
            {hand.map((card, i) => (
              <div key={card.id} style={{ animationDelay: `${i * 0.1}s` }} className="card-reveal">
                <CardFace
                  card={card}
                  isSelected={selectedCard?.id === card.id}
                  onClick={() => status === 'choosing' && selectCard(card)}
                  isRevealing={status === 'dealing'}
                  size="hand"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Round result overlay */}
      {status === 'resolving' && lastResult && (
        <RoundResult result={lastResult} playerSlot={playerSlot} onContinue={handleContinue} />
      )}
    </div>
  );
};
