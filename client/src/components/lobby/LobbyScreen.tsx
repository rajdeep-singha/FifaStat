import React, { useState } from 'react';
import { useStore } from '../../store';

export const LobbyScreen: React.FC = () => {
  const [roomInput, setRoomInput] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { hostRoom, joinRoom: joinP2P, game } = useStore();

  const createRoom = async () => {
    setIsCreating(true);
    await hostRoom();
    setIsCreating(false);
  };

  const joinRoom = () => {
    if (!roomInput.trim()) return;
    joinP2P(roomInput.trim());
  };

  if (game.roomId && (game.status === 'idle' || game.status === 'waiting_opponent')) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚽</div>
        <h2 style={{ color: 'var(--gold)', fontSize: 24, marginBottom: 16 }}>Room Created!</h2>
        <div style={{
          background: 'var(--bg3)',
          padding: '16px 32px',
          borderRadius: 12,
          fontSize: 28,
          fontWeight: 900,
          letterSpacing: 4,
          color: 'white',
          display: 'inline-block',
          marginBottom: 16,
          border: '2px solid var(--gold)',
        }}>
          {game.roomId}
        </div>
        <p style={{ color: 'var(--text2)', fontSize: 14 }}>Share this code with your opponent</p>
        <div style={{ marginTop: 24, color: 'var(--text2)' }}>
          {game.status === 'waiting_opponent' ? (
            <span style={{ color: 'var(--win)' }}>✓ Opponent connected! Starting...</span>
          ) : (
            <span>⏳ Waiting for opponent to join...</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '80vh', padding: 20, gap: 32,
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 8 }}>⚽</div>
        <h1 style={{
          fontSize: 48, fontWeight: 900,
          background: 'linear-gradient(135deg, #c8a227, #ffd700)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: -1,
        }}>
          CardClash
        </h1>
        <p style={{ color: 'var(--text2)', fontSize: 16, marginTop: 8 }}>
          Football cards. Live data. Real stakes.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
        <div style={{
          background: 'var(--bg2)', border: '1px solid var(--bg3)',
          borderRadius: 16, padding: 32, width: 260,
          display: 'flex', flexDirection: 'column', gap: 16,
        }}>
          <h3 style={{ color: 'var(--gold)', textAlign: 'center' }}>Create Room</h3>
          <button
            onClick={createRoom}
            disabled={isCreating}
            style={{
              background: 'linear-gradient(135deg, #c8a227, #ffd700)',
              color: '#000', padding: '14px 24px', borderRadius: 10,
              fontSize: 16, fontWeight: 800, opacity: isCreating ? 0.7 : 1,
            }}
          >
            {isCreating ? 'Creating...' : '+ New Game'}
          </button>
        </div>

        <div style={{
          background: 'var(--bg2)', border: '1px solid var(--bg3)',
          borderRadius: 16, padding: 32, width: 260,
          display: 'flex', flexDirection: 'column', gap: 16,
        }}>
          <h3 style={{ color: 'var(--accent)', textAlign: 'center' }}>Join Room</h3>
          <input
            value={roomInput}
            onChange={(e) => setRoomInput(e.target.value.toUpperCase())}
            placeholder="ROOM CODE"
            maxLength={8}
            style={{
              background: 'var(--bg3)', border: '2px solid var(--bg3)',
              borderRadius: 8, padding: '12px 16px', color: 'white',
              fontSize: 20, fontWeight: 700, letterSpacing: 4,
              textAlign: 'center', outline: 'none',
            }}
            onKeyDown={(e) => e.key === 'Enter' && joinRoom()}
          />
          <button
            onClick={joinRoom}
            disabled={!roomInput.trim()}
            style={{
              background: 'var(--accent)', color: 'white',
              padding: '14px 24px', borderRadius: 10,
              fontSize: 16, fontWeight: 800,
              opacity: !roomInput.trim() ? 0.5 : 1,
            }}
          >
            Join →
          </button>
        </div>
      </div>
    </div>
  );
};
