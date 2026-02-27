import { useState, useRef, useCallback } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiUsers, FiBookOpen, FiCode } from 'react-icons/fi';
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from 'framer-motion';
import AnimatedSection from './AnimatedSection.tsx';
import SectionHeading from './SectionHeading.tsx';

const mentorshipStats = [
  { icon: FiUsers, label: 'Developers mentored', value: '30+' },
  { icon: FiBookOpen, label: 'Bootcamp sessions delivered', value: '20+' },
  { icon: FiCode, label: 'Project reviews & build walkthroughs', value: '100+' },
];

const GLOW_RGB = '124, 58, 237';

function TiltCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  const springConfig = { stiffness: 220, damping: 28 };
  const rotateX = useSpring(useTransform(rawY, [-0.5, 0.5], [8, -8]), springConfig);
  const rotateY = useSpring(useTransform(rawX, [-0.5, 0.5], [-8, 8]), springConfig);

  const glowX = useTransform(rawX, [-0.5, 0.5], ['10%', '90%']);
  const glowY = useTransform(rawY, [-0.5, 0.5], ['10%', '90%']);
  const glowBg = useMotionTemplate`radial-gradient(circle at ${glowX} ${glowY}, rgba(${GLOW_RGB}, 0.15) 0%, transparent 65%)`;

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
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
    <motion.div
      ref={cardRef}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative cursor-default overflow-hidden ${className}`}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{ background: glowBg }}
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.25 }}
      />
      {children}
    </motion.div>
  );
}

function Mentorship() {
  return (
    <section id="mentorship" className="py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Teaching & Mentorship"
        />

        <AnimatedSection>
          <p className="mx-auto mb-10 max-w-3xl text-center text-base leading-relaxed text-text-secondary md:text-lg">
          Alongside leading delivery, I mentor junior developers through internal bootcamps and support T-Level students on real client projects. I’m involved across the full lifecycle, from planning and architectural decisions to detailed code reviews and debugging sessions.

I also help teams refine their workflows by introducing practical tooling and AI assistants where they add value, improving review quality and reducing unnecessary friction so teams can deliver more confidently.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {mentorshipStats.map((stat, index) => (
            <AnimatedSection key={stat.label} delay={index * 0.08}>
              <TiltCard className="rounded-2xl border border-border bg-bg-card p-6">
                <div className="relative z-10">
                  <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-violet/10 text-violet">
                    <stat.icon size={18} />
                  </div>
                  <p className="text-2xl font-black text-text-primary">{stat.value}</p>
                  <p className="mt-1 text-sm text-text-secondary">{stat.label}</p>
                </div>
              </TiltCard>
            </AnimatedSection>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
          <AnimatedSection delay={0.16}>
            <TiltCard className="rounded-2xl border border-border bg-bg-card p-6">
              <div className="relative z-10">
                <h3 className="text-lg font-semibold text-text-primary">Bootcamp Mentoring</h3>
                <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                 I’ve coached beginner developers through structured bootcamp programmes, helping them move from the basics to shipping complete projects with clean structure and code they can actually maintain. I introduce practical tooling and light automation to handle routine tasks, giving them more space to focus on understanding the harder concepts.
                </p>
              </div>
            </TiltCard>
          </AnimatedSection>

          <AnimatedSection delay={0.24}>
            <TiltCard className="rounded-2xl border border-border bg-bg-card p-6">
              <div className="relative z-10">
                <h3 className="text-lg font-semibold text-text-primary">T-Level Project Coaching</h3>
                <p className="mt-3 text-sm leading-relaxed text-text-secondary">
               I support learners through real, project-based work, giving practical feedback, sitting down to debug together, and helping them break work into clear milestones so they can confidently explain what they’ve built and why. I focus on good, repeatable workflows, testable results, and using AI as a support tool for research and debugging, not as a replacement for thinking.
                </p>
              </div>
            </TiltCard>
          </AnimatedSection>
        </div>

        <AnimatedSection delay={0.3} className="mt-10 text-center">
          <Link
            to="/blog"
            className="hover-underline-accent group inline-flex items-center gap-2 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
          >
            Read more about how I approach engineering and growth
            <FiArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </AnimatedSection>
      </div>
    </section>
  );
}

export default Mentorship;
