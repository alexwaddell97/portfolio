import { MeshGradient } from '@paper-design/shaders-react';
import { Link } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle.ts';

function NotFound() {
  usePageTitle('404');

  return (
    <div className="next-scene">
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 sm:px-10">
        <div className="pointer-events-none absolute inset-0 z-0">
          <MeshGradient
            className="h-full w-full"
            style={{ opacity: 0.55 }}
            colors={['#000000', '#000000', '#ffffff', '#d4ff00']}
            speed={0.2}
            distortion={0.5}
            swirl={0.15}
            grainMixer={0.05}
            grainOverlay={0.18}
          />
          <div className="absolute inset-0 bg-black/55" />
        </div>

        <Link
          to="/"
          className="next-kicker absolute top-8 left-6 z-10 inline-flex items-center gap-2 text-next-ink-dim transition-colors hover:text-next-ink sm:top-10 sm:left-10"
        >
          ← alexw.dev
        </Link>

        <div className="relative z-10 text-center">
          <span className="next-kicker">Not found</span>
          <h1 className="next-heading mt-4 flex items-center justify-center text-[clamp(6rem,24vw,18rem)] leading-none font-black uppercase text-next-neon">
            <span>4</span>
            <span className="inline-grid place-items-center">
              <span className="col-start-1 row-start-1">0</span>
              <span
                className="logo-mark col-start-1 row-start-1"
                style={{ width: '0.22em', height: '0.22em', transform: 'translateX(2px)' }}
                aria-hidden="true"
              />
            </span>
            <span>4</span>
          </h1>
        </div>
      </section>
    </div>
  );
}

export default NotFound;
