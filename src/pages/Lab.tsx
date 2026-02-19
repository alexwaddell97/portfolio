import { FiCpu, FiZap, FiTerminal } from 'react-icons/fi';
import Nav from '../components/Nav.tsx';
import Footer from '../components/Footer.tsx';

const experiments = [
  {
    title: 'Interaction Lab',
    desc: 'Micro-interactions and animation timing experiments used before shipping UI updates.',
    icon: FiZap,
  },
  {
    title: 'Performance Sandbox',
    desc: 'Bundle-size and rendering tests for keeping experiences fast under real constraints.',
    icon: FiCpu,
  },
  {
    title: 'Command Notes',
    desc: 'Scratchpad for command-line style UI ideas and hidden terminal-inspired patterns.',
    icon: FiTerminal,
  },
];

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
              A quiet corner for experiments, prototypes, and things that may or may not ship.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {experiments.map((item) => (
              <article key={item.title} className="rounded-2xl border border-border bg-bg-card p-5">
                <item.icon size={18} className="text-cyan" />
                <h2 className="mt-3 text-lg font-semibold">{item.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">{item.desc}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default Lab;
