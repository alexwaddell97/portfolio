import { Link } from 'react-router-dom';
import { FiArrowRight, FiUsers, FiBookOpen, FiCode } from 'react-icons/fi';
import AnimatedSection from './AnimatedSection.tsx';
import SectionHeading from './SectionHeading.tsx';

const mentorshipStats = [
  { icon: FiUsers, label: 'Developers mentored', value: '50+' },
  { icon: FiBookOpen, label: 'T-Level sessions delivered', value: '30+' },
  { icon: FiCode, label: 'Project reviews & build walkthroughs', value: '100+' },
];

function Mentorship() {
  return (
    <section id="mentorship" className="py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Teaching & Mentorship"
          subtitle="I build products and help developers grow with practical, project-first coaching"
        />

        <AnimatedSection>
          <p className="mx-auto mb-10 max-w-3xl text-center text-base leading-relaxed text-text-secondary md:text-lg">
            Alongside delivery work, I mentor beginner developers through internal bootcamps and support T-Level learners
            through real-world projects — from planning and architecture to code reviews, debugging, and confident delivery.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {mentorshipStats.map((stat, index) => (
            <AnimatedSection key={stat.label} delay={index * 0.08}>
              <div className="rounded-2xl border border-border bg-bg-card p-6">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-violet/10 text-violet">
                  <stat.icon size={18} />
                </div>
                <p className="text-2xl font-black text-text-primary">{stat.value}</p>
                <p className="mt-1 text-sm text-text-secondary">{stat.label}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
          <AnimatedSection delay={0.16}>
            <article className="rounded-2xl border border-border bg-bg-card p-6">
              <h3 className="text-lg font-semibold text-text-primary">Bootcamp Mentoring</h3>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                Coached beginner developers through structured bootcamp pathways, helping them move from fundamentals to
                shipping complete projects with clean architecture and maintainable code.
              </p>
            </article>
          </AnimatedSection>

          <AnimatedSection delay={0.24}>
            <article className="rounded-2xl border border-border bg-bg-card p-6">
              <h3 className="text-lg font-semibold text-text-primary">T-Level Project Coaching</h3>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                Supported learners through project-based delivery with practical feedback, pair-debugging, and milestone
                guidance so they can confidently present and explain their solutions.
              </p>
            </article>
          </AnimatedSection>
        </div>

        <AnimatedSection delay={0.3} className="mt-10 text-center">
          <Link
            to="/blog"
            className="hover-underline-accent group inline-flex items-center gap-2 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
          >
            Read more about how I approach engineering and growth
            <FiArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </AnimatedSection>
      </div>
    </section>
  );
}

export default Mentorship;
