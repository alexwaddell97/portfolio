import { MeshGradient } from '@paper-design/shaders-react';
import { FiDownload, FiExternalLink, FiMail } from 'react-icons/fi';
import { Link, useSearchParams } from 'react-router-dom';
import ScrambleText from '../components/ScrambleText.tsx';
import { usePageTitle } from '../hooks/usePageTitle.ts';
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

// The screen view runs on the site's noir/neon "next" system (fixed dark
// palette, single neon accent). That palette has no light-mode variant —
// it's built for screen, not paper — so ?pdf=1 (rendered headless by
// scripts/export-cv-pdf.mjs into an actual downloadable PDF) uses its own
// literal light/print colors instead of the next-* utility classes: same
// display/mono fonts and the same accent hue, darkened for legibility on
// white rather than the dark background itself.
const PRINT_INK = '#161616';
const PRINT_INK_DIM = '#5a5f66';
const PRINT_BORDER = '#e2e2e2';
const PRINT_ACCENT = '#5c6f00';

// Same static approximation of the hero's MeshGradient used by
// scripts/generate-favicon.mjs — blurred radial blobs rather than the live
// WebGL shader. The PDF is rasterised by a headless browser with no
// guaranteed GPU, so this is the reliable way to get the same "cool"
// coloured header the screen version has without depending on WebGL
// actually initialising during export.
const PRINT_HEADER_GRADIENT =
  'radial-gradient(circle at 22% 20%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 45%), ' +
  'radial-gradient(circle at 80% 78%, rgba(212,255,0,0.95) 0%, rgba(212,255,0,0) 48%), ' +
  'radial-gradient(circle at 78% 18%, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 40%)';
const PRINT_HEADER_TEXT = '#ffffff';
const PRINT_HEADER_TEXT_DIM = 'rgba(255,255,255,0.75)';

