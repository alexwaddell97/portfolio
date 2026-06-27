import type { CSSProperties } from 'react';

interface Milestone {
  year: string;
  title: string;
  subtitle: string;
  glowRgb: string;
}

const milestones: Milestone[] = [
  {
    year: '2019',
    title: 'Coastline Software',
    subtitle: 'Director / Lead Front-end Developer',
    glowRgb: '6, 182, 212',
  },
  {
    year: '2022',
    title: 'Boxmodel',
    subtitle: 'Senior Software Engineer',
    glowRgb: '34, 197, 94',
  },
  {
    year: '2023',
    title: 'Layers Studio',
    subtitle: 'Lead Developer',
    glowRgb: '117, 255, 221',
  },
];

function IntroTimeline() {
  return (
    <section id="journey" className="journey-v1">
      <div className="jv-shell">
        <div className="jv-copy">
          <h2>How I Work</h2>
          <p>
            I lead product builds end to end, setting direction, writing production code, and helping other developers grow. My
            priority is practical delivery, with well-defined scope, sound technical decisions, and code that will not become a
            problem six months later.
          </p>
        </div>

        <div className="jv-rail">
          {milestones.map((item) => (
            <article className="jv-step" key={item.year}>
              <p className="jv-year">{item.year}</p>
              <div className="jv-info" style={{ '--milestone-accent': `rgb(${item.glowRgb})` } as CSSProperties}>
                <h3>{item.title}</h3>
                <p>{item.subtitle}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default IntroTimeline;
