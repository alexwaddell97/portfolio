import Nav from '../components/Nav.tsx';
import Hero from '../components/Hero.tsx';
import TechStack from '../components/TechStack.tsx';
import Projects from '../components/Projects.tsx';
import Mentorship from '../components/Mentorship.tsx';
import Contact from '../components/Contact.tsx';
import Footer from '../components/Footer.tsx';

function Home() {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <Nav />
      <main>
        <Hero />
        <TechStack />
        <Projects />
        <Mentorship />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

export default Home;
