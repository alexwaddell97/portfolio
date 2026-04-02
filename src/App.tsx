import './App.css';
import { lazy, Suspense, useEffect, useLayoutEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext.tsx';
import SnakeOverlay from './components/SnakeOverlay.tsx';

const Home = lazy(() => import('./pages/Home.tsx'));
const AllProjects = lazy(() => import('./pages/AllProjects.tsx'));
const CaseStudy = lazy(() => import('./pages/CaseStudy.tsx'));
const Blog = lazy(() => import('./pages/Blog.tsx'));
const BlogPost = lazy(() => import('./pages/BlogPost.tsx'));
const CV = lazy(() => import('./pages/CV.tsx'));
const NotFound = lazy(() => import('./pages/NotFound.tsx'));
const Lab = lazy(() => import('./pages/Lab.tsx'));
const LabExperiment = lazy(() => import('./pages/LabExperiment.tsx'));
const LabCaseStudy = lazy(() => import('./pages/LabCaseStudy.tsx'));

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

function ScrollToTop() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    const root = document.documentElement;
    const previousScrollBehavior = root.style.scrollBehavior;

    root.style.scrollBehavior = 'auto';
    window.scrollTo({ top: 0, left: 0 });

    window.requestAnimationFrame(() => {
      root.style.scrollBehavior = previousScrollBehavior;
    });
  }, [pathname]);

  return null;
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppRoutes />
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
        <Route path="/projects" element={<AllProjects />} />
        <Route path="/projects/lab/:slug" element={<LabCaseStudy />} />
        <Route path="/projects/:slug" element={<CaseStudy key={location.pathname} />} />
        <Route path="/cv" element={<CV />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
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
