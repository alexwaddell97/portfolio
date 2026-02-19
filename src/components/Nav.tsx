import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiArrowLeft, FiSun, FiMoon } from 'react-icons/fi';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
      className="relative flex h-7 w-7 items-center justify-center rounded-full text-text-secondary transition-colors hover:text-text-primary cursor-pointer"
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
          {isDark ? <FiMoon size={15} /> : <FiSun size={16} />}
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
  const isHome = location.pathname === '/';
  const isAllProjects = location.pathname === '/projects';
  const isBlog = location.pathname === '/blog' || location.pathname.startsWith('/blog/');
  const isCaseStudy = location.pathname.startsWith('/projects/') && location.pathname !== '/projects';

  function scrollToSection(sectionId: string, delayMs = 0) {
    window.setTimeout(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
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
    { label: 'Writing', type: 'link', to: '/blog' },
    { label: 'Contact', type: 'hash', href: '#contact', section: 'contact' },
  ];

  function isActive(item: NavItem) {
    if (item.type === 'link') {
      if (item.to === '/projects') return isAllProjects;
      if (item.to === '/blog') return isBlog;
      return false;
    }
    // hash item — item.section is now narrowed correctly
    if (!isHome) return false;
    return activeSection === item.section;
  }

  return (
    <motion.nav
      initial={false}
      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
        mobileOpen
          ? 'border-b border-border bg-bg-primary'
          : scrolled
            ? 'backdrop-blur-md border-b border-border bg-bg-primary/80'
            : 'border-b border-transparent bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo + theme toggle */}
        <div className="flex items-center gap-2.5">
          <Link
            to="/"
            onClick={() => { if (isHome) window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="group relative flex items-center"
          >
            <motion.span
              whileHover={{ y: -1 }}
              transition={{ type: 'spring', stiffness: 420, damping: 28 }}
              className="nav-brand text-sm font-semibold tracking-tight"
            >
              <span className="text-text-primary">alexw</span>
              <span className="nav-brand-dotdev">.dev</span>
            </motion.span>
            <span
              aria-hidden
              className={`nav-brand-underline absolute -bottom-0.5 h-px bg-linear-to-r from-cyan to-violet transition-all duration-300 ${
                isHome
                  ? 'left-0 w-full opacity-70'
                  : 'left-1/2 w-0 opacity-0 group-hover:left-0 group-hover:w-full group-hover:opacity-100'
              }`}
            />
          </Link>
          <ThemeToggle />
        </div>

        {/* Case study: back button */}
        {isCaseStudy ? (
          <Link
            to="/projects"
            className="flex items-center gap-2 rounded-full px-4 py-1.5 text-sm text-text-secondary transition-colors hover:text-cyan"
          >
            <FiArrowLeft size={16} />
            Back to work
          </Link>
        ) : (
          <div className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const active = isActive(item);
              return item.type === 'link' ? (
                <Link
                  key={item.to}
                  to={item.to}
                  className="relative px-4 py-1.5 text-sm transition-colors"
                  style={{ color: active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-indicator"
                      className="absolute inset-0 rounded-full border border-cyan/30 bg-cyan/10"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{item.label}</span>
                </Link>
              ) : (
                <button
                  key={item.href}
                  onClick={() => handleHashNav(item.section)}
                  className="relative px-4 py-1.5 text-sm transition-colors cursor-pointer"
                  style={{ color: active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-indicator"
                      className="absolute inset-0 rounded-full border border-cyan/30 bg-cyan/10"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{item.label}</span>
                </button>
              );
            })}
            <a
              href={cvFilePath}
              download
              className="btn-soft-cyan ml-2 rounded-full px-4 py-1.5 text-sm"
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
            className="overflow-hidden border-b border-border bg-bg-primary md:hidden"
          >
            <div className="flex flex-col px-6 py-5">
              {navItems.map((item) => {
                const active = isActive(item);

                if (item.type === 'link') {
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileOpen(false)}
                      className={`border-b py-3.5 text-base font-medium transition-colors last:border-0 ${
                        active
                          ? 'border-border/50 text-text-primary underline decoration-2 decoration-cyan/80 underline-offset-8'
                          : 'border-border/50 text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                }

                return (
                  <button
                    key={item.href}
                    onClick={() => handleHashNav(item.section)}
                    className={`cursor-pointer border-b py-3.5 text-left text-base font-medium transition-colors last:border-0 ${
                      active
                        ? 'border-border/50 text-text-primary underline decoration-2 decoration-cyan/80 underline-offset-8'
                        : 'border-border/50 text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
              <a
                href={cvFilePath}
                download
                onClick={() => setMobileOpen(false)}
                className="btn-soft-cyan mt-5 w-full rounded-xl py-3 text-sm"
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
