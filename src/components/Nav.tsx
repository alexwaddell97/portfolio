import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiArrowLeft } from 'react-icons/fi';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cvFilePath } from '../data/cv.ts';

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const location = useLocation();

  const navigate = useNavigate();
  const isHome = location.pathname === '/';
  const isAllProjects = location.pathname === '/projects';
  const isBlog = location.pathname === '/blog' || location.pathname.startsWith('/blog/');
  const isCV = location.pathname === '/cv';
  const isCaseStudy = location.pathname.startsWith('/projects/') && location.pathname !== '/projects';

  function handleHashNav(sectionId: string) {
    setMobileOpen(false);
    if (isHome) {
      const el = document.getElementById(sectionId);
      el?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/');
      // After navigation, React re-renders the home page — wait a tick for the DOM
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }, 120);
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
      className={`fixed top-0 right-0 left-0 z-50 backdrop-blur-md transition-all duration-300 ${
        scrolled ? 'border-b border-border bg-bg-primary/80' : 'border-b border-transparent bg-bg-primary/0'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          to="/"
          onClick={() => { if (isHome) window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className="group relative flex items-center"
        >
          {/* <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan to-violet text-xs font-bold text-white shadow-lg shadow-violet/20">
            {'</>'}
          </div> */}
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
            className={`nav-brand-underline absolute -bottom-0.5 h-px bg-gradient-to-r from-cyan to-violet transition-all duration-300 ${
              isHome
                ? 'left-0 w-full opacity-70'
                : 'left-1/2 w-0 opacity-0 group-hover:left-0 group-hover:w-full group-hover:opacity-100'
            }`}
          />
        </Link>

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
                      className="absolute inset-0 rounded-full bg-white/5"
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
                      className="absolute inset-0 rounded-full bg-white/5"
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
              className="ml-2 rounded-full border border-cyan/35 bg-cyan/10 px-4 py-1.5 text-sm font-medium text-cyan transition-colors hover:bg-cyan/15"
            >
              Download CV
            </a>
          </div>
        )}

        {/* Mobile toggle */}
        {!isCaseStudy && (
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-text-secondary md:hidden"
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
            transition={{ duration: 0.3 }}
            className="overflow-hidden border-b border-border bg-bg-primary/95 backdrop-blur-md md:hidden"
          >
            <div className="flex flex-col gap-4 px-4 py-4">
              {navItems.map((item) =>
                item.type === 'link' ? (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className="text-text-secondary transition-colors hover:text-text-primary"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <button
                    key={item.href}
                    onClick={() => handleHashNav(item.section)}
                    className="text-left text-text-secondary transition-colors hover:text-text-primary cursor-pointer"
                  >
                    {item.label}
                  </button>
                )
              )}
              <a
                href={cvFilePath}
                download
                onClick={() => setMobileOpen(false)}
                className="rounded-lg border border-cyan/35 bg-cyan/10 px-3 py-2 text-sm font-medium text-cyan transition-colors hover:bg-cyan/15"
              >
                Download CV
              </a>
              {!isCV && (
                <Link
                  to="/cv"
                  onClick={() => setMobileOpen(false)}
                  className="text-text-secondary transition-colors hover:text-text-primary"
                >
                  View CV
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

export default Nav;
