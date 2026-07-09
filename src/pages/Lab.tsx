import { Link } from 'react-router-dom';
import { FiArrowUpRight } from 'react-icons/fi';
import { labs } from '../data/labs.ts';
import type { LabExperiment } from '../data/labs.ts';

function StatusBadge({ status }: { status: 'live' | 'wip' | 'idea' }) {
  const labels = { live: 'Live', wip: 'WIP', idea: 'Idea' };
  const isLive = status === 'live';

  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-next-line px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-next-ink-dim">
      {isLive && (
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-next-neon shadow-[0_0_6px_var(--color-next-neon)]" />
      )}
      {labels[status]}
    </span>
  );
}

function LabRow({ experiment, index }: { experiment: LabExperiment; index: number }) {
  return (
    <Link
      to={experiment.path}
      className="group flex flex-col gap-4 border-b next-rule py-10 outline-none focus-visible:ring-2 focus-visible:ring-next-neon sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
    >
      <div className="flex items-baseline gap-4 sm:w-2/3">
        <span className="next-index text-sm">0{index + 1}</span>
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="next-heading text-2xl font-extrabold sm:text-3xl">
              {experiment.shortTitle ?? experiment.title}
            </h2>
            <StatusBadge status={experiment.status} />
          </div>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-next-ink-dim">
            {experiment.description}
          </p>
          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-wide text-next-ink-dim">
            {experiment.tags.slice(0, 4).map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </div>
      </div>

      <span className="next-cta-link inline-flex shrink-0 items-center gap-2 font-mono text-xs uppercase tracking-wide">
        Launch
        <FiArrowUpRight className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </span>
    </Link>
  );
}

function Lab() {
  return (
    <div className="next-scene min-h-screen">
      <div className="mx-auto max-w-4xl px-4 pt-16 pb-28 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="next-index text-sm">00</span>
            <span className="next-kicker">Lab — experiments, not portfolio pieces</span>
          </div>
          <Link to="/" className="next-kicker">
            ← alexw.dev
          </Link>
        </div>

        <div className="next-rule border-t">
          {labs.map((experiment, index) => (
            <LabRow key={experiment.slug} experiment={experiment} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Lab;
