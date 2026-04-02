import { useState, useEffect, Fragment } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LuTrophy, LuMedal } from 'react-icons/lu';
import { FiChevronDown } from 'react-icons/fi';

// ── Brand ─────────────────────────────────────────────────────────────────────

const RED        = '#d01c1c';
const RED_BG     = 'rgba(208,28,28,0.07)';
const RED_BORDER = 'rgba(208,28,28,0.25)';

const BORDER  = 'rgba(0,0,0,0.07)';
const BORDER2 = 'rgba(0,0,0,0.05)';

// ── League config ─────────────────────────────────────────────────────────────

interface LeagueConfig {
  id: string;
  label: string;
  shortLabel: string;
  leagueId: number;
  divisionId: number;
  seasonId: number;
  venue: 'parks' | 'rgs-wed' | 'rgs-thu';
  division: 'cup' | 'plate';
}

const LEAGUES: LeagueConfig[] = [
  { id: 'parks-cup',     label: 'The Parks — Cup',            shortLabel: 'Parks Cup',     leagueId: 2074, divisionId: 8151, seasonId: 95, venue: 'parks',   division: 'cup'   },
  { id: 'parks-plate',   label: 'The Parks — Plate',           shortLabel: 'Parks Plate',   leagueId: 2074, divisionId: 8152, seasonId: 95, venue: 'parks',   division: 'plate' },
  { id: 'rgs-wed-cup',   label: 'RGS Newcastle Wed — Cup',     shortLabel: 'RGS Wed Cup',   leagueId: 2075, divisionId: 8159, seasonId: 95, venue: 'rgs-wed', division: 'cup'   },
  { id: 'rgs-wed-plate', label: 'RGS Newcastle Wed — Plate',   shortLabel: 'RGS Wed Plate', leagueId: 2075, divisionId: 8160, seasonId: 95, venue: 'rgs-wed', division: 'plate' },
  { id: 'rgs-thu-cup',   label: 'RGS Newcastle Thu — Cup',     shortLabel: 'RGS Thu Cup',   leagueId: 2076, divisionId: 8165, seasonId: 95, venue: 'rgs-thu', division: 'cup'   },
  { id: 'rgs-thu-plate', label: 'RGS Newcastle Thu — Plate',   shortLabel: 'RGS Thu Plate', leagueId: 2076, divisionId: 8166, seasonId: 95, venue: 'rgs-thu', division: 'plate' },
];

const VENUES = [
  { id: 'parks'   as const, label: 'Monday' },
  { id: 'rgs-wed' as const, label: 'Wednesday' },
  { id: 'rgs-thu' as const, label: 'Thursday' },
];

type VenueId = 'parks' | 'rgs-wed' | 'rgs-thu';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Standing {
  pos: number;
  teamId: number | null;
  team: string;
  pld: number;
  w: number;
  l: number;
  d: number;
  f: number;
  a: number;
  diff: number;
  pts: number;
}

interface Fixture {
  date: string;
  time: string;
  pitch: string;
  home: string;
  away: string;
  homeScore: number | null;
  awayScore: number | null;
  played: boolean;
}

interface SeasonMatch {
  date: string; time: string; court: string; opposition: string;
  scoreFor: number | null; scoreAgainst: number | null;
  result: 'W' | 'L' | 'D' | null; label: string | null;
}

interface StatBlock {
  avgScored: number | null; avgConceded: number | null; avgPoints: number | null;
  biggestWin: string | null; biggestLoss: string | null;
}

interface TeamProfile {
  teamId: number;
  name: string;
  currentPosition: number | null;
  currentRecord: { w: number; l: number; d: number } | null;
  seasonMatches: SeasonMatch[];
  stats: { last3: StatBlock; season: StatBlock; allTime: StatBlock };
  previousSeasons: { label: string; leagueId: number | null; seasonId: number | null; divisionId: number | null }[];
  pomAwards: { player: string; team: string; awards: number }[];
}

// ── API helpers ───────────────────────────────────────────────────────────────

