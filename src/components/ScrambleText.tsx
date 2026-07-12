import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { appReady } from '../lib/appReady.ts';

const NOISE_CHARS = '!<>-_\\/[]{}=+*^?#';

interface QueueItem {
  from: string;
  to: string;
  start: number;
  end: number;
  char?: string;
}

function runScramble(el: HTMLElement, text: string) {
  const queue: QueueItem[] = Array.from({ length: text.length }, (_, i) => {
    const start = Math.floor(Math.random() * 16);
    return { from: '', to: text[i], start, end: start + Math.floor(Math.random() * 16) };
  });

  let frame = 0;
  let frameRequest = 0;

  // Every non-space position shows *some* glyph from frame 0 (noise until
  // its own reveal frame, then the real character) rather than a blank —
  // previously, unstarted characters rendered as literal spaces, so the
  // string was much shorter than the final text early in the animation and
  // only reached full width once most characters resolved. That growing
  // width could cross a line-wrap breakpoint mid-animation, making the
  // heading visibly reflow after the page had already loaded. Full-width
  // noise from the first frame keeps the rendered width — and therefore
  // the wrap point — constant throughout; only the characters change.
  const update = () => {
    let output = '';
    let complete = 0;

    for (const item of queue) {
      if (frame >= item.end) {
        complete += 1;
        output += item.to;
      } else if (item.to === ' ') {
        output += ' ';
      } else {
        if (!item.char || Math.random() < 0.3) {
          item.char = NOISE_CHARS[Math.floor(Math.random() * NOISE_CHARS.length)];
        }
        output += `<span class="next-scramble-noise">${item.char}</span>`;
      }
    }

    el.innerHTML = output;

    if (complete < queue.length) {
      frame += 1;
      frameRequest = requestAnimationFrame(update);
    }
  };

  update();
  return () => cancelAnimationFrame(frameRequest);
}

interface ScrambleTextProps {
  text: string;
  as?: 'h1' | 'h2' | 'span';
  className?: string;
}

function ScrambleText({ text, as = 'span', className }: ScrambleTextProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(() => {
    const el = ref.current;
    if (!el) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      el.textContent = text;
      return;
    }

    let cancelled = false;
    let stop: (() => void) | undefined;

    // The page loads its display font with `display=swap` (see index.html),
    // so on a cold cache the browser renders this heading in a fallback
    // font first and swaps to the real one the moment it finishes
    // downloading — a one-off reflow with different character metrics. If
    // that swap lands mid-scramble, the rapid innerHTML updates make the
    // resulting jump read as a flicker rather than a single quiet reflow.
    // Waiting for the font to be ready before the first frame means the
    // scramble always measures/renders with its final metrics, so there's
    // nothing left to reflow once it starts.
    const start = () => {
      if (cancelled || !el.isConnected) return;
      stop = runScramble(el, text);
    };

    // Also waits on appReady so the scramble plays out where a viewer can
    // see it — otherwise, mounting underneath the page loader, it would
    // resolve to static text before the loader ever exits.
    Promise.all([document.fonts?.ready ?? Promise.resolve(), appReady]).then(start);

    return () => {
      cancelled = true;
      stop?.();
    };
  }, [text]);

  const Tag = as;
  return (
    <Tag aria-label={text} className={`relative inline-block ${className ?? ''}`}>
      {/* Ghost: the real final text, laid out normally but invisible. Its
          only job is to size this element — 1 line or 2, whatever the
          final text actually wraps to at this viewport width. The noise
          glyphs used during the scramble (see runScramble) are narrower
          than the bold final letters, so if the animated text drove the
          box's size, the box would visibly grow the instant the scramble
          finishes and the wider final characters land. Sizing from a
          static, always-final copy means the box never resizes — only the
          overlaid text changes. */}
      <span aria-hidden="true" className="invisible">
        {text}
      </span>
      {/* Overlay: the animated scramble, absolutely positioned over the
          ghost so it never affects this element's box size. */}
      <span ref={ref as never} aria-hidden="true" className="absolute inset-0">
        {text}
      </span>
    </Tag>
  );
}

export default ScrambleText;
