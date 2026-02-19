import { useState, useRef, useCallback } from 'react';
import { FiBriefcase, FiCode, FiUsers } from 'react-icons/fi';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
} from 'framer-motion';
import AnimatedSection from './AnimatedSection.tsx';
import SectionHeading from './SectionHeading.tsx';

interface Milestone {
  year: string;
  title: string;
  subtitle: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  colorClass: string;
  glowClass: string;
  glowRgb: string;
  isCurrent?: boolean;
}

const milestones: Milestone[] = [
  {
    year: '2019',
    title: 'Coastline Software',
    subtitle: 'Director / Lead Front-end Developer',
    Icon: FiCode,
    colorClass: 'text-cyan',
    glowClass: 'bg-cyan/15 border-cyan/30',
    glowRgb: '6, 182, 212',
  },
  {
    year: '2022',
    title: 'Boxmodel',
    subtitle: 'Senior Software Engineer',
    Icon: FiBriefcase,
    colorClass: 'text-violet',
    glowClass: 'bg-violet/15 border-violet/30',
    glowRgb: '124, 58, 237',
  },
  {
    year: '2023',
    title: 'Layers Studio',
    subtitle: 'Lead Developer',
    Icon: FiUsers,
    colorClass: 'text-pink',
    glowClass: 'bg-pink/15 border-pink/30',
    glowRgb: '236, 72, 153',
    isCurrent: true,
  },
];

function TiltCard({ item }: { item: Milestone }) {
  const cardRef = useRef<HTMLElement>(null);
  const [hovered, setHovered] = useState(false);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  const springConfig = { stiffness: 220, damping: 28 };
  const rotateX = useSpring(useTransform(rawY, [-0.5, 0.5], [8, -8]), springConfig);
  const rotateY = useSpring(useTransform(rawX, [-0.5, 0.5], [-8, 8]), springConfig);

  const glowX = useTransform(rawX, [-0.5, 0.5], ['10%', '90%']);
  const glowY = useTransform(rawY, [-0.5, 0.5], ['10%', '90%']);
  const glowBg = useMotionTemplate`radial-gradient(circle at ${glowX} ${glowY}, rgba(${item.glowRgb}, 0.18) 0%, transparent 65%)`;

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      rawX.set((e.clientX - rect.left) / rect.width - 0.5);
      rawY.set((e.clientY - rect.top) / rect.height - 0.5);
    },
    [rawX, rawY],
  );

  const handleMouseEnter = useCallback(() => setHovered(true), []);

  const handleMouseLeave = useCallback(() => {
    setHovered(false);
    rawX.set(0);
    rawY.set(0);
  }, [rawX, rawY]);

  return (
    <motion.article
      ref={cardRef}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative cursor-default overflow-hidden rounded-2xl border border-border bg-bg-card p-6"
    >
      {/* Mouse-tracking inner spotlight */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{ background: glowBg }}
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.25 }}
      />

      {/* Icon badge */}
      <div className="relative z-10">
        <motion.div
          className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg border ${item.glowClass}`}
          animate={
            hovered
              ? { scale: 1.08, boxShadow: `0 0 18px rgba(${item.glowRgb}, 0.3)` }
              : { scale: 1, boxShadow: `0 0 0px rgba(${item.glowRgb}, 0)` }
          }
          transition={{ duration: 0.25 }}
        >
          <item.Icon size={18} className={item.colorClass} />
        </motion.div>
      </div>

      {/* Text content */}
      <div className="relative z-10">
        <div className="mb-1 flex items-center gap-2">
          <p className="text-xs font-semibold tracking-wider text-text-muted">{item.year}</p>
          {item.isCurrent && (
            <span
              className="flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold"
              style={{
                color: `rgba(${item.glowRgb}, 1)`,
                borderColor: `rgba(${item.glowRgb}, 0.3)`,
                background: `rgba(${item.glowRgb}, 0.1)`,
              }}
            >
              <motion.span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: `rgba(${item.glowRgb}, 1)` }}
                animate={{ opacity: [1, 0.25, 1] }}
                transition={{ duration: 1.4, repeat: Infinity }}
              />
              NOW
            </span>
          )}
        </div>
        <h3 className="text-base font-semibold text-text-primary">{item.title}</h3>
        <p className="mt-1 text-sm text-text-secondary">{item.subtitle}</p>
      </div>
    </motion.article>
  );
}

function IntroTimeline() {
  return (
    <section id="journey" className="py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="How I Work"
          subtitle="End-to-end delivery from architecture to shipping, with a focus on clarity and craft"
        />

        <AnimatedSection>
          <p className="mx-auto mb-10 max-w-3xl text-center text-base leading-relaxed text-text-secondary md:text-lg">
            I build high-quality products end-to-end, blending architecture, hands-on development, and mentorship.
            My focus is always practical delivery: clear scope, maintainable code, and outcomes teams can ship confidently.
            I also work with teams to introduce pragmatic developer tooling and AI-assisted patterns that reduce
            repetitive work, tighten feedback loops, and improve delivery predictability.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
          {milestones.map((item, index) => (
            <AnimatedSection key={item.year} delay={index * 0.08}>
              <TiltCard item={item} />
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

export default IntroTimeline;
