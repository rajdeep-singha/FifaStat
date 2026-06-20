import { useEffect, useState } from 'react';
import './styles/globals.css';
import './styles/animations.css';
import { useStore } from './store';
import { LobbyScreen } from './components/lobby/LobbyScreen';
import { Arena } from './components/game/Arena';
import { CardFace } from './components/card/CardFace';

function App() {
  const { game, demoCards, fetchDemoCards } = useStore();
  const [showDemo, setShowDemo] = useState(false);
  const [revealedIdx, setRevealedIdx] = useState(-1);

  useEffect(() => { fetchDemoCards(); }, []);

  const startPackReveal = () => {
    setShowDemo(true);
    setRevealedIdx(-1);
    [0, 1, 2, 3, 4].forEach((i) => setTimeout(() => setRevealedIdx(i), 300 + i * 400));
  };

  const isInGame = ['dealing', 'choosing', 'waiting_choice', 'resolving', 'finished'].includes(game.status);

  if (isInGame) return <Arena />;

  return (
    <div style={{ minHeight: '100vh' }}>
      {showDemo && demoCards.length > 0 ? (
        <div style={{ padding: 20 }}>
          <button
            onClick={() => setShowDemo(false)}
            style={{
              background: 'var(--bg3)', color: 'white', padding: '8px 16px',
              borderRadius: 8, marginBottom: 24, fontSize: 14,
            }}
          >
            ← Back
          </button>
          <h2 style={{ color: 'var(--gold)', marginBottom: 20, textAlign: 'center' }}>Pack Opening</h2>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            {demoCards.slice(0, 5).map((card, i) => (
              <div key={card.id}>
                {i <= revealedIdx ? (
                  <CardFace
                    card={card}
                    isRevealing={i === revealedIdx}
                    size={i === 4 ? 'arena' : 'hand'}
                  />
                ) : (
                  <div style={{
                    width: 180, height: 260,
                    background: 'var(--bg2)', border: '2px solid var(--bg3)',
                    borderRadius: 12,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 32, color: 'var(--text2)',
                  }}>?</div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <LobbyScreen />
          {demoCards.length > 0 && (
            <div style={{ textAlign: 'center', paddingBottom: 40 }}>
              <button
                onClick={startPackReveal}
                style={{
                  background: 'transparent', border: '1px solid var(--bg3)',
                  color: 'var(--text2)', padding: '10px 20px', borderRadius: 8, fontSize: 13,
                }}
              >
                👀 Preview Cards
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
