import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { Link } from 'react-router-dom';
import MarqueeTicker from './MarqueeTicker.tsx';
import { useTheme } from '../contexts/ThemeContext.tsx';

const roles = ['Lead Developer', 'Software Architect', 'Mentor', 'Problem Solver', 'Performance Driven'];
const ORIGINAL_NAME = 'Alex Waddell';
const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};

function Hero() {
  const { theme } = useTheme();
  const [roleIndex, setRoleIndex] = useState(0);
  const [nameClickCount, setNameClickCount] = useState(0);
  const [nameGlitchActive, setNameGlitchActive] = useState(false);
  const [konamiActive, setKonamiActive] = useState(false);
  const [showKonamiToast, setShowKonamiToast] = useState(false);

  const konamiProgress = useRef<string[]>([]);

  // Cursor spotlight
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 60, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 60, damping: 20 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      konamiProgress.current = [...konamiProgress.current, e.key].slice(-KONAMI.length);
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

  useEffect(() => {
    const interval = setInterval(() => {
      setRoleIndex(prev => (prev + 1) % roles.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (nameClickCount < 5) return;
    setNameGlitchActive(true);
    setNameClickCount(0);
    const timer = window.setTimeout(() => setNameGlitchActive(false), 1100);
    return () => window.clearTimeout(timer);
  }, [nameClickCount]);

  function triggerNameEasterEgg() {
    setNameClickCount((prev) => prev + 1);
  }

  return (
    <section
      id="hero"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] dot-grid"
      />

      {/* Cursor spotlight */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: `radial-gradient(700px circle at ${springX}px ${springY}px, rgba(59,130,246,${theme === 'light' ? '0.10' : '0.05'}), transparent 50%)`,
        }}
      />

      {/* Static glow orbs */}
      <div className="pointer-events-none absolute left-1/4 top-1/3 h-80 w-80 rounded-full bg-violet-glow blur-3xl opacity-60" />
      <div className="pointer-events-none absolute right-1/4 bottom-1/3 h-64 w-64 rounded-full bg-cyan-glow blur-3xl opacity-40" />
      <div className="pointer-events-none absolute right-1/3 top-1/4 h-48 w-48 rounded-full bg-pink-glow blur-3xl opacity-30" />

      {/* Hero content — wireframe style, permanent */}
      <motion.div
        className="relative z-10 px-4 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Cycling role label */}
        <motion.div variants={itemVariants} className="mb-6 flex h-7 items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.p
              key={roles[roleIndex]}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] as const }}
              className="text-xs font-semibold tracking-[0.2em] uppercase"
              style={{ color: 'var(--color-cyan)' }}
            >
              {roles[roleIndex]}
            </motion.p>
          </AnimatePresence>
        </motion.div>

        {/* Name — full colour + sheen */}
        <motion.div
          variants={itemVariants}
          className="hero-name-wrap relative my-2 select-none"
          whileHover={{ scale: 1.01, y: -2 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] as const }}
          onClick={triggerNameEasterEgg}
        >
          <h1
              data-text={ORIGINAL_NAME}
              className={`hero-name-interactive display-heading-safe block text-[clamp(3rem,8vw,7rem)] font-black tracking-tighter ${nameGlitchActive ? 'hero-name-glitch' : ''} ${konamiActive ? 'konami-rainbow' : ''}`}
            >
              {ORIGINAL_NAME}
            </h1>
        </motion.div>

        {/* Descriptor row */}
        <motion.div variants={itemVariants} className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <span className="text-sm text-text-muted">Full-Stack Engineer</span>
          <span className="text-text-muted/40">·</span>
          <span className="text-sm text-text-muted">Newcastle, UK</span>
          <span className="text-text-muted/40">·</span>
          <span className="text-sm text-text-muted">Engineering Mentor</span>
        </motion.div>

        {/* Tagline */}
        <motion.p
          variants={itemVariants}
          className="mx-auto mt-5 max-w-lg text-lg leading-relaxed text-text-muted md:text-xl"
        >
          I build fast, scalable web applications and optimise teams to deliver at their best.
        </motion.p>

        {/* CTAs */}
        <motion.div variants={itemVariants} className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center sm:gap-4">
          <Link
            to="/projects"
            className="btn-primary brand-sheen"
          >
            View Projects
          </Link>
          <a
            href="#contact"
            className="btn-outline hover-underline-accent"
            style={{ borderWidth: '2px', backgroundColor: theme === 'light' ? '#fff' : 'transparent' }}
          >
            Get In Touch
          </a>
        </motion.div>
      </motion.div>

      {/* Konami toast */}
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

      {/* Subtle Konami hint */}
      <p className="pointer-events-none absolute bottom-20 right-5 z-10 select-none text-[10px] uppercase tracking-widest text-text-muted/30">
        ↑ ↑ ↓ ↓ ← → ← → B A
      </p>

      {/* Marquee at bottom */}
      <div className="absolute right-0 bottom-0 left-0 z-10">
        <MarqueeTicker />
      </div>
    </section>
  );
}

export default Hero;
