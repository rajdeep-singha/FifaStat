import { useEffect, useRef, useState } from 'react';
import type { Card } from '../../types';
import { CardFace } from '../card/CardFace';
import '../../styles/landing.css';

/* ──────────────────────────────────────────────
   Types & constants
────────────────────────────────────────────── */

interface TickerEntry {
  name: string;
  club: string;
  rating: number;
  delta: number;
}

const TICKER_DATA: TickerEntry[] = [
  { name: 'Haaland',      club: 'Man City',   rating: 9.8, delta: +3 },
  { name: 'Salah',        club: 'Liverpool',  rating: 9.5, delta: +3 },
  { name: 'Mbappe',       club: 'Real Madrid',rating: 9.2, delta: +3 },
  { name: 'Bellingham',   club: 'Real Madrid',rating: 9.1, delta: +3 },
  { name: 'Lamine Yamal', club: 'Barcelona',  rating: 9.3, delta: +3 },
  { name: 'Pedri',        club: 'Barcelona',  rating: 5.5, delta: -2 },
  { name: 'De Bruyne',    club: 'Man City',   rating: 6.8, delta:  0 },
  { name: 'Vinicius Jr',  club: 'Real Madrid',rating: 8.8, delta: +2 },
  { name: 'Rodri',        club: 'Man City',   rating: 8.5, delta: +3 },
  { name: 'Van Dijk',     club: 'Liverpool',  rating: 9.0, delta: +3 },
  { name: 'Foden',        club: 'Man City',   rating: 8.7, delta: +3 },
  { name: 'Saka',         club: 'Arsenal',    rating: 8.0, delta: +1 },
];

const FEATURES = [
  {
    icon: '📸', label: 'feature-icon-green', accent: 'feature-accent-green',
    title: 'Live Match Photos',
    desc: 'Every card pulls a real action shot from the player\'s latest match. Not a stock portrait — the actual moment.',
  },
  {
    icon: '📊', label: 'feature-icon-cyan', accent: 'feature-accent-cyan',
    title: 'Credible Stats',
    desc: 'PAC · SHO · PAS · DRI · DEF · PHY scraped from proper ratings databases. The numbers are real.',
  },
  {
    icon: '⚡', label: 'feature-icon-purple', accent: 'feature-accent-purple',
    title: 'Live Form Rating',
    desc: 'Last 5 match ratings swing overall ±5. Haaland hat-trick tonight? His card is 94 by morning.',
  },
  {
    icon: '🐦', label: 'feature-icon-gold', accent: 'feature-accent-gold',
    title: 'Meme Taglines',
    desc: 'The top caption about that player from football Twitter, scraped fresh. "The spinner got spinned."',
  },
];

/* ──────────────────────────────────────────────
   Sub-components
────────────────────────────────────────────── */

