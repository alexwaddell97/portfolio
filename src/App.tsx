import './App.css';
import { useEffect, useLayoutEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext.tsx';
import Home from './pages/Home.tsx';
import AllProjects from './pages/AllProjects.tsx';
import CaseStudy from './pages/CaseStudy.tsx';
import Blog from './pages/Blog.tsx';
import BlogPost from './pages/BlogPost.tsx';
import CV from './pages/CV.tsx';
import NotFound from './pages/NotFound.tsx';
import Lab from './pages/Lab.tsx';
import SnakeOverlay from './components/SnakeOverlay.tsx';

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
    document.documentElement.setAttribute('data-konami', terminalMode ? 'on' : 'off');
  }, [terminalMode]);

  return (
    <>
      <ScrollToTop />
      {terminalMode && <SnakeOverlay onClose={() => setTerminalMode(false)} />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<AllProjects />} />
        <Route path="/projects/:slug" element={<CaseStudy key={location.pathname} />} />
        <Route path="/cv" element={<CV />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/lab" element={<Lab />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
