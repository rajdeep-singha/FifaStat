import { useEffect, useState } from 'react';
import './styles/globals.css';
import './styles/animations.css';
import { useStore } from './store';
import { LobbyScreen } from './components/lobby/LobbyScreen';
import { Arena } from './components/game/Arena';
import { PackOpening } from './components/pack/PackOpening';
import { HomeScreen } from './components/home/HomeScreen';
import { LandingPage } from './components/landing/LandingPage';
import { useAuth } from './web3/useAuth';
import { LoginScreen } from './components/auth/LoginScreen';
import { ProfileBar } from './components/auth/ProfileBar';

function App() {
  const { game, demoCards, fetchDemoCards } = useStore();
  const { isLoggedIn } = useAuth();
  const [showcase, setShowcase] = useState(() => new URLSearchParams(location.search).has('pack'));
  const [view, setView] = useState<'home' | 'play'>('home');
  const [hasEntered, setHasEntered] = useState(() => {
    return sessionStorage.getItem('cc.entered') === '1';
  });

  useEffect(() => { fetchDemoCards(); }, []);

  const enterApp = () => {
    sessionStorage.setItem('cc.entered', '1');
    setHasEntered(true);
  };

  // Pack opening works before login
  if (showcase && demoCards.length > 0) {
    return <PackOpening cards={demoCards} onClose={() => setShowcase(false)} />;
  }

  // Landing page — shown before entering the app
  if (!hasEntered) {
    return (
      <LandingPage
        demoCards={demoCards}
        onEnterApp={enterApp}
        onOpenPack={() => setShowcase(true)}
      />
    );
  }

  // Auth gate
  if (!isLoggedIn) return <LoginScreen onPreview={() => setShowcase(true)} />;

  // In-game
  const isInGame = ['dealing', 'choosing', 'waiting_choice', 'resolving', 'finished'].includes(game.status);
  if (isInGame) return <Arena />;

  return (
    <div style={{ minHeight: '100vh' }}>
      <ProfileBar />
      {view === 'home' ? (
        <HomeScreen onOpenPack={() => setShowcase(true)} onPlay={() => setView('play')} onBuildTeam={() => setView('play')} />
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
