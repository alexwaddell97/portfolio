import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import SectionHeading from './SectionHeading.tsx';

const mentorshipStats = [
  { label: 'Developers mentored', value: '30+' },
  { label: 'Bootcamp sessions delivered', value: '20+' },
  { label: 'Project reviews & build walkthroughs', value: '100+' },
];

function Mentorship() {
  return (
    <section id="mentorship" className="ment-v1">
      <div className="mv-shell">
        <SectionHeading title="Teaching & Mentorship" />

        <div className="mv-intro">
          <p>
            Alongside leading delivery, I mentor junior developers through internal bootcamps and support T-Level students on
            real client projects. I am involved from planning and architecture through code reviews and debugging sessions.
          </p>
        </div>

        <div className="mv-stats">
          {mentorshipStats.map((stat) => (
            <div key={stat.label} className="mv-stat">
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>

        <div className="mv-panels">
          <div className="mv-panel">
            <h3>Bootcamp Mentoring</h3>
            <p>
              I coach early-career developers from fundamentals through shipping maintainable production work, with practical
              tooling and clear delivery habits.
            </p>
          </div>
          <div className="mv-panel">
            <h3>T-Level Project Coaching</h3>
            <p>
              I support learners through real project milestones, pairing on debugging and helping them explain design and
              implementation decisions clearly.
            </p>
          </div>
        </div>

        <div className="mv-link text-center">
          <Link
            to="/blog"
            className="hover-underline-accent group inline-flex items-center gap-2 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
          >
            Read more about how I approach engineering and growth
            <FiArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Mentorship;
