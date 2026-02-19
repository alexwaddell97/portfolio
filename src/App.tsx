import './App.css';
import { useLayoutEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home.tsx';
import AllProjects from './pages/AllProjects.tsx';
import CaseStudy from './pages/CaseStudy.tsx';
import Blog from './pages/Blog.tsx';
import BlogPost from './pages/BlogPost.tsx';
import CV from './pages/CV.tsx';

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
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

function AppRoutes() {
  const location = useLocation();

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<AllProjects />} />
        <Route path="/projects/:slug" element={<CaseStudy key={location.pathname} />} />
        <Route path="/cv" element={<CV />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
      </Routes>
    </>
  );
}

export default App;
