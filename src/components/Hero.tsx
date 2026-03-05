import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { Link } from 'react-router-dom';
import MarqueeTicker from './MarqueeTicker.tsx';
import { useTheme } from '../contexts/ThemeContext.tsx';

const roles = ['Lead Developer', 'Architect', 'Mentor', 'Problem Solver', 'Performance Obsessive'];
const ORIGINAL_NAME = 'Alex Waddell';

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
              className={`hero-name-interactive display-heading-safe block text-[clamp(3rem,8vw,7rem)] font-black tracking-tighter ${nameGlitchActive ? 'hero-name-glitch' : ''}`}
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
          I build fast, scalable web applications, optimise teams, and help developers adopt AI tooling to improve workflows and delivery.
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

      {/* Marquee at bottom */}
      <div className="absolute right-0 bottom-0 left-0 z-10">
        <MarqueeTicker />
      </div>
    </section>
  );
}

export default Hero;
