import { createContext, useContext, useEffect, useRef, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

function getInitialTheme(): Theme {
  const stored = localStorage.getItem('theme');
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

const THEME_STREAK_WINDOW_MS = 6000;
const THEME_STREAK_TARGET = 7;
const THEME_STREAK_DURATION_MS = 2400;

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const toggleTimestampsRef = useRef<number[]>([]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Follow system preference changes only when user hasn't set a manual override
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  function toggleTheme() {
    const now = Date.now();
    const recent = [...toggleTimestampsRef.current.filter((timestamp) => now - timestamp <= THEME_STREAK_WINDOW_MS), now];
    if (recent.length >= THEME_STREAK_TARGET) {
      document.documentElement.setAttribute('data-theme-streak', 'on');
      window.setTimeout(() => {
        document.documentElement.removeAttribute('data-theme-streak');
      }, THEME_STREAK_DURATION_MS);
      toggleTimestampsRef.current = [];
    } else {
      toggleTimestampsRef.current = recent;
    }

    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
