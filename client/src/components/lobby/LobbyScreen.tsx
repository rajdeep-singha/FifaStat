import { useState } from 'react';
import { useStore } from '../../store';

const panel: React.CSSProperties = {
  background: 'var(--panel)', border: '1px solid var(--line)',
  borderRadius: 18, padding: 28, width: 270,
  display: 'flex', flexDirection: 'column', gap: 16,
};
const label: React.CSSProperties = {
  fontFamily: "'Oswald', sans-serif", fontWeight: 600, letterSpacing: 2,
  textTransform: 'uppercase', fontSize: 13, textAlign: 'center',
};

export const LobbyScreen: React.FC<{ onOpenPack?: () => void }> = ({ onOpenPack }) => {
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
    const ready = game.status === 'waiting_opponent';
    return (
      <div style={{ textAlign: 'center', padding: '70px 20px' }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>⚽</div>
        <h2 className="display" style={{ fontSize: 26, marginBottom: 20 }}>ROOM READY</h2>
        <div style={{
          fontFamily: "'Anton', sans-serif", fontSize: 44, letterSpacing: 10,
          color: 'var(--live)', padding: '14px 36px', display: 'inline-block',
          background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 16,
          boxShadow: '0 0 40px rgba(43,245,154,0.18)',
        }}>
          {game.roomId}
        </div>
        <p style={{ color: 'var(--text2)', fontSize: 14, marginTop: 16 }}>
          Share this code — your opponent enters it to join
        </p>
        <div style={{ marginTop: 22, fontFamily: "'Oswald', sans-serif", letterSpacing: 1 }}>
          {ready ? (
            <span style={{ color: 'var(--live)' }}>● OPPONENT CONNECTED — KICK OFF</span>
          ) : (
            <span style={{ color: 'var(--text2)' }}>○ waiting for opponent…</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '82vh', padding: 20, gap: 30,
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 className="display" style={{
          fontSize: 72, lineHeight: 0.9,
          background: 'linear-gradient(135deg, #fff 10%, var(--live) 60%, var(--accent))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          CARDCLASH
        </h1>
        <p style={{
          color: 'var(--live)', fontSize: 13, marginTop: 6,
          fontFamily: "'Oswald', sans-serif", letterSpacing: 4, textTransform: 'uppercase',
        }}>
          🏆 World Cup 2026 · live form · no cap
        </p>
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
        <div style={panel}>
          <h3 style={{ ...label, color: 'var(--live)' }}>Create room</h3>
          <p style={{ color: 'var(--text2)', fontSize: 12, textAlign: 'center', lineHeight: 1.5 }}>
            Host a match and get a 5-letter code to share.
          </p>
          <button
            onClick={createRoom}
            disabled={isCreating}
            style={{
              background: 'linear-gradient(135deg, var(--live), #19c47b)',
              color: '#04130b', padding: '14px 24px', borderRadius: 12,
              fontFamily: "'Oswald', sans-serif", fontSize: 16, fontWeight: 700, letterSpacing: 1,
              opacity: isCreating ? 0.7 : 1,
            }}
          >
            {isCreating ? 'CREATING…' : '+ NEW GAME'}
          </button>
        </div>

        <div style={panel}>
          <h3 style={{ ...label, color: 'var(--accent)' }}>Join room</h3>
          <input
            value={roomInput}
            onChange={(e) => setRoomInput(e.target.value.toUpperCase())}
            placeholder="CODE"
            maxLength={5}
            style={{
              background: 'var(--pitch2)', border: '1px solid var(--line)',
              borderRadius: 10, padding: '12px 16px', color: '#fff',
              fontFamily: "'Anton', sans-serif", fontSize: 26, letterSpacing: 8,
              textAlign: 'center', outline: 'none',
            }}
            onKeyDown={(e) => e.key === 'Enter' && joinRoom()}
          />
          <button
            onClick={joinRoom}
            disabled={!roomInput.trim()}
            style={{
              background: 'var(--accent)', color: '#04121c',
              padding: '14px 24px', borderRadius: 12,
              fontFamily: "'Oswald', sans-serif", fontSize: 16, fontWeight: 700, letterSpacing: 1,
              opacity: !roomInput.trim() ? 0.45 : 1,
            }}
          >
            JOIN →
          </button>
        </div>
      </div>

      {onOpenPack && (
        <button
          onClick={onOpenPack}
          style={{
            background: 'transparent', border: '1px solid var(--social)',
            color: 'var(--social)', padding: '12px 26px', borderRadius: 999,
            fontFamily: "'Oswald', sans-serif", fontWeight: 600, letterSpacing: 1.5, fontSize: 13,
          }}
        >
          ⚡ OPEN A PACK
        </button>
      )}
    </div>
  );
};
