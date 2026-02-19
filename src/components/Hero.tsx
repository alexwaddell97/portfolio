import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import MarqueeTicker from './MarqueeTicker.tsx';

const roles = ['Lead Developer', 'Architect', 'Mentor', 'Problem Solver', 'Performance Obsessive'];

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
  const [roleIndex, setRoleIndex] = useState(0);

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

  return (
    <section
      id="hero"
      className="dot-grid relative flex min-h-screen flex-col items-center justify-center overflow-hidden"
    >
      {/* Cursor spotlight */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: `radial-gradient(700px circle at ${springX}px ${springY}px, rgba(6,182,212,0.05), transparent 50%)`,
        }}
      />

      {/* Static glow orbs */}
      <div className="pointer-events-none absolute left-1/4 top-1/3 h-80 w-80 rounded-full bg-violet-glow blur-3xl opacity-60" />
      <div className="pointer-events-none absolute right-1/4 bottom-1/3 h-64 w-64 rounded-full bg-cyan-glow blur-3xl opacity-40" />
      <div className="pointer-events-none absolute right-1/3 top-1/4 h-48 w-48 rounded-full bg-pink-glow blur-3xl opacity-30" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 px-4 text-center"
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

        {/* Giant two-layer name */}
        <motion.div variants={itemVariants} className="relative my-2 select-none">
          {/* Ghost outline layer */}
          <span
            aria-hidden="true"
            className="display-heading-safe block text-[clamp(4rem,12vw,10rem)] font-black tracking-tighter"
            style={{
              WebkitTextStroke: '1px rgba(6,182,212,0.25)',
              WebkitTextFillColor: 'transparent',
              color: 'transparent',
            }}
          >
            Alex Waddell
          </span>
          {/* Gradient fill layer */}
          <h1
            className="gradient-text-cyan-violet display-heading-safe absolute inset-0 block text-[clamp(4rem,12vw,10rem)] font-black tracking-tighter"
          >
            Alex Waddell
          </h1>
        </motion.div>

        {/* Tagline */}
        <motion.p
          variants={itemVariants}
          className="mx-auto mt-8 max-w-lg text-lg leading-relaxed text-text-secondary md:text-xl"
        >
          I build fast, scalable web applications and mentor developers through practical, project-first delivery.
        </motion.p>

        {/* CTAs */}
        <motion.div variants={itemVariants} className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#projects"
            className="brand-sheen relative overflow-hidden rounded-lg px-6 py-3 font-medium text-white transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-violet/20"
            style={{ background: 'linear-gradient(135deg, #06b6d4, #7c3aed)' }}
          >
            View Projects
          </a>
          <a
            href="#contact"
            className="hover-underline-accent rounded-lg border border-border px-6 py-3 font-medium text-text-primary transition-all hover:border-cyan/50 hover:text-cyan"
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
