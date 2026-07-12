import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface PageLoaderProps {
  onDone: () => void;
}

// Long enough for the flicker-in below to actually read as an intro rather
// than a flash, short enough not to feel like a stall on a fast connection.
const MIN_VISIBLE_MS = 1100;

function PageLoader({ onDone }: PageLoaderProps) {
  const markRef = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const el = markRef.current;
    if (!el) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      gsap.set(el, { opacity: 1 });
      return;
    }

    // There's no text here to run ScrambleText's character-swap on, so this
    // is the same "resolve out of noise" idea translated to a shape: a burst
    // of randomized opacity/offset/hue jitter that settles into a steady mark,
    // echoing the headline's own scramble-in without literally reusing it.
    const FLICKERS = 7;
    const STEP = 0.06;
    const tl = gsap.timeline();

    for (let i = 0; i < FLICKERS; i += 1) {
      tl.set(
        el,
        {
          opacity: gsap.utils.random(0.15, 1),
          x: gsap.utils.random(-6, 6),
          y: gsap.utils.random(-4, 4),
          filter: `hue-rotate(${gsap.utils.random(-40, 40)}deg) brightness(${gsap.utils.random(0.8, 1.8)})`,
        },
        i * STEP,
      );
    }
    tl.set(el, { opacity: 1, x: 0, y: 0, filter: 'none' }, FLICKERS * STEP);

    // A faint, occasional flicker while we hold on the settled mark, so a
    // slower load doesn't read as the page having frozen.
    const idleTick = gsap.to(el, {
      filter: 'brightness(1.3)',
      duration: 0.08,
      repeat: -1,
      repeatDelay: 2.4,
      yoyo: true,
      delay: FLICKERS * STEP + 0.3,
    });

    return () => {
      tl.kill();
      idleTick.kill();
    };
  }, []);

  useEffect(() => {
    const start = Date.now();

    const finish = () => {
      const wait = Math.max(0, MIN_VISIBLE_MS - (Date.now() - start));
      window.setTimeout(() => {
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const doc = document as Document & {
          startViewTransition?: (callback: () => void) => { finished: Promise<void> };
        };

        // Reuses the exact same ::view-transition-old/new(root) glitch
        // already defined for route navigation (see App.css) — the loader
        // "old" view glitches out and the revealed page glitches in, with
        // no bespoke exit animation of its own.
        if (!reduceMotion && typeof doc.startViewTransition === 'function') {
          doc.startViewTransition(onDone).finished.catch(() => {});
        } else {
          onDone();
        }
      }, wait);
    };

    if (document.fonts?.ready) {
      document.fonts.ready.then(finish);
    } else {
      finish();
    }
  }, [onDone]);

  return (
    <div
      className="next-grain fixed inset-0 z-999 flex items-center justify-center overflow-hidden bg-next-bg"
      aria-hidden="true"
    >
      <div className="page-loader-scanlines" />
      <span ref={markRef} className="logo-mark page-loader-mark" />
    </div>
  );
}

export default PageLoader;
