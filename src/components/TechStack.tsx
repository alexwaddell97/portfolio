import { motion } from 'framer-motion';
import { FiZap } from 'react-icons/fi';
import {
  SiReact, SiTypescript, SiNodedotjs, SiNextdotjs, SiPostgresql,
  SiDocker, SiTailwindcss, SiGraphql, SiRedis, SiPython, SiFigma,
  SiMongodb, SiWordpress, SiSanity, SiPwa,
} from 'react-icons/si';
import SectionHeading from './SectionHeading.tsx';

const techItems = [
  { Icon: SiReact, label: 'React', color: '#61dafb', glow: 'rgba(97,218,251,0.12)' },
  { Icon: SiTypescript, label: 'TypeScript', color: '#3178c6', glow: 'rgba(49,120,198,0.12)' },
  { Icon: SiNodedotjs, label: 'Node.js', color: '#6cc24a', glow: 'rgba(108,194,74,0.12)' },
  { Icon: SiNextdotjs, label: 'Next.js', color: '#e4e4e7', glow: 'rgba(228,228,231,0.08)' },
  { Icon: SiPostgresql, label: 'PostgreSQL', color: '#4169e1', glow: 'rgba(65,105,225,0.12)' },
  { Icon: SiDocker, label: 'Docker', color: '#2496ed', glow: 'rgba(36,150,237,0.12)' },
  { Icon: SiTailwindcss, label: 'Tailwind', color: '#06b6d4', glow: 'rgba(6,182,212,0.12)' },
  { Icon: SiGraphql, label: 'GraphQL', color: '#e10098', glow: 'rgba(225,0,152,0.12)' },
  { Icon: SiRedis, label: 'Redis', color: '#dc382d', glow: 'rgba(220,56,45,0.12)' },
  { Icon: SiPython, label: 'Python', color: '#3776ab', glow: 'rgba(55,118,171,0.12)' },
  { Icon: SiMongodb, label: 'MongoDB', color: '#47a248', glow: 'rgba(71,162,72,0.12)' },
  { Icon: SiWordpress, label: 'WordPress', color: '#21759b', glow: 'rgba(33,117,155,0.12)' },
  { Icon: SiSanity, label: 'Sanity.io', color: '#f03e2f', glow: 'rgba(240,62,47,0.12)' },
  { Icon: SiPwa, label: 'PWA', color: '#5a0fc8', glow: 'rgba(90,15,200,0.12)' },
  { Icon: SiFigma, label: 'Figma', color: '#f24e1e', glow: 'rgba(242,78,30,0.12)' },
  { Icon: FiZap, label: 'Vite', color: '#fbbf24', glow: 'rgba(251,191,36,0.14)' },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

const pillVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.95 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

function TechStack() {
  return (
    <section id="tech" className="py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <SectionHeading title="Tech Stack" subtitle="Tools I reach for every day" />
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="flex flex-wrap justify-center gap-3"
        >
          {techItems.map((tech) => (
            <motion.div
              key={tech.label}
              variants={pillVariants}
              whileHover={{ scale: 1.06, y: -2 }}
              className="flex items-center gap-2.5 rounded-full border border-border bg-bg-card px-4 py-2.5 transition-all duration-200"
              style={{ boxShadow: `0 0 24px ${tech.glow}` }}
            >
              <tech.Icon size={17} style={{ color: tech.color }} />
              <span className="text-sm font-medium text-text-secondary">{tech.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default TechStack;
