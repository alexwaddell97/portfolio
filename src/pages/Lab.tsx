import { Link } from 'react-router-dom';
import Nav from '../components/Nav.tsx';
import Footer from '../components/Footer.tsx';
import { labs } from '../data/labs.ts';

function StatusBadge({ status }: { status: 'live' | 'wip' | 'idea' }) {
  const styles = {
    live: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    wip: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    idea: 'bg-border text-text-secondary border-border',
  };
  const labels = { live: 'Live', wip: 'WIP', idea: 'Idea' };
  return (
    <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

function Lab() {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col">
      <Nav />
      <main className="flex-1">
        <section className="dot-grid border-b border-border">
          <div className="mx-auto max-w-6xl px-4 pb-12 pt-32 sm:px-6 lg:px-8">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-cyan">Hidden Route</p>
            <h1 className="page-heading-sweep display-heading-safe mt-2 text-5xl font-black tracking-tighter md:text-7xl">
              Lab
            </h1>
            <p className="mt-3 max-w-2xl text-text-secondary">
              A quiet corner for experiments, toys, and things that exist for the joy of building them.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {labs.map((experiment) => (
              <Link
                key={experiment.slug}
                to={`/lab/${experiment.slug}`}
                className="group relative flex flex-col rounded-2xl border border-border bg-bg-card p-5 transition-colors hover:border-cyan/40 hover:bg-bg-card/80"
              >
                <div className="flex items-start justify-between">
                  <h2 className="text-lg font-semibold transition-colors group-hover:text-cyan">
                    {experiment.title}
                  </h2>
                  <StatusBadge status={experiment.status} />
                </div>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-text-secondary">
                  {experiment.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {experiment.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md border border-border bg-bg-primary px-2 py-0.5 text-xs text-text-secondary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default Lab;
