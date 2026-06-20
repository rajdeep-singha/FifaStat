import { useEffect, useState } from 'react';
import type { Card, StatKey } from '../../types';
import '../../styles/card.css';
import '../../styles/animations.css';

interface CardFaceProps {
  card: Card;
  isSelected?: boolean;
  isRevealing?: boolean;
  size?: 'hand' | 'arena' | 'large';
  onClick?: () => void;
  showEffStats?: boolean;
  isWinner?: boolean;
  /** show the flip-to-form button (default true) */
  flippable?: boolean;
}

const STAT_LABELS: { key: StatKey; label: string }[] = [
  { key: 'pac', label: 'PAC' },
  { key: 'sho', label: 'SHO' },
  { key: 'pas', label: 'PAS' },
  { key: 'dri', label: 'DRI' },
  { key: 'def', label: 'DEF' },
  { key: 'phy', label: 'PHY' },
];

const ratingClass = (r: number) => (r >= 7.5 ? 'green' : r >= 6 ? 'yellow' : 'red');

export const CardFace: React.FC<CardFaceProps> = ({
  card,
  isSelected = false,
  isRevealing = false,
  size = 'hand',
  onClick,
  showEffStats = true,
  isWinner = false,
  flippable = true,
}) => {
  const [shine, setShine] = useState(false);
  const [glow, setGlow] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const stats = showEffStats ? card.eff_stats : card.base_stats;

  useEffect(() => {
    if (isRevealing) {
      setShine(true);
      const t = setTimeout(() => setGlow(true), 350);
      const t2 = setTimeout(() => { setGlow(false); setShine(false); }, 2400);
      return () => { clearTimeout(t); clearTimeout(t2); };
    }
  }, [isRevealing]);

  const sizeClass =
    size === 'arena' ? 'size-arena' : size === 'large' ? 'size-large' : 'size-hand';

  const frontCls = [
    'card-side',
    'card-front',
    shine ? 'card-shine' : '',
    glow ? 'glow-pulse' : '',
    isWinner ? 'win-pulse' : '',
    isSelected ? 'is-selected' : '',
  ].filter(Boolean).join(' ');

  const recent = (card.form || []).slice(0, 5);

  return (
    <div className={`card-wrapper ${sizeClass}`}>
      <div className="card-3d" data-flipped={flipped} onClick={onClick}>
        {/* ---------- FRONT ---------- */}
        <div className={frontCls} data-rarity={card.rarity}>
          <div className="card-photo">
            {card.photo_url ? (
              <img
                src={card.photo_url}
                alt={card.player_name}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            ) : (
              <div className="card-photo-placeholder">⚽</div>
            )}
          </div>

          <div className="card-overlay-top">
            <div className="card-overall">{card.overall}</div>
            <div className="divider" />
            <div className="card-position">{card.position}</div>
          </div>

          <div className="card-bottom">
            <div className="card-name">{card.player_name}</div>
            <div className="card-meta">
              <span>{card.nation}</span>
              <span className="dot" />
              <span>{card.club}</span>
            </div>

            <div className="card-stats">
              {STAT_LABELS.map(({ key, label }) => (
                <div className="card-stat" key={key}>
                  <span className="stat-label">{label}</span>
                  <span className="stat-value">{stats[key]}</span>
                </div>
              ))}
            </div>

            <div className="card-formline">
              <div className="form-strip">
                {recent.length > 0
                  ? recent.map((f, i) => <div key={i} className={`form-dot ${ratingClass(f.rating)}`} title={`${f.opponent}: ${f.rating}`} />)
                  : Array.from({ length: 5 }).map((_, i) => <div key={i} className="form-dot empty" />)}
              </div>
              {card.form_delta > 0 ? (
                <span className="form-pill hot"><span className="live-dot" />FORM +{card.form_delta}</span>
              ) : card.form_delta < 0 ? (
                <span className="form-pill cold">❄ {card.form_delta}</span>
              ) : null}
            </div>
          </div>
        </div>

        {/* ---------- BACK: the living card ---------- */}
        <div className="card-side card-back" data-rarity={card.rarity}>
          <div className="back-head">
            <span className="back-ovr">{card.overall}</span>
            <div className="back-name">
              {card.player_name}
              <small>{card.club} · {card.nation}</small>
            </div>
          </div>

          <div className="back-title">Last 5 · live form</div>

          <div className="back-games">
            {recent.map((g, i) => (
              <div className="back-game" key={i}>
                <div className={`game-rating ${ratingClass(g.rating)}`}>{g.rating.toFixed(1)}</div>
                <div className="game-opp">
                  <span>vs {g.opponent}</span>
                  <span className="date">{g.match_date.slice(5)}</span>
                </div>
                <div className="game-meme">“{g.meme || card.meme_tagline}”</div>
              </div>
            ))}
          </div>

          <div className="back-foot">
            <span>FORM SWING</span>
            <span>
              {card.form_delta > 0 ? <b className="up">+{card.form_delta}</b>
                : card.form_delta < 0 ? <b className="down">{card.form_delta}</b>
                : <b>0</b>} OVR
            </span>
          </div>
        </div>
      </div>

      {flippable && (
        <button
          className="card-flip-btn"
          title={flipped ? 'Back to card' : 'See last 5 games + memes'}
          onClick={(e) => { e.stopPropagation(); setFlipped((f) => !f); }}
        >
          {flipped ? '✕' : '↻'}
        </button>
      )}
    </div>
  );
};
