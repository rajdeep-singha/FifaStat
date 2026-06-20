import { useEffect, useMemo, useRef, useState } from 'react';
import type { Card } from '../../types';
import { CardFace } from '../card/CardFace';
import '../../styles/pack.css';

const rarityRank: Record<string, number> = { bronze: 0, silver: 1, gold: 2 };

// Anakin-flavored scrape lines shown while the pack "charges".
const scrapeLines = [
  ['fetching last match…', 'sofascore'],
  ['rating 8.7 · +3 form', 'live'],
  ['pulling action photo…', 'getty'],
  ['scraping meme tagline…', 'twitter'],
  ['minting card', 'done'],
];

type Phase = 'closed' | 'charging' | 'revealing';

export const PackOpening: React.FC<{ cards: Card[]; onClose: () => void }> = ({ cards, onClose }) => {
  const [phase, setPhase] = useState<Phase>('closed');
  const [revealed, setRevealed] = useState(0);
  const [scrapeIdx, setScrapeIdx] = useState(0);
  const timers = useRef<number[]>([]);

  // Pick 5 and order worst → best so the best card walks out last.
  const pack = useMemo(() => {
    const five = [...cards].sort(() => Math.random() - 0.5).slice(0, 5);
    return five.sort(
      (a, b) => rarityRank[a.rarity] - rarityRank[b.rarity] || a.overall - b.overall,
    );
  }, [cards]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // ?pack=auto opens immediately (used for demo deep-links / screenshots)
  useEffect(() => {
    if (new URLSearchParams(location.search).get('pack') === 'auto') open();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const open = () => {
    setPhase('charging');
    // scrape ticker
    scrapeLines.forEach((_, i) => {
      timers.current.push(window.setTimeout(() => setScrapeIdx(i), i * 240));
    });
    // then reveal cards one by one, longest pause before the best
    timers.current.push(window.setTimeout(() => {
      setPhase('revealing');
      pack.forEach((_, i) => {
        const delay = i * 650 + (i === pack.length - 1 ? 250 : 0);
        timers.current.push(window.setTimeout(() => setRevealed(i + 1), delay));
      });
    }, 1300));
  };

  const bestIdx = pack.length - 1;
  const done = revealed >= pack.length;
  const topRarity = pack[bestIdx]?.rarity ?? 'bronze';

  return (
    <div className="pack-overlay">
      <button className="pack-close" onClick={onClose}>✕ Close</button>
      {(phase === 'revealing') && topRarity === 'gold' && <div className="pack-rays rays" />}

      {phase === 'closed' && (
        <div className="pack-closed">
          <div className="pack-box pack-float" onClick={open}>
            <div className="pack-crest">⚽</div>
            <div className="pack-word">CARDCLASH</div>
            <div className="pack-tier">🏆 WORLD CUP 2026 · FORM XI</div>
          </div>
          <button className="pack-open-btn" onClick={open}>OPEN PACK</button>
          <p style={{ color: 'var(--text2)', fontSize: 13 }}>5 living cards · scraped fresh · lowkey heat</p>
        </div>
      )}

      {phase === 'charging' && (
        <div className="pack-closed">
          <div className="pack-box pack-float pack-charge">
            <div className="pack-crest">⚽</div>
            <div className="pack-word">CARDCLASH</div>
          </div>
          <div className="pack-scrape">
            {scrapeLines[scrapeIdx][0]}{' '}
            <span className="muted">— {scrapeLines[scrapeIdx][1]}</span>
          </div>
        </div>
      )}

      {phase === 'revealing' && (
        <>
          <div className="pack-head fade-in">
            <h2>{done ? 'YOUR PACK' : 'COOKING…'}</h2>
            <p>{done ? 'tap ↻ on any card for its last 5 games + memes' : 'goat lands last'}</p>
          </div>
          <div className="pack-stage">
            {pack.map((card, i) => {
              const isOpen = i < revealed;
              const isBest = i === bestIdx;
              const justRevealed = i === revealed - 1;
              return (
                <div key={card.id} className={`pack-slot ${isBest ? 'is-best' : ''}`}>
                  {isOpen ? (
                    <div className={isBest ? 'walkout' : 'rise'}>
                      {isBest && justRevealed && topRarity === 'gold' && (
                        <div className="pack-burst burst" />
                      )}
                      <CardFace
                        card={card}
                        size={isBest ? 'large' : 'hand'}
                        isRevealing={justRevealed}
                      />
                    </div>
                  ) : (
                    <div className="pack-down">?</div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
