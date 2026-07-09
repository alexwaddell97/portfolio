import { useRef } from 'react';
import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { MeshGradient } from '@paper-design/shaders-react';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { FiArrowUpRight, FiChevronLeft, FiChevronRight, FiGithub, FiLinkedin, FiLock, FiTwitter } from 'react-icons/fi';
import ScrambleText from '../components/ScrambleText.tsx';
import projects from '../data/projects.ts';
import type { Project } from '../types/index.ts';

gsap.registerPlugin(SplitText);

const socialLinks = [
  { icon: FiGithub, label: 'GitHub', href: 'https://github.com/alexwaddell97' },
  { icon: FiLinkedin, label: 'LinkedIn', href: 'https://www.linkedin.com/in/alexander-waddell/' },
  { icon: FiTwitter, label: 'X', href: 'https://x.com/alexw_dev' },
];

// Featured first, then fill with the next two so the section always shows three.
const workItems = [
  ...projects.filter((p) => p.featured),
  ...projects.filter((p) => !p.featured).slice(0, 2),
].slice(0, 3);

function useMagnetic<T extends HTMLElement>(strength = 0.3) {
  const ref = useRef<T>(null);

  useGSAP(() => {
    const el = ref.current;
    if (!el) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const xTo = gsap.quickTo(el, 'x', { duration: 0.45, ease: 'power3' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.45, ease: 'power3' });

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      xTo((e.clientX - (rect.left + rect.width / 2)) * strength);
      yTo((e.clientY - (rect.top + rect.height / 2)) * strength);
    };
    const onLeave = () => {
      xTo(0);
      yTo(0);
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, [strength]);

  return ref;
}

function useTilt<T extends HTMLElement>(strength = 6) {
  const ref = useRef<T>(null);

  useGSAP(() => {
    const el = ref.current;
    if (!el) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    gsap.set(el, { transformPerspective: 1000 });
    const rotationXTo = gsap.quickTo(el, 'rotationX', { duration: 0.5, ease: 'power3' });
    const rotationYTo = gsap.quickTo(el, 'rotationY', { duration: 0.5, ease: 'power3' });

    const onMove = (e: PointerEvent) => {
      const px = e.clientX / window.innerWidth - 0.5;
      const py = e.clientY / window.innerHeight - 0.5;
      rotationXTo(py * -strength);
      rotationYTo(px * strength);
    };

    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, [strength]);

  return ref;
}

function ScrollProgress() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const blipRef = useRef<HTMLSpanElement>(null);
  const percentRef = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const wrap = wrapRef.current;
    // Walk up from our own (reliably-attached) node rather than reading a ref
    // passed down from an ancestor — a parent's ref attaches AFTER its
    // children's layout effects run, so heroRef.current would still be null here.
    const hero = wrap?.closest('section');
    const fill = fillRef.current;
    const blip = blipRef.current;
    const percentEl = percentRef.current;
    if (!wrap || !hero || !fill || !blip || !percentEl) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    // Progress across the hero's OWN scroll distance (top of hero at viewport
    // top → bottom of hero at viewport top), not the whole page — this widget
    // only ever lives inside the hero, so page-wide progress would barely move
    // off 0% before it fades away. Fade-out is derived from the same number,
    // so "100%" and "gone" land together instead of being two unrelated triggers.
    const FADE_START = 0.75;

    const setProgress = (progress: number) => {
      const pct = Math.round(progress * 100);
      gsap.set(fill, { height: `${pct}%` });
      gsap.set(blip, { top: `${pct}%` });
      percentEl.textContent = `${String(pct).padStart(2, '0')}%`;

      const opacity = progress <= FADE_START ? 1 : 1 - (progress - FADE_START) / (1 - FADE_START);
      gsap.set(wrap, { opacity });
    };

    const progressTrigger = ScrollTrigger.create({
      trigger: hero,
      start: 'top top',
      end: 'bottom top',
      onUpdate: (self) => setProgress(self.progress),
      onRefresh: (self) => setProgress(self.progress),
    });

    return () => progressTrigger.kill();
  }, []);

  return (
    <div ref={wrapRef} className="absolute bottom-6 left-6 z-10 flex items-center gap-3 sm:bottom-8 sm:left-10">
      <span className="next-kicker">Scroll</span>
      <span className="relative h-16 w-px bg-next-line">
        <span ref={fillRef} className="absolute inset-x-0 top-0 w-px bg-next-neon" />
        <span
          ref={blipRef}
          className="absolute left-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-next-neon shadow-[0_0_8px_var(--color-next-neon),0_0_18px_var(--color-next-neon-dim)]"
        />
      </span>
      <span ref={percentRef} className="next-kicker w-9 tabular-nums">
        00%
      </span>
    </div>
  );
}

