import { motion } from 'framer-motion';
import { FiExternalLink, FiGithub, FiArrowRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import type { Project } from '../types/index.ts';
import { useTheme } from '../contexts/ThemeContext.tsx';

interface ProjectCardProps {
  project: Project;
  index?: number;
  compact?: boolean;
}

const accentColor: Record<string, string> = {
  cyan: 'var(--color-cyan)',
  violet: 'var(--color-violet)',
  pink: 'var(--color-pink)',
};

const tagClass: Record<string, string> = {
  cyan: 'bg-cyan/10 text-cyan border-cyan/20',
  violet: 'bg-violet/10 text-violet border-violet/20',
  pink: 'bg-pink/10 text-pink border-pink/20',
};

const imageBorderClass: Record<string, string> = {
  cyan: 'gradient-border-cyan glow-cyan',
  violet: 'gradient-border-violet glow-violet',
  pink: 'gradient-border-pink glow-pink',
};

const placeholderGradient: Record<string, string> = {
  cyan: 'from-cyan/20 via-cyan/5 to-transparent',
  violet: 'from-violet/20 via-violet/5 to-transparent',
  pink: 'from-pink/20 via-pink/5 to-transparent',
};

const gradientTextClass: Record<string, string> = {
  cyan: 'gradient-text-cyan-violet',
  violet: 'gradient-text-violet-pink',
  pink: 'gradient-text-violet-pink',
};

function ProjectCard({ project, index = 0, compact = false }: ProjectCardProps) {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const accent = project.accentColor;
  const hasCustomAccent = Boolean(project.accentHex);
  const color = hasCustomAccent
    ? (theme === 'light' ? (project.accentHexLight ?? accentColor[accent]) : project.accentHex!)
    : accentColor[accent];

  function openCaseStudy() {
    navigate(`/projects/${project.slug}`);
  }

  return (
    <motion.div
      onClick={openCaseStudy}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openCaseStudy();
        }
      }}
      tabIndex={0}
      aria-label={`Open case study for ${project.title}`}
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
      className="group relative cursor-pointer rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/70 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary"
    >
      {/* Image / placeholder — bordered showcase panel */}
      <div
        className={`relative overflow-hidden rounded-2xl bg-bg-secondary ${hasCustomAccent ? 'border' : imageBorderClass[accent]}`}
        style={{
          aspectRatio: compact ? '16/9' : '16/7',
          backgroundColor: project.imageBgHex,
          borderColor: hasCustomAccent ? `${color}66` : undefined,
          boxShadow: hasCustomAccent ? `0 0 0 1px ${color}22, 0 0 30px ${color}20` : undefined,
        }}
      >
        {project.image ? (
          <img
            src={project.image}
            alt={project.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        ) : (
          <div
            className={`flex h-full w-full items-center justify-center ${hasCustomAccent ? '' : `bg-gradient-to-br ${placeholderGradient[accent]}`}`}
            style={hasCustomAccent ? { background: `linear-gradient(135deg, ${color}22, transparent 70%)` } : undefined}
          >
            {/* Grid pattern overlay */}
            <div className="absolute inset-0 dot-grid opacity-40" />
            {/* Giant letter */}
            <span
              className="relative select-none text-[clamp(6rem,18vw,14rem)] font-black leading-[1.05] opacity-15"
              style={{ color }}
            >
              {project.title[0]}
            </span>
            {/* Glow orb */}
            <div
              className="pointer-events-none absolute inset-0 rounded-2xl"
              style={{ background: `radial-gradient(ellipse 60% 60% at 50% 50%, ${color}18, transparent)` }}
            />
          </div>
        )}

        {/* Hover overlay — "View Case Study" */}
        <div className="absolute inset-0 flex items-center justify-center bg-bg-primary/60 opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100 rounded-2xl">
          <div
            className="flex items-center gap-3 rounded-full border px-6 py-3 text-sm font-semibold text-white"
            style={{ borderColor: `${color}60`, background: `${color}15` }}
          >
            View Case Study
            <FiArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
          </div>
        </div>

        {/* Project number badge */}
        <div
          className="absolute top-4 left-4 flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold"
          style={{ borderColor: `${color}40`, color, background: `${color}10` }}
        >
          {String(index + 1).padStart(2, '0')}
        </div>
      </div>

      {/* Content row below image */}
      <div className={`mt-4 px-1 ${compact ? '' : 'flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mt-5'}`}>
        {/* Title + description + tags */}
        <div className="flex-1">
          <h3
            className={`${hasCustomAccent ? '' : gradientTextClass[accent]} font-bold leading-tight ${compact ? 'text-lg' : 'text-2xl md:text-3xl'}`}
            style={hasCustomAccent ? { color } : undefined}
          >
            {project.title}
          </h3>
          {!compact && (
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-text-secondary">
              {project.description}
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className={`rounded-full border px-3 py-1 text-xs font-medium ${hasCustomAccent ? 'bg-bg-card text-text-primary' : tagClass[accent]}`}
                style={hasCustomAccent ? { borderColor: `${color}55`, background: `${color}12` } : undefined}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Stats + links — only on full cards */}
        {!compact && (
          <div className="flex shrink-0 flex-col items-end gap-4 sm:min-w-[180px]">
            {project.stats && project.stats.slice(0, 2).map((stat) => (
              <div key={stat.label} className="text-right">
                <div className="text-xl font-black" style={{ color }}>{stat.value}</div>
                <div className="text-xs text-text-secondary">{stat.label}</div>
              </div>
            ))}
            <div className="flex items-center gap-4 mt-1">
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                aria-label={`Open live site for ${project.title}`}
                className="hover-underline-accent flex items-center gap-1.5 text-xs text-text-secondary transition-colors hover:text-text-primary"
              >
                <FiExternalLink size={13} /> Live
              </a>
              {project.repoUrl && (
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  aria-label={`Open source code for ${project.title}`}
                  className="hover-underline-accent flex items-center gap-1.5 text-xs text-text-secondary transition-colors hover:text-text-primary"
                >
                  <FiGithub size={13} /> Source
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default ProjectCard;
