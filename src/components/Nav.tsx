import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiArrowLeft, FiSun, FiMoon } from 'react-icons/fi';
import { LuFlaskConical } from 'react-icons/lu';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLenis } from 'lenis/react';
import { cvFilePath } from '../data/cv.ts';
import { useTheme } from '../contexts/ThemeContext.tsx';

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  function handleToggle(e: React.MouseEvent<HTMLButtonElement>) {
    document.documentElement.style.setProperty('--theme-x', `${e.clientX}px`);
    document.documentElement.style.setProperty('--theme-y', `${e.clientY}px`);

    if (!('startViewTransition' in document)) {
      toggleTheme();
      return;
    }

    (document as Document & { startViewTransition(cb: () => void): void })
      .startViewTransition(toggleTheme);
  }

  return (
    <button
      onClick={handleToggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="relative flex h-7 w-7 items-center justify-center text-text-secondary transition-colors hover:text-home-ember cursor-pointer"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ opacity: 0, rotate: isDark ? -90 : 90, scale: 0.6 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: isDark ? 90 : -90, scale: 0.6 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] as const }}
          className="absolute inset-0 flex items-center justify-center"
        >
          {isDark ? <FiSun size={16} /> : <FiMoon size={15} />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

function Nav() {
  const mobileMenuTransitionMs = 260;
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const location = useLocation();

  const navigate = useNavigate();
  const lenis = useLenis();
  const isHome = location.pathname === '/';
  const isAllProjects = location.pathname === '/projects';
  const isCaseStudy = location.pathname.startsWith('/projects/') && location.pathname !== '/projects';
  // Pages already migrated to the new "home" design system — Nav should match their background too.
  const usesHomeSystem = isHome || isAllProjects || isCaseStudy;

  function scrollToSection(sectionId: string, delayMs = 0) {
    window.setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (!el) return;
      if (lenis) {
        lenis.scrollTo(el);
      } else {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, delayMs);
  }

  function handleHashNav(sectionId: string) {
    const menuDelay = mobileOpen ? mobileMenuTransitionMs : 0;
    setMobileOpen(false);

    if (isHome) {
      scrollToSection(sectionId, menuDelay);
    } else {
      navigate('/');
      // After navigation, React re-renders the home page — wait a tick for the DOM
      scrollToSection(sectionId, 120 + menuDelay);
    }
  }

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track active section on home page only
  useEffect(() => {
    if (!isHome) return;
    const sections = ['hero', 'projects', 'contact'];
    const observers: IntersectionObserver[] = [];
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { threshold: 0.4 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach(obs => obs.disconnect());
  }, [isHome]);

  // Nav items — each has a type so we know how to render
  type NavItem =
    | { label: string; type: 'hash'; href: string; section: string }
    | { label: string; type: 'link'; to: string };

  const navItems: NavItem[] = [
    { label: 'Home', type: 'hash', href: '#hero', section: 'hero' },
    { label: 'Projects', type: 'link', to: '/projects' },
    { label: 'Contact', type: 'hash', href: '#contact', section: 'contact' },
  ];

  function isActive(item: NavItem) {
    if (item.type === 'link') {
      if (item.to === '/projects') return isAllProjects;
      return false;
    }
    // hash item — item.section is now narrowed correctly
    if (!isHome) return false;
    return activeSection === item.section;
  }

  const solidBg = usesHomeSystem ? 'border-home-line bg-home-bg' : 'border-border bg-bg-primary';
  const scrolledBg = usesHomeSystem
    ? 'backdrop-blur-md border-home-line bg-home-bg/90'
    : 'backdrop-blur-md border-border bg-bg-primary/80';

  return (
    <motion.nav
      initial={false}
      className={`fixed top-0 right-0 left-0 z-50 border-b transition-all duration-300 ${
        mobileOpen
          ? solidBg
          : scrolled
            ? scrolledBg
            : 'border-transparent bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo + utility cluster */}
        <div className="flex items-center gap-4">
          <Link
            to="/"
            onClick={() => {
              if (!isHome) return;
              if (lenis) {
                lenis.scrollTo(0);
              } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="group relative flex items-center"
          >
            <motion.span
              whileHover={{ y: -1 }}
              transition={{ type: 'spring', stiffness: 420, damping: 28 }}
              className="nav-brand-dotdev text-sm font-semibold tracking-tight"
            >
              alexw.dev
            </motion.span>
            <span
              aria-hidden
              className={`nav-brand-underline absolute -bottom-0.5 h-px transition-all duration-300 ${
                isHome
                  ? 'left-0 w-full opacity-70 bg-home-ember'
                  : 'left-1/2 w-0 opacity-0 bg-home-volt group-hover:left-0 group-hover:w-full group-hover:opacity-100'
              }`}
            />
          </Link>
          <div className="flex items-center rounded-xs border border-home-line">
            <ThemeToggle />
            <span aria-hidden className="h-4 w-px bg-home-line" />
            <motion.span whileHover={{ rotate: -15 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }}>
              <Link
                to="/lab"
                aria-label="Lab"
                className="flex h-7 w-7 items-center justify-center text-text-secondary transition-colors hover:text-home-ember"
              >
                <LuFlaskConical size={15} strokeWidth={2} />
              </Link>
            </motion.span>
          </div>
        </div>

        {/* Case study: back button */}
        {isCaseStudy ? (
          <Link
            to="/projects"
            className="flex items-center gap-2 px-4 py-1.5 font-mono text-xs uppercase tracking-[0.14em] text-text-secondary transition-colors hover:text-home-ember"
          >
            <FiArrowLeft size={14} />
            Back to projects
          </Link>
        ) : (
          <div className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const active = isActive(item);
              const linkClasses = 'relative px-4 py-1.5 font-mono text-xs uppercase tracking-[0.14em] transition-colors';
              return item.type === 'link' ? (
                <Link
                  key={item.to}
                  to={item.to}
                  className={linkClasses}
                  style={{ color: active ? 'var(--color-home-paper)' : 'var(--color-text-secondary)' }}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-active-underline"
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute inset-x-3 bottom-0.5 h-0.5 bg-home-ember"
                    />
                  )}
                  <span className="relative z-10">{item.label}</span>
                </Link>
              ) : (
                <button
                  key={item.href}
                  onClick={() => handleHashNav(item.section)}
                  className={`${linkClasses} cursor-pointer`}
                  style={{ color: active ? 'var(--color-home-paper)' : 'var(--color-text-secondary)' }}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-active-underline"
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute inset-x-3 bottom-0.5 h-0.5 bg-home-ember"
                    />
                  )}
                  <span className="relative z-10">{item.label}</span>
                </button>
              );
            })}
            <a
              href={cvFilePath}
              download
              className="ml-2 rounded-xs border border-home-line px-4 py-1.5 text-sm font-semibold text-home-paper transition-colors hover:border-home-ember hover:text-home-ember"
            >
              Download CV
            </a>
          </div>
        )}

        {/* Mobile toggle */}
        {!isCaseStudy && (
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="cursor-pointer text-text-secondary md:hidden"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
          >
            {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        )}
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && !isCaseStudy && (
          <motion.div
            id="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] as const }}
            className={`overflow-hidden border-b md:hidden ${solidBg}`}
          >
            <div className="flex flex-col px-6 py-5">
              {navItems.map((item) => {
                const active = isActive(item);

                const mobileDivider = usesHomeSystem ? 'border-home-line' : 'border-border/50';
                const mobileLinkClasses = `border-b py-3.5 font-mono text-sm uppercase tracking-[0.14em] transition-colors last:border-0 ${mobileDivider} ${
                  active
                    ? 'text-home-paper underline decoration-2 decoration-home-ember/80 underline-offset-8'
                    : 'text-text-secondary hover:text-home-paper'
                }`;

                if (item.type === 'link') {
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileOpen(false)}
                      className={mobileLinkClasses}
                    >
                      {item.label}
                    </Link>
                  );
                }

                return (
                  <button
                    key={item.href}
                    onClick={() => handleHashNav(item.section)}
                    className={`cursor-pointer text-left ${mobileLinkClasses}`}
                  >
                    {item.label}
                  </button>
                );
              })}
              <a
                href={cvFilePath}
                download
                onClick={() => setMobileOpen(false)}
                className="mt-5 w-full rounded-xs border border-home-line py-3 text-center text-sm text-home-paper transition-colors hover:border-home-ember hover:text-home-ember"
              >
                Download CV
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

export default Nav;