function CV() {
  const [searchParams] = useSearchParams();
  const isPdf = searchParams.get('pdf') === '1';
  usePageTitle('CV');
  const pdfPrimaryHighlights = 3;
  const pdfSecondaryHighlights = 2;
  const pdfSkillLimit = 12;

  const eyebrowClass = isPdf
    ? 'text-xs font-semibold tracking-[0.2em] uppercase'
    : 'next-index text-xs uppercase tracking-[0.2em]';

  const eyebrowStyle = isPdf ? { color: PRINT_ACCENT, fontFamily: 'var(--font-mono)' } : undefined;

  return (
    <div
      className={isPdf ? 'min-h-screen bg-white' : 'next-scene min-h-screen'}
      style={isPdf ? { color: PRINT_INK, fontFamily: 'var(--font-sans)' } : undefined}
    >
      {!isPdf && (
        <div className="px-6 pt-8 sm:px-10">
          <Link to="/" className="next-kicker inline-flex items-center gap-2 text-next-ink-dim transition-colors hover:text-next-ink">
            ← alexw.dev
          </Link>
        </div>
      )}

      <main className={isPdf ? 'min-h-screen w-full p-0' : 'mx-auto max-w-5xl px-4 pt-10 pb-20 sm:px-6 lg:px-8'}>
        <section
          className={
            isPdf
              ? 'w-full px-6 py-5'
              : 'next-grain overflow-hidden rounded-xs border border-next-line bg-next-bg-raised p-6 sm:p-8'
          }
          style={isPdf ? { background: '#ffffff' } : undefined}
        >
          <div
            className={
              isPdf
                ? 'relative -mx-6 -mt-6 flex flex-wrap items-start justify-between gap-2 overflow-hidden border-b px-6 pt-6 pb-4 sm:-mx-8 sm:-mt-8 sm:px-8 sm:pt-8'
                : 'relative -mx-6 -mt-6 flex flex-wrap items-start justify-between gap-4 overflow-hidden border-b border-next-line px-6 pt-6 pb-6 sm:-mx-8 sm:-mt-8 sm:px-8 sm:pt-8'
            }
            style={isPdf ? { borderColor: PRINT_BORDER } : undefined}
          >
            {!isPdf && (
              <div className="pointer-events-none absolute inset-0 z-0">
                <MeshGradient
                  className="h-full w-full"
                  style={{ opacity: 0.45 }}
                  colors={['#000000', '#000000', '#ffffff', '#d4ff00']}
                  speed={0.15}
                  distortion={0.4}
                  swirl={0.12}
                  grainMixer={0.05}
                  grainOverlay={0.15}
                />
                <div className="absolute inset-0 bg-black/60" />
              </div>
            )}

            {isPdf && (
              <div className="pointer-events-none absolute inset-0 z-0" style={{ background: '#000000' }}>
                <div
                  className="absolute -inset-8"
                  style={{ backgroundImage: PRINT_HEADER_GRADIENT, filter: 'blur(30px) saturate(1.1)' }}
                />
                <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.45)' }} />
              </div>
            )}

            <div className="relative z-10">
              {isPdf ? (
                <h1
                  className="text-3xl font-black tracking-tight uppercase sm:text-3xl"
                  style={{ color: PRINT_HEADER_TEXT, fontFamily: 'var(--font-sans)' }}
                >
                  {cvData.fullName}
                </h1>
              ) : (
                <ScrambleText
                  as="h1"
                  text={cvData.fullName}
                  className="next-heading text-4xl font-black tracking-tight uppercase sm:text-5xl"
                />
              )}
              <p
                className={`${isPdf ? 'mt-1 text-sm' : 'mt-2'} ${isPdf ? '' : 'text-next-ink-dim'}`}
                style={isPdf ? { color: PRINT_HEADER_TEXT_DIM } : undefined}
              >
                {cvData.title}
              </p>
              <p
                className={`${isPdf ? 'mt-0.5 text-xs' : 'mt-1 text-sm'} ${isPdf ? '' : 'text-next-ink-dim'}`}
                style={isPdf ? { color: PRINT_HEADER_TEXT_DIM } : undefined}
              >
                {cvData.location}
              </p>
            </div>

            {!isPdf ? (
              <div className="relative z-10 flex items-center gap-4">
                <span className="logo-mark h-16 w-16 shrink-0" aria-hidden="true" />

                <a href={cvFilePath} download className="next-btn next-btn-outline px-4 py-2 text-sm">
                  <FiDownload size={15} />
                  Download PDF
                </a>
              </div>
            ) : (
              <span
                className="logo-mark relative z-10 h-16 w-16 shrink-0"
                style={{ backgroundColor: '#d4ff00' }}
                aria-hidden="true"
              />
            )}
          </div>

          <div className={`${isPdf ? 'grid gap-4 pt-3 md:grid-cols-[1.8fr_0.8fr]' : 'grid gap-8 pt-6 md:grid-cols-[1.6fr_1fr]'}`}>
            <div className={isPdf ? 'space-y-4' : 'space-y-8'}>
              <section>
                <h2 className={eyebrowClass} style={eyebrowStyle}>Profile</h2>
                <p
                  className={`${isPdf ? 'mt-2 text-sm leading-snug' : 'mt-3 leading-relaxed'} ${isPdf ? '' : 'text-next-ink-dim'}`}
                  style={isPdf ? { color: PRINT_INK_DIM } : undefined}
                >
                  {cvData.summary}
                </p>
              </section>

              <section>
                <h2 className={eyebrowClass} style={eyebrowStyle}>Experience</h2>
                <div className={isPdf ? 'mt-2 space-y-3' : 'mt-4 space-y-6'}>
                  {cvData.experience.map((item, index) => (
                    <article
                      key={`${item.company}-${item.role}`}
                      className={isPdf ? 'rounded-lg p-3' : 'rounded-xs border border-next-line bg-next-bg p-4'}
                      style={isPdf ? { border: `1px solid ${PRINT_BORDER}` } : undefined}
                    >
                      <div className="flex flex-nowrap items-baseline justify-between gap-2">
                        <h3
                          className={`${isPdf ? 'text-base' : 'text-lg'} font-semibold`}
                          style={isPdf ? { color: PRINT_INK } : undefined}
                        >
                          {item.role}
                        </h3>
                        <p
                          className={`${isPdf ? 'shrink-0 text-right text-xs whitespace-nowrap' : 'text-sm'} ${isPdf ? '' : 'text-next-ink-dim'}`}
                          style={isPdf ? { color: PRINT_INK_DIM, fontFamily: 'var(--font-mono)' } : undefined}
                        >
                          {formatDateRange(item.start, item.end, isPdf)}
                        </p>
                      </div>
                      <p
                        className={`${isPdf ? 'mt-0.5 text-xs' : 'mt-1 text-sm'} ${isPdf ? '' : 'text-next-ink-dim'}`}
                        style={isPdf ? { color: PRINT_INK_DIM } : undefined}
                      >
                        {item.company}
                        {item.location ? ` · ${item.location}` : ''}
                      </p>
                      <ul
                        className={`${isPdf ? 'mt-2 space-y-1 text-xs leading-snug' : 'mt-3 space-y-2 text-sm'} ${isPdf ? '' : 'text-next-ink-dim'}`}
                        style={isPdf ? { color: PRINT_INK_DIM } : undefined}
                      >
                        {(isPdf
                          ? item.highlights.slice(0, index === 0 ? pdfPrimaryHighlights : pdfSecondaryHighlights)
                          : item.highlights).map((highlight) => (
                          <li key={highlight} className="flex gap-2">
                            <span
                              className={isPdf ? 'mt-1 h-1.5 w-1.5 shrink-0 rounded-full' : 'mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-next-neon'}
                              style={isPdf ? { background: PRINT_ACCENT } : undefined}
                            />
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                      {item.tech && item.tech.length > 0 && (
                        <div className={`${isPdf ? 'mt-2 flex flex-wrap gap-1.5' : 'mt-3 flex flex-wrap gap-2'}`}>
                          {(isPdf ? item.tech.slice(0, 3) : item.tech).map((skill) => (
                            <span
                              key={skill}
                              className={
                                isPdf
                                  ? 'rounded-full px-2 py-0.5 text-[10px]'
                                  : 'rounded-full border border-next-line px-2.5 py-1 text-xs text-next-ink-dim'
                              }
                              style={isPdf ? { border: `1px solid ${PRINT_BORDER}`, color: PRINT_INK_DIM } : undefined}
                            >
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
                <h2 className={eyebrowClass} style={eyebrowStyle}>Education</h2>
                <div className={isPdf ? 'mt-2 space-y-2' : 'mt-4 space-y-4'}>
                  {cvData.education.map((item) => (
                    <article
                      key={`${item.institution}-${item.qualification}`}
                      className={isPdf ? 'rounded-lg p-2.5' : 'rounded-xs border border-next-line bg-next-bg p-4'}
                      style={isPdf ? { border: `1px solid ${PRINT_BORDER}` } : undefined}
                    >
                      <div className="flex flex-nowrap items-baseline justify-between gap-2">
                        <h3
                          className={`${isPdf ? 'text-sm' : ''} font-semibold`}
                          style={isPdf ? { color: PRINT_INK } : undefined}
                        >
                          {item.qualification}
                        </h3>
                        <p
                          className={`${isPdf ? 'shrink-0 text-right text-xs whitespace-nowrap' : 'text-sm'} ${isPdf ? '' : 'text-next-ink-dim'}`}
                          style={isPdf ? { color: PRINT_INK_DIM, fontFamily: 'var(--font-mono)' } : undefined}
                        >
                          {formatDateRange(item.start, item.end, isPdf)}
                        </p>
                      </div>
                      <p
                        className={`${isPdf ? 'mt-0.5 text-xs' : 'mt-1 text-sm'} ${isPdf ? '' : 'text-next-ink-dim'}`}
                        style={isPdf ? { color: PRINT_INK_DIM } : undefined}
                      >
                        {item.institution}
                      </p>
                      {item.notes && item.notes.length > 0 && (
                        <ul
                          className={`${isPdf ? 'mt-1 space-y-0.5 text-xs' : 'mt-2 space-y-1 text-sm'} ${isPdf ? '' : 'text-next-ink-dim'}`}
                          style={isPdf ? { color: PRINT_INK_DIM } : undefined}
                        >
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
                <h2 className={eyebrowClass} style={eyebrowStyle}>Contact</h2>
                <a
                  href={`mailto:${cvData.email}`}
                  className={`${isPdf ? 'mt-2 text-xs' : 'mt-3 text-sm'} inline-flex items-center gap-2 ${isPdf ? '' : 'text-next-ink-dim transition-colors hover:text-next-neon'}`}
                  style={isPdf ? { color: PRINT_INK_DIM } : undefined}
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
                        className={`${isPdf ? 'text-xs' : 'text-sm'} inline-flex items-center gap-2 ${isPdf ? '' : 'text-next-ink-dim transition-colors hover:text-next-ink'}`}
                        style={isPdf ? { color: PRINT_INK_DIM } : undefined}
                      >
                        {link.label}
                        <FiExternalLink size={13} />
                      </a>
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h2 className={eyebrowClass} style={eyebrowStyle}>Strengths</h2>
                {isPdf ? (
                  <ul className="mt-2 space-y-1 text-xs leading-snug" style={{ color: PRINT_INK_DIM }}>
                    {cvData.strengths.slice(0, 3).map((strength) => (
                      <li key={strength} className="flex gap-2">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: PRINT_ACCENT }} />
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <ul className="mt-3 space-y-2 text-sm text-next-ink-dim">
                    {cvData.strengths.map((strength) => (
                      <li key={strength}>{strength}</li>
                    ))}
                  </ul>
                )}
              </section>

              <section>
                <h2 className={eyebrowClass} style={eyebrowStyle}>Skills</h2>
                {isPdf ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {cvData.skills.slice(0, pdfSkillLimit).map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full px-2 py-0.5 text-[10px]"
                        style={{ border: `1px solid ${PRINT_BORDER}`, color: PRINT_INK_DIM }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {cvData.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full border border-next-line px-2.5 py-1 text-xs text-next-ink-dim"
                      >
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