function FillStatement({ text }: { text: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const neonRef = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      const neonEl = neonRef.current;
      const container = containerRef.current;
      if (!neonEl || !container) return;

      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduceMotion) {
        neonEl.style.clipPath = 'inset(0 0% 0 0)';
        return;
      }

      neonEl.style.clipPath = 'none';

      const split = SplitText.create(neonEl, {
        type: 'lines',
        autoSplit: true,
        onSplit(self) {
          gsap.set(self.lines, { clipPath: 'inset(0 100% 0 0)' });

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: container,
              start: 'top 75%',
              end: 'bottom 45%',
              scrub: 0.6,
            },
          });

          self.lines.forEach((line) => {
            tl.to(line, { clipPath: 'inset(0 0% 0 0)', ease: 'none' });
          });

          return tl;
        },
      });

      return () => split.revert();
    },
    { scope: containerRef },
  );

  return (
    <section ref={containerRef} className="next-rule border-t px-6 py-32 sm:px-10">
      <div className="next-fill-wrap next-heading mx-auto max-w-5xl text-[clamp(2rem,6vw,4.5rem)] font-black uppercase">
        <p className="next-fill-base">{text}</p>
        <p ref={neonRef} className="next-fill-neon" aria-hidden="true">
          {text}
        </p>
      </div>
    </section>
  );
}

// Curated per-project screenshot for the laptop mockup — first gallery
// image if there is one, falling back to the project's main image.
function getSlideImage(project: Project): string {
  return project.gallery?.[0] || project.image;
}

// Bare domain for the fake browser chrome's URL pill, e.g. "giglab.co.uk".
function getDisplayUrl(liveUrl: string | undefined): string {
  if (!liveUrl) return '';
  try {
    return new URL(liveUrl).hostname.replace(/^www\./, '');
  } catch {
    return liveUrl;
  }
}

function WorkSlide({
  project,
  index,
  style,
}: {
  project: Project;
  index: number;
  style?: CSSProperties;
}) {
  const ctaRef = useMagnetic<HTMLSpanElement>(0.25);

  return (
    <a
      href={project.liveUrl}
      target="_blank"
      rel="noreferrer"
      style={style}
      className="work-slide next-grain group relative flex w-full flex-col justify-center gap-10 overflow-hidden bg-next-bg px-8 py-16 outline-none focus-visible:ring-2 focus-visible:ring-next-neon md:absolute md:inset-0 md:h-full md:flex-row md:items-center md:gap-16 md:px-20"
    >
      {/* Faint radial glow behind the text — depth without a second WebGL canvas per slide */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_left,rgba(212,255,0,0.06),transparent_55%)]" />

      <div className="work-slide-content relative z-10 max-w-xl md:w-1/2">
        <span className="next-index text-sm">0{index + 1}</span>
        <h3 className="next-heading mt-2 text-3xl font-extrabold sm:text-4xl">{project.title}</h3>
        <p className="mt-3 max-w-md text-base leading-relaxed text-next-ink-dim">{project.description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {project.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-next-line px-2.5 py-0.5 font-mono text-[11px] text-next-ink-dim"
            >
              {tag}
            </span>
          ))}
        </div>
        <span
          ref={ctaRef}
          className="next-cta-link mt-5 inline-flex w-fit items-center gap-2 font-mono text-xs uppercase tracking-wide"
        >
          Visit site
          <FiArrowUpRight className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>

      {project.image && (
        <div className="relative z-10 w-full shrink-0 perspective-[1600px] md:w-1/2 md:max-w-2xl">
          {/* Screen/lid — hinges open or shut via rotationX in WorkSlides (first
              and last slide only); transform-origin is the hinge at the base. */}
          <div className="laptop-lid origin-bottom rounded-t-md border border-b-0 border-zinc-400 bg-zinc-300 p-2 backface-hidden sm:p-2.5">
            <div className="relative flex aspect-16/10 w-full flex-col overflow-hidden rounded-sm bg-black">
              {/* macOS-style browser chrome — its own row, not overlaid on the
                  screenshot, so the page content is contained below it rather
                  than covered by it */}
              <div className="relative flex h-5 shrink-0 items-center gap-2 border-b border-black/40 bg-zinc-800 px-2 sm:h-6">
                <div className="flex shrink-0 items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-linear-to-b from-[#ff8a80] to-[#e0443e] shadow-[inset_0_0_1px_rgba(255,255,255,0.4)]" />
                  <span className="h-2 w-2 rounded-full bg-linear-to-b from-[#ffd873] to-[#dea123] shadow-[inset_0_0_1px_rgba(255,255,255,0.4)]" />
                  <span className="h-2 w-2 rounded-full bg-linear-to-b from-[#6fe377] to-[#1aab29] shadow-[inset_0_0_1px_rgba(255,255,255,0.4)]" />
                </div>
                <div className="hidden shrink-0 items-center gap-1 text-zinc-500 sm:flex">
                  <FiChevronLeft size={10} />
                  <FiChevronRight size={10} />
                </div>
                {/* Centered on the whole bar, not just the space left of the controls — matches real browser chrome */}
                <div className="absolute top-1/2 left-1/2 flex max-w-[65%] -translate-x-1/2 -translate-y-1/2 items-center gap-1 truncate rounded-sm bg-zinc-900 px-2 py-0.5">
                  <FiLock size={7} className="shrink-0 text-zinc-500" />
                  <span className="truncate font-mono text-[8px] text-zinc-400">{getDisplayUrl(project.liveUrl)}</span>
                </div>
              </div>
              <div className="relative flex-1 overflow-hidden">
                <img
                  src={getSlideImage(project)}
                  alt=""
                  loading="lazy"
                  className={`work-slide-image h-full w-full object-cover contrast-105 ${
                    project.slug === 'subcreation' ? 'object-top' : 'object-center'
                  }`}
                />
                {/* Grey brighten/contrast wash (no hue shift) — opacity is scroll-driven in WorkSlides, brightest once this slide has arrived */}
                <div className="work-slide-tint pointer-events-none absolute inset-0 bg-white opacity-0 mix-blend-overlay" />
              </div>
            </div>
          </div>
          {/* Base / hinge lip — slightly wider than the screen, like a laptop chassis. Stays put; only the lid above it rotates. */}
          <div className="relative mx-[-4%] h-3 rounded-b-xl border border-t-0 border-zinc-400 bg-zinc-300 sm:h-4">
            <div className="absolute top-0 left-1/2 h-1 w-14 -translate-x-1/2 rounded-b-full bg-zinc-500" />
          </div>
        </div>
      )}
    </a>
  );
}