function LiveTicker() {
  // Duplicate for seamless loop
  const items = [...TICKER_DATA, ...TICKER_DATA];
  return (
    <div className="ticker-rail">
      <div className="ticker-label">
        <div className="live-pip" />
        LIVE FORM
      </div>
      <div className="ticker-track">
        <div className="ticker-inner">
          {items.map((t, i) => (
            <div className="ticker-item" key={i}>
              <span className="ticker-name">{t.name}</span>
              <span className={`ticker-rating ${t.delta > 0 ? 'up' : t.delta < 0 ? 'down' : ''}`}>
                {t.rating.toFixed(1)} {t.delta > 0 ? `▲+${t.delta}` : t.delta < 0 ? `▼${t.delta}` : '→'}
              </span>
              <span className="ticker-club">{t.club}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AnimatedNumber({ target }: { target: number }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      const start = performance.now();
      const dur = 1400;
      const tick = (now: number) => {
        const t = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        setVal(Math.round(eased * target));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref} className="stat-number">{val}</span>;
}

/* ──────────────────────────────────────────────
   Main LandingPage
────────────────────────────────────────────── */

interface Props {
  demoCards: Card[];
  onEnterApp: () => void;
  onOpenPack: () => void;
}

export const LandingPage: React.FC<Props> = ({ demoCards, onEnterApp, onOpenPack }) => {
  const heroCard = demoCards.find(c => c.rarity === 'gold') ?? demoCards[0];
  const showcaseCards = demoCards.filter(c => c.rarity === 'gold').slice(0, 4);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{ minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ── NAVBAR ── */}
      <nav className="land-nav">
        <div className="land-nav-logo">
          <span className="ball">⚽</span>
          CARDCLASH
        </div>
        <div className="land-nav-links">
          <button className="land-nav-link" onClick={() => scrollTo('features')}>How It Works</button>
          <button className="land-nav-link" onClick={() => scrollTo('cards')}>The Cards</button>
          <button className="land-nav-link" onClick={() => scrollTo('play')}>Play</button>
        </div>
        <button className="land-nav-cta" onClick={onEnterApp}>Enter App →</button>
      </nav>

      {/* ── HERO ── */}
      <section className="land-hero">
        {/* Background video */}
        <video
          className="hero-video-bg"
          src="/bg.mp4"
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="land-hero-left">
          <div className="land-hero-tag">
            <div className="live-pip" />
            🏆 WORLD CUP 2026 — LIVE DATA
          </div>
          <h1>FOOTBALL<br />CARDS.<br />ALIVE.</h1>
          <p className="land-hero-sub">
            Real match photos. <strong>Credible stats.</strong> Ratings that move after every game.
            A meme tagline scraped off Twitter. <strong>All live, every matchday.</strong>
          </p>
          <div className="land-hero-btns">
            <button className="hero-btn-primary" onClick={onOpenPack}>
              ⚡ OPEN A PACK
            </button>
            <button className="hero-btn-secondary" onClick={onEnterApp}>
              ENTER APP →
            </button>
          </div>
        </div>

        {heroCard && (
          <div className="land-hero-right">
            <div className="hero-card-float">
              <CardFace card={heroCard} size="large" flippable={false} />
            </div>
          </div>
        )}
      </section>

      {/* ── LIVE TICKER ── */}
      <LiveTicker />

      {/* ── FEATURES ── */}
      <section className="land-section" id="features" style={{ textAlign: 'left' }}>
        <span className="land-section-label">Why CardClash</span>
        <h2>CARDS THAT<br />MOVE WITH FOOTBALL</h2>
        <p className="sub">
          FIFA cards are frozen all season. Ours update every real match — photo, rating, caption.
        </p>
        <div className="features-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className={`feature-card glass ${f.accent}`}
              style={{ borderRadius: 20 }}>
              <div className={`feature-icon ${f.label}`}>{f.icon}</div>
              <h3 style={{ color: 'var(--text)' }}>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <div style={{ background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="land-section" style={{ textAlign: 'center' }}>
          <span className="land-section-label">The Loop</span>
          <h2 style={{ margin: '0 auto 8px' }}>HOW IT WORKS</h2>
          <p className="sub" style={{ margin: '0 auto 48px', textAlign: 'center' }}>
            Three moments. Each one hits different.
          </p>
          <div className="steps-row">
            <div className="step">
              <div className="step-num step-1">1</div>
              <h3 style={{ color: 'var(--live)' }}>Open a Pack</h3>
              <p>5 living cards scraped fresh. Worst card first, god-tier lands last. Watch the meme tagline load in real time.</p>
            </div>
            <div className="step">
              <div className="step-num step-2">2</div>
              <h3 style={{ color: 'var(--social)' }}>Duel 1v1</h3>
              <p>Pick a card, pick a stat. ATK beats MID beats DEF beats ATK — the counter gives you ×1.2. A 78 can beat an 88.</p>
            </div>
            <div className="step">
              <div className="step-num step-3">3</div>
              <h3 style={{ color: 'var(--accent)' }}>Win Cards</h3>
              <p>Best of 3. Winner takes the opponent's wagered card. Real stakes, provable wins, and a screenshot-able meme to close it out.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── CARD SHOWCASE ── */}
      {showcaseCards.length > 0 && (
        <section className="land-section" id="cards" style={{ textAlign: 'center' }}>
          <span className="land-section-label">The Cards</span>
          <h2 style={{ margin: '0 auto 8px' }}>LIVING CARDS</h2>
          <p className="sub" style={{ margin: '0 auto 48px', textAlign: 'center' }}>
            Tap ↻ on any card to see the last 5 match ratings + memes.
          </p>
          <div className="showcase-grid">
            {showcaseCards.map((card) => (
              <div key={card.id} className="showcase-card">
                <CardFace card={card} size="arena" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── STATS BAR ── */}
      <div className="stats-bar">
        <div className="stats-inner">
          <div className="stat-item">
            <AnimatedNumber target={12} />
            <div className="stat-label">Live Players</div>
          </div>
          <div className="stat-item">
            <AnimatedNumber target={6} />
            <div className="stat-label">Nations</div>
          </div>
          <div className="stat-item">
            <AnimatedNumber target={64} />
            <div className="stat-label">WC Matches</div>
          </div>
          <div className="stat-item">
            <AnimatedNumber target={99} />
            <div className="stat-label">Max Overall</div>
          </div>
        </div>
      </div>

      {/* ── VS TABLE ── */}
      <section className="land-section" style={{ textAlign: 'center' }}>
        <span className="land-section-label">The Difference</span>
        <h2 style={{ margin: '0 auto 32px' }}>VS EVERY OTHER CARD GAME</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          gap: 0,
          maxWidth: 700, margin: '0 auto',
          borderRadius: 20, overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          {/* Header */}
          <div style={{ background: 'rgba(255,255,255,0.04)', padding: '14px 20px', fontFamily: "'Oswald', sans-serif", fontWeight: 700, color: 'var(--text2)', letterSpacing: 2, fontSize: 12 }}>NORMAL</div>
          <div style={{ background: 'rgba(43,245,154,0.08)', padding: '14px 16px', textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.08)', borderRight: '1px solid rgba(255,255,255,0.08)' }}></div>
          <div style={{ background: 'rgba(43,245,154,0.08)', padding: '14px 20px', fontFamily: "'Oswald', sans-serif", fontWeight: 700, color: 'var(--live)', letterSpacing: 2, fontSize: 12 }}>CARDCLASH</div>
          {[
            ['Ratings hardcoded once a year', '→', 'Re-rated after every real match'],
            ['Static portrait photo', '→', 'Real action photo from latest match'],
            ['No personality', '→', 'Live meme tagline from football Twitter'],
            ['"Higher rating always wins"', '→', 'Positional counter triangle = real reads'],
            ['Fake economy', '→', 'Cards you actually own and wager'],
          ].map(([left, arrow, right], i) => (
            <>
              <div key={`l${i}`} style={{
                background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                padding: '14px 20px', color: 'var(--text2)', fontSize: 13,
                borderTop: '1px solid rgba(255,255,255,0.05)'
              }}>{left}</div>
              <div key={`a${i}`} style={{
                background: i % 2 === 0 ? 'rgba(43,245,154,0.04)' : 'rgba(43,245,154,0.02)',
                padding: '14px 0', textAlign: 'center', color: 'var(--live)', fontSize: 16,
                borderLeft: '1px solid rgba(255,255,255,0.08)', borderRight: '1px solid rgba(255,255,255,0.08)',
                borderTop: '1px solid rgba(255,255,255,0.05)'
              }}>{arrow}</div>
              <div key={`r${i}`} style={{
                background: i % 2 === 0 ? 'rgba(43,245,154,0.04)' : 'rgba(43,245,154,0.02)',
                padding: '14px 20px', color: 'var(--text)', fontSize: 13, fontWeight: 600,
                borderTop: '1px solid rgba(255,255,255,0.05)'
              }}>{right}</div>
            </>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="land-cta-section" id="play">
        <h2>READY<br />TO BALL?</h2>
        <p>Join a room, open a pack, and play with cards that moved last night.</p>
        <div className="land-cta-btns">
          <button className="hero-btn-primary" style={{ fontSize: 18, padding: '18px 44px' }} onClick={onEnterApp}>
            ENTER APP →
          </button>
          <button className="hero-btn-secondary" style={{ fontSize: 18, padding: '18px 44px' }} onClick={onOpenPack}>
            ⚡ OPEN PACK FIRST
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="land-footer">
        <div>
          <div className="land-footer-logo">⚽ CARDCLASH</div>
          <p style={{ marginTop: 4 }}>Football cards. Live data. Real stakes.</p>
        </div>
        <div className="land-footer-links">
          <a href="#features">How it works</a>
          <a href="#cards">Cards</a>
          <a href="#play">Play</a>
        </div>
        <p style={{ color: 'var(--text2)', fontSize: 12, textAlign: 'right' }}>
          Powered by Anakin · WC2026
        </p>
      </footer>

    </div>
  );
};
