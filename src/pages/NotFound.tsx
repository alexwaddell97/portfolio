import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import Nav from '../components/Nav.tsx';
import Footer from '../components/Footer.tsx';

function NotFound() {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col">
      <Nav />
      <main className="flex flex-1 items-center justify-center px-4 py-24">
        <div className="w-full max-w-2xl rounded-2xl border border-border bg-bg-card/70 p-8 text-center">
          <p className="inline-flex rounded-full border border-border/80 px-4 py-1 text-xs font-semibold tracking-[0.2em] uppercase text-text-muted">
            Under Construction
          </p>

          <div className="relative mx-auto mt-5 w-full max-w-xl">
            <div className="pointer-events-none absolute -inset-4 rounded-sm border border-border/55" />
            <div className="pointer-events-none absolute -left-2 top-4 bottom-4 w-px bg-border/40" />
            <div className="pointer-events-none absolute -right-2 top-4 bottom-4 w-px bg-border/40" />
            <div className="pointer-events-none absolute left-3 right-3 -top-2 h-px bg-border/45" />
            <div className="pointer-events-none absolute left-3 right-3 -bottom-2 h-px bg-border/45" />

            <h1 className="display-heading-safe text-center text-[clamp(3rem,10vw,5.5rem)] font-black tracking-tighter text-transparent [-webkit-text-stroke:1.5px_var(--color-text-secondary)]">
              404
            </h1>
          </div>

          <h2 className="mt-6 text-2xl font-bold tracking-tight md:text-3xl">This Page Isn’t Finished Yet</h2>
          <p className="mx-auto mt-3 max-w-xl text-text-secondary">
            You’ve found a part of the site that’s still behind the scaffold.
          </p>

          <Link
            to="/"
            className="btn-primary brand-sheen mt-8 inline-flex"
          >
            Back to Home <FiArrowRight size={14} />
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default NotFound;
