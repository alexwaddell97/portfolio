import './App.css';
import { lazy, Suspense, useEffect, useLayoutEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useLenis } from 'lenis/react';
import { ThemeProvider } from './contexts/ThemeContext.tsx';
import SnakeOverlay from './components/SnakeOverlay.tsx';
import SmoothScroll from './components/SmoothScroll.tsx';
import PageLoader from './components/PageLoader.tsx';
import { markAppReady } from './lib/appReady.ts';

const LOADER_SEEN_KEY = 'alexw-loader-seen';

const Home = lazy(() => import('./pages/Home.tsx'));
const Contact = lazy(() => import('./pages/Contact.tsx'));
const CV = lazy(() => import('./pages/CV.tsx'));
const NotFound = lazy(() => import('./pages/NotFound.tsx'));
const Lab = lazy(() => import('./pages/Lab.tsx'));
const LabExperiment = lazy(() => import('./pages/LabExperiment.tsx'));

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

function ScrollToTop() {
  const { pathname } = useLocation();
  const lenis = useLenis();

  useLayoutEffect(() => {
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
      return;
    }

    const root = document.documentElement;
    const previousScrollBehavior = root.style.scrollBehavior;

    root.style.scrollBehavior = 'auto';
    window.scrollTo({ top: 0, left: 0 });

    window.requestAnimationFrame(() => {
      root.style.scrollBehavior = previousScrollBehavior;
    });
  }, [pathname, lenis]);

  return null;
}

function App() {
  // Lazy initializer marks the session as "seen" the moment we decide to
  // show the loader (not after it finishes) — if the tab reloads mid-load,
  // sessionStorage already reflects the choice, so it shows once and stays gone.
  const [showLoader, setShowLoader] = useState(() => {
    if (typeof window === 'undefined') return false;

    // Dev convenience: ?loader=1 replays the intro regardless of session
    // gating, so iterating on it doesn't need a DevTools round-trip each time.
    const forceReplay = import.meta.env.DEV && new URLSearchParams(window.location.search).get('loader') === '1';

    if (!forceReplay && window.sessionStorage.getItem(LOADER_SEEN_KEY)) {
      markAppReady();
      return false;
    }
    window.sessionStorage.setItem(LOADER_SEEN_KEY, '1');
    return true;
  });

  return (
    <ThemeProvider>
      {showLoader && (
        <PageLoader
          onDone={() => {
            markAppReady();
            setShowLoader(false);
          }}
        />
      )}
      <BrowserRouter>
        <SmoothScroll>
          <AppRoutes />
        </SmoothScroll>
      </BrowserRouter>
    </ThemeProvider>
  );
}

function AppRoutes() {
  const location = useLocation();
  const [terminalMode, setTerminalMode] = useState(false);

  useEffect(() => {
    window.console.info('%c⚡ alexw.dev booted', 'color:#06b6d4;font-weight:700;font-size:12px;');
    window.console.info('%cHint: try window.alexw() for a tiny easter egg.', 'color:#a1a1aa;font-size:11px;');

    (window as Window & { alexw?: () => string }).alexw = () => {
      const message = 'build > ship > mentor > repeat';
      window.console.info(`%c${message}`, 'color:#7c3aed;font-weight:700;');
      return message;
    };

    return () => {
      delete (window as Window & { alexw?: () => string }).alexw;
    };
  }, []);

  useEffect(() => {
    let pointer = 0;

    const isEditableTarget = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;
      return (
        target.isContentEditable
        || target.tagName === 'INPUT'
        || target.tagName === 'TEXTAREA'
        || target.tagName === 'SELECT'
      );
    };

    const movementKeys = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);

    const onKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) return;

      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      const expected = KONAMI[pointer];

      if (movementKeys.has(event.key)) {
        const isPotentialSequenceKey = event.key === expected || event.key === KONAMI[0] || pointer > 0;
        if (isPotentialSequenceKey) {
          event.preventDefault();
        }
      }

      if (key === expected) {
        pointer += 1;
        if (pointer === KONAMI.length) {
          setTerminalMode((prev) => !prev);
          pointer = 0;
        }
        return;
      }

      pointer = key === KONAMI[0] ? 1 : 0;
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    const base = 'https://alexw.dev';
    const canonical = `${base}${location.pathname}`;
    let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = canonical;
  }, [location.pathname]);

  useEffect(() => {
    document.documentElement.setAttribute('data-konami', terminalMode ? 'on' : 'off');
  }, [terminalMode]);

  return (
    <Suspense fallback={null}>
      <ScrollToTop />
      {terminalMode && <SnakeOverlay onClose={() => setTerminalMode(false)} />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/cv" element={<CV />} />
        <Route path="/lab" element={<Lab />} />
        <Route path="/ttr" element={<LabExperiment slugOverride="ttr-dashboard" />} />
        <Route path="/f1" element={<LabExperiment slugOverride="f1-dashboard" />} />
        <Route path="/lab/:slug" element={<LabExperiment />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default App;
