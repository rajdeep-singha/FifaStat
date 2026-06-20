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
}

const STAT_LABELS: { key: StatKey; label: string }[] = [
  { key: 'pac', label: 'PAC' },
  { key: 'sho', label: 'SHO' },
  { key: 'pas', label: 'PAS' },
  { key: 'dri', label: 'DRI' },
  { key: 'def', label: 'DEF' },
  { key: 'phy', label: 'PHY' },
];

export const CardFace: React.FC<CardFaceProps> = ({
  card,
  isSelected = false,
  isRevealing = false,
  size = 'hand',
  onClick,
  showEffStats = true,
  isWinner = false,
}) => {
  const [revealClass, setRevealClass] = useState('');
  const [glowClass, setGlowClass] = useState('');
  const stats = showEffStats ? card.eff_stats : card.base_stats;

  useEffect(() => {
    if (isRevealing) {
      setRevealClass('card-reveal');
      const t = setTimeout(() => {
        setGlowClass('card-glow-pulse');
        setTimeout(() => setGlowClass(''), 2500);
      }, 400);
      return () => clearTimeout(t);
    }
  }, [isRevealing]);

  useEffect(() => {
    if (isWinner) {
      setGlowClass('card-win-pulse');
      const t = setTimeout(() => setGlowClass(''), 1200);
      return () => clearTimeout(t);
    }
  }, [isWinner]);

  const formDotClass = (rating: number) => {
    if (rating >= 7.5) return 'green';
    if (rating >= 6) return 'yellow';
    return 'red';
  };

  const sizeClass = size === 'arena' ? 'size-arena' : size === 'large' ? 'size-large' : '';

  return (
    <div className={`card-wrapper ${sizeClass}`} onClick={onClick}>
      <div
        className={`card ${revealClass} ${glowClass} ${isSelected ? 'selected' : ''}`}
        data-rarity={card.rarity}
      >
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
          <div className="card-position">{card.position}</div>
        </div>

        <div className="card-bottom">
          <div className="card-name">{card.player_name}</div>
          <div className="card-meta">
            <span>{card.nation}</span>
            <span>·</span>
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

          <div className="form-strip">
            {card.form && card.form.length > 0 ? (
              card.form.slice(0, 5).map((f, i) => (
                <div key={i} className={`form-dot ${formDotClass(f.rating)}`} title={`${f.opponent}: ${f.rating}`} />
              ))
            ) : (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="form-dot empty" />
              ))
            )}
            {card.form_delta !== 0 && (
              <span className={`form-delta ${card.form_delta > 0 ? 'positive' : 'negative'}`}>
                {card.form_delta > 0 ? `+${card.form_delta}` : card.form_delta}
              </span>
            )}
          </div>

          {card.meme_tagline && (
            <div className="meme-tagline">"{card.meme_tagline}"</div>
          )}
        </div>
      </div>
    </div>
  );
};
