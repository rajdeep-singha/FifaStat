import { useEffect, useState } from 'react';
import './styles/globals.css';
import './styles/animations.css';
import { useStore } from './store';
import { LobbyScreen } from './components/lobby/LobbyScreen';
import { Arena } from './components/game/Arena';
import { PackOpening } from './components/pack/PackOpening';
import { HomeScreen } from './components/home/HomeScreen';
import { useAuth } from './web3/useAuth';
import { LoginScreen } from './components/auth/LoginScreen';
import { ProfileBar } from './components/auth/ProfileBar';

function App() {
  const { game, demoCards, fetchDemoCards } = useStore();
  const { isLoggedIn } = useAuth();
  const [showcase, setShowcase] = useState(() => new URLSearchParams(location.search).has('pack'));
  const [view, setView] = useState<'home' | 'play'>('home');

  useEffect(() => { fetchDemoCards(); }, []);

  // Flow:  login → home (your id + your cards) → Open Pack / Play → match
  // Pack opening also works pre-login (no wallet needed to look).
  if (showcase && demoCards.length > 0) {
    return <PackOpening cards={demoCards} onClose={() => setShowcase(false)} />;
  }

  if (!isLoggedIn) return <LoginScreen onPreview={() => setShowcase(true)} />;

  const isInGame = ['dealing', 'choosing', 'waiting_choice', 'resolving', 'finished'].includes(game.status);
  if (isInGame) return <Arena />;

  return (
    <div style={{ minHeight: '100vh' }}>
      <ProfileBar />
      {view === 'home' ? (
        <HomeScreen onOpenPack={() => setShowcase(true)} onPlay={() => setView('play')} />
      ) : (
        <div>
          <button
            onClick={() => setView('home')}
            style={{
              margin: '14px 0 0 18px', background: 'var(--panel2)', color: 'var(--text)',
              padding: '7px 16px', borderRadius: 999, fontSize: 13,
            }}
          >
            ← home
          </button>
          <LobbyScreen onOpenPack={() => setShowcase(true)} />
        </div>
      )}
    </div>
  );
}

export default App;
