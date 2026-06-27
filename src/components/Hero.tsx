import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import MarqueeTicker from './MarqueeTicker';
import { useTheme } from '../contexts/ThemeContext.tsx';

const ORIGINAL_NAME = 'Alex Waddell';
const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

function Hero() {
  const { theme } = useTheme();
  const [nameGlitchActive, setNameGlitchActive] = useState(false);
  const [konamiActive, setKonamiActive] = useState(false);
  const [showKonamiToast, setShowKonamiToast] = useState(false);
  const konamiProgress = useRef<string[]>([]);
  const nameClickCountRef = useRef(0);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      konamiProgress.current = [...konamiProgress.current, event.key].slice(-KONAMI.length);
      if (konamiProgress.current.join(',') === KONAMI.join(',')) {
        setKonamiActive(true);
        setShowKonamiToast(true);
        konamiProgress.current = [];
        window.setTimeout(() => setKonamiActive(false), 4000);
        window.setTimeout(() => setShowKonamiToast(false), 3200);
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  function triggerNameEasterEgg() {
    nameClickCountRef.current += 1;
    if (nameClickCountRef.current < 5) return;

    nameClickCountRef.current = 0;
    setNameGlitchActive(true);
    window.setTimeout(() => setNameGlitchActive(false), 1100);
  }

  return (
    <section id="hero" className="hero-v2">
      <div className="h2-shell">
        <h1
          data-text={ORIGINAL_NAME}
          onClick={triggerNameEasterEgg}
          className={`h2-name ${nameGlitchActive ? 'hero-name-glitch' : ''} ${konamiActive ? 'konami-rainbow' : ''}`}
        >
          {ORIGINAL_NAME}
        </h1>

        <div className="h2-meta">
          <span>Full-Stack Engineer</span>
          <span>·</span>
          <span>Newcastle, UK</span>
          <span>·</span>
          <span>Engineering Mentor</span>
        </div>

        <p className="h2-copy">I build fast, scalable web applications and optimise teams to deliver at their best.</p>

        <div className="h2-actions">
          <Link to="/projects" className="btn-primary">View Projects</Link>
          <a
            href="#contact"
            className="btn-outline"
            style={{ borderWidth: '2px', backgroundColor: theme === 'light' ? '#fff' : 'transparent' }}
          >
            Get In Touch
          </a>
        </div>

        <div className="h2-proof">
          <span>6+ years</span>
          <span>lead developer</span>
          <span>mentor</span>
        </div>
      </div>

      <AnimatePresence>
        {showKonamiToast && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] as const }}
            className="pointer-events-none fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full border border-border bg-bg-primary/90 px-5 py-2.5 text-sm font-medium text-text-primary shadow-xl backdrop-blur-md"
          >
            🎮 +30 lives unlocked
          </motion.div>
        )}
      </AnimatePresence>

      <p className="h2-hint">↑ ↑ ↓ ↓ ← → ← → B A</p>

      <div className="h2-marquee">
        <MarqueeTicker />
      </div>
    </section>
  );
}

export default Hero;
