import { FiDownload, FiExternalLink, FiMail } from 'react-icons/fi';
import { useSearchParams } from 'react-router-dom';
import Nav from '../components/Nav.tsx';
import cvData, { cvFilePath } from '../data/cv.ts';

const monthShort: Record<string, string> = {
  January: 'Jan',
  February: 'Feb',
  March: 'Mar',
  April: 'Apr',
  May: 'May',
  June: 'Jun',
  July: 'Jul',
  August: 'Aug',
  September: 'Sep',
  October: 'Oct',
  November: 'Nov',
  December: 'Dec',
};

function compactDateLabel(value: string) {
  const [month, year] = value.split(' ');
  if (!year || !monthShort[month]) return value;
  return `${monthShort[month]} ${year}`;
}

function formatDateRange(start: string, end: string, compact = false) {
  if (!compact) return `${start} — ${end}`;
  return `${compactDateLabel(start)} — ${compactDateLabel(end)}`;
}

function CV() {
  const [searchParams] = useSearchParams();
  const isPdf = searchParams.get('pdf') === '1';
  const pdfPrimaryHighlights = 3;
  const pdfSecondaryHighlights = 2;
  const pdfSkillLimit = 12;

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary" {...(isPdf ? { 'data-theme': 'light' } : {})}>
      {!isPdf && <Nav />}
      <main className={isPdf ? 'min-h-screen w-full p-0' : 'mx-auto max-w-5xl px-4 pb-20 pt-32 sm:px-6 lg:px-8'}>
        <section className={isPdf ? 'dot-grid min-h-screen w-full bg-bg-primary px-6 py-5' : 'dot-grid overflow-hidden rounded-2xl border border-border bg-bg-card p-6 sm:p-8'}>
          <div className={isPdf ? 'flex flex-wrap items-start justify-between gap-2 border-b border-border pb-3' : 'flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6'}>
            <div>
              <h1
                className={`${isPdf ? 'text-3xl sm:text-3xl' : 'text-4xl sm:text-5xl'} font-black tracking-tight`}
                style={{
                  backgroundImage: 'linear-gradient(135deg, var(--color-cyan), var(--color-violet))',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                {cvData.fullName}
              </h1>
              <p className={`${isPdf ? 'mt-1 text-sm' : 'mt-2'} text-text-secondary`}>{cvData.title}</p>
              <p className={`${isPdf ? 'mt-0.5 text-xs' : 'mt-1 text-sm'} text-text-muted`}>{cvData.location}</p>
            </div>

            {!isPdf && (
              <a
                href={cvFilePath}
                download
                className="btn-soft-cyan px-4 py-2 text-sm"
              >
                <FiDownload size={15} />
                Download PDF
              </a>
            )}
          </div>

          <div className={`${isPdf ? 'grid gap-4 pt-3 md:grid-cols-[1.8fr_0.8fr]' : 'grid gap-8 pt-6 md:grid-cols-[1.6fr_1fr]'}`}>
            <div className={isPdf ? 'space-y-4' : 'space-y-8'}>
              <section>
                <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-cyan">Profile</h2>
                <p className={`${isPdf ? 'mt-2 text-sm leading-snug' : 'mt-3 leading-relaxed'} text-text-secondary`}>{cvData.summary}</p>
              </section>

              <section>
                <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-violet">Experience</h2>
                <div className={isPdf ? 'mt-2 space-y-3' : 'mt-4 space-y-6'}>
                  {cvData.experience.map((item, index) => (
                    <article key={`${item.company}-${item.role}`} className={isPdf ? 'rounded-lg border border-border bg-bg-secondary/40 p-3' : 'rounded-xl border border-border bg-bg-secondary/50 p-4'}>
                      <div className="flex flex-nowrap items-baseline justify-between gap-2">
                        <h3 className={`${isPdf ? 'text-base' : 'text-lg'} font-semibold text-text-primary`}>{item.role}</h3>
                        <p className={`${isPdf ? 'text-xs whitespace-nowrap shrink-0 text-right' : 'text-sm'} text-text-muted`}>
                          {formatDateRange(item.start, item.end, isPdf)}
                        </p>
                      </div>
                      <p className={`${isPdf ? 'mt-0.5 text-xs' : 'mt-1 text-sm'} text-text-secondary`}>
                        {item.company}
                        {item.location ? ` · ${item.location}` : ''}
                      </p>
                      <ul className={`${isPdf ? 'mt-2 space-y-1 text-xs leading-snug' : 'mt-3 space-y-2 text-sm'} text-text-secondary`}>
                        {(isPdf
                          ? item.highlights.slice(0, index === 0 ? pdfPrimaryHighlights : pdfSecondaryHighlights)
                          : item.highlights).map((highlight) => (
                          <li key={highlight} className="flex gap-2">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-cyan" />
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                      {item.tech && item.tech.length > 0 && (
                        <div className={`${isPdf ? 'mt-2 flex flex-wrap gap-1.5' : 'mt-3 flex flex-wrap gap-2'}`}>
                          {(isPdf ? item.tech.slice(0, 3) : item.tech).map((skill) => (
                            <span key={skill} className={`${isPdf ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'} rounded-full border border-border bg-bg-card text-text-secondary`}>
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-pink">Education</h2>
                <div className={isPdf ? 'mt-2 space-y-2' : 'mt-4 space-y-4'}>
                  {cvData.education.map((item) => (
                    <article key={`${item.institution}-${item.qualification}`} className={isPdf ? 'rounded-lg border border-border bg-bg-secondary/40 p-2.5' : 'rounded-xl border border-border bg-bg-secondary/50 p-4'}>
                      <div className="flex flex-nowrap items-baseline justify-between gap-2">
                        <h3 className={`${isPdf ? 'text-sm' : ''} font-semibold text-text-primary`}>{item.qualification}</h3>
                        <p className={`${isPdf ? 'text-xs whitespace-nowrap shrink-0 text-right' : 'text-sm'} text-text-muted`}>
                          {formatDateRange(item.start, item.end, isPdf)}
                        </p>
                      </div>
                      <p className={`${isPdf ? 'mt-0.5 text-xs' : 'mt-1 text-sm'} text-text-secondary`}>{item.institution}</p>
                      {item.notes && item.notes.length > 0 && (
                        <ul className={`${isPdf ? 'mt-1 space-y-0.5 text-xs' : 'mt-2 space-y-1 text-sm'} text-text-secondary`}>
                          {item.notes.map((note) => (
                            <li key={note}>{note}</li>
                          ))}
                        </ul>
                      )}
                    </article>
                  ))}
                </div>
              </section>
            </div>

            <aside className={isPdf ? 'space-y-4' : 'space-y-8'}>
              <section>
                <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-cyan">Contact</h2>
                <a
                  href={`mailto:${cvData.email}`}
                  className={`${isPdf ? 'mt-2 text-xs' : 'mt-3 text-sm'} inline-flex items-center gap-2 text-text-secondary transition-colors hover:text-cyan`}
                >
                  <FiMail size={14} />
                  {cvData.email}
                </a>
                <ul className={isPdf ? 'mt-2 space-y-1' : 'mt-3 space-y-2'}>
                  {cvData.links.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${isPdf ? 'text-xs' : 'text-sm'} inline-flex items-center gap-2 text-text-secondary transition-colors hover:text-text-primary`}
                      >
                        {link.label}
                        <FiExternalLink size={13} />
                      </a>
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-violet">Strengths</h2>
                {isPdf ? (
                  <ul className="mt-2 space-y-1 text-xs leading-snug text-text-secondary">
                    {cvData.strengths.slice(0, 3).map((strength) => (
                      <li key={strength} className="flex gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-violet" />
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <ul className="mt-3 space-y-2 text-sm text-text-secondary">
                    {cvData.strengths.map((strength) => (
                      <li key={strength}>{strength}</li>
                    ))}
                  </ul>
                )}
              </section>

              <section>
                <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-pink">Skills</h2>
                {isPdf ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {cvData.skills.slice(0, pdfSkillLimit).map((skill) => (
                      <span key={skill} className="rounded-full border border-border bg-bg-secondary/70 px-2 py-0.5 text-[10px] text-text-secondary">
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {cvData.skills.map((skill) => (
                      <span key={skill} className="rounded-full border border-border bg-bg-secondary px-2.5 py-1 text-xs text-text-secondary">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </section>
            </aside>
          </div>
        </section>
      </main>
    </div>
  );
}

export default CV;
