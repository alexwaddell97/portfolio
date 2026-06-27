import { Link } from 'react-router-dom';
import projects from '../data/projects.ts';
import { labs } from '../data/labs.ts';

const homeProjects = [
  ...projects.filter((project) => project.featured),
  ...projects.filter((project) => !project.featured).slice(0, 2),
];

function Projects() {
  return (
    <section id="projects" className="projects-v2">
      <div className="v2-shell">
        <p className="v2-kicker">Case studies</p>
        <h2>Selected Work</h2>

        <div className="v2-stack">
          {homeProjects.map((project, index) => (
            <article key={project.id} className="v2-item">
              <div className="v2-media">
                <img src={project.image} alt={project.title} loading="lazy" />
                <span className="v2-index">{String(index + 1).padStart(2, '0')}</span>
              </div>

              <div className="v2-body">
                <div className="v2-headline">
                  <h3>{project.title}</h3>
                  <Link to={`/projects/${project.slug}`}>Open case study</Link>
                </div>
                <p>{project.description}</p>
                <div className="v2-tech">
                  {project.tags.slice(0, 5).map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>

        <footer className="v2-foot">
          <Link to="/projects">View all {projects.length + labs.length} projects</Link>
        </footer>
      </div>
    </section>
  );
}

export default Projects;
