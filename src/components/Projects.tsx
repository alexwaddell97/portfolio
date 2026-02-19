import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import AnimatedSection from './AnimatedSection.tsx';
import SectionHeading from './SectionHeading.tsx';
import ProjectCard from './ProjectCard.tsx';
import projects from '../data/projects.ts';

// Show featured + up to 2 others on the home page
const homeProjects = [
  ...projects.filter(p => p.featured),
  ...projects.filter(p => !p.featured).slice(0, 2),
];

function Projects() {
  return (
    <section id="projects" className="py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading title="Selected Work" subtitle="Projects I'm genuinely proud of" />

        {/* Featured — full width */}
        <AnimatedSection className="mb-6">
          <ProjectCard project={homeProjects[0]} index={0} />
        </AnimatedSection>

        {/* 2-col grid for remaining */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {homeProjects.slice(1).map((project, i) => (
            <AnimatedSection key={project.id} delay={i * 0.1}>
              <ProjectCard project={project} index={i + 1} compact />
            </AnimatedSection>
          ))}
        </div>

        {/* View all link */}
        <AnimatedSection delay={0.3} className="mt-12 text-center">
          <Link
            to="/projects"
            className="hover-underline-accent group inline-flex items-center gap-2 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
          >
            View all {projects.length} projects
            <FiArrowRight
              size={14}
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </Link>
        </AnimatedSection>
      </div>
    </section>
  );
}

export default Projects;