function WorkSlides() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
        const track = trackRef.current;
        const section = sectionRef.current;
        if (!track || !section) return;

        const slides = gsap.utils.toArray<HTMLElement>('.work-slide', track);

        // One viewport-height of scroll per incoming panel, plus one extra for
        // the closing beat at the very end (see isLast below).
        const scrollDistance = () => window.innerHeight * (slides.length + 1);

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: () => `+=${scrollDistance()}`,
            scrub: 0.6,
            pin: true,
            invalidateOnRefresh: true,
          },
        });

        const CLOSED_ROTATION_X = -100;

        slides.forEach((slide, i) => {
          const tint = slide.querySelector<HTMLElement>('.work-slide-tint');
          const lid = slide.querySelector<HTMLElement>('.laptop-lid');
          const contentChildren = slide.querySelector<HTMLElement>('.work-slide-content')?.children;
          const isFirst = i === 0;
          const isLast = i === slides.length - 1;

          // The first slide starts half onscreen (paired with the intro panel's
          // own 50% width, below) so the opening frame reads as a 50/50 split
          // rather than an empty full-width intro. Later slides arrive from
          // fully offscreen since they're covering another full-bleed slide.
          const fromXPercent = isFirst ? 50 : 100;
          tl.fromTo(slide, { xPercent: fromXPercent }, { xPercent: 0, ease: 'none' });

          if (tint) {
            // Same timeline position as the slide-in ("<") — the photo brightens
            // and gains contrast as the panel arrives and covers the last one.
            tl.fromTo(tint, { opacity: 0 }, { opacity: 0.4, ease: 'none' }, '<');
          }
          // No motion on the image itself — it's meant to read as a static
          // screenshot sitting in a real laptop screen, not something that
          // zooms as you scroll.
          if (lid) {
            if (isFirst) {
              // The very first laptop opens as it arrives — kicks off the showcase.
              tl.fromTo(lid, { rotationX: CLOSED_ROTATION_X }, { rotationX: 0, ease: 'none' }, '<');
            } else {
              // Every other laptop is already open when its slide arrives.
              gsap.set(lid, { rotationX: 0 });
            }
          }
          if (i > 0 && contentChildren && contentChildren.length) {
            // Slide 0's text is already visible at rest (the 50/50 opening
            // frame), so only later slides — fully offscreen until scrolled
            // to — get a staggered fade/rise as their panel arrives.
            tl.fromTo(
              contentChildren,
              { autoAlpha: 0, y: 24 },
              { autoAlpha: 1, y: 0, ease: 'none', stagger: 0.08 },
              '<',
            );
          }

          if (isLast && lid) {
            // A distinct closing beat AFTER the last slide has fully arrived
            // (not simultaneous with its slide-in) — the showcase wraps up
            // cleanly instead of arriving and shutting at the same time.
            tl.to(lid, { rotationX: CLOSED_ROTATION_X, ease: 'none' });
          }
        });

        return () => tl.scrollTrigger?.kill();
      });

      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section
      id="work"
      ref={sectionRef}
      className="next-rule relative overflow-hidden border-t md:h-screen"
    >
      <div ref={trackRef} className="relative flex flex-col md:block md:h-full">
        <div className="next-grain relative w-full px-6 py-20 sm:px-10 md:flex md:h-full md:w-1/2 md:flex-col md:justify-center md:px-16 md:py-0">
          <div className="md:max-w-xl">
            <div className="mb-6 flex items-center gap-3">
              <span className="next-index text-sm">02</span>
              <span className="next-kicker">Selected work</span>
            </div>
            <h2 className="next-heading text-[clamp(1.9rem,4.2vw,3rem)] font-black uppercase">
              Some of what I&rsquo;ve shipped.
            </h2>
            <Link to="/projects" className="next-cta-link next-kicker mt-8 inline-block w-fit">
              View all {projects.length} projects
            </Link>
          </div>
        </div>

        {workItems.map((project, index) => (
          <WorkSlide key={project.id} project={project} index={index} style={{ zIndex: index + 1 }} />
        ))}
      </div>
    </section>
  );
}

