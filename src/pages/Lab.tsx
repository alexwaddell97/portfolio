import { Link } from 'react-router-dom';
import { MeshGradient } from '@paper-design/shaders-react';
import { FiArrowUpRight } from 'react-icons/fi';
import ScrambleText from '../components/ScrambleText.tsx';
import { usePageTitle } from '../hooks/usePageTitle.ts';
import { labs } from '../data/labs.ts';
import type { LabExperiment } from '../data/labs.ts';

function StatusBadge({ status }: { status: 'live' | 'wip' | 'idea' }) {
  const labels = { live: 'Live', wip: 'WIP', idea: 'Idea' };
  const isLive = status === 'live';

  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-next-line bg-next-bg/80 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-next-ink-dim backdrop-blur">
      {isLive && (
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-next-neon shadow-[0_0_6px_var(--color-next-neon)]" />
      )}
      {labels[status]}
    </span>
  );
}

function LabCard({ experiment, index }: { experiment: LabExperiment; index: number }) {
  return (
    <Link
      to={experiment.path}
      className="next-grain group relative flex gap-4 overflow-hidden rounded-xs border border-next-line bg-next-bg-raised p-4 outline-none transition-colors duration-300 hover:border-next-neon focus-visible:border-next-neon focus-visible:ring-2 focus-visible:ring-next-neon"
    >
      {experiment.image && (
        <div className="relative aspect-square w-24 shrink-0 overflow-hidden rounded-xs sm:w-28">
          <img
            src={experiment.image}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.08]"
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: `radial-gradient(circle at 85% 15%, ${experiment.color}40, transparent 65%)` }}
          />
        </div>
      )}

      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="next-index text-sm">0{index + 1}</span>
          <h2 className="next-heading text-lg font-extrabold sm:text-xl">
            {experiment.shortTitle ?? experiment.title}
          </h2>
          <StatusBadge status={experiment.status} />
        </div>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-next-ink-dim">
          {experiment.description}
        </p>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-wide text-next-ink-dim">
          {experiment.tags.slice(0, 3).map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        <span className="next-cta-link mt-2 inline-flex w-fit items-center gap-2 font-mono text-xs uppercase tracking-wide">
          Launch
          <FiArrowUpRight className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </Link>
  );
}

function Lab() {
  usePageTitle('Lab');

  return (
    <div className="next-scene">
      <section className="relative flex min-h-screen flex-col justify-center overflow-hidden px-6 py-16 sm:px-10">
        {/* Background */}
        <div className="pointer-events-none absolute inset-0 z-0">
          <MeshGradient
            className="h-full w-full"
            style={{ opacity: 0.45 }}
            colors={['#000000', '#000000', '#ffffff', '#ff2e9a']}
            speed={0.2}
            distortion={0.5}
            swirl={0.15}
            grainMixer={0.05}
            grainOverlay={0.18}
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-5xl">
          {/* Nav row */}
          <div className="mb-10 flex items-center justify-between gap-3">
           
            <Link to="/" className="next-kicker text-next-ink-dim transition-colors hover:text-next-ink">
              ← alexw.dev 
            </Link>
          </div>

          {/* Two-column layout */}
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            {/* Left: copy */}
            <div className="flex flex-col justify-center">
              <ScrambleText
                as="h1"
                text="THE LAB"
                className="next-heading select-none text-[clamp(2.8rem,8vw,6rem)] font-black uppercase"
              />
              <p className="mt-6 max-w-sm text-base leading-relaxed text-next-ink-dim">
                A running list of side builds. Dashboards, tools and one-off experiments made for fun, curiosity, or to scratch a very specific itch.
              </p>
            </div>

            {/* Right: experiments */}
            <div className="flex flex-col justify-center gap-4">
              {labs.map((experiment, index) => (
                <LabCard key={experiment.slug} experiment={experiment} index={index} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Lab;

