import { lazy, Suspense, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MeshGradient } from '@paper-design/shaders-react';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { FiArrowUpRight, FiChevronDown, FiGithub, FiLinkedin, FiTwitter } from 'react-icons/fi';
import ScrambleText from '../components/ScrambleText.tsx';
import ViewTransitionLink from '../components/ViewTransitionLink.tsx';
import type { Laptop3DHandle } from '../components/Laptop3D.tsx';
import projects from '../data/projects.ts';

// Lazy-loaded: three.js/@react-three/fiber/drei are a ~230KB (gzipped) chunk.
// isDesktop already stops this from ever mounting on phones, but a static
// import would still ship that code to every visitor regardless — code-
// splitting means mobile only pays for the small Suspense wrapper.
const Laptop3D = lazy(() => import('../components/Laptop3D.tsx'));
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

function ScrollHint() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const wrap = wrapRef.current;
    // Walk up from our own (reliably-attached) node rather than reading a ref
    // passed down from an ancestor — a parent's ref attaches AFTER its
    // children's layout effects run, so heroRef.current would still be null here.
    const hero = wrap?.closest('section');
    const arrow = arrowRef.current;
    if (!wrap || !hero || !arrow) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    // Fades out across the hero's OWN scroll distance (top of hero at
    // viewport top → bottom of hero at viewport top), not the whole page —
    // gone by the time the hero itself scrolls away, not some unrelated
    // page-wide trigger.
    const FADE_START = 0.75;
    const setOpacity = (progress: number) => {
      const opacity = progress <= FADE_START ? 1 : 1 - (progress - FADE_START) / (1 - FADE_START);
      gsap.set(wrap, { opacity });
    };

    const fadeTrigger = ScrollTrigger.create({
      trigger: hero,
      start: 'top top',
      end: 'bottom top',
      onUpdate: (self) => setOpacity(self.progress),
      onRefresh: (self) => setOpacity(self.progress),
    });

    const bounce = gsap.to(arrow, {
      y: 8,
      duration: 0.9,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
    });

    return () => {
      fadeTrigger.kill();
      bounce.kill();
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className="absolute bottom-6 left-6 z-10 flex flex-col items-center gap-2 sm:bottom-8 sm:left-10"
    >
      <span className="next-kicker">Scroll</span>
      <span ref={arrowRef} className="flex text-next-neon">
        <FiChevronDown size={20} />
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
              start: 'top 55%',
              end: 'bottom 30%',
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

// Projects alternate sides each slide (even index -> laptop on the right,
// text on the left; odd index -> the reverse), so the showcase doesn't
// repeat the same left/right rhythm every time.
function WorkSlide({ project, index }: { project: Project; index: number }) {
  const ctaRef = useMagnetic<HTMLSpanElement>(0.25);
  const textSide = index % 2 === 0 ? 'left' : 'right';

  return (
    <a
      href={project.liveUrl}
      target="_blank"
      rel="noreferrer"
      className={`work-slide next-grain group relative flex w-full flex-col justify-center overflow-hidden bg-next-bg px-8 py-16 outline-none focus-visible:ring-2 focus-visible:ring-next-neon md:absolute md:inset-y-0 md:h-full md:w-1/2 md:px-16 ${
        textSide === 'left' ? 'md:left-0' : 'md:right-0'
      }`}
    >
      {/* Faint radial glow behind the text — depth without a second WebGL canvas per slide */}
      <div
        className={`pointer-events-none absolute inset-0 z-0 ${
          textSide === 'right'
            ? 'bg-[radial-gradient(ellipse_at_top_left,rgba(212,255,0,0.14),transparent_55%)]'
            : 'bg-[radial-gradient(ellipse_at_top_left,rgba(212,255,0,0.06),transparent_55%)]'
        }`}
      />

      {/* Hidden by default on desktop (matching GSAP's initial autoAlpha:0
          state) so there's no flash of every slide's text fully visible and
          overlapping before the 3D model finishes loading and the pinned
          timeline's gsap.set() runs. Scoped to md + motion-safe — the exact
          condition the timeline itself requires — so mobile and
          reduced-motion users (where GSAP never takes over) still see this
          normally, un-hidden. Once JS is ready, its inline autoAlpha style
          takes over and overrides these classes entirely. */}
      <div className="work-slide-content relative z-10 max-w-xl md:motion-safe:translate-y-6 md:motion-safe:opacity-0">
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
    </a>
  );
}

// Even index -> laptop wrapper shifted a full width over into the right
// slot; odd index -> left in its home slot (the left half). Text always
// takes the opposite side (see WorkSlide above).
function laptopXPercent(index: number) {
  return index % 2 === 0 ? 100 : 0;
}

// Scroll units (not seconds) to hold still, screen facing forward, before a
// turn begins — the laptop just arrived at this pose from the previous turn
// (or the initial open), so it's a beat to actually look at the project
// before the next flip starts, rather than being in constant motion.
const TURN_HOLD_DURATION = 0.75;

// Reveal-spotlight intensity once the lid is open — 0 while closed (set on
// the spotlight itself as its default, and explicitly here at rest).
const SPOTLIGHT_ON_INTENSITY = 4;

function WorkSlides() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const laptopWrapRef = useRef<HTMLDivElement>(null);
  const laptopRef = useRef<Laptop3DHandle>(null);
  const [laptopReady, setLaptopReady] = useState(false);
  // Client-only SPA (no SSR), so it's safe to read this directly rather than
  // deferring to an effect — avoids mounting/loading the 10MB model at all
  // on phones, where the pinned/rotating showcase doesn't run anyway.
  const [isDesktop] = useState(() => window.matchMedia('(min-width: 768px)').matches);

  useGSAP(
    () => {
      if (!laptopReady) return;

      // Defensive: React remounting this component (route away and back)
      // must never leave a previous pin/ScrollTrigger alive on this same
      // trigger element. If one somehow survived (e.g. a cleanup that ran
      // out of order), it would fight the new one for control of the same
      // `.work-slide-content` nodes, showing two slides' text overlapping
      // at once. Kill anything already attached to this section first.
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === sectionRef.current) st.kill();
      });

      const mm = gsap.matchMedia();

      mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
        const track = trackRef.current;
        const section = sectionRef.current;
        const laptopWrap = laptopWrapRef.current;
        const laptop = laptopRef.current;
        const lidPivot = laptop?.lidPivot;
        const modelGroup = laptop?.modelGroup;
        const closedRotationX = laptop?.closedRotationX;
        const closedLiftY = laptop?.closedLiftY;
        const spotlight = laptop?.spotlight;
        const spotlightBack = laptop?.spotlightBack;
        if (
          !track ||
          !section ||
          !laptopWrap ||
          !laptop ||
          !lidPivot ||
          !modelGroup ||
          !spotlight ||
          !spotlightBack ||
          closedRotationX == null ||
          closedLiftY == null
        ) {
          return;
        }

        const slides = gsap.utils.toArray<HTMLElement>('.work-slide', track);

        // Every tween below is positioned against an explicit label (or an
        // offset from one) rather than "<"/sequential chaining — the turn
        // transitions (rotation + a mid-call + rotation) take 2 units where
        // everything else takes 1, and relying on GSAP's "end of the last
        // tween added" cursor for sequential inserts silently desyncs once
        // durations differ. Explicit positions sidestep that entirely.
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            // Scroll distance follows however long the choreography actually
            // ends up being (via labels/offsets below) rather than a guessed
            // "one viewport-height per slide" constant.
            end: () => `+=${tl.duration() * window.innerHeight}`,
            scrub: 0.6,
            pin: true,
            invalidateOnRefresh: true,
          },
        });

        // Start closed, laptop in slide 0's slot, showing its screenshot —
        // the lid opens as slide 0 arrives (below).
        gsap.set(lidPivot.rotation, { x: closedRotationX });
        gsap.set(lidPivot.position, { y: closedLiftY });
        gsap.set([spotlight, spotlightBack], { intensity: 0 });
        gsap.set(laptopWrap, { xPercent: laptopXPercent(0) });
        gsap.set(gsap.utils.toArray('.work-slide-content', track), { autoAlpha: 0, y: 24 });
        laptop.setScreenTexture(getSlideImage(workItems[0]));

        slides.forEach((slide, i) => {
          const content = slide.querySelector<HTMLElement>('.work-slide-content');
          const isFirst = i === 0;
          const isLast = i === slides.length - 1;
          const label = `slide-${i}`;
          tl.addLabel(label);

          let segmentDuration = 1;

          if (isFirst) {
            // The laptop opens as the first showcase fades in — kicks off the sequence.
            // Explicit duration: 1 unit, matching the label spacing below — without it,
            // tweens default to GSAP's 0.5s and leave the back half of every "unit"
            // completely static (dead scroll range with nothing animating).
            tl.to(lidPivot.rotation, { x: 0, ease: 'none', duration: 1 }, label);
            tl.to(lidPivot.position, { y: 0, ease: 'none', duration: 1 }, label);
            tl.to(
              [spotlight, spotlightBack],
              { intensity: SPOTLIGHT_ON_INTENSITY, ease: 'none', duration: 1 },
              label,
            );
            if (content) tl.to(content, { autoAlpha: 1, y: 0, ease: 'none', duration: 1 }, label);
          } else {
            // Between projects the laptop turns a full revolution while
            // translating to the opposite slot; the screen texture swaps at
            // the halfway point, while it's facing away, and the outgoing/
            // incoming text crossfade around that same beat.
            const prevContent = slides[i - 1].querySelector<HTMLElement>('.work-slide-content');
            const project = workItems[i];
            const prevProject = workItems[i - 1];

            // Hold first (screen still facing forward, showing the previous
            // project) — then each rotation half explicitly spans its own
            // full unit (turnStart to turnStart+1, then +1 to +2) so the turn
            // itself is one continuous sweep, no held/paused moment right as
            // the laptop's back faces the camera.
            const turnStart = TURN_HOLD_DURATION;
            const turnMid = TURN_HOLD_DURATION + 1;
            if (prevContent) {
              tl.to(prevContent, { autoAlpha: 0, y: -24, ease: 'none', duration: 1 }, `${label}+=${turnStart}`);
            }
            tl.to(modelGroup.rotation, { y: `+=${Math.PI}`, ease: 'none', duration: 1 }, `${label}+=${turnStart}`);
            tl.to(laptopWrap, { xPercent: laptopXPercent(i), ease: 'none', duration: 2 }, `${label}+=${turnStart}`);

            // GSAP fires .call() on both scrub directions — scrolling back up
            // crosses this same instant, so pick the texture by direction
            // rather than always swapping forward to `project`.
            tl.call(
              () => {
                const direction = tl.scrollTrigger?.direction ?? 1;
                laptop.setScreenTexture(getSlideImage(direction === 1 ? project : prevProject));
              },
              [],
              `${label}+=${turnMid}`,
            );
            tl.to(modelGroup.rotation, { y: `+=${Math.PI}`, ease: 'none', duration: 1 }, `${label}+=${turnMid}`);
            if (content) {
              tl.fromTo(
                content,
                { autoAlpha: 0, y: 24 },
                { autoAlpha: 1, y: 0, ease: 'none', duration: 1 },
                `${label}+=${turnMid}`,
              );
            }
            segmentDuration = TURN_HOLD_DURATION + 2; // hold + the turn/move
          }

          if (isLast) {
            // A distinct closing beat AFTER the last slide's segment fully
            // completes, plus the same "screen facing us" hold as every other
            // turn — the final project gets a beat on screen before the lid
            // folds shut, instead of closing the instant the turn finishes.
            const closeAt = `${label}+=${segmentDuration + TURN_HOLD_DURATION}`;
            tl.to(lidPivot.rotation, { x: closedRotationX, ease: 'none', duration: 1 }, closeAt);
            tl.to(lidPivot.position, { y: closedLiftY, ease: 'none', duration: 1 }, closeAt);
            tl.to([spotlight, spotlightBack], { intensity: 0, ease: 'none', duration: 1 }, closeAt);
          }
        });

        // Force a synchronous measurement pass right away rather than
        // waiting for GSAP's next natural refresh cycle — this section's
        // pinned height depends on the timeline duration computed just
        // above, and the trigger may be created while the page is still
        // settling (e.g. right after a route change), so any stale cached
        // measurement must be thrown out immediately, not eventually.
        ScrollTrigger.refresh();

        return () => tl.kill();
      });

      return () => mm.revert();
    },
    { scope: sectionRef, dependencies: [laptopReady] },
  );

  return (
    <section id="work" ref={sectionRef} className="relative overflow-hidden md:h-screen">
      <div ref={trackRef} className="relative flex flex-col md:block md:h-full">
        {workItems.map((project, index) => (
          <WorkSlide key={project.id} project={project} index={index} />
        ))}

        {isDesktop && (
          <div ref={laptopWrapRef} className="pointer-events-none absolute inset-y-0 left-0 z-30 w-1/2">
            <Suspense fallback={null}>
              <Laptop3D
                ref={laptopRef}
                onReady={() => setLaptopReady(true)}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
              />
            </Suspense>
          </div>
        )}
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
             <ViewTransitionLink to="/contact" className="next-btn next-btn-outline">
              Say hello
            </ViewTransitionLink>
          </div>
        </div>

        <ScrollHint />

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

      <FillStatement text="I build software that works, and engineers who can build it without me." />

      <WorkSlides />

      <MarqueeBand />

      <footer id="contact" className="relative flex flex-col items-center gap-8 overflow-hidden px-6 py-32 text-center sm:px-10">
        <span aria-hidden="true" className="logo-mark footer-mark" />
        <ViewTransitionLink
          ref={ctaRef}
          to="/contact"
          className="next-cta-link next-heading relative z-10 inline-block text-[clamp(2.5rem,9vw,6rem)] font-black uppercase"
        >
          Let&apos;s talk →
        </ViewTransitionLink>
        <div className="relative z-10 flex items-center gap-5">
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
