import { useEffect, useState } from 'react';
import './styles/globals.css';
import './styles/animations.css';
import { useStore } from './store';
import { LobbyScreen } from './components/lobby/LobbyScreen';
import { Arena } from './components/game/Arena';
import { PackOpening } from './components/pack/PackOpening';
import { useAuth } from './web3/useAuth';
import { LoginScreen } from './components/auth/LoginScreen';
import { UsernamePrompt } from './components/auth/UsernamePrompt';
import { ProfileBar } from './components/auth/ProfileBar';

function App() {
  const { game, demoCards, fetchDemoCards } = useStore();
  const { isLoggedIn } = useAuth();
  const [showcase, setShowcase] = useState(false);
  const [editingName, setEditingName] = useState(false);

  useEffect(() => { fetchDemoCards(); }, []);

  // Pack opening is a showcase — playable before login too (no wallet needed to look).
  if (showcase && demoCards.length > 0) {
    return <PackOpening cards={demoCards} onClose={() => setShowcase(false)} />;
  }

  // ---- on-chain auth gate (no backend) ----
  // Login = connect wallet + sign (FREE, no gas). That's all it takes to play.
  // Setting an on-chain username is optional and is the only thing that needs test ETH.
  if (!isLoggedIn) return <LoginScreen onPreview={() => setShowcase(true)} />;

  const isInGame = ['dealing', 'choosing', 'waiting_choice', 'resolving', 'finished'].includes(game.status);

  if (isInGame) return <Arena />;
  if (editingName) return <UsernamePrompt onClose={() => setEditingName(false)} />;

  return (
    <div style={{ minHeight: '100vh' }}>
      <ProfileBar onEditName={() => setEditingName(true)} />
      <LobbyScreen onOpenPack={() => setShowcase(true)} />
    </div>
  );
}

export default App;
