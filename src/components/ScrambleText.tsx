import { useRef } from 'react';
import { useGSAP } from '@gsap/react';

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

  const update = () => {
    let output = '';
    let complete = 0;

    for (const item of queue) {
      if (frame >= item.end) {
        complete += 1;
        output += item.to;
      } else if (frame >= item.start) {
        if (!item.char || Math.random() < 0.3) {
          item.char = item.to === ' ' ? ' ' : NOISE_CHARS[Math.floor(Math.random() * NOISE_CHARS.length)];
        }
        output += item.to === ' ' ? ' ' : `<span class="next-scramble-noise">${item.char}</span>`;
      } else {
        output += ' ';
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

    return runScramble(el, text);
  }, [text]);

  const Tag = as;
  return (
    <Tag ref={ref as never} aria-label={text} className={className}>
      {text}
    </Tag>
  );
}

export default ScrambleText;