const MARQUEE_WORDS = ['React', 'TypeScript', 'Next.js', 'Node.js', 'Tailwind CSS', 'AWS', 'Vercel', 'WordPress'];

function MarqueeBand() {
  const renderWords = (keyPrefix: string) => (
    <div className="marquee-group next-marquee-text" key={keyPrefix} aria-hidden={keyPrefix === 'b'}>
      {MARQUEE_WORDS.map((word, i) => (
        <span key={`${keyPrefix}-${word}`} className={i % 2 === 1 ? 'is-neon' : undefined}>
          {word}
        </span>
      ))}
    </div>
  );

  return (
    <section className="next-rule overflow-hidden border-y py-10">
      <div className="marquee-track" style={{ animationDuration: '32s' }} aria-hidden="true">
        {renderWords('a')}
        {renderWords('b')}
      </div>
      <span className="sr-only">{MARQUEE_WORDS.join(', ')}</span>
    </section>
  );
}

function Home() {
  const ctaRef = useMagnetic<HTMLAnchorElement>(0.35);
  const tiltRef = useTilt<HTMLDivElement>(6);

  return (
    <div className="next-scene min-h-screen">
      <section id="hero" className="relative flex min-h-screen flex-col justify-center overflow-hidden px-6 sm:px-10">
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

        <div ref={tiltRef} className="relative z-10 mx-auto w-full max-w-5xl">
          <ScrambleText
            as="h1"
            text="ALEX WADDELL"
            className="next-heading select-none text-[clamp(3rem,11vw,9rem)] font-black uppercase"
          />
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-next-ink-dim md:text-xl">
            Lead Developer, Software Architect, Mentor. <br />
            <br />Over seven years shipping production React,
            Next.js and Node apps and mentoring the developers who&apos;ll ship the next ones.
          </p>
          <p className="mt-4 text-sm text-next-ink-dim">
            Newcastle, UK · open to select engagements
          </p>
          <div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4">
            <a href="#work" className="next-btn next-btn-primary">
              View work
            </a>
            <a href="mailto:alex@alexw.dev" className="next-btn next-btn-outline">
              Say hello
            </a>
          </div>
        </div>

        <ScrollProgress />

        <Link
          to="/lab"
          aria-label="Hidden lab access"
          className="next-secret-dot absolute right-6 bottom-6 z-10 flex h-8 items-center sm:right-8 sm:bottom-8"
        >
          <span aria-hidden="true" className="next-secret-label">
            <span className="next-secret-label-text">Lab</span>
          </span>
          <span aria-hidden="true" className="next-secret-dot-mark" />
        </Link>
      </section>

      <FillStatement text="I BUILD PRODUCTS. I HELP BUILD THE PEOPLE WHO BUILD THEM." />

      <WorkSlides />

      <MarqueeBand />

      <footer id="contact" className="flex flex-col items-center gap-8 px-6 py-32 text-center sm:px-10">
        <a
          ref={ctaRef}
          href="mailto:alex@alexw.dev"
          className="next-cta-link next-heading inline-block text-[clamp(2.5rem,9vw,6rem)] font-black uppercase"
        >
          Let&apos;s talk →
        </a>
        <div className="flex items-center gap-5">
          {socialLinks.map(({ icon: Icon, label, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={label}
              className="text-next-ink-dim transition-colors hover:text-next-neon"
            >
              <Icon size={18} />
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}

export default Home;
