import { lazy, Suspense, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { labs } from '../data/labs.ts';
import { FiArrowLeft } from 'react-icons/fi';

/**
 * Static registry of lazy-loaded experiment components.
 * Add a new entry here whenever you add a file to src/labs/.
 */
const experimentComponents: Record<string, React.LazyExoticComponent<() => React.ReactElement>> = {
  'f1-dashboard': lazy(() => import('../labs/F1Dashboard.tsx')),
  'ttr-dashboard': lazy(() => import('../labs/TTRDashboard.tsx')),
};

export default function LabExperiment() {
  const { slug } = useParams<{ slug: string }>();
  const meta = labs.find((l) => l.slug === slug);
  const ExperimentComponent = slug ? experimentComponents[slug] : undefined;

  if (!meta || !ExperimentComponent) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg-primary text-text-primary">
        <p className="text-text-secondary">Experiment not found.</p>
        <Link to="/lab" className="text-cyan underline underline-offset-4 hover:opacity-80">
          Back to Lab
        </Link>
      </div>
    );
  }

  const isCanvas = (meta.layout ?? 'canvas') === 'canvas';

  useEffect(() => {
    const prev = document.title;
    document.title = `${meta.title} | alexw.dev`;
    return () => { document.title = prev; };
  }, [meta.title]);

  return (
    <div className={`relative w-full overflow-x-hidden bg-black ${isCanvas ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
      {/* Floating back button — fixed on canvas, inline on scroll layouts */}
      {isCanvas ? (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between px-5 py-4">
          <Link
            to="/lab"
            className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-white/10 bg-black/60 px-3 py-1.5 text-sm font-medium text-white/80 backdrop-blur-md transition hover:bg-white/10"
          >
            <FiArrowLeft size={14} />
            Lab
          </Link>
          <div className="pointer-events-none flex flex-col items-end">
            <span className="text-sm font-semibold text-white/90">{meta.title}</span>
            <span className="text-xs text-white/40">{meta.description}</span>
          </div>
        </div>
      ) : (
        <div className="hidden sm:flex items-center px-5 py-3 absolute inset-x-0 top-0 z-10 pointer-events-none">
          <Link
            to="/lab"
            className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-white/10 bg-black/60 px-3 py-1.5 text-sm font-medium text-white/80 backdrop-blur-md transition hover:bg-white/10"
          >
            <FiArrowLeft size={14} />
            Lab
          </Link>
        </div>
      )}

      {/* Canvas hint */}
      {isCanvas && (
        <div className="pointer-events-none absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full border border-white/10 bg-black/60 px-3 py-1 text-xs text-white/40 backdrop-blur-md">
          click to add · right-click to clear
        </div>
      )}

      {/* Page layout: content scrolls under the floating back button */}
      <div className={isCanvas ? 'h-full' : ''}>
        <Suspense fallback={null}>
          <ExperimentComponent />
        </Suspense>
      </div>
    </div>
  );
}