async function fetchTTR(league: LeagueConfig, type: 'standings' | 'fixtures'): Promise<unknown[]> {
  const params = new URLSearchParams({
    leagueId: String(league.leagueId),
    divisionId: String(league.divisionId),
    seasonId: String(league.seasonId),
    type,
  });
  const res = await fetch(`/api/ttr?${params}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return json.data ?? [];
}

async function fetchTeamProfileAPI(league: LeagueConfig, teamId: number): Promise<TeamProfile> {
  const params = new URLSearchParams({
    leagueId: String(league.leagueId),
    divisionId: String(league.divisionId),
    seasonId: String(league.seasonId),
    teamId: String(teamId),
    type: 'team-profile',
  });
  const res = await fetch(`/api/ttr?${params}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return json.data as TeamProfile;
}

// ── Sub-components ────────────────────────────────────────────────────────────

// ── Form guide ────────────────────────────────────────────────────────────────

function FormDots({ matches, loading }: { matches: SeasonMatch[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="flex gap-1 justify-end">
        {[1, 2, 3, 4, 5].map(i => (
          <div
            key={i}
            className="w-4 h-4 rounded-sm"
            style={{ background: 'rgba(0,0,0,0.08)', animation: `ttr-shimmer 1.4s ${i * 0.1}s ease-in-out infinite` }}
          />
        ))}
      </div>
    );
  }
  const last5 = [...matches].filter(m => m.result).slice(-5);
  if (last5.length === 0) return <span className="font-mono text-xs text-black/25">—</span>;
  return (
    <div className="flex gap-1 items-center justify-end">
      {last5.map((m, i) => (
        <div
          key={i}
          className="w-4 h-4 rounded-sm flex items-center justify-center"
          title={`${m.result} — ${m.opposition}  ${m.scoreFor}–${m.scoreAgainst}`}
          style={{
            background:
              m.result === 'W' ? RED
              : m.result === 'D' ? 'rgba(0,0,0,0.20)'
              : 'rgba(0,0,0,0.05)',
            boxShadow: m.result === 'L' ? 'inset 0 0 0 1px rgba(0,0,0,0.18)' : 'none',
          }}
        >
          <span
            className="font-mono font-bold leading-none select-none"
            style={{
              fontSize: '8px',
              color:
                m.result === 'W' ? 'rgba(255,255,255,0.9)'
                : m.result === 'D' ? 'rgba(255,255,255,0.75)'
                : 'rgba(0,0,0,0.40)',
            }}
          >
            {m.result}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Team detail panel ─────────────────────────────────────────────────────────

function TeamDetailPanel({ profile, onViewProfile }: { profile: TeamProfile; onViewProfile: () => void }) {
  const recentPlayed = [...profile.seasonMatches].filter(m => m.result !== null).slice(-5).reverse();
  const ss = profile.stats.season;

  return (
    <div
      className="px-4 py-4 space-y-4"
      style={{ background: 'rgba(208,28,28,0.03)', borderTop: `1px solid ${RED_BORDER}` }}
    >
      {/* Record + season stats + profile link */}
      <div className="flex flex-wrap items-center gap-5">
        {profile.currentRecord && (
          <>
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-2xl font-black" style={{ color: RED }}>{profile.currentRecord.w}</span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-black/45 ml-0.5">W</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-2xl font-black text-black/40">{profile.currentRecord.l}</span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-black/45 ml-0.5">L</span>
            </div>
            {profile.currentRecord.d > 0 && (
              <div className="flex items-baseline gap-1.5">
                <span className="font-mono text-2xl font-black text-black/30">{profile.currentRecord.d}</span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-black/45 ml-0.5">D</span>
              </div>
            )}
          </>
        )}
        {ss.avgScored !== null && (
          <div className="hidden sm:flex items-center gap-4 ml-2">
            <div>
              <span className="font-mono text-sm font-bold text-black/70">{ss.avgScored.toFixed(1)}</span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-black/40 ml-1">avg scored</span>
            </div>
            <div>
              <span className="font-mono text-sm font-bold text-black/50">{ss.avgConceded?.toFixed(1)}</span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-black/40 ml-1">conceded</span>
            </div>
            {ss.biggestWin && (
              <div>
                <span className="font-mono text-sm font-bold" style={{ color: RED }}>{ss.biggestWin}</span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-black/40 ml-1">best win</span>
              </div>
            )}
          </div>
        )}
        <button
          onClick={onViewProfile}
          className="ml-auto cursor-pointer font-mono text-[11px] font-bold uppercase tracking-widest px-4 py-2 rounded-sm transition-opacity hover:opacity-85 active:opacity-70 shrink-0"
          style={{ background: RED, color: '#fff' }}
        >
          Full profile →
        </button>
      </div>

      {/* Recent results */}
      {recentPlayed.length > 0 && (
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-black/40 mb-2">Recent Results</div>
          <div className="space-y-2">
            {recentPlayed.map((m, i) => (
              <div key={i} className="flex items-center gap-2.5 text-sm">
                <span
                  className="w-6 h-6 shrink-0 flex items-center justify-center font-mono text-[10px] font-black rounded-sm"
                  style={{
                    background:
                      m.result === 'W' ? RED
                      : m.result === 'D' ? 'rgba(0,0,0,0.12)'
                      : 'rgba(0,0,0,0.05)',
                    boxShadow: m.result === 'L' ? 'inset 0 0 0 1px rgba(0,0,0,0.18)' : 'none',
                    color: m.result === 'W' ? '#fff' : m.result === 'D' ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0.40)',
                  }}
                >{m.result}</span>
                <span className="font-semibold text-black/70 truncate">{m.opposition}</span>
                <span className="ml-auto font-mono tabular-nums text-black/55 shrink-0">{m.scoreFor}–{m.scoreAgainst}</span>
                <span className="font-mono text-xs text-black/30 shrink-0 w-24 text-right hidden sm:block">{m.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* POM Awards */}
      {profile.pomAwards.length > 0 && (
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-black/40 mb-2">Player of the Match</div>
          <div className="flex flex-wrap gap-1.5">
            {profile.pomAwards.slice(0, 8).map((p, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-2.5 py-1.5 text-sm"
                style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.09)' }}
              >
                <span className="text-black/70">{p.player}</span>
                <span
                  className="font-mono text-[10px] font-black px-1 py-0.5"
                  style={{ background: RED_BG, color: RED }}
                >×{p.awards}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Previous seasons */}
      {profile.previousSeasons.length > 0 && (
        <div className="font-mono text-xs text-black/35">
          {profile.previousSeasons.length} previous season{profile.previousSeasons.length !== 1 ? 's' : ''} on record
        </div>
      )}
    </div>
  );
}

// ── Previous season row ───────────────────────────────────────────────────────

// ── Season accordion ──────────────────────────────────────────────────────────

// "Newcastle - Paddy Freeman's Park (Early Summer 2025) - Early Summer 2025 - Paddy Freeman's Cup"
// → "Early Summer 2025 · Paddy Freeman's Cup"
// "Newcastle - Paddy Freeman's Park (Autumn 2025) - Autumn 2025"
// → "Autumn 2025"
function shortenSeasonLabel(label: string): string {
  // Always pull season name from the (…) in the label
  const parenMatch = label.match(/\(([^)]+)\)/);
  const seasonName = parenMatch?.[1] ?? null;
  // Always use whatever comes after the final " - " as the division
  const lastDash = label.lastIndexOf(' - ');
  const division = lastDash >= 0 ? label.slice(lastDash + 3).trim() : label;
  if (!seasonName) return division;
  if (division === seasonName) return seasonName;
  return `${seasonName} · ${division}`;
}

function SeasonAccordion({ label, played, w, l, d }: {
  label: string;
  played: SeasonMatch[];
  w: number; l: number; d: number;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex cursor-pointer items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-black/2"
        style={{ borderBottom: `1px solid ${BORDER}` }}
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-black/40 flex-1">
          {shortenSeasonLabel(label)} · {played.length} games
        </span>
        <span className="font-mono text-[10px]" style={{ color: RED }}>{w}W</span>
        <span className="font-mono text-[10px] text-black/35">{l}L</span>
        {d > 0 && <span className="font-mono text-[10px] text-black/25">{d}D</span>}
        <span className="font-mono text-[10px] text-black/25 ml-1">{open ? '▲' : '▼'}</span>
      </button>
      {open && played.map((m, i) => (
        <div
          key={i}
          className="flex items-center gap-2.5 px-4 py-3"
          style={{ borderBottom: `1px solid ${BORDER2}` }}
        >
          <span
            className="w-6 h-6 shrink-0 flex items-center justify-center font-mono text-[10px] font-black rounded-sm"
            style={{
              background: m.result === 'W' ? RED : m.result === 'D' ? 'rgba(0,0,0,0.12)' : 'rgba(0,0,0,0.05)',
              boxShadow: m.result === 'L' ? 'inset 0 0 0 1px rgba(0,0,0,0.18)' : 'none',
              color: m.result === 'W' ? '#fff' : m.result === 'D' ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0.40)',
            }}
          >{m.result}</span>
          <span className="font-semibold text-sm text-black/70 truncate">{m.opposition}</span>
          {m.label && !/Fixtures and Results/i.test(m.label) && (
            <span className="font-mono text-[9px] uppercase tracking-wider text-black/30 shrink-0 hidden sm:block">{m.label}</span>
          )}
          <span className="ml-auto font-mono tabular-nums text-sm text-black/55 shrink-0">{m.scoreFor}–{m.scoreAgainst}</span>
          <span className="font-mono text-xs text-black/30 shrink-0 w-24 text-right hidden sm:block">{m.date}</span>
        </div>
      ))}
    </div>
  );
}

// ── Team profile page ─────────────────────────────────────────────────────────

function TeamProfilePage({ profile, onBack }: { profile: TeamProfile; onBack: () => void }) {
  const allTime = profile.stats.allTime;

  // Fetch all previous seasons in parallel
  const [pastProfiles, setPastProfiles] = useState<(TeamProfile | null)[]>([]);
  const [pastLoading, setPastLoading] = useState(false);

  useEffect(() => {
    const fetchable = profile.previousSeasons.filter(
      s => s.leagueId && s.seasonId && s.divisionId
    );
    if (fetchable.length === 0) return;
    setPastLoading(true);
    Promise.all(
      fetchable.map(s =>
        fetch(`/api/ttr?${new URLSearchParams({
          leagueId: String(s.leagueId!),
          divisionId: String(s.divisionId!),
          seasonId: String(s.seasonId!),
          teamId: String(profile.teamId),
          type: 'team-profile',
        })}`)
          .then(r => r.json())
          .then(j => j.data as TeamProfile)
          .catch(() => null)
      )
    ).then(results => {
      setPastProfiles(results);
      setPastLoading(false);
    });
  }, [profile.teamId, profile.previousSeasons]);

  // All seasons ordered newest → oldest: current first, then each past season
  const seasonGroups: { label: string; profile: TeamProfile }[] = [
    { label: 'This Season', profile },
    ...profile.previousSeasons
      .map((s, i) => ({ label: s.label, p: pastProfiles[i] ?? null }))
      .filter((s): s is { label: string; p: TeamProfile } => s.p !== null)
      .map(s => ({ label: s.label, profile: s.p })),
  ];

  // Aggregate POM awards across all fetched seasons
  const pomMap = new Map<string, number>();
  for (const g of seasonGroups) {
    for (const award of g.profile.pomAwards) {
      pomMap.set(award.player, (pomMap.get(award.player) ?? 0) + award.awards);
    }
  }
  const allPom = [...pomMap.entries()]
    .map(([player, awards]) => ({ player, awards }))
    .sort((a, b) => b.awards - a.awards);

  const totalGames = seasonGroups.reduce(
    (sum, g) => sum + g.profile.seasonMatches.filter(m => m.result !== null).length,
    0
  );

  return (
    <div>
      {/* Back navigation */}
      <div className="flex items-center gap-3 px-4 py-4" style={{ borderBottom: `1px solid ${BORDER}` }}>
        <button
          onClick={onBack}
          className="flex cursor-pointer items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest transition-colors hover:text-black"
          style={{ color: 'rgba(0,0,0,0.40)' }}
        >
          ← Back to standings
        </button>
      </div>

      {/* Team name */}
      <div className="flex items-center gap-4 px-4 py-5" style={{ borderBottom: `1px solid ${BORDER}` }}>
        <div className="w-1 h-8 rounded-full shrink-0" style={{ background: RED }} />
        <div>
          <div className="text-2xl font-black tracking-tight text-black leading-none">{profile.name}</div>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-black/35">
              {pastLoading ? `${profile.previousSeasons.length} season${profile.previousSeasons.length !== 1 ? 's' : ''} on record` : `${seasonGroups.length} season${seasonGroups.length !== 1 ? 's' : ''} · ${totalGames} games`}
            </span>
          </div>
        </div>
      </div>

      {/* All-time stats strip */}
      <div className="px-4 py-5" style={{ borderBottom: `1px solid ${BORDER}` }}>
        {pastLoading ? (
          <div className="flex items-center gap-3">
            <div className="relative h-0.5 w-32 overflow-hidden rounded-full" style={{ background: 'rgba(0,0,0,0.06)' }}>
              <div
                className="absolute inset-y-0 w-1/2"
                style={{ background: `linear-gradient(90deg, transparent, ${RED}, transparent)`, animation: 'ttr-sweep 1.5s ease-in-out infinite' }}
              />
            </div>
            <span className="font-mono text-[9px] uppercase tracking-widest text-black/30">Calculating all-time stats…</span>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            {(() => {
              const totalW = seasonGroups.reduce((sum, g) => sum + (g.profile.currentRecord?.w ?? 0), 0);
              const totalL = seasonGroups.reduce((sum, g) => sum + (g.profile.currentRecord?.l ?? 0), 0);
              const totalD = seasonGroups.reduce((sum, g) => sum + (g.profile.currentRecord?.d ?? 0), 0);
              return (totalW + totalL + totalD) > 0 ? (
                <>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-mono text-2xl font-black" style={{ color: RED }}>{totalW}</span>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-black/45 ml-0.5">W</span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-mono text-2xl font-black text-black/40">{totalL}</span>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-black/45 ml-0.5">L</span>
                  </div>
                  {totalD > 0 && (
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-mono text-2xl font-black text-black/30">{totalD}</span>
                      <span className="font-mono text-[10px] uppercase tracking-widest text-black/45 ml-0.5">D</span>
                    </div>
                  )}
                  <div className="h-5 w-px bg-black/10" />
                </>
              ) : null;
            })()}
            {allTime.avgScored !== null && (
              <>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-mono text-xl font-black text-black/70">{allTime.avgScored.toFixed(1)}</span>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-black/40">avg scored</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-mono text-xl font-black text-black/50">{allTime.avgConceded?.toFixed(1)}</span>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-black/40">avg conceded</span>
                </div>
              </>
            )}
            {allTime.biggestWin && (
              <div className="flex items-baseline gap-1.5">
                <span className="font-mono text-base font-black" style={{ color: RED }}>{allTime.biggestWin}</span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-black/40">best win</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* All-time POM leaderboard + season groups (or skeleton) */}
      {pastLoading ? (
        <div>
          {/* Sweep bar */}
          <div className="relative h-0.5 overflow-hidden" style={{ background: 'rgba(0,0,0,0.06)' }}>
            <div
              className="absolute inset-y-0 w-1/2"
              style={{ background: `linear-gradient(90deg, transparent, ${RED}, transparent)`, animation: 'ttr-sweep 1.5s ease-in-out infinite' }}
            />
          </div>
          {/* Skeleton section headers */}
          {[0, 1, 2].map(i => (
            <div key={i}>
              <div className="flex items-center gap-4 px-4 py-3" style={{ borderBottom: `1px solid ${BORDER}` }}>
                <div className="h-2.5 rounded flex-1" style={{ background: 'rgba(0,0,0,0.07)', animation: `ttr-shimmer 1.4s ${i * 0.2}s ease-in-out infinite` }} />
                <div className="h-2.5 w-8 rounded" style={{ background: 'rgba(0,0,0,0.05)', animation: `ttr-shimmer 1.4s ${i * 0.2 + 0.1}s ease-in-out infinite` }} />
              </div>
              {[0, 1, 2, 3].map(j => (
                <div key={j} className="flex items-center gap-2.5 px-4 py-3" style={{ borderBottom: `1px solid ${BORDER2}` }}>
                  <div className="w-6 h-6 rounded-sm shrink-0" style={{ background: 'rgba(0,0,0,0.06)', animation: `ttr-shimmer 1.4s ${(i + j) * 0.07}s ease-in-out infinite` }} />
                  <div className="h-3 rounded" style={{ width: `${45 + (j * 13) % 35}%`, background: 'rgba(0,0,0,0.08)', animation: `ttr-shimmer 1.4s ${(i + j) * 0.07}s ease-in-out infinite` }} />
                  <div className="ml-auto h-3 w-12 rounded" style={{ background: 'rgba(0,0,0,0.05)', animation: `ttr-shimmer 1.4s ${(i + j) * 0.07 + 0.1}s ease-in-out infinite` }} />
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* All-time POM leaderboard */}
          {allPom.length > 0 && (
            <div style={{ borderBottom: `1px solid ${BORDER}` }}>
              <div className="px-4 pt-3 pb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-black/40">
                Player of the Match · All Seasons
              </div>
              <div className="flex flex-wrap gap-1.5 px-4 pb-3 pt-2">
                {allPom.map((p, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm"
                    style={{ background: i === 0 ? RED_BG : 'rgba(0,0,0,0.04)', border: `1px solid ${i === 0 ? RED_BORDER : 'rgba(0,0,0,0.08)'}` }}
                  >
                    <span className="text-sm font-medium text-black/65">{p.player}</span>
                    <span className="font-mono text-[10px] font-black" style={{ color: i === 0 ? RED : 'rgba(0,0,0,0.35)' }}>×{p.awards}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Season-by-season games */}
          {seasonGroups.map(({ label, profile: sp }) => {
            const played = sp.seasonMatches.filter(m => m.result !== null).reverse();
            if (played.length === 0) return null;
            const w = played.filter(m => m.result === 'W').length;
            const l = played.filter(m => m.result === 'L').length;
            const d = played.filter(m => m.result === 'D').length;
            return (
              <SeasonAccordion key={label} label={label} played={played} w={w} l={l} d={d} />
            );
          })}
        </>
      )}
    </div>
  );
}

// ── Standings table ───────────────────────────────────────────────────────────

function StandingsTable({
  standings,
  profiles,
  profilesLoading,
  selectedTeamId,
  onSelectTeam,
  onViewProfile,
}: {
  standings: Standing[];
  profiles: Map<number, TeamProfile>;
  profilesLoading: boolean;
  selectedTeamId: number | null;
  onSelectTeam: (id: number | null) => void;
  onViewProfile: (teamId: number) => void;
}) {
  if (standings.length === 0) return <p className="py-10 text-center text-sm text-black/30">No standings data yet.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
            {(['#', 'Club', 'P', 'W', 'L', 'D', 'F', 'A', 'PD', 'Pts', 'Form'] as const).map((h, i) => (
              <th
                key={h}
                scope="col"
                className={`py-3 font-mono text-[10px] font-bold tracking-[0.12em] uppercase text-black/35
                  ${i === 0 ? 'pl-4 pr-2 text-left w-10'
                  : i === 1 ? 'text-left'
                  : i >= 6 && i <= 8 ? 'hidden pr-3 text-right w-10 sm:table-cell'
                  : i === 9 ? 'pr-3 text-right w-14'
                  : i === 10 ? 'hidden pr-4 text-right sm:table-cell'
                  : 'pr-3 text-right w-10'}`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {standings.map((s, i) => {
            const isTop = i === 0;
            const isSelected = s.teamId !== null && s.teamId === selectedTeamId;
            const profile = s.teamId !== null ? profiles.get(s.teamId) : undefined;
            return (
              <Fragment key={s.team}>
                <tr
                  className={`transition-colors hover:bg-black/2 ${s.teamId !== null ? 'cursor-pointer' : 'cursor-default'}`}
                  onClick={() => s.teamId !== null && onSelectTeam(isSelected ? null : s.teamId)}
                  style={{
                    borderBottom: isSelected ? 'none' : `1px solid ${BORDER2}`,
                    ...(isSelected ? { background: 'rgba(208,28,28,0.07)' } : isTop ? { background: RED_BG } : {}),
                  }}
                >
                  <td className="py-3.5 pl-4 pr-2 w-10">
                    <span className="font-mono text-xs" style={{ color: isTop ? RED : 'rgba(0,0,0,0.35)' }}>{s.pos}</span>
                  </td>
                  <td className="py-3.5 pr-4">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="inline-block w-0.5 shrink-0 rounded-full"
                        style={{ height: '1.1rem', background: isSelected || isTop ? RED : 'transparent' }}
                      />
                      <span className={`font-semibold truncate ${isTop || isSelected ? 'text-black' : 'text-black/75'}`}>{s.team}</span>
                    </div>
                  </td>
                  <td className="py-3.5 pr-3 text-right w-10">
                    <span className="font-mono text-xs text-black/45">{s.pld}</span>
                  </td>
                  <td className="py-3.5 pr-3 text-right w-10">
                    <span className="font-mono text-xs font-bold text-black/85">{s.w}</span>
                  </td>
                  <td className="py-3.5 pr-3 text-right w-10">
                    <span className="font-mono text-xs text-black/40">{s.l}</span>
                  </td>
                  <td className="py-3.5 pr-3 text-right w-10">
                    <span className="font-mono text-xs text-black/40">{s.d}</span>
                  </td>
                  <td className="hidden py-3.5 pr-3 text-right w-10 sm:table-cell">
                    <span className="font-mono text-xs text-black/45">{s.f}</span>
                  </td>
                  <td className="hidden py-3.5 pr-3 text-right w-10 sm:table-cell">
                    <span className="font-mono text-xs text-black/45">{s.a}</span>
                  </td>
                  <td className="hidden py-3.5 pr-3 text-right w-10 sm:table-cell">
                    <span className="font-mono text-xs tabular-nums" style={{ color: s.diff > 0 ? RED : s.diff < 0 ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0.35)' }}>
                      {s.diff > 0 ? `+${s.diff}` : s.diff}
                    </span>
                  </td>
                  <td className="py-3.5 pr-3 text-right w-14">
                    <span className="font-mono text-sm font-black" style={{ color: isTop ? RED : 'rgba(0,0,0,0.75)' }}>{s.pts}</span>
                  </td>
                  <td className="hidden py-3 pr-4 text-right sm:table-cell">
                    <FormDots
                      matches={profile?.seasonMatches ?? []}
                      loading={profilesLoading && !profile}
                    />
                  </td>
                  <td className="py-3 pr-3 text-right w-6">
                    <FiChevronDown
                      size={13}
                      className="transition-transform duration-200 text-black/25"
                      style={{ transform: isSelected ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    />
                  </td>
                </tr>
                {isSelected && profile && (
                  <tr style={{ borderBottom: `1px solid ${BORDER2}` }}>
                    <td colSpan={12}>
                      <TeamDetailPanel profile={profile} onViewProfile={() => onViewProfile(profile.teamId)} />
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Fixture row ───────────────────────────────────────────────────────────────

function FixtureRow({ fixture }: { fixture: Fixture }) {
  const homeWon = fixture.played && fixture.homeScore! > fixture.awayScore!;
  const awayWon = fixture.played && fixture.awayScore! > fixture.homeScore!;

  return (
    <div
      className="flex items-center gap-2 px-4 py-3 transition-colors hover:bg-black/2"
      style={{ borderBottom: `1px solid ${BORDER2}` }}
    >
      <span className="font-mono text-xs tabular-nums text-black/40 shrink-0 w-10">{fixture.time}</span>
      <span className="font-mono text-xs truncate text-black/30 shrink-0 w-8 hidden sm:block">{fixture.pitch}</span>
      <span className={`flex-1 truncate text-right text-sm font-semibold ${homeWon ? 'text-black' : 'text-black/50'}`}>{fixture.home}</span>
      {fixture.played ? (
        <div
          className="shrink-0 px-2.5 py-1 text-center font-mono text-sm font-black tabular-nums"
          style={{
            color: RED,
            background: RED_BG,
            border: `1px solid ${RED_BORDER}`,
            minWidth: '3.75rem',
          }}
        >
          {fixture.homeScore}–{fixture.awayScore}
        </div>
      ) : (
        <div
          className="shrink-0 px-2.5 py-1 text-center font-mono text-[10px] uppercase tracking-widest text-black/35"
          style={{ border: '1px solid rgba(0,0,0,0.14)', minWidth: '3.75rem' }}
        >
          vs
        </div>
      )}
      <span className={`flex-1 truncate text-left text-sm font-semibold ${awayWon ? 'text-black' : 'text-black/50'}`}>{fixture.away}</span>
    </div>
  );
}

// ── Fixtures section heading ──────────────────────────────────────────────────

function FixturesSection({ heading, entries }: { heading: string; entries: [string, Fixture[]][] }) {
  return (
    <div>
      <div className="flex items-center gap-3 px-4 py-2.5" style={{ borderBottom: `1px solid ${BORDER}` }}>
        <span className="font-mono text-xs font-black tracking-[0.15em] uppercase" style={{ color: RED }}>{heading}</span>
      </div>
      {entries.map(([date, fs]) => (
        <div key={date}>
          <div
            className="px-4 py-2 font-mono text-xs tracking-widest uppercase text-black/40"
            style={{ background: 'rgba(0,0,0,0.025)', borderBottom: `1px solid ${BORDER2}` }}
          >
            {date}
          </div>
          {fs.map((f, i) => <FixtureRow key={i} fixture={f} />)}
        </div>
      ))}
    </div>
  );
}

// ── Fixtures list ─────────────────────────────────────────────────────────────

function FixturesList({ fixtures }: { fixtures: Fixture[] }) {
  if (fixtures.length === 0) return (
    <p className="py-10 text-center text-sm text-black/30">
      No upcoming fixtures — check back once the next round is scheduled.
    </p>
  );

  const byDate = fixtures.reduce<Record<string, Fixture[]>>((acc, f) => {
    if (!acc[f.date]) acc[f.date] = [];
    acc[f.date].push(f);
    return acc;
  }, {});

  const upcoming = Object.entries(byDate).filter(([, fs]) => fs.some(f => !f.played));
  const results  = Object.entries(byDate).filter(([, fs]) => fs.every(f => f.played));

  return (
    <div>
      {upcoming.length > 0 && <FixturesSection heading="Upcoming" entries={upcoming} />}
      {results.length > 0 && <FixturesSection heading="Results" entries={[...results].reverse()} />}
    </div>
  );
}

// ── League panel ──────────────────────────────────────────────────────────────

function LeaguePanel({ league }: { league: LeagueConfig }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = (searchParams.get('tab') ?? 'standings') as 'standings' | 'fixtures';
  const teamParam = searchParams.get('team');
  const selectedTeamId: number | null = teamParam ? parseInt(teamParam, 10) : null;
  const profileParam = searchParams.get('profile');
  const profileTeamId: number | null = profileParam ? parseInt(profileParam, 10) : null;

  function setTab(t: 'standings' | 'fixtures') {
    setSearchParams(p => { const n = new URLSearchParams(p); n.set('tab', t); return n; }, { replace: true });
  }
  function setSelectedTeamId(id: number | null) {
    setSearchParams(p => { const n = new URLSearchParams(p); if (id === null) n.delete('team'); else n.set('team', String(id)); n.delete('profile'); return n; }, { replace: true });
  }
  function setProfileTeamId(id: number | null) {
    setSearchParams(p => { const n = new URLSearchParams(p); if (id === null) n.delete('profile'); else n.set('profile', String(id)); return n; }, { replace: true });
  }

  const [standings, setStandings] = useState<Standing[]>([]);
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teamProfiles, setTeamProfiles] = useState<Map<number, TeamProfile>>(new Map());
  const [profilesLoading, setProfilesLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setTeamProfiles(new Map());
    Promise.all([
      fetchTTR(league, 'standings'),
      fetchTTR(league, 'fixtures'),
    ]).then(([s, f]) => {
      if (cancelled) return;
      const sd = s as Standing[];
      setStandings(sd);
      setFixtures(f as Fixture[]);
      setLoading(false);
      // Fan out to fetch all team profiles in parallel
      const teamIds = sd.map(t => t.teamId).filter((id): id is number => typeof id === 'number');
      if (teamIds.length > 0) {
        setProfilesLoading(true);
        Promise.all(teamIds.map(id =>
          fetchTeamProfileAPI(league, id).then(p => [id, p] as const)
        )).then(entries => {
          if (cancelled) return;
          setTeamProfiles(new Map(entries));
          setProfilesLoading(false);
        }).catch(() => { if (!cancelled) setProfilesLoading(false); });
      }
    }).catch(e => {
      if (!cancelled) { setError(String(e)); setLoading(false); }
    });
    return () => { cancelled = true; };
  }, [league]);

  const leader = standings[0];
  // The fixtures endpoint only ever returns upcoming games (TTR site doesn't expose results there).
  // Derive total matches played from standings: sum of all pld divided by 2 (each match has 2 teams).
  const totalGames = standings.length > 0
    ? Math.round(standings.reduce((sum, s) => sum + s.pld, 0) / 2)
    : 0;
  const upcomingCount = fixtures.length; // every returned fixture is upcoming
  const fixturesReleased = fixtures.length > 0;

  const viewingProfile = profileTeamId !== null ? (teamProfiles.get(profileTeamId) ?? null) : null;
  if (profileTeamId !== null) {
    if (!viewingProfile) {
      return (
        <div className="flex items-center gap-3 px-4 py-8">
          <div className="relative h-0.5 w-32 overflow-hidden rounded-full" style={{ background: 'rgba(0,0,0,0.06)' }}>
            <div className="absolute inset-y-0 w-1/2" style={{ background: `linear-gradient(90deg, transparent, ${RED}, transparent)`, animation: 'ttr-sweep 1.5s ease-in-out infinite' }} />
          </div>
          <span className="font-mono text-[9px] uppercase tracking-widest text-black/30">Loading profile…</span>
        </div>
      );
    }
    return (
      <div>
        <TeamProfilePage profile={viewingProfile} onBack={() => setProfileTeamId(null)} />
      </div>
    );
  }

  return (
    <div>
      {/* Stats strip */}
      <div
        className="flex flex-wrap items-center gap-x-6 gap-y-3 px-4 py-5"
        style={{ borderBottom: `1px solid ${BORDER}` }}
      >
        {loading ? (
          /* Skeleton stats */
          <>
            {[10, 8, 9, 28].map(w => (
              <div
                key={w}
                className="h-7 rounded"
                style={{ width: `${w * 4}px`, background: RED_BG, animation: 'ttr-shimmer 1.4s ease-in-out infinite' }}
              />
            ))}
          </>
        ) : (
          /* Live stats */
          <>
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-2xl font-black" style={{ color: RED }}>{totalGames}</span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-black/45">Played</span>
            </div>
            <div className="h-5 w-px bg-black/10" />
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-2xl font-black text-black/35">
                {fixturesReleased ? upcomingCount : '—'}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-black/45">Upcoming</span>
            </div>
            <div className="h-5 w-px bg-black/10" />
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-2xl font-black text-black/35">{standings.length}</span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-black/45">Teams</span>
            </div>
            {leader && (
              <>
                <div className="h-5 w-px bg-black/10" />
                <div className="flex min-w-0 items-baseline gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-black/45 shrink-0 hidden sm:inline">Leader</span>
                  <span className="truncate font-semibold text-sm text-black">{leader.team}</span>
                  <span className="font-mono text-xs shrink-0" style={{ color: RED }}>{leader.pts} pts</span>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Content tabs */}
      <div className="flex" style={{ borderBottom: `1px solid ${BORDER}` }}>
        {(['standings', 'fixtures'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="relative cursor-pointer px-5 py-3.5 text-xs font-semibold capitalize transition-colors"
            style={{ color: tab === t ? '#000' : 'rgba(0,0,0,0.40)' }}>
            {t}
            {tab === t && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: RED }} />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div>
          {/* Sweep bar */}
          <div className="relative h-0.5 overflow-hidden" style={{ background: 'rgba(0,0,0,0.06)' }}>
            <div
              className="absolute inset-y-0 w-1/2"
              style={{
                background: `linear-gradient(90deg, transparent, ${RED}, transparent)`,
                animation: 'ttr-sweep 1.5s ease-in-out infinite',
              }}
            />
          </div>
          {/* Skeleton rows — mimic table/fixture layout */}
          {[70, 55, 80, 45, 65, 50].map((teamW, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-4 py-3.5"
              style={{ borderBottom: `1px solid ${BORDER2}` }}
            >
              {/* pos */}
              <div className="h-3 w-4 shrink-0 rounded" style={{ background: 'rgba(0,0,0,0.07)', animation: `ttr-shimmer 1.4s ${i * 0.08}s ease-in-out infinite` }} />
              {/* team name */}
              <div className="h-3.5 rounded" style={{ width: `${teamW}%`, background: 'rgba(0,0,0,0.09)', animation: `ttr-shimmer 1.4s ${i * 0.08}s ease-in-out infinite` }} />
              {/* stat cols */}
              <div className="ml-auto flex gap-3">
                {[1, 2, 3, 4].map(j => (
                  <div key={j} className="h-3 w-5 rounded" style={{ background: 'rgba(0,0,0,0.05)', animation: `ttr-shimmer 1.4s ${(i + j) * 0.06}s ease-in-out infinite` }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="mx-4 mt-4 rounded border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>
      ) : tab === 'standings' ? (
        <StandingsTable
          standings={standings}
          profiles={teamProfiles}
          profilesLoading={profilesLoading}
          selectedTeamId={selectedTeamId}
          onSelectTeam={setSelectedTeamId}
          onViewProfile={setProfileTeamId}
        />
      ) : (
        <FixturesList fixtures={fixtures} />
      )}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function TTRDashboard(): React.ReactElement {
  const [searchParams, setSearchParams] = useSearchParams();
  const venue = (searchParams.get('venue') ?? 'parks') as VenueId;
  const division = (searchParams.get('division') ?? 'cup') as 'cup' | 'plate';

  function setVenue(v: VenueId) {
    setSearchParams(p => {
      const n = new URLSearchParams(p);
      n.set('venue', v);
      n.set('division', 'cup');
      n.delete('tab');
      n.delete('team');
      n.delete('profile');
      return n;
    }, { replace: true });
  }
  function setDivision(d: 'cup' | 'plate') {
    setSearchParams(p => {
      const n = new URLSearchParams(p);
      n.set('division', d);
      n.delete('tab');
      n.delete('team');
      n.delete('profile');
      return n;
    }, { replace: true });
  }

  const league = LEAGUES.find(l => l.venue === venue && l.division === division)!;

  // Scrollbar override — TTR red
  useEffect(() => {
    const styleId = 'ttr-scrollbar-override';
    let el = document.getElementById(styleId) as HTMLStyleElement | null;
    if (!el) { el = document.createElement('style'); el.id = styleId; document.head.appendChild(el); }
    el.textContent = `
      html { scrollbar-color: ${RED}55 transparent; scrollbar-width: thin; }
      html::-webkit-scrollbar { width: 6px; }
      html::-webkit-scrollbar-track { background: transparent; }
      html::-webkit-scrollbar-thumb { background: ${RED}55; border-radius: 99px; }
      html::-webkit-scrollbar-thumb:hover { background: ${RED}99; }
      @keyframes ttr-sweep {
        0%   { transform: translateX(-150%); }
        100% { transform: translateX(350%); }
      }
      @keyframes ttr-shimmer {
        0%, 100% { opacity: 0.35; }
        50%       { opacity: 0.65; }
      }
    `;
    return () => { el?.remove(); };
  }, []);

  return (
    <div className="min-h-screen text-black" style={{ background: '#f6f6f6' }}>

      {/* ── Header ── */}
      <div style={{ borderBottom: `1px solid ${BORDER}` }}>
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="flex items-end justify-between py-5 sm:py-8">
            {/* Wordmark */}
            <div className="flex items-stretch gap-4">
              <div className="w-1 shrink-0 rounded-full" style={{ background: RED }} />
              <div className="flex items-center gap-3">
                <img
                  src="/images/ttr_logo.svg"
                  alt="TTR"
                  className="h-10 w-auto sm:h-12"
                  style={{ filter: 'invert(1)' }}
                />
              <div>
                <div className="text-4xl font-black tracking-tighter leading-none text-black sm:text-5xl">Newcastle</div>
              </div>
              </div>
            </div>
            <div className="pb-1 font-mono text-[9px] tracking-[0.25em] uppercase" style={{ color: RED }}>
              Spring 2026
            </div>
          </div>
        </div>
      </div>

      {/* ── Venue tabs ── */}
      <div style={{ borderBottom: `1px solid ${BORDER}` }}>
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="flex overflow-x-auto">
            {VENUES.map(v => (
              <button
                key={v.id}
                onClick={() => setVenue(v.id)}
                className="relative cursor-pointer whitespace-nowrap px-4 py-4 text-xs font-semibold transition-colors"
                style={{ color: venue === v.id ? '#000' : 'rgba(0,0,0,0.35)' }}
              >
                {v.label}
                {venue === v.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: RED }} />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Division row ── */}
      <div
        className="mx-auto max-w-4xl px-4 sm:px-6"
        style={{ borderBottom: `1px solid ${BORDER}` }}
      >
        <div className="flex items-center justify-end py-4">
          {/* Cup / Plate toggle */}
          <div className="flex overflow-hidden rounded-sm" style={{ border: '1px solid rgba(0,0,0,0.12)' }}>
            {(['cup', 'plate'] as const).map(d => (
              <button
                key={d}
                onClick={() => setDivision(d)}
                className="flex cursor-pointer items-center gap-1.5 px-5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-widest transition-colors"
                style={
                  division === d
                    ? { background: RED, color: '#fff' }
                    : { background: 'transparent', color: 'rgba(0,0,0,0.38)' }
                }
              >
                {d === 'cup' ? <LuTrophy size={12} /> : <LuMedal size={12} />}
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Panel ── */}
      <div className="mx-auto max-w-4xl pb-12">
        <LeaguePanel key={league.id} league={league} />
      </div>

    </div>
  );
}
