import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ScatterChart,
  Scatter, ReferenceLine, CartesianGrid,
} from 'recharts';

// ─── Custom Select ──────────────────────────────────────────────────────────

interface SelectOption { label: string; value: string | number; }

function F1Select({
  value, onChange, options, disabled = false, accentColor = '#e10600', minWidth,
}: {
  value: string | number;
  onChange: (v: string | number) => void;
  options: SelectOption[];
  disabled?: boolean;
  accentColor?: string;
  minWidth?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const selected = options.find((o) => String(o.value) === String(value));

  return (
    <div
      ref={ref}
      className="relative select-none"
      style={{ minWidth: minWidth ?? 'auto', opacity: disabled ? 0.4 : 1, pointerEvents: disabled ? 'none' : 'auto' }}
    >
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex w-full items-center justify-between gap-3 rounded-lg border bg-[#0e0e0e] px-3 py-2 text-sm text-white transition-colors"
        style={{
          borderColor: open ? accentColor : 'rgba(255,255,255,0.1)',
          boxShadow: open ? `0 0 0 1px ${accentColor}33` : 'none',
        }}
      >
        <span className="truncate font-mono tracking-tight">{selected?.label ?? '—'}</span>
        <svg
          width="12" height="12" viewBox="0 0 12 12" fill="none"
          className="shrink-0 transition-transform"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', color: accentColor }}
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute left-0 top-full z-50 mt-1 w-full overflow-hidden rounded-lg border bg-[#111] py-1"
          style={{ borderColor: `${accentColor}44`, boxShadow: `0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px ${accentColor}22` }}
        >
          {options.map((opt) => {
            const isActive = String(opt.value) === String(value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-white/5"
                style={{ color: isActive ? accentColor : 'rgba(255,255,255,0.85)' }}
              >
                {isActive && (
                  <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: accentColor }} />
                )}
                <span className={isActive ? 'font-semibold' : ''}>{opt.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Race Picker ─────────────────────────────────────────────────────────────

const MODULE_NOW = Date.now(); // stable ref — used only for past/future styling
const MODULE_YEAR = new Date(MODULE_NOW).getFullYear();

const ISO3_TO_2: Record<string, string> = {
  // Standard ISO 3166-1 alpha-3
  AUS: 'AU', CHN: 'CN', JPN: 'JP', BHR: 'BH', SAU: 'SA', USA: 'US',
  ITA: 'IT', MCO: 'MC', CAN: 'CA', ESP: 'ES', AUT: 'AT', GBR: 'GB',
  HUN: 'HU', BEL: 'BE', NLD: 'NL', SGP: 'SG', MEX: 'MX', BRA: 'BR',
  ARE: 'AE', QAT: 'QA', AZE: 'AZ', RSA: 'ZA', ARG: 'AR', POR: 'PT',
  TUR: 'TR', MYS: 'MY', KOR: 'KR', IND: 'IN', RUS: 'RU', MOR: 'MA',
  // OpenF1 non-standard codes
  KSA: 'SA', BRN: 'BH', NED: 'NL', MON: 'MC', UAE: 'AE',
};

function countryFlag(code: string): string {
  const iso2 = ISO3_TO_2[code?.toUpperCase()] ?? code?.slice(0, 2).toUpperCase();
  if (!iso2 || iso2.length < 2) return '🏁';
  return String.fromCodePoint(...[...iso2].map((c) => 0x1F1E6 + c.charCodeAt(0) - 65));
}

function shortGPName(name: string): string {
  return name
    .replace(/ Grand Prix$/i, '')
    .replace(/ GP$/i, '')
    .trim();
}

function formatRaceDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

interface Meeting {
  meeting_key: number;
  meeting_name: string;
  country_code: string;
  date_start: string;
  year: number;
}

function RacePicker({
  meetings,
  value,
  onChange,
  accentColor = '#e10600',
  inline = false,
  onNavigateToRace,
}: {
  meetings: Meeting[];
  value: number | null;
  onChange: (key: number) => void;
  accentColor?: string;
  inline?: boolean;
  onNavigateToRace?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const selected = meetings.find((m) => m.meeting_key === value);

  // Inline calendar — renders grid directly, no dropdown
  if (inline) {
    let roundCounter = 0;
    const roundNumbers = new Map<number, number>();
    for (const m of meetings) {
      const isTest = /test/i.test(m.meeting_name);
      if (!isTest) roundCounter++;
      roundNumbers.set(m.meeting_key, isTest ? -1 : roundCounter);
    }
    return (
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
        {meetings.map((m) => {
          const isSelected = m.meeting_key === value;
          const isPast = new Date(m.date_start).getTime() < MODULE_NOW;
          const raceRound = roundNumbers.get(m.meeting_key) ?? -1;
          const isTest = raceRound === -1;
          return (
            <button
              key={m.meeting_key}
              type="button"
              disabled={!isPast}
              onClick={() => { if (isPast) { onChange(m.meeting_key); onNavigateToRace?.(); } }}
              className="group relative flex flex-col items-center gap-1 rounded-lg border px-2 py-2.5 text-center transition-all duration-150"
              style={{
                borderStyle: !isPast ? 'dashed' : 'solid',
                borderColor: isSelected ? accentColor : isPast ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.08)',
                background: isSelected ? `${accentColor}28` : isPast ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.02)',
                boxShadow: isSelected ? `0 0 0 1px ${accentColor}66, 0 4px 16px ${accentColor}22` : 'none',
                opacity: !isPast ? 0.45 : 1,
                cursor: isPast ? 'pointer' : 'not-allowed',
              }}
            >
              {!isPast && (
                <span className="absolute top-1.5 right-1.5 rounded px-1 py-0.5 font-mono text-[7px] font-bold tracking-widest uppercase" style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.35)' }}>SOON</span>
              )}
              {isPast && !isSelected && (
                <span className="pointer-events-none absolute inset-0 rounded-lg opacity-0 transition-opacity duration-150 group-hover:opacity-100" style={{ boxShadow: `inset 0 0 0 1px ${accentColor}55`, background: `${accentColor}0d` }} />
              )}
              <span className="font-mono text-[9px] font-bold tracking-widest uppercase" style={{ color: isPast ? (isTest ? 'rgba(255,255,255,0.4)' : accentColor) : 'rgba(255,255,255,0.2)' }}>
                {isTest ? 'TEST' : `R${raceRound}`}
              </span>
              <span className="text-2xl leading-none">{countryFlag(m.country_code)}</span>
              <span className="w-full truncate text-[10px] font-semibold leading-tight" style={{ color: isSelected ? '#fff' : isPast ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.35)' }}>
                {shortGPName(m.meeting_name)}
              </span>
              <span className="font-mono text-[9px]" style={{ color: isSelected ? accentColor : isPast ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.2)' }}>
                {formatRaceDate(m.date_start)}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div ref={ref} className="relative select-none flex-1" style={{ minWidth: '180px' }}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex w-full items-center justify-between gap-3 rounded-lg border bg-[#0e0e0e] px-3 py-2 text-sm text-white transition-colors"
        style={{
          borderColor: open ? accentColor : 'rgba(255,255,255,0.1)',
          boxShadow: open ? `0 0 0 1px ${accentColor}33` : 'none',
        }}
      >
        <span className="flex items-center gap-2 truncate">
          {selected && (
            <span className="text-base leading-none">{countryFlag(selected.country_code)}</span>
          )}
          <span className="font-mono tracking-tight truncate">
            {selected ? shortGPName(selected.meeting_name) : meetings.length ? '—' : 'Loading…'}
          </span>
        </span>
        <svg
          width="12" height="12" viewBox="0 0 12 12" fill="none"
          className="shrink-0 transition-transform"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', color: accentColor }}
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Panel */}
      {open && meetings.length > 0 && (
        <div
          className="absolute left-0 top-full z-50 mt-1 overflow-auto rounded-xl border bg-[#0e0e0e] p-3"
          style={{
            borderColor: `${accentColor}44`,
            boxShadow: `0 16px 48px rgba(0,0,0,0.7), 0 0 0 1px ${accentColor}22`,
            maxHeight: '70vh',
            width: 'max(100%, 560px)',
          }}
        >
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {(() => {
              // compute sequential round numbers, skipping testing events
              let roundCounter = 0;
              const roundNumbers = new Map<number, number>();
              for (const m of meetings) {
                const isTesting = /test/i.test(m.meeting_name);
                if (!isTesting) roundCounter++;
                roundNumbers.set(m.meeting_key, isTesting ? -1 : roundCounter);
              }
              return meetings.map((m) => {
              const isSelected = m.meeting_key === value;
              const isPast = new Date(m.date_start).getTime() < MODULE_NOW;
              const raceRound = roundNumbers.get(m.meeting_key) ?? -1;
              const isTesting = raceRound === -1;
              return (
                <button
                  key={m.meeting_key}
                  type="button"
                  disabled={!isPast}
                  onClick={() => { if (isPast) { onChange(m.meeting_key); setOpen(false); } }}
                  className="group relative flex flex-col items-center gap-1 rounded-lg border px-2 py-2.5 text-center transition-all duration-150"
                  style={{
                    borderStyle: !isPast ? 'dashed' : 'solid',
                    borderColor: isSelected
                      ? accentColor
                      : isPast
                      ? 'rgba(255,255,255,0.18)'
                      : 'rgba(255,255,255,0.08)',
                    background: isSelected
                      ? `${accentColor}28`
                      : isPast
                      ? 'rgba(255,255,255,0.07)'
                      : 'rgba(255,255,255,0.02)',
                    boxShadow: isSelected
                      ? `0 0 0 1px ${accentColor}66, 0 4px 16px ${accentColor}22`
                      : 'none',
                    opacity: !isPast ? 0.45 : 1,
                    cursor: isPast ? 'pointer' : 'not-allowed',
                  }}
                >
                  {/* Upcoming pill — top-right corner */}
                  {!isPast && (
                    <span
                      className="absolute top-1.5 right-1.5 rounded px-1 py-0.5 font-mono text-[7px] font-bold tracking-widest uppercase"
                      style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.35)' }}
                    >
                      SOON
                    </span>
                  )}
                  {/* Hover glow for past cards */}
                  {isPast && !isSelected && (
                    <span
                      className="pointer-events-none absolute inset-0 rounded-lg opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                      style={{ boxShadow: `inset 0 0 0 1px ${accentColor}55`, background: `${accentColor}0d` }}
                    />
                  )}
                  {/* Round number or TEST label */}
                  <span
                    className="font-mono text-[9px] font-bold tracking-widest uppercase"
                    style={{ color: isPast ? (isTesting ? 'rgba(255,255,255,0.4)' : accentColor) : 'rgba(255,255,255,0.2)' }}
                  >
                    {isTesting ? 'TEST' : `R${raceRound}`}
                  </span>
                  {/* Flag */}
                  <span className="text-2xl leading-none">{countryFlag(m.country_code)}</span>
                  {/* Short name */}
                  <span
                    className="w-full truncate text-[10px] font-semibold leading-tight"
                    style={{ color: isSelected ? '#fff' : isPast ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.35)' }}
                  >
                    {shortGPName(m.meeting_name)}
                  </span>
                  {/* Date */}
                  <span
                    className="font-mono text-[9px]"
                    style={{ color: isSelected ? accentColor : isPast ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.2)' }}
                  >
                    {formatRaceDate(m.date_start)}
                  </span>
                </button>
              );
            });
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface Session {
  session_key: number;
  session_name: string;
  session_type: string;
}

interface Driver {
  driver_number: number;
  name_acronym: string;
  full_name: string;
  team_name: string;
  team_colour: string;
  headshot_url: string;
}

interface Lap {
  driver_number: number;
  lap_number: number;
  lap_duration: number | null;
  is_pit_out_lap: boolean;
}

interface Stint {
  driver_number: number;
  stint_number: number;
  lap_start: number;
  lap_end: number;
  compound: string;
}

interface RaceControlMsg {
  date: string;
  lap_number: number | null;
  category: string;
  flag: string | null;
  message: string;
  driver_number: number | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const COMPOUND_COLOURS: Record<string, string> = {
  SOFT: '#e4182c',
  MEDIUM: '#ffd600',
  HARD: '#f0f0f0',
  INTERMEDIATE: '#39b54a',
  WET: '#0067ff',
  UNKNOWN: '#888',
};

const FLAG_COLOURS: Record<string, string> = {
  GREEN: '#22c55e',
  YELLOW: '#eab308',
  DOUBLE_YELLOW: '#f59e0b',
  RED: '#ef4444',
  CHEQUERED: '#f0f0f0',
  BLUE: '#3b82f6',
  BLACK_AND_WHITE: '#a3a3a3',
  CLEAR: '#06b6d4',
};

const F1_POINTS: Record<number, number> = { 1: 25, 2: 18, 3: 15, 4: 12, 5: 10, 6: 8, 7: 6, 8: 4, 9: 2, 10: 1 };

// Upgrades the F1 CDN transform from the default 2col to a higher-res variant.
// If the URL contains the Cloudinary fallback marker (driver photo not yet on CDN),
// skip the upscale — replacing the transform breaks the fallback chain and causes a 404.
const hiResUrl = (url: string, size: '4col' | '6col' = '4col') =>
  url.replace(/\/\dcol\//, `/${size}/`);


const BASE = 'https://api.openf1.org/v1';
const YEARS = [2023, 2024, 2025, 2026];

// Maps Ergast constructorId → F1 CDN slug + logo year
const CONSTRUCTOR_LOGO_SLUGS: Record<string, { slug: string; year: number }> = {
  mercedes:     { slug: 'mercedes',     year: 2025 },
  ferrari:      { slug: 'ferrari',      year: 2025 },
  mclaren:      { slug: 'mclaren',      year: 2025 },
  red_bull:     { slug: 'redbullracing', year: 2025 },
  aston_martin: { slug: 'astonmartin',  year: 2025 },
  alpine:       { slug: 'alpine',       year: 2025 },
  williams:     { slug: 'williams',     year: 2025 },
  rb:           { slug: 'racingbulls',  year: 2025 },
  haas:         { slug: 'haas',         year: 2025 },
  audi:         { slug: 'audi',         year: 2026 },
  cadillac:     { slug: 'cadillac',     year: 2026 },
  alphatauri:   { slug: 'alphatauri',   year: 2024 },
  alfa:         { slug: 'alfaromeo',    year: 2023 },
};

function getConstructorLogoUrl(constructorId: string): string | null {
  const entry = CONSTRUCTOR_LOGO_SLUGS[constructorId];
  if (!entry) return null;
  const { slug, year } = entry;
  return `https://media.formula1.com/image/upload/c_fit,h_48/q_auto/v1740000001/common/f1/${year}/${slug}/${year}${slug}logowhite.webp`;
}

// Maps OpenF1 team_name → Ergast constructorId for logo lookups
const OPENF1_TEAM_TO_CONSTRUCTOR_ID: Record<string, string> = {
  'Oracle Red Bull Racing':              'red_bull',
  'Red Bull Racing':                     'red_bull',
  'Scuderia Ferrari':                    'ferrari',
  'Ferrari':                             'ferrari',
  'McLaren F1 Team':                     'mclaren',
  'McLaren':                             'mclaren',
  'Mercedes-AMG Petronas F1 Team':       'mercedes',
  'Mercedes':                            'mercedes',
  'Aston Martin Aramco F1 Team':         'aston_martin',
  'Aston Martin':                        'aston_martin',
  'BWT Alpine F1 Team':                  'alpine',
  'Alpine F1 Team':                      'alpine',
  'Alpine':                              'alpine',
  'Williams Racing':                     'williams',
  'Williams':                            'williams',
  'Visa Cash App RB Formula One Team':   'rb',
  'Racing Bulls':                        'rb',
  'RB':                                  'rb',
  'MoneyGram Haas F1 Team':              'haas',
  'Haas F1 Team':                        'haas',
  'Haas':                                'haas',
  'Stake F1 Team Kick Sauber':           'sauber',
  'Kick Sauber':                         'sauber',
  'Audi F1 Team':                        'audi',
  'Cadillac Formula One Team':           'cadillac',
};

function getConstructorLogoUrlByTeamName(teamName: string): string | null {
  const id = OPENF1_TEAM_TO_CONSTRUCTOR_ID[teamName];
  return id ? getConstructorLogoUrl(id) : null;
}

// Maps Ergast constructorId → team livery hex (no #) for the standings view
const CONSTRUCTOR_COLOURS_BY_ID: Record<string, string> = {
  mercedes:     '27F4D2',
  ferrari:      'E8002D',
  mclaren:      'FF8000',
  red_bull:     '3671C6',
  aston_martin: '358C75',
  alpine:       'FF87BC',
  williams:     '64C4FF',
  rb:           '6692FF',
  haas:         'B6BABD',
  audi:         'C03800',
  cadillac:     'A50F15',
  alphatauri:   '5E8FAA',
  alfa:         'B12039',
};

interface DriverStanding {
  position: number;
  points: number;
  wins: number;
  code: string;
  driverId: string;
  givenName: string;
  familyName: string;
  constructorName: string;
  constructorId: string;
  round?: string;
}

interface ErgastDriverEntry {
  position: string;
  points: string;
  wins: string;
  Driver?: { code?: string; driverId?: string; givenName?: string; familyName?: string };
  Constructors?: { name?: string; constructorId?: string }[];
}

interface ErgastConstructorEntry {
  position: string;
  points: string;
  wins: string;
  Constructor?: { name?: string; constructorId?: string };
}

interface ConstructorStanding {
  position: number;
  points: number;
  wins: number;
  name: string;
  constructorId: string;
}

const TEAM_ABBREVIATIONS: Record<string, string> = {
  'Red Bull Racing': 'RBR',
  'Mercedes': 'MER',
  'Ferrari': 'FER',
  'McLaren': 'MCL',
  'Aston Martin': 'AMR',
  'Alpine': 'ALP',
  'Williams': 'WIL',
  'AlphaTauri': 'AT',
  'RB': 'RB',
  'Haas F1 Team': 'HAA',
  'Haas': 'HAA',
  'Kick Sauber': 'SAU',
  'Sauber': 'SAU',
  'Alfa Romeo': 'ALR',
};

// Enforce ≤3 req/s across the entire module — all fetches are sequential so
// tracking a single timestamp is sufficient and race-condition-free.
let lastRequestAt = 0;
const MIN_GAP_MS = 500;

async function apiFetch<T>(path: string, signal?: AbortSignal): Promise<T> {
  const wait = MIN_GAP_MS - (Date.now() - lastRequestAt);
  if (wait > 0) await new Promise<void>((r) => setTimeout(r, wait));
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
  lastRequestAt = Date.now();
  const res = await fetch(`${BASE}${path}`, { signal });
  if (!res.ok) throw new Error(`OpenF1 ${path} → ${res.status}`);
  return res.json() as Promise<T>;
}

function formatLapTime(seconds: number | null): string {
  if (seconds == null) return '—';
  const m = Math.floor(seconds / 60);
  const s = (seconds % 60).toFixed(3).padStart(6, '0');
  return m > 0 ? `${m}:${s}` : `${s}s`;
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────

function LapTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string; payload: Record<string, number> }> }) {
  if (!active || !payload?.length) return null;
  const sorted = [...payload]
    .filter((p) => p.value != null)
    .sort((a, b) => a.value - b.value);
  return (
    <div className="rounded-lg border border-white/10 bg-black/90 px-3 py-2 text-xs backdrop-blur-sm">
      {sorted.map((p) => {
        const gap: number | undefined = p.payload?.[`${p.name}_gap`];
        const gapStr = gap == null ? null : gap === 0 ? 'Leader' : `+${gap.toFixed(3)}s`;
        return (
          <div key={p.name} className="flex items-center gap-2 py-0.5">
            <span className="h-2 w-2 rounded-full" style={{ background: `#${p.color}` }} />
            <span className="font-mono text-white/40">P{p.value}</span>
            <span className="text-white/80">{p.name}</span>
            {gapStr != null && (
              <span className="ml-auto pl-3 font-mono" style={{ color: gap === 0 ? '#facc15' : 'rgba(255,255,255,0.35)' }}>
                {gapStr}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Team badge ──────────────────────────────────────────────────────────────

function TeamBadge({ teamName, teamColour }: { teamName: string; teamColour: string }) {
  const abbr = TEAM_ABBREVIATIONS[teamName] ?? teamName.slice(0, 3).toUpperCase();
  return (
    <span
      className="inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-black tracking-widest uppercase"
      style={{ background: `#${teamColour}25`, color: `#${teamColour}`, border: `1px solid #${teamColour}40` }}
    >
      {abbr}
    </span>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`rounded ${className}`}
      style={{
        background: `linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)`,
        backgroundSize: '200% 100%',
        animation: 'skeletonShimmer 1.6s ease-in-out infinite',
      }}
    />
  );
}

function DashboardSkeleton({ accentColor, meetingName }: { accentColor: string; meetingName?: string }) {
  const rgb = [
    parseInt(accentColor.slice(1, 3), 16),
    parseInt(accentColor.slice(3, 5), 16),
    parseInt(accentColor.slice(5, 7), 16),
  ].join(',');
  return (
    <div className="space-y-6" style={{ animation: 'fadeInUp 0.3s ease both' }}>
      <style>{`
        @keyframes skeletonShimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes sweepBar {
          0%   { transform: translateX(-100%); }
          50%  { transform: translateX(60%); }
          100% { transform: translateX(200%); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes contentFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-dot {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {/* Accent sweep bar */}
      <div className="relative h-px overflow-hidden rounded-full" style={{ background: `rgba(${rgb},0.12)` }}>
        <div
          className="absolute inset-y-0 w-1/3 rounded-full"
          style={{
            background: `linear-gradient(90deg, transparent, rgba(${rgb},0.9), transparent)`,
            animation: 'sweepBar 1.8s ease-in-out infinite',
          }}
        />
      </div>

      {/* Status label */}
      <div className="flex items-center gap-3">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-1.5 w-1.5 rounded-full"
              style={{
                background: accentColor,
                animation: `pulse-dot 1.4s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
        <span className="font-mono text-xs tracking-widest" style={{ color: `rgba(${rgb},0.7)` }}>
          FETCHING {meetingName ? meetingName.toUpperCase() : 'RACE'} DATA
        </span>
      </div>

      {/* Fastest lap card skeletons */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="relative overflow-hidden rounded-xl p-3"
            style={{
              background: '#0e0e0e',
              border: `1px solid rgba(${rgb},0.12)`,
              opacity: 1 - i * 0.12,
            }}
          >
            <div className="mb-2 flex items-center justify-between">
              <Skeleton className="h-5 w-8"/>
              <Skeleton className="h-4 w-10"/>
            </div>
            <div className="mb-3 flex items-center gap-2.5">
              <Skeleton className="h-10 w-10 rounded-md"/>
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-16"/>
                <Skeleton className="h-3 w-12"/>
              </div>
            </div>
            <Skeleton className="mb-2 h-5 w-24"/>
            <Skeleton className="h-2 w-full rounded-full"/>
          </div>
        ))}
      </div>

      {/* Tab bar skeleton */}
      <div className="flex gap-1 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-b-none"/>
        ))}
      </div>

      {/* Chart area skeleton */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div
          className="rounded-xl p-4 space-y-3"
          style={{ background: '#0e0e0e', border: `1px solid rgba(${rgb},0.08)` }}
        >
          <Skeleton className="h-4 w-32"/>
          <Skeleton className="h-48 w-full"/>
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-3 w-12"/>)}
          </div>
        </div>
        <div
          className="rounded-xl p-4 space-y-3"
          style={{ background: '#0e0e0e', border: `1px solid rgba(${rgb},0.08)` }}
        >
          <Skeleton className="h-4 w-28"/>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-3 w-8"/>
              <Skeleton className="h-5 flex-1 rounded"/>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Tyre Strategy chart ──────────────────────────────────────────────────────

function TyreStrategy({
  stints,
  drivers,
  totalLaps,
  finalPositions,
  accentColor,
}: {
  stints: Stint[];
  drivers: Driver[];
  totalLaps: number;
  finalPositions: Record<string, number>;
  accentColor: string;
}) {
  const hasPositions = Object.keys(finalPositions).length > 0;
  const [sortBy, setSortBy] = useState<'position' | 'stops' | 'team'>(hasPositions ? 'position' : 'team');
  const [highlightCompound, setHighlightCompound] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

  const byDriver = drivers
    .map((d) => ({
      driver: d,
      stints: stints.filter((s) => s.driver_number === d.driver_number).sort((a, b) => a.stint_number - b.stint_number),
    }))
    .filter((d) => d.stints.length > 0);

  const filtered = selectedTeam ? byDriver.filter(({ driver }) => driver.team_name === selectedTeam) : byDriver;

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'position') {
      return (finalPositions[a.driver.name_acronym] ?? 99) - (finalPositions[b.driver.name_acronym] ?? 99);
    }
    if (sortBy === 'stops') return b.stints.length - a.stints.length;
    return a.driver.team_name.localeCompare(b.driver.team_name) || a.driver.name_acronym.localeCompare(b.driver.name_acronym);
  });

  const uniqueTeams = Array.from(
    new Map(drivers.map((d) => [d.team_name, { name: d.team_name, colour: d.team_colour }])).values()
  );

  const usedCompounds = Array.from(new Set(stints.map((s) => s.compound))).filter((c) => c !== 'UNKNOWN');

  // In testing sessions lap counts are per-driver and can exceed `totalLaps`;
  // derive the scale from the stints themselves so nothing overflows.
  const effectiveTotalLaps = Math.max(1, totalLaps, ...stints.map((s) => s.lap_end ?? 0));

  const ticks = Array.from({ length: Math.floor(effectiveTotalLaps / 10) }, (_, i) => (i + 1) * 10).filter((t) => t < effectiveTotalLaps);

  const accentR = parseInt(accentColor.slice(1, 3), 16);
  const accentG = parseInt(accentColor.slice(3, 5), 16);
  const accentB = parseInt(accentColor.slice(5, 7), 16);

  return (
    <div className="space-y-4">
      {/* Filter / sort bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Sort toggle */}
        <div className="flex items-center gap-1">
          {(['position', 'stops', 'team'] as const).filter((s) => s !== 'position' || hasPositions).map((s) => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className="rounded px-2.5 py-1 text-xs font-medium transition-all"
              style={
                sortBy === s
                  ? { background: `rgba(${accentR},${accentG},${accentB},0.15)`, color: accentColor, border: `1px solid rgba(${accentR},${accentG},${accentB},0.4)` }
                  : { background: 'transparent', color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.08)' }
              }
            >
              {s === 'position' ? 'Finish pos.' : s === 'stops' ? 'Stops' : 'Team'}
            </button>
          ))}
        </div>

        {/* Compound highlight pills */}
        <div className="flex items-center gap-1">
          {usedCompounds.map((c) => {
            const col = COMPOUND_COLOURS[c] ?? COMPOUND_COLOURS.UNKNOWN;
            const active = highlightCompound === c;
            return (
              <button
                key={c}
                onClick={() => setHighlightCompound(active ? null : c)}
                className="flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-all"
                style={
                  active
                    ? { background: `${col}22`, color: col, border: `1px solid ${col}66` }
                    : { background: 'transparent', color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.08)' }
                }
              >
                <span className="h-2 w-2 rounded-sm" style={{ background: col }} />
                {c[0]}{c.slice(1).toLowerCase()}
              </button>
            );
          })}
        </div>

        {/* Team filter chips */}
        <div className="ml-auto flex flex-wrap items-center gap-1">
          {uniqueTeams.map(({ name, colour }) => {
            const active = selectedTeam === name;
            const abbr = TEAM_ABBREVIATIONS[name] ?? name.slice(0, 3).toUpperCase();
            return (
              <button
                key={name}
                onClick={() => setSelectedTeam(active ? null : name)}
                className="rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide transition-all"
                style={
                  active
                    ? { background: `#${colour}28`, color: `#${colour}`, border: `1px solid #${colour}` }
                    : { background: 'transparent', color: `#${colour}70`, border: `1px solid #${colour}30` }
                }
              >
                {abbr}
              </button>
            );
          })}
        </div>
      </div>

      {/* Lap-number ruler */}
      <div className="relative ml-[4.5rem] mr-10 h-5">
        <div className="absolute inset-x-0 bottom-0 border-b border-white/10" />
        {ticks.map((t) => (
          <div key={t} className="absolute bottom-0 flex flex-col items-center" style={{ left: `${(t / effectiveTotalLaps) * 100}%` }}>
            <span className="mb-0.5 text-[9px] font-mono leading-none text-white/25">{t}</span>
            <div className="h-2 w-px bg-white/15" />
          </div>
        ))}
        <div className="absolute bottom-0 right-0 flex flex-col items-center">
          <span className="mb-0.5 text-[9px] font-mono leading-none text-white/25">{effectiveTotalLaps}</span>
          <div className="h-2 w-px bg-white/15" />
        </div>
      </div>

      {/* Driver rows */}
      <div className="space-y-1">
        {sorted.map(({ driver, stints: ds }) => {
          const pos = finalPositions[driver.name_acronym];
          const stops = ds.length - 1;
          return (
            <div key={driver.driver_number} className="flex min-w-0 items-center gap-3">
              {/* Position + driver label */}
              <div className="flex w-16 shrink-0 items-center gap-1.5">
                {pos != null ? (
                  <span className="w-5 text-right font-mono text-[10px] text-white/25">{pos}</span>
                ) : (
                  <span className="w-5" />
                )}
                <span className="text-xs font-mono font-semibold" style={{ color: `#${driver.team_colour}` }}>
                  {driver.name_acronym}
                </span>
              </div>

              {/* Stint bar */}
              <div className="relative h-8 min-w-0 flex-1 overflow-hidden rounded-sm bg-white/[0.04]">
                {ds.map((s, si) => {
                  const left = Math.min(100, ((s.lap_start - 1) / effectiveTotalLaps) * 100);
                  const width = Math.min(100 - left, ((s.lap_end - s.lap_start + 1) / effectiveTotalLaps) * 100);
                  const col = COMPOUND_COLOURS[s.compound] ?? COMPOUND_COLOURS.UNKNOWN;
                  const dimmed = highlightCompound !== null && highlightCompound !== s.compound;
                  return (
                    <div
                      key={s.stint_number}
                      className="absolute inset-y-0 flex items-center justify-center text-[10px] font-bold text-black/60 transition-opacity duration-200"
                      style={{
                        left: `${left}%`,
                        width: `${width}%`,
                        background: col,
                        opacity: dimmed ? 0.12 : 1,
                        borderLeft: si > 0 ? '2px solid #0e0e0e' : 'none',
                      }}
                      title={`${s.compound} · L${s.lap_start}–${s.lap_end} · ${s.lap_end - s.lap_start + 1} laps`}
                    >
                      {width > 7 ? s.compound[0] : ''}
                    </div>
                  );
                })}
              </div>

              {/* Stop count */}
              <span className="w-8 shrink-0 text-right font-mono text-[10px] text-white/25">
                {stops > 0 ? `${stops}s` : 'NS'}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend + footnote */}
      <div className="flex flex-wrap items-center gap-4 pt-1">
        {usedCompounds.map((c) => {
          const col = COMPOUND_COLOURS[c] ?? COMPOUND_COLOURS.UNKNOWN;
          return (
            <div key={c} className="flex items-center gap-1.5 text-xs text-white/40">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: col }} />
              {c[0]}{c.slice(1).toLowerCase()}
            </div>
          );
        })}
        <span className="ml-auto font-mono text-[10px] text-white/20">s = stops · NS = no stop</span>
      </div>
    </div>
  );
}

// ─── Race Control feed ────────────────────────────────────────────────────────

function RaceControlFeed({ messages, drivers, accentColor }: { messages: RaceControlMsg[]; drivers: Driver[]; accentColor: string }) {
  const [catFilter, setCatFilter] = useState<string>('ALL');
  const [flagFilter, setFlagFilter] = useState<string>('ALL');

  const driverMap = Object.fromEntries(drivers.map((d) => [d.driver_number, d]));

  const categories = ['ALL', ...Array.from(new Set(messages.map((m) => m.category).filter(Boolean)))] as string[];
  const flagTypes = ['ALL', ...Array.from(new Set(messages.map((m) => m.flag).filter(Boolean)))] as string[];

  const filtered = messages.filter(
    (m) =>
      (catFilter === 'ALL' || m.category === catFilter) &&
      (flagFilter === 'ALL' || m.flag === flagFilter),
  );

  const scCount = messages.filter((m) => m.category?.toLowerCase().includes('safety')).length;
  const redCount = messages.filter((m) => m.flag === 'RED').length;
  const drsCount = messages.filter((m) => m.category?.toLowerCase().includes('drs')).length;
  const penaltyCount = messages.filter(
    (m) =>
      m.message?.toLowerCase().includes('penalty') ||
      m.message?.toLowerCase().includes('investigation'),
  ).length;

  return (
    <div className="space-y-4">
      {/* ── Stats ── */}
      <div className="flex flex-wrap gap-2">
        {scCount > 0 && (
          <span className="px-2 py-0.5 rounded text-xs font-mono bg-yellow-500/10 border border-yellow-500/20 text-yellow-400">
            {scCount} SC / VSC event{scCount > 1 ? 's' : ''}
          </span>
        )}
        {redCount > 0 && (
          <span className="px-2 py-0.5 rounded text-xs font-mono bg-red-500/10 border border-red-500/20 text-red-400">
            {redCount} red flag{redCount > 1 ? 's' : ''}
          </span>
        )}
        {drsCount > 0 && (
          <span className="px-2 py-0.5 rounded text-xs font-mono bg-green-500/10 border border-green-500/20 text-green-400">
            {drsCount} DRS event{drsCount > 1 ? 's' : ''}
          </span>
        )}
        {penaltyCount > 0 && (
          <span className="px-2 py-0.5 rounded text-xs font-mono bg-white/5 border border-white/10 text-white/50">
            {penaltyCount} penalty / investigation{penaltyCount > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap items-center gap-1.5">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCatFilter(cat)}
            className="px-2.5 py-1 rounded text-xs font-medium transition-all"
            style={
              catFilter === cat
                ? { background: accentColor + '33', border: `1px solid ${accentColor}66`, color: accentColor }
                : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.45)' }
            }
          >
            {cat}
          </button>
        ))}
        {flagTypes.length > 1 && (
          <div className="flex flex-wrap items-center gap-1.5 ml-1 pl-2.5 border-l border-white/10">
            {flagTypes.map((flag) => {
              const col = flag === 'ALL' ? '#888' : (FLAG_COLOURS[flag] ?? '#888');
              return (
                <button
                  key={flag}
                  onClick={() => setFlagFilter(flag)}
                  className="px-2.5 py-1 rounded text-xs font-medium transition-all"
                  style={
                    flagFilter === flag
                      ? { background: col + '33', border: `1px solid ${col}88`, color: col }
                      : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.35)' }
                  }
                >
                  {flag === 'ALL' ? 'All flags' : flag.replace(/_/g, ' ')}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Timeline ── */}
      <div className="relative max-h-[560px] overflow-y-auto pr-1 space-y-0.5">
        {/* vertical rail */}
        <div className="absolute left-[11px] top-2 bottom-2 w-px" style={{ background: 'rgba(255,255,255,0.05)' }} />

        {filtered.map((msg, i) => {
          const flagCol = msg.flag ? (FLAG_COLOURS[msg.flag] ?? '#444') : '#333';
          const driver = msg.driver_number ? driverMap[msg.driver_number] : null;
          const isMajor =
            msg.flag === 'RED' ||
            msg.flag === 'DOUBLE_YELLOW' ||
            msg.category?.toLowerCase().includes('safety');
          const isMinor = msg.category?.toLowerCase().includes('drs') || msg.flag === 'GREEN' || msg.flag === 'CLEAR';

          return (
            <div
              key={i}
              className="relative flex gap-3 pl-7 py-2.5 pr-3 rounded-lg transition-colors"
              style={{
                background: isMajor ? `${flagCol}12` : 'transparent',
                borderLeft: isMajor ? `2px solid ${flagCol}55` : '2px solid transparent',
                marginLeft: '0',
              }}
            >
              {/* timeline dot */}
              <div
                className="absolute left-[6px] top-[14px] flex-shrink-0 rounded-full"
                style={{
                  width: isMajor ? 11 : 8,
                  height: isMajor ? 11 : 8,
                  top: isMajor ? 13 : 14.5,
                  background: isMajor ? flagCol : isMinor ? flagCol + '66' : '#2a2a2a',
                  border: `2px solid ${isMajor ? flagCol : flagCol + '55'}`,
                  boxShadow: isMajor ? `0 0 6px ${flagCol}88` : 'none',
                }}
              />

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 mb-1">
                  {msg.lap_number != null && (
                    <span className="font-mono text-[10px] bg-white/5 px-1.5 py-0.5 rounded text-white/35">
                      L{msg.lap_number}
                    </span>
                  )}
                  {msg.category && (
                    <span
                      className="text-[10px] font-semibold uppercase tracking-wider"
                      style={{ color: isMajor ? flagCol : 'rgba(255,255,255,0.3)' }}
                    >
                      {msg.category}
                    </span>
                  )}
                  {msg.flag && msg.flag !== 'CLEAR' && msg.flag !== 'GREEN' && (
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wide"
                      style={{ background: flagCol + '20', color: flagCol, border: `1px solid ${flagCol}44` }}
                    >
                      {msg.flag.replace(/_/g, ' ')}
                    </span>
                  )}
                  {driver && (
                    <span
                      className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded"
                      style={{
                        color: `#${driver.team_colour}`,
                        background: `#${driver.team_colour}18`,
                        border: `1px solid #${driver.team_colour}33`,
                      }}
                    >
                      {driver.name_acronym}
                    </span>
                  )}
                </div>
                <p
                  className="text-xs leading-snug"
                  style={{ color: isMajor ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.55)', fontWeight: isMajor ? 500 : 400 }}
                >
                  {msg.message}
                </p>
              </div>

              <div className="text-[10px] font-mono text-white/20 shrink-0 pt-0.5 tabular-nums">
                {new Date(msg.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <p className="text-xs text-white/30 text-center py-10">No messages match this filter.</p>
        )}
      </div>
    </div>
  );
}

// ─── Season Champion Hero ─────────────────────────────────────────────────────

function SeasonChampionHero({
  driverStandings,
  constructorStandings,
  year,
  headshots,
}: {
  driverStandings: DriverStanding[];
  constructorStandings: ConstructorStanding[];
  year: number;
  headshots: Record<string, string>;
}) {
  const champion = driverStandings[0];
  const p2 = driverStandings[1];
  const p3 = driverStandings[2];
  const constrChamp = constructorStandings[0];
  if (!champion || !constrChamp) return null;

  const wHex = CONSTRUCTOR_COLOURS_BY_ID[champion.constructorId] ?? 'e10600';
  const wCol = `#${wHex}`;
  const wR = parseInt(wHex.slice(0, 2), 16);
  const wG = parseInt(wHex.slice(2, 4), 16);
  const wB = parseInt(wHex.slice(4, 6), 16);

  const cHex = CONSTRUCTOR_COLOURS_BY_ID[constrChamp.constructorId] ?? '888888';
  const cCol = `#${cHex}`;
  const cR = parseInt(cHex.slice(0, 2), 16);
  const cG = parseInt(cHex.slice(2, 4), 16);
  const cB = parseInt(cHex.slice(4, 6), 16);

  const champLogo = getConstructorLogoUrl(champion.constructorId);
  const constrLogo = getConstructorLogoUrl(constrChamp.constructorId);
  const champAbbr = TEAM_ABBREVIATIONS[champion.constructorName] ?? champion.constructorName.slice(0, 3).toUpperCase();
  const constrAbbr = TEAM_ABBREVIATIONS[constrChamp.name] ?? constrChamp.name.slice(0, 3).toUpperCase();

  const podiumOrder = [
    p2 ? { d: p2, pos: 2 } : null,
    { d: champion, pos: 1 },
    p3 ? { d: p3, pos: 3 } : null,
  ].filter(Boolean) as { d: DriverStanding; pos: number }[];
  const podiumHeights = [96, 132, 72];

  return (
    <div
      className="mb-8 overflow-hidden rounded-2xl relative"
      style={{ background: '#0a0a0a', border: `1px solid rgba(${wR},${wG},${wB},0.22)` }}
    >
      {/* Background glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: [
            `radial-gradient(ellipse 65% 100% at -5% 50%, rgba(${wR},${wG},${wB},0.11) 0%, transparent 60%)`,
            `radial-gradient(ellipse 35% 60% at 108% 50%, rgba(${cR},${cG},${cB},0.06) 0%, transparent 60%)`,
          ].join(','),
        }}
      />
      {/* Top colour bar */}
      <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, ${wCol}, ${wCol}00 70%)` }} />

      <div className="relative grid lg:grid-cols-[300px_1fr]">

        {/* ── Champion portrait panel ── */}
        <div
          className="relative flex flex-col justify-end overflow-hidden p-6 lg:border-r"
          style={{ borderColor: `${wCol}15`, minHeight: 280 }}
        >
          {/* Floor glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: `radial-gradient(ellipse 100% 70% at 50% 120%, rgba(${wR},${wG},${wB},0.22) 0%, transparent 60%)` }}
          />
          {/* Full-height champion image */}
          {headshots[champion.code] && (
            <img
              src={hiResUrl(headshots[champion.code], '6col')}
              alt={champion.code}
              className="absolute bottom-0 right-0 h-[90%] w-auto object-contain object-bottom pointer-events-none select-none"
              style={{ filter: `drop-shadow(0 0 36px rgba(${wR},${wG},${wB},0.4))` }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          )}
          {/* World Champion badge — pinned top-left so it doesn't crowd the face */}
          <div
            className="absolute top-5 left-5 z-10 inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-[10px] font-black tracking-[0.15em] uppercase"
            style={{ background: wCol, color: '#000' }}
          >
            ★ {year} World Champion
          </div>

          {/* Text overlay — bottom only: code + name + logo + points */}
          <div className="relative z-10">
            <div
              className="font-black leading-none tracking-tighter"
              style={{ fontSize: 40, color: wCol, lineHeight: 1 }}
            >
              {champion.code}
            </div>
            <div className="mt-1 text-xs font-medium text-white/40">
              {champion.givenName} {champion.familyName}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {champLogo && (
                <img
                  src={champLogo}
                  alt={champAbbr}
                  className="h-4 object-contain"
                  style={{ filter: `drop-shadow(0 0 4px rgba(${wR},${wG},${wB},0.5))` }}
                />
              )}
              {champion.wins > 0 && (
                <span className="rounded-full px-2 py-0.5 font-mono text-[10px] font-bold" style={{ background: `rgba(${wR},${wG},${wB},0.15)`, color: wCol }}>
                  {champion.wins}W
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-mono text-2xl font-bold" style={{ color: wCol }}>{champion.points}</span>
              <span className="text-xs text-white/30">pts</span>
            </div>
          </div>
        </div>

        {/* ── Right: podium + constructors' champion ── */}
        <div className="flex flex-col items-center justify-center gap-6 p-6 lg:flex-row">

          {/* ── Podium graphic ── */}
          <div className="flex items-end justify-center gap-2 lg:mx-auto">
            {podiumOrder.map(({ d, pos }, idx) => {
              const dHex = CONSTRUCTOR_COLOURS_BY_ID[d.constructorId] ?? '888888';
              const col = `#${dHex}`;
              const dR = parseInt(dHex.slice(0, 2), 16);
              const dG = parseInt(dHex.slice(2, 4), 16);
              const dB = parseInt(dHex.slice(4, 6), 16);
              const platformH = podiumHeights[idx];
              const gap = pos === 1 ? null : `-${(champion.points - d.points).toFixed(0)} pts`;
              return (
                <div key={pos} className="flex flex-col items-center gap-1.5">
                  <div className="h-11 w-11 overflow-hidden rounded-full" style={{ border: `2px solid rgba(${dR},${dG},${dB},0.55)` }}>
                    {headshots[d.code] ? (
                      <img
                        src={hiResUrl(headshots[d.code], '4col')}
                        alt={d.code}
                        className="h-full w-full object-cover object-top"
                        onError={(e) => { (e.target as HTMLImageElement).src = headshots[d.code]; }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] font-black" style={{ background: `rgba(${dR},${dG},${dB},0.2)`, color: col }}>{d.code.slice(0, 2)}</div>
                    )}
                  </div>
                  <span className="text-[10px] font-mono font-bold" style={{ color: col }}>{d.code}</span>
                  <div
                    className="flex w-[68px] flex-col items-center justify-start rounded-t pt-2 gap-1"
                    style={{ height: platformH, background: `rgba(${dR},${dG},${dB},0.1)`, border: `1px solid rgba(${dR},${dG},${dB},0.28)`, borderBottom: 'none' }}
                  >
                    <span className="font-black select-none" style={{ color: `rgba(${dR},${dG},${dB},0.55)`, fontSize: 20 }}>P{pos}</span>
                    {gap && <span className="font-mono text-[9px] text-white/25 text-center leading-tight px-1">{gap}</span>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Constructors' Champion ── */}
          <div
            className="flex shrink-0 flex-col gap-3 rounded-xl p-4 lg:min-w-[200px]"
            style={{ background: `rgba(${cR},${cG},${cB},0.06)`, border: `1px solid rgba(${cR},${cG},${cB},0.18)` }}
          >
            <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-white/25">Constructors' Champion</div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-20 shrink-0 items-center justify-center rounded-lg" style={{ background: `rgba(${cR},${cG},${cB},0.15)`, border: `1px solid rgba(${cR},${cG},${cB},0.3)` }}>
                {constrLogo
                  ? <img src={constrLogo} alt={constrAbbr} className="h-5 w-full object-contain px-1.5" />
                  : <span className="font-mono text-sm font-black" style={{ color: cCol }}>{constrAbbr}</span>}
              </div>
              <div className="min-w-0 flex-1">
                <div className="inline-flex items-center gap-1 rounded px-2 py-0.5 font-mono text-[10px] font-black uppercase tracking-widest mb-1" style={{ background: cCol, color: '#000' }}>★ Champions</div>
                <div className="font-mono text-xs font-bold" style={{ color: cCol }}>{constrAbbr}</div>
                <div className="truncate text-xs text-white/40">{constrChamp.name}</div>
              </div>
            </div>
            <div className="flex items-baseline gap-2 border-t pt-2" style={{ borderColor: `rgba(${cR},${cG},${cB},0.15)` }}>
              <span className="font-mono text-xl font-bold" style={{ color: cCol }}>{constrChamp.points}</span>
              <span className="text-xs text-white/30">pts</span>
              {constrChamp.wins > 0 && <span className="ml-auto font-mono text-[10px] font-bold" style={{ color: cCol }}>{constrChamp.wins}W</span>}
            </div>
          </div>

        </div>{/* ── end right panel ── */}
      </div>{/* ── end grid ── */}
    </div>
  );
}

// ─── Season Standings ─────────────────────────────────────────────────────────

function StandingsView({
  driverStandings,
  constructorStandings,
  year,
  accentColor,
  headshots,
}: {
  driverStandings: DriverStanding[];
  constructorStandings: ConstructorStanding[];
  year: number;
  accentColor: string;
  headshots: Record<string, string>;
}) {
  const [view, setView] = useState<'drivers' | 'constructors'>('drivers');
  const [logoErrors, setLogoErrors] = useState<Set<string>>(new Set());

  const aR = parseInt(accentColor.slice(1, 3), 16);
  const aG = parseInt(accentColor.slice(3, 5), 16);
  const aB = parseInt(accentColor.slice(5, 7), 16);

  const maxDriverPts = driverStandings[0]?.points ?? 1;
  const maxConstrPts = constructorStandings[0]?.points ?? 1;

  const headshotByCode = headshots;

  return (
    <div className="space-y-5">
      {/* Header + toggle */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-white/70">
            {year} Season Standings
          </h2>
          {driverStandings.length > 0 && (
            <p className="mt-0.5 font-mono text-[10px] text-white/25">
              After round {driverStandings[0]?.round ?? '—'} · via Ergast / Jolpi.ca
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 rounded-lg p-1" style={{ background: 'rgba(255,255,255,0.04)' }}>
          {(['drivers', 'constructors'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className="rounded-md px-3 py-1 text-xs font-semibold transition-all"
              style={
                view === v
                  ? { background: `rgba(${aR},${aG},${aB},0.18)`, color: accentColor, border: `1px solid rgba(${aR},${aG},${aB},0.4)` }
                  : { background: 'transparent', color: 'rgba(255,255,255,0.35)', border: '1px solid transparent' }
              }
            >
              {v === 'drivers' ? 'Drivers' : 'Constructors'}
            </button>
          ))}
        </div>
      </div>

      {/* Drivers */}
      {view === 'drivers' && (
        <div className="space-y-1.5">
          {driverStandings.map((d) => {
            const col = CONSTRUCTOR_COLOURS_BY_ID[d.constructorId] ?? 'aaaaaa';
            const pct = (d.points / maxDriverPts) * 100;
            const isLeader = d.position === 1;
            return (
              <div
                key={d.code}
                className="group relative flex items-center gap-3 overflow-hidden rounded-lg px-3 py-2 transition-colors"
                style={{
                  background: isLeader ? `rgba(${aR},${aG},${aB},0.07)` : 'rgba(255,255,255,0.025)',
                  border: isLeader ? `1px solid rgba(${aR},${aG},${aB},0.25)` : '1px solid rgba(255,255,255,0.05)',
                }}
              >
                {/* Fill bar behind */}
                <div
                  className="pointer-events-none absolute inset-y-0 left-0 rounded-lg opacity-30 transition-all duration-500"
                  style={{ width: `${pct}%`, background: `linear-gradient(90deg, #${col}22, transparent)` }}
                />
                {/* Position */}
                <span className="relative z-10 w-5 text-right font-mono text-xs font-bold text-white/25">
                  {d.position}
                </span>
                {/* Headshot */}
                <div
                  className="relative z-10 h-10 w-10 shrink-0 overflow-hidden rounded-full"
                  style={{
                    border: `2px solid #${col}70`,
                    background: `#${col}18`,
                    boxShadow: `0 0 10px #${col}40`,
                  }}
                >
                  {headshotByCode[d.code] ? (
                    <img
                      src={hiResUrl(headshotByCode[d.code], '4col')}
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = headshotByCode[d.code]; }}
                      alt={d.code}
                      className="h-full w-full object-cover object-[center_top]"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center font-mono text-[10px] font-bold" style={{ color: `#${col}` }}>{d.code}</span>
                  )}
                </div>
                {/* Driver code */}
                <span className="relative z-10 w-10 font-mono text-xs font-bold" style={{ color: `#${col}` }}>
                  {d.code}
                </span>
                {/* Full name */}
                <span className="relative z-10 flex-1 truncate text-sm text-white/60">
                  {d.givenName} <span className="font-semibold text-white/80">{d.familyName}</span>
                </span>
                {/* Wins */}
                {d.wins > 0 && (
                  <span
                    className="relative z-10 hidden rounded px-1.5 py-0.5 font-mono text-[10px] font-bold sm:block"
                    style={{ background: `#${col}22`, color: `#${col}`, border: `1px solid #${col}44` }}
                  >
                    {d.wins}W
                  </span>
                )}
                {/* Constructor logo */}
                {(() => {
                  const logoUrl = getConstructorLogoUrl(d.constructorId);
                  const hasFailed = logoErrors.has(d.constructorId);
                  return (
                    <div className="relative z-10 hidden h-5 w-12 shrink-0 items-center justify-center sm:flex">
                      {logoUrl && !hasFailed ? (
                        <img
                          src={logoUrl}
                          alt={d.constructorName}
                          className="max-h-4 max-w-[48px] object-contain opacity-50"
                          onError={() => setLogoErrors((prev) => new Set([...prev, d.constructorId]))}
                        />
                      ) : (
                        <span className="text-[11px] text-white/25">
                          {TEAM_ABBREVIATIONS[d.constructorName] ?? d.constructorName.slice(0, 3).toUpperCase()}
                        </span>
                      )}
                    </div>
                  );
                })()}
                {/* Points */}
                <span className="relative z-10 w-14 text-right font-mono text-sm font-bold tabular-nums"
                  style={{ color: isLeader ? accentColor : 'rgba(255,255,255,0.7)' }}>
                  {d.points}
                  <span className="ml-0.5 text-[10px] font-normal text-white/25">pts</span>
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Constructors */}
      {view === 'constructors' && (
        <div className="space-y-2">
          {constructorStandings.map((c) => {
            const col = CONSTRUCTOR_COLOURS_BY_ID[c.constructorId] ?? 'aaaaaa';
            const pct = (c.points / maxConstrPts) * 100;
            const isLeader = c.position === 1;
            const cR = parseInt(col.slice(0, 2), 16);
            const cG = parseInt(col.slice(2, 4), 16);
            const cB = parseInt(col.slice(4, 6), 16);
            return (
              <div
                key={c.constructorId}
                className="space-y-1.5 overflow-hidden rounded-lg px-3 py-2.5"
                style={{
                  background: isLeader ? `rgba(${aR},${aG},${aB},0.07)` : 'rgba(255,255,255,0.025)',
                  border: isLeader ? `1px solid rgba(${aR},${aG},${aB},0.25)` : '1px solid rgba(255,255,255,0.05)',
                }}
              >
                <div className="flex items-center gap-3">
                  {/* Position */}
                  <span className="w-5 text-right font-mono text-xs font-bold text-white/25">{c.position}</span>
                  {/* Team logo */}
                  {(() => {
                    const logoUrl = getConstructorLogoUrl(c.constructorId);
                    const hasFailed = logoErrors.has(c.constructorId);
                    return (
                      <div
                        className="flex h-9 w-20 shrink-0 items-center justify-center rounded-md overflow-hidden"
                        style={{ background: `#${col}18`, border: `1.5px solid #${col}44` }}
                      >
                        {logoUrl && !hasFailed ? (
                          <img
                            src={logoUrl}
                            alt={c.name}
                            className="max-h-7 max-w-[68px] object-contain"
                            onError={() => setLogoErrors((prev) => new Set([...prev, c.constructorId]))}
                          />
                        ) : (
                          <span className="font-mono text-[11px] font-black tracking-wider" style={{ color: `#${col}` }}>
                            {TEAM_ABBREVIATIONS[c.name] ?? c.name.slice(0, 3).toUpperCase()}
                          </span>
                        )}
                      </div>
                    );
                  })()}
                  {/* Name */}
                  <span className="flex-1 text-sm font-semibold text-white/80">
                    {c.name}
                  </span>
                  {/* Wins */}
                  {c.wins > 0 && (
                    <span
                      className="rounded px-1.5 py-0.5 font-mono text-[10px] font-bold"
                      style={{ background: `#${col}22`, color: `#${col}`, border: `1px solid #${col}44` }}
                    >
                      {c.wins}W
                    </span>
                  )}
                  {/* Points */}
                  <span className="w-14 text-right font-mono text-sm font-bold tabular-nums"
                    style={{ color: isLeader ? accentColor : 'rgba(255,255,255,0.7)' }}>
                    {c.points}
                    <span className="ml-0.5 text-[10px] font-normal text-white/25">pts</span>
                  </span>
                </div>
                {/* Points bar */}
                <div
                  className="ml-8 h-1 overflow-hidden rounded-full"
                  style={{ background: `rgba(${cR},${cG},${cB},0.1)` }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: `rgba(${cR},${cG},${cB},0.65)` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {driverStandings.length === 0 && (
        <p className="py-10 text-center text-sm text-white/30">No standings data available for {year}.</p>
      )}
    </div>
  );
}

// ─── Testing Hero ────────────────────────────────────────────────────────────

function TestingHero({
  fastestLaps,
  overallFastest,
  accentColor,
  laps,
  stints,
}: {
  fastestLaps: { driver: Driver; best: number | null }[];
  overallFastest: number | null;
  accentColor: string;
  laps: Lap[];
  stints: Stint[];
}) {
  const [activeTab, setActiveTab] = useState<'bestlap' | 'mileage' | 'longruns'>('bestlap');

  if (fastestLaps.length === 0) return null;

  const leaderCol = fastestLaps[0] ? `#${fastestLaps[0].driver.team_colour}` : accentColor;
  const maxDelta = overallFastest
    ? Math.max((fastestLaps[fastestLaps.length - 1]?.best ?? 0) - overallFastest, 0.001)
    : 0.001;

  const getCompound = (driverNum: number, lapNum: number | null): string | null => {
    if (!lapNum) return null;
    return stints.find((s) => s.driver_number === driverNum && s.lap_start <= lapNum && s.lap_end >= lapNum)?.compound ?? null;
  };

  // Mileage: total valid laps per driver
  const mileageData = fastestLaps
    .map(({ driver }) => {
      const count = laps.filter((l) => l.driver_number === driver.driver_number && l.lap_duration != null).length;
      return { driver, count };
    })
    .sort((a, b) => b.count - a.count);
  const maxLaps = mileageData[0]?.count ?? 1;

  // Long run pace (same methodology as practice)
  const longRunData = fastestLaps.map(({ driver }) => {
    const driverStints = stints.filter((s) => s.driver_number === driver.driver_number);
    let bestAvg: number | null = null;
    let bestCompound: string | null = null;
    for (const stint of driverStints) {
      const stintLaps = laps
        .filter((l) =>
          l.driver_number === driver.driver_number &&
          l.lap_number >= stint.lap_start + 1 &&
          l.lap_number <= stint.lap_end - 1 &&
          !l.is_pit_out_lap &&
          l.lap_duration != null &&
          l.lap_duration > 60
        )
        .map((l) => l.lap_duration as number);
      if (stintLaps.length < 4) continue;
      const stintMin = Math.min(...stintLaps);
      const valid = stintLaps.filter((t) => t <= stintMin * 1.1);
      if (valid.length < 4) continue;
      const avg = valid.reduce((s, t) => s + t, 0) / valid.length;
      if (bestAvg === null || avg < bestAvg) { bestAvg = avg; bestCompound = stint.compound; }
    }
    return { driver, avg: bestAvg, compound: bestCompound };
  }).filter((x) => x.avg !== null).sort((a, b) => (a.avg ?? 0) - (b.avg ?? 0));
  const bestLongRun = longRunData[0]?.avg ?? null;

  const compoundsUsed = [...new Set(stints.map((s) => s.compound).filter(Boolean))];
  const totalLapCount = laps.filter((l) => l.lap_duration != null).length;

  const CompactRow = ({ driver, rank, time, delta, fillPct, compound, col }: {
    driver: Driver; rank: number; time: number | null; delta: number | null;
    fillPct: number; compound: string | null; col: string;
  }) => (
    <div className="flex items-center gap-1.5 rounded-lg px-2 py-1.5" style={{ background: rank === 0 ? `${accentColor}12` : `${col}06`, border: `1px solid ${rank === 0 ? accentColor + '35' : col + '12'}` }}>
      <span className="w-4 shrink-0 text-center font-mono text-[10px] font-bold" style={{ color: rank === 0 ? accentColor : 'rgba(255,255,255,0.3)' }}>{rank + 1}</span>
      {driver.headshot_url ? (
        <img src={driver.headshot_url} alt={driver.name_acronym} className="h-5 w-5 shrink-0 rounded object-cover object-top" style={{ outline: `1px solid ${col}40` }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
      ) : (
        <div className="h-5 w-5 shrink-0 rounded flex items-center justify-center text-[8px] font-black" style={{ background: `${col}25`, color: col }}>{driver.name_acronym[0]}</div>
      )}
      <span className="font-black text-[11px] tracking-tight shrink-0" style={{ color: rank === 0 ? accentColor : col }}>{driver.name_acronym}</span>
      <div className="flex-1 min-w-0">
        <div className="h-0.5 rounded-full overflow-hidden" style={{ background: `${col}18` }}>
          <div className="h-full rounded-full" style={{ width: `${fillPct}%`, background: rank === 0 ? accentColor : col }} />
        </div>
      </div>
      <span className="shrink-0 font-mono text-[10px] text-white/70">{formatLapTime(time)}</span>
      {delta != null && <span className="shrink-0 font-mono text-[9px]" style={{ color: `${col}80` }}>+{delta.toFixed(3)}</span>}
      {compound && (
        <span className="shrink-0 h-3.5 w-3.5 rounded-sm flex items-center justify-center text-[7px] font-black" style={{ background: COMPOUND_COLOURS[compound] ?? '#888', color: compound === 'HARD' || compound === 'MEDIUM' ? '#000' : '#fff' }}>
          {compound[0]}
        </span>
      )}
    </div>
  );

  return (
    <div className="mb-6 overflow-hidden rounded-2xl" style={{ background: '#0e0e0e', border: `1px solid ${leaderCol}25` }}>
      <div className="grid grid-cols-1 md:grid-cols-[260px_1fr]">

        {/* Left — session overview */}
        <div className="relative flex flex-col justify-between overflow-hidden p-5" style={{ background: `linear-gradient(135deg, ${leaderCol}12 0%, transparent 60%)`, borderRight: `1px solid ${leaderCol}15`, minHeight: 200 }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at 50% 100%, ${leaderCol}15 0%, transparent 65%)` }} />
          <div className="relative z-10">
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.18em]" style={{ background: `${accentColor}20`, color: accentColor, border: `1px solid ${accentColor}40` }}>
              ⚙ Pre-Season Testing
            </div>
            <div className="mb-4 rounded-lg px-3 py-2 text-[10px] leading-relaxed text-white/40" style={{ background: 'rgba(255,200,0,0.05)', border: '1px solid rgba(255,200,0,0.12)', color: 'rgba(255,200,0,0.55)' }}>
              ⚠ Times reflect different fuel loads, tyre programmes, and setups — not representative of race pace.
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-white/35">Total laps</span>
                <span className="font-mono font-bold text-white/70">{totalLapCount}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/35">Drivers</span>
                <span className="font-mono font-bold text-white/70">{fastestLaps.length}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-white/35">Compounds</span>
                <div className="flex gap-1">
                  {compoundsUsed.map((c) => (
                    <span key={c} className="h-4 w-4 rounded-sm flex items-center justify-center text-[8px] font-black" style={{ background: COMPOUND_COLOURS[c] ?? '#888', color: c === 'HARD' || c === 'MEDIUM' ? '#000' : '#fff' }}>
                      {c[0]}
                    </span>
                  ))}
                </div>
              </div>
              {fastestLaps[0]?.best && (
                <div className="flex justify-between text-xs">
                  <span className="text-white/35">Fastest</span>
                  <span className="font-mono font-bold" style={{ color: accentColor }}>{fastestLaps[0].driver.name_acronym} · {formatLapTime(fastestLaps[0].best)}</span>
                </div>
              )}
              {longRunData[0] && (
                <div className="flex justify-between text-xs">
                  <span className="text-white/35">Best long run</span>
                  <span className="font-mono font-bold" style={{ color: accentColor }}>{longRunData[0].driver.name_acronym} · {formatLapTime(longRunData[0].avg)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right — tabs */}
        <div className="flex flex-col p-4">
          <div className="mb-3 flex gap-1 rounded-lg border border-white/5 bg-white/3 p-1 w-fit">
            {([['bestlap', 'Best Lap'], ['mileage', 'Mileage'], ['longruns', 'Long Runs']] as const).map(([id, label]) => (
              <button key={id} onClick={() => setActiveTab(id)} className="rounded-md px-3 py-1 text-xs font-medium transition-colors cursor-pointer"
                style={activeTab === id ? { background: `${accentColor}25`, color: accentColor } : { color: 'rgba(255,255,255,0.35)' }}>
                {label}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative' }}>
            {/* Best Lap */}
            {activeTab === 'bestlap' && overallFastest && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: 'repeat(10, auto)', gridAutoFlow: 'column', gap: 3 }}>
                {fastestLaps.map((entry, i) => {
                  const col = `#${entry.driver.team_colour}`;
                  const delta = i === 0 ? null : (entry.best ?? 0) - overallFastest;
                  const fillPct = i === 0 ? 100 : Math.max(2, 100 - ((delta ?? 0) / maxDelta) * 98);
                  const driverLaps = laps.filter((l) => l.driver_number === entry.driver.driver_number && l.lap_duration != null);
                  const bestLapNum = driverLaps.find((l) => l.lap_duration === entry.best)?.lap_number ?? null;
                  const compound = getCompound(entry.driver.driver_number, bestLapNum);
                  return <CompactRow key={entry.driver.driver_number} driver={entry.driver} rank={i} time={entry.best} delta={delta} fillPct={fillPct} compound={compound} col={col} />;
                })}
              </div>
            )}

            {/* Mileage */}
            {activeTab === 'mileage' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: 'repeat(10, auto)', gridAutoFlow: 'column', gap: 3 }}>
                {mileageData.map((entry, i) => {
                  const col = `#${entry.driver.team_colour}`;
                  const fillPct = Math.max(4, (entry.count / maxLaps) * 100);
                  return (
                    <div key={entry.driver.driver_number} className="flex items-center gap-1.5 rounded-lg px-2 py-1.5" style={{ background: i === 0 ? `${accentColor}12` : `${col}06`, border: `1px solid ${i === 0 ? accentColor + '35' : col + '12'}` }}>
                      <span className="w-4 shrink-0 text-center font-mono text-[10px] font-bold" style={{ color: i === 0 ? accentColor : 'rgba(255,255,255,0.3)' }}>{i + 1}</span>
                      {entry.driver.headshot_url ? (
                        <img src={entry.driver.headshot_url} alt={entry.driver.name_acronym} className="h-5 w-5 shrink-0 rounded object-cover object-top" style={{ outline: `1px solid ${col}40` }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      ) : (
                        <div className="h-5 w-5 shrink-0 rounded flex items-center justify-center text-[8px] font-black" style={{ background: `${col}25`, color: col }}>{entry.driver.name_acronym[0]}</div>
                      )}
                      <span className="font-black text-[11px] tracking-tight shrink-0" style={{ color: i === 0 ? accentColor : col }}>{entry.driver.name_acronym}</span>
                      <div className="flex-1 min-w-0">
                        <div className="h-0.5 rounded-full overflow-hidden" style={{ background: `${col}18` }}>
                          <div className="h-full rounded-full" style={{ width: `${fillPct}%`, background: i === 0 ? accentColor : col }} />
                        </div>
                      </div>
                      <span className="shrink-0 font-mono text-[10px] text-white/70">{entry.count} laps</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Long Runs */}
            {activeTab === 'longruns' && (
              longRunData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-white/25">Not enough long-run data for this session.</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: `repeat(${Math.ceil(longRunData.length / 2)}, auto)`, gridAutoFlow: 'column', gap: 3 }}>
                  {longRunData.map((entry, i) => {
                    const col = `#${entry.driver.team_colour}`;
                    const delta = i === 0 ? null : (entry.avg ?? 0) - (bestLongRun ?? 0);
                    const fillPct = bestLongRun && entry.avg ? Math.max(2, 100 - ((entry.avg - bestLongRun) / Math.max((longRunData[longRunData.length - 1]?.avg ?? 0) - bestLongRun, 0.001)) * 98) : 100;
                    return <CompactRow key={entry.driver.driver_number} driver={entry.driver} rank={i} time={entry.avg} delta={delta} fillPct={fillPct} compound={entry.compound} col={col} />;
                  })}
                </div>
              )
            )}
            {activeTab === 'longruns' && longRunData.length > 0 && (
              <p style={{ position: 'absolute', bottom: 0, right: 0 }} className="text-[9px] text-white/20 pointer-events-none">
                Avg pace · best stint ≥4 clean laps · outlap/inlap excl.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Practice Hero ───────────────────────────────────────────────────────────

function PracticeResultHero({
  fastestLaps,
  overallFastest,
  accentColor,
  laps,
  stints,
}: {
  fastestLaps: { driver: Driver; best: number | null }[];
  overallFastest: number | null;
  accentColor: string;
  laps: Lap[];
  stints: Stint[];
}) {
  const [activeTab, setActiveTab] = useState<'pace' | 'longruns'>('pace');

  if (fastestLaps.length === 0 || !overallFastest) return null;

  const leader = fastestLaps[0];
  const leaderCol = `#${leader.driver.team_colour}`;
  const maxDelta = Math.max((fastestLaps[fastestLaps.length - 1]?.best ?? 0) - overallFastest, 0.001);

  // Compound lookup: find which stint covers a given lap number for a driver
  const getCompound = (driverNum: number, lapNum: number | null): string | null => {
    if (!lapNum) return null;
    return stints.find((s) => s.driver_number === driverNum && s.lap_start <= lapNum && s.lap_end >= lapNum)?.compound ?? null;
  };

  // Long run pace: for each driver, group laps by stint, keep stints ≥ 5 valid laps,
  // exclude outlap (first), inlap (last), and laps > 110% of that stint's min.
  const longRunData = fastestLaps.map(({ driver }) => {
    const driverStints = stints.filter((s) => s.driver_number === driver.driver_number);
    let bestAvg: number | null = null;
    let bestCompound: string | null = null;
    for (const stint of driverStints) {
      const stintLaps = laps
        .filter((l) =>
          l.driver_number === driver.driver_number &&
          l.lap_number >= stint.lap_start + 1 &&
          l.lap_number <= stint.lap_end - 1 &&
          !l.is_pit_out_lap &&
          l.lap_duration != null &&
          l.lap_duration > 60
        )
        .map((l) => l.lap_duration as number);
      if (stintLaps.length < 4) continue;
      const stintMin = Math.min(...stintLaps);
      const valid = stintLaps.filter((t) => t <= stintMin * 1.1);
      if (valid.length < 4) continue;
      const avg = valid.reduce((s, t) => s + t, 0) / valid.length;
      if (bestAvg === null || avg < bestAvg) {
        bestAvg = avg;
        bestCompound = stint.compound;
      }
    }
    return { driver, avg: bestAvg, compound: bestCompound };
  }).filter((x) => x.avg !== null).sort((a, b) => (a.avg ?? 0) - (b.avg ?? 0));

  const bestLongRun = longRunData[0]?.avg ?? null;

  const tabs = [
    { id: 'pace' as const, label: 'Best Lap' },
    { id: 'longruns' as const, label: 'Long Runs' },
  ];

  // Pace tab: 20 drivers in 2-col vertical-flow grid
  const PaceRow = ({ entry, rank }: { entry: typeof fastestLaps[0]; rank: number }) => {
    const col = `#${entry.driver.team_colour}`;
    const delta = rank === 0 ? null : (entry.best ?? 0) - overallFastest;
    const fillPct = rank === 0 ? 100 : Math.max(2, 100 - ((delta ?? 0) / maxDelta) * 98);
    const driverLaps = laps.filter((l) => l.driver_number === entry.driver.driver_number && l.lap_duration != null);
    const bestLapNum = driverLaps.find((l) => l.lap_duration === entry.best)?.lap_number ?? null;
    const compound = getCompound(entry.driver.driver_number, bestLapNum);
    return (
      <div className="flex items-center gap-1.5 rounded-lg px-2 py-1.5" style={{ background: rank === 0 ? `${accentColor}12` : `${col}06`, border: `1px solid ${rank === 0 ? accentColor + '35' : col + '12'}` }}>
        <span className="w-4 shrink-0 text-center font-mono text-[10px] font-bold" style={{ color: rank === 0 ? accentColor : 'rgba(255,255,255,0.3)' }}>
          {rank + 1}
        </span>
        {entry.driver.headshot_url ? (
          <img src={entry.driver.headshot_url} alt={entry.driver.name_acronym} className="h-5 w-5 shrink-0 rounded object-cover object-top" style={{ outline: `1px solid ${col}40` }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        ) : (
          <div className="h-5 w-5 shrink-0 rounded flex items-center justify-center text-[8px] font-black" style={{ background: `${col}25`, color: col }}>{entry.driver.name_acronym[0]}</div>
        )}
        <span className="font-black text-[11px] tracking-tight shrink-0" style={{ color: rank === 0 ? accentColor : col }}>{entry.driver.name_acronym}</span>
        <div className="flex-1 min-w-0">
          <div className="h-0.5 rounded-full overflow-hidden" style={{ background: `${col}18` }}>
            <div className="h-full rounded-full" style={{ width: `${fillPct}%`, background: rank === 0 ? accentColor : col }} />
          </div>
        </div>
        <span className="shrink-0 font-mono text-[10px] text-white/70">{formatLapTime(entry.best)}</span>
        {delta != null && <span className="shrink-0 font-mono text-[9px]" style={{ color: `${col}80` }}>+{delta.toFixed(3)}</span>}
        {compound && (
          <span className="shrink-0 h-3.5 w-3.5 rounded-sm flex items-center justify-center text-[7px] font-black" style={{ background: COMPOUND_COLOURS[compound] ?? '#888', color: compound === 'HARD' || compound === 'MEDIUM' ? '#000' : '#fff' }}>
            {compound[0]}
          </span>
        )}
      </div>
    );
  };

  // Long run row
  const LongRunRow = ({ entry, rank }: { entry: typeof longRunData[0]; rank: number }) => {
    const col = `#${entry.driver.team_colour}`;
    const delta = rank === 0 ? null : (entry.avg ?? 0) - (bestLongRun ?? 0);
    const fillPct = bestLongRun && entry.avg ? Math.max(2, 100 - ((entry.avg - bestLongRun) / Math.max((longRunData[longRunData.length - 1]?.avg ?? 0) - bestLongRun, 0.001)) * 98) : 100;
    return (
      <div className="flex items-center gap-1.5 rounded-lg px-2 py-1.5" style={{ background: rank === 0 ? `${accentColor}12` : `${col}06`, border: `1px solid ${rank === 0 ? accentColor + '35' : col + '12'}` }}>
        <span className="w-4 shrink-0 text-center font-mono text-[10px] font-bold" style={{ color: rank === 0 ? accentColor : 'rgba(255,255,255,0.3)' }}>{rank + 1}</span>
        {entry.driver.headshot_url ? (
          <img src={entry.driver.headshot_url} alt={entry.driver.name_acronym} className="h-5 w-5 shrink-0 rounded object-cover object-top" style={{ outline: `1px solid ${col}40` }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        ) : (
          <div className="h-5 w-5 shrink-0 rounded flex items-center justify-center text-[8px] font-black" style={{ background: `${col}25`, color: col }}>{entry.driver.name_acronym[0]}</div>
        )}
        <span className="font-black text-[11px] tracking-tight shrink-0" style={{ color: rank === 0 ? accentColor : col }}>{entry.driver.name_acronym}</span>
        <div className="flex-1 min-w-0">
          <div className="h-0.5 rounded-full overflow-hidden" style={{ background: `${col}18` }}>
            <div className="h-full rounded-full" style={{ width: `${fillPct}%`, background: rank === 0 ? accentColor : col }} />
          </div>
        </div>
        <span className="shrink-0 font-mono text-[10px] text-white/70">{formatLapTime(entry.avg)}</span>
        {delta != null && <span className="shrink-0 font-mono text-[9px]" style={{ color: `${col}80` }}>+{delta.toFixed(3)}</span>}
        {entry.compound && (
          <span className="shrink-0 h-3.5 w-3.5 rounded-sm flex items-center justify-center text-[7px] font-black" style={{ background: COMPOUND_COLOURS[entry.compound] ?? '#888', color: entry.compound === 'HARD' || entry.compound === 'MEDIUM' ? '#000' : '#fff' }}>
            {entry.compound[0]}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="mb-6 overflow-hidden rounded-2xl" style={{ background: '#0e0e0e', border: `1px solid ${leaderCol}25` }}>
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr]">
        {/* Left — pace-setter portrait */}
        <div className="relative flex flex-col justify-end overflow-hidden p-5" style={{ background: `linear-gradient(135deg, ${leaderCol}18 0%, transparent 60%)`, borderRight: `1px solid ${leaderCol}15`, minHeight: 200 }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at 50% 100%, ${leaderCol}20 0%, transparent 65%)` }} />
          {leader.driver.headshot_url && (
            <img
              src={hiResUrl(leader.driver.headshot_url, '6col')}
              onError={(e) => { (e.target as HTMLImageElement).src = leader.driver.headshot_url!; }}
              alt={leader.driver.name_acronym}
              className="absolute bottom-0 right-0 h-56 object-contain object-bottom pointer-events-none select-none"
              style={{ filter: `drop-shadow(0 0 28px ${leaderCol}55)` }}
            />
          )}
          <div className="relative z-10">
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.18em]" style={{ background: `${leaderCol}20`, color: leaderCol, border: `1px solid ${leaderCol}40` }}>
              ⏱ Fastest
            </div>
            <div className="text-4xl font-black tracking-tight" style={{ color: leaderCol }}>{leader.driver.name_acronym}</div>
            <div className="text-sm text-white/50">{leader.driver.full_name}</div>
            <div className="mt-2 font-mono text-xl font-black text-white">{formatLapTime(leader.best)}</div>
          </div>
        </div>

        {/* Right — tabs */}
        <div className="flex flex-col p-4">
          {/* Tab bar */}
          <div className="mb-3 flex gap-1 rounded-lg border border-white/5 bg-white/3 p-1 w-fit">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className="rounded-md px-3 py-1 text-xs font-medium transition-colors cursor-pointer"
                style={activeTab === t.id ? { background: `${accentColor}25`, color: accentColor } : { color: 'rgba(255,255,255,0.35)' }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div style={{ position: 'relative' }}>
            {activeTab === 'pace' && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gridTemplateRows: 'repeat(10, auto)',
                  gridAutoFlow: 'column',
                  gap: '3px',
                }}
              >
                {fastestLaps.map((entry, i) => (
                  <PaceRow key={entry.driver.driver_number} entry={entry} rank={i} />
                ))}
              </div>
            )}
            {activeTab === 'longruns' && (
              longRunData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-white/25">Not enough long-run data for this session.</div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gridTemplateRows: `repeat(${Math.ceil(longRunData.length / 2)}, auto)`,
                    gridAutoFlow: 'column',
                    gap: '3px',
                  }}
                >
                  {longRunData.map((entry, i) => (
                    <LongRunRow key={entry.driver.driver_number} entry={entry} rank={i} />
                  ))}
                </div>
              )
            )}
            {activeTab === 'longruns' && longRunData.length > 0 && (
              <p style={{ position: 'absolute', bottom: 0, right: 0 }} className="text-[9px] text-white/20 pointer-events-none">
                Avg pace · best stint ≥4 clean laps · outlap/inlap excl.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Qualifying Hero ─────────────────────────────────────────────────────────

function QualiResultHero({
  fastestLaps,
  overallFastest,
  accentColor,
  isSprint,
}: {
  fastestLaps: { driver: Driver; best: number | null }[];
  overallFastest: number | null;
  accentColor: string;
  isSprint: boolean;
}) {
  const [activeSeg, setActiveSeg] = useState<'Q3' | 'Q2' | 'Q1'>('Q3');

  if (fastestLaps.length === 0 || !overallFastest) return null;

  const pole = fastestLaps[0];
  const poleCol = `#${pole.driver.team_colour}`;
  const r = parseInt(poleCol.slice(1, 3), 16);
  const g = parseInt(poleCol.slice(3, 5), 16);
  const b = parseInt(poleCol.slice(5, 7), 16);

  const q3Count = isSprint ? 8 : 10;
  const q2Count = isSprint ? 4 : 5;
  const q3Drivers = fastestLaps.slice(0, q3Count);
  const q2Elim = fastestLaps.slice(q3Count, q3Count + q2Count);
  const q1Elim = fastestLaps.slice(q3Count + q2Count);
  const maxDelta = Math.max((fastestLaps[fastestLaps.length - 1]?.best ?? 0) - overallFastest, 0.001);

  const renderRow = (entry: { driver: Driver; best: number | null }, pos: number, compact = false) => {
    const delta = pos > 1 && entry.best ? entry.best - overallFastest : null;
    const barPct = delta != null ? Math.min(100, (delta / maxDelta) * 100) : 100;
    const dCol = `#${entry.driver.team_colour}`;
    return (
      <div
        key={entry.driver.driver_number}
        className={`relative flex items-center gap-2 rounded-lg overflow-hidden ${compact ? 'px-2 py-1' : 'px-3 py-1.5'}`}
        style={{
          border: `1px solid ${dCol}${pos === 1 ? '35' : '18'}`,
          background: pos === 1 ? `${dCol}12` : `${dCol}06`,
        }}
      >
        {/* gap fill bar */}
        <div
          className="absolute left-0 top-0 bottom-0 pointer-events-none rounded-lg"
          style={{ width: `${barPct}%`, background: `${dCol}09` }}
        />
        {/* pos */}
        <span
          className="relative z-10 w-4 shrink-0 text-right font-mono text-[10px] font-black"
          style={{ color: dCol }}
        >
          {pos}
        </span>
        {/* headshot — hidden in compact mode to save width */}
        {!compact && (
          <img
            src={hiResUrl(entry.driver.headshot_url, '4col')}
            className="relative z-10 h-7 w-7 shrink-0 rounded object-cover"
            style={{ border: `1px solid ${dCol}40`, background: `${dCol}20` }}
            onError={(e) => { (e.target as HTMLImageElement).style.visibility = 'hidden'; }}
          />
        )}
        {/* name */}
        <div className="relative z-10 min-w-0 flex-1">
          <div className={`truncate font-bold tracking-wide ${compact ? 'text-xs' : 'text-sm'}`} style={{ color: dCol }}>
            {entry.driver.name_acronym}
          </div>
          {!compact && <div className="truncate font-mono text-[10px] text-white/20">{entry.driver.full_name}</div>}
        </div>
        {/* time + delta */}
        <div className="relative z-10 shrink-0 text-right">
          <div className={`font-mono font-bold ${compact ? 'text-[10px]' : 'text-sm'}`} style={{ color: 'rgba(255,255,255,0.9)' }}>
            {formatLapTime(entry.best)}
          </div>
          {delta != null ? (
            <div className="font-mono text-[10px]" style={{ color: `${dCol}80` }}>+{delta.toFixed(3)}s</div>
          ) : (
            <div className="font-mono text-[10px] font-black" style={{ color: accentColor }}>⚡ POLE</div>
          )}
        </div>
      </div>
    );
  };

  const segLabel = (seg: string) => isSprint ? `S${seg}` : seg;

  return (
    <div className="mb-6 overflow-hidden rounded-2xl" style={{ border: `1px solid ${poleCol}20`, background: '#0d0d0d' }}>
      <div
        className="grid lg:grid-cols-[300px_1fr]"
        style={{ background: `radial-gradient(ellipse 80% 80% at 0% 50%, rgba(${r},${g},${b},0.1) 0%, transparent 65%)` }}
      >
        {/* ── Pole hero ── */}
        <div
          className="relative flex flex-col justify-end overflow-hidden p-6 lg:border-r"
          style={{ borderColor: `${poleCol}15`, minHeight: 200 }}
        >
          {/* floor glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: `radial-gradient(ellipse 100% 70% at 50% 120%, rgba(${r},${g},${b},0.2) 0%, transparent 60%)` }}
          />
          {/* big headshot */}
          <img
            src={hiResUrl(pole.driver.headshot_url, '6col')}
            className="absolute bottom-0 right-0 h-[90%] w-auto object-contain object-bottom pointer-events-none select-none"
            style={{ filter: `drop-shadow(0 0 36px rgba(${r},${g},${b},0.4))` }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          {/* text */}
          <div className="relative z-10">
            <span
              className="mb-3 inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 font-mono text-[10px] font-black uppercase tracking-[0.18em]"
              style={{ background: poleCol, color: '#000' }}
            >
              ⚡ Pole Position
            </span>
            <div className="font-black text-4xl tracking-tighter" style={{ color: poleCol }}>
              {pole.driver.name_acronym}
            </div>
            <div className="mt-0.5 text-sm text-white/35">{pole.driver.full_name}</div>
            <div className="mt-3 font-mono text-2xl font-black tracking-tight text-white/90">
              {formatLapTime(overallFastest)}
            </div>
          </div>
        </div>

        {/* ── Leaderboard with tabs ── */}
        <div className="flex flex-col p-4">
          {/* Tab bar */}
          <div className="mb-3 flex items-center gap-1">
            {(['Q3', 'Q2', 'Q1'] as const).map((seg) => {
              const label = segLabel(seg);
              const subtitle = seg === 'Q3' ? 'Pole battle' : 'Eliminated';
              const count = seg === 'Q3' ? q3Drivers.length : seg === 'Q2' ? q2Elim.length : q1Elim.length;
              if (count === 0) return null;
              const isActive = activeSeg === seg;
              return (
                <button
                  key={seg}
                  onClick={() => setActiveSeg(seg)}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-xs font-black uppercase tracking-widest transition-all"
                  style={{
                    background: isActive ? `${accentColor}20` : 'transparent',
                    border: `1px solid ${isActive ? accentColor : 'rgba(255,255,255,0.08)'}`,
                    color: isActive ? accentColor : 'rgba(255,255,255,0.25)',
                  }}
                >
                  {label}
                  <span
                    className="rounded px-1 py-px text-[9px]"
                    style={{ background: isActive ? `${accentColor}30` : 'rgba(255,255,255,0.06)', color: isActive ? accentColor : 'rgba(255,255,255,0.2)' }}
                  >
                    {count}
                  </span>
                  <span className="hidden sm:inline text-[9px] font-normal normal-case tracking-normal opacity-60">{subtitle}</span>
                </button>
              );
            })}
          </div>

          {/* Active segment rows */}
          <div>
            {activeSeg === 'Q3' && (
              <div className="grid grid-cols-2 gap-1" style={{ gridAutoFlow: 'column', gridTemplateRows: 'repeat(5, auto)' }}>
                {q3Drivers.map((e, i) => renderRow(e, i + 1, true))}
              </div>
            )}
            {activeSeg === 'Q2' && (
              <div className="grid grid-cols-2 gap-1" style={{ gridAutoFlow: 'column', gridTemplateRows: 'repeat(5, auto)' }}>
                {q2Elim.map((e, i) => renderRow(e, q3Count + i + 1, true))}
              </div>
            )}
            {activeSeg === 'Q1' && (
              <div className="grid grid-cols-2 gap-1" style={{ gridAutoFlow: 'column', gridTemplateRows: 'repeat(5, auto)' }}>
                {q1Elim.map((e, i) => renderRow(e, q3Count + q2Count + i + 1, true))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Race Result Hero ─────────────────────────────────────────────────────────

function RaceResultHero({
  isRaceSession,
  podiumDrivers,
  winMargin,
  topConstructors,
  meetingName,
  year,
}: {
  isRaceSession: boolean;
  podiumDrivers: { driver: Driver; pos: number }[];
  winMargin: number | null;
  topConstructors: { team: string; colour: string; points: number }[];
  meetingName?: string;
  year?: number;
}) {
  const [highlightsVideoId, setHighlightsVideoId] = useState<string | null>(null);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY as string | undefined;
    if (!apiKey || !isRaceSession || !meetingName || !year) return;
    let cancelled = false;
    const q = `Race Highlights | ${year} ${meetingName} Grand Prix`;
    // Official F1 YouTube channel ID
    const F1_CHANNEL_ID = 'UCB_qr75-ydFVKSF9Dmo6izg';
    fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(q)}&channelId=${F1_CHANNEL_ID}&type=video&maxResults=1&key=${apiKey}`
    )
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const id: string | undefined = data?.items?.[0]?.id?.videoId;
        if (id) setHighlightsVideoId(id);
      })
      .catch(() => { /* fail silently — search URL fallback is used */ });
    return () => { cancelled = true; };
  }, [isRaceSession, meetingName, year]);

  if (!isRaceSession || podiumDrivers.length < 3) return null;

  const winner = podiumDrivers.find((p) => p.pos === 1)!;
  const p2 = podiumDrivers.find((p) => p.pos === 2)!;
  const p3 = podiumDrivers.find((p) => p.pos === 3)!;

  const wCol = `#${winner.driver.team_colour}`;
  const wR = parseInt(winner.driver.team_colour.slice(0, 2), 16) || 225;
  const wG = parseInt(winner.driver.team_colour.slice(2, 4), 16) || 6;
  const wB = parseInt(winner.driver.team_colour.slice(4, 6), 16) || 0;

  // P2 left, P1 centre, P3 right — classic podium left-to-right ordering
  const podiumOrder = [p2, winner, p3];
  const podiumHeights = [96, 132, 72];

  const highlightsHref = highlightsVideoId
    ? `https://www.youtube.com/watch?v=${highlightsVideoId}`
    : `https://www.youtube.com/results?search_query=${encodeURIComponent(`Race Highlights | ${year} ${meetingName} Grand Prix`)}`;

  return (
    <div
      className="mb-8 overflow-hidden rounded-2xl relative"
      style={{ background: '#0a0a0a', border: `1px solid rgba(${wR},${wG},${wB},0.22)` }}
    >
      {/* Highlights link — floating top-right */}
      {meetingName && year && (
        <a
          href={highlightsHref}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-4 right-4 z-20 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold tracking-wide backdrop-blur-sm transition-opacity hover:opacity-75"
          style={{ background: 'rgba(255,0,0,0.18)', color: '#ff5555', border: '1px solid rgba(255,0,0,0.28)' }}
        >
          <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.8 15.5V8.5l6.3 3.5-6.3 3.5z"/></svg>
          {highlightsVideoId ? 'Watch Highlights' : 'Search Highlights'}
        </a>
      )}
      {/* Background glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: [
            `radial-gradient(ellipse 65% 100% at -5% 50%, rgba(${wR},${wG},${wB},0.11) 0%, transparent 60%)`,
            `radial-gradient(ellipse 35% 60% at 108% 50%, rgba(${wR},${wG},${wB},0.06) 0%, transparent 60%)`,
          ].join(','),
        }}
      />
      {/* Top colour bar */}
      <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, ${wCol}, ${wCol}00 70%)` }} />

      <div className="relative grid lg:grid-cols-[300px_1fr]">

        {/* ── Winner panel ── */}
        <div
          className="relative flex flex-col justify-end overflow-hidden p-6 lg:border-r"
          style={{ borderColor: `${wCol}15`, minHeight: 280 }}
        >
          {/* floor glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: `radial-gradient(ellipse 100% 70% at 50% 120%, rgba(${wR},${wG},${wB},0.22) 0%, transparent 60%)` }}
          />
          {/* full-height driver image */}
          {winner.driver.headshot_url && (
            <img
              src={hiResUrl(winner.driver.headshot_url, '6col')}
              alt={winner.driver.full_name}
              className="absolute bottom-0 right-0 h-[90%] w-auto object-contain object-bottom pointer-events-none select-none"
              style={{ filter: `drop-shadow(0 0 36px rgba(${wR},${wG},${wB},0.4))` }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          )}
          {/* text overlay */}
          <div className="relative z-10">
            <div
              className="mb-2 inline-flex w-fit items-center gap-1.5 rounded px-2.5 py-1 text-[10px] font-black tracking-[0.15em] uppercase"
              style={{ background: wCol, color: '#000' }}
            >
              ◆ Race Winner
            </div>
            <div
              className="font-black leading-none tracking-tighter"
              style={{ fontSize: 40, color: wCol, lineHeight: 1 }}
            >
              {winner.driver.name_acronym}
            </div>
            <div className="mt-1 text-xs font-medium text-white/40">{winner.driver.full_name}</div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <TeamBadge teamName={winner.driver.team_name} teamColour={winner.driver.team_colour} />
              {winMargin != null && winMargin > 0 && (
                <span className="font-mono text-[10px] text-white/20">+{winMargin.toFixed(3)}s</span>
              )}
            </div>

          </div>
        </div>

        {/* ── Right: podium + constructors ── */}
        <div className="flex flex-col items-center justify-center gap-6 p-6 lg:flex-row">

        {/* ── Podium graphic ── */}
        <div className="flex items-end justify-center gap-2 lg:mx-auto">
          {podiumOrder.map(({ driver, pos }, idx) => {
            const col = `#${driver.team_colour}`;
            const dR = parseInt(driver.team_colour.slice(0, 2), 16) || 100;
            const dG = parseInt(driver.team_colour.slice(2, 4), 16) || 100;
            const dB = parseInt(driver.team_colour.slice(4, 6), 16) || 100;
            const platformH = podiumHeights[idx];
            return (
              <div key={pos} className="flex flex-col items-center gap-1.5">
                {/* Headshot */}
                <div
                  className="h-11 w-11 overflow-hidden rounded-full"
                  style={{ border: `2px solid rgba(${dR},${dG},${dB},0.55)` }}
                >
                  {driver.headshot_url ? (
                    <img
                      src={hiResUrl(driver.headshot_url, '4col')}
                      alt={driver.name_acronym}
                      className="h-full w-full object-cover object-top"
                      onError={(e) => { (e.target as HTMLImageElement).src = driver.headshot_url; }}
                    />
                  ) : (
                    <div
                      className="flex h-full w-full items-center justify-center text-[10px] font-black"
                      style={{ background: `rgba(${dR},${dG},${dB},0.2)`, color: col }}
                    >
                      {driver.name_acronym.slice(0, 2)}
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-mono font-bold" style={{ color: col }}>{driver.name_acronym}</span>
                {/* Platform block */}
                <div
                  className="flex w-[68px] items-start justify-center rounded-t pt-2"
                  style={{
                    height: platformH,
                    background: `rgba(${dR},${dG},${dB},0.1)`,
                    border: `1px solid rgba(${dR},${dG},${dB},0.28)`,
                    borderBottom: 'none',
                  }}
                >
                  <span
                    className="font-black select-none"
                    style={{ color: `rgba(${dR},${dG},${dB},0.55)`, fontSize: 20 }}
                  >
                    P{pos}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Constructor points ── */}
        {topConstructors.length > 0 && (
          <div
            className="flex shrink-0 flex-col gap-3 rounded-xl p-4 lg:min-w-[190px]"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-white/25">Constructors · this race</div>
            {topConstructors.map((c, i) => {
              const cR = parseInt(c.colour.slice(0, 2), 16) || 100;
              const cG = parseInt(c.colour.slice(2, 4), 16) || 100;
              const cB = parseInt(c.colour.slice(4, 6), 16) || 100;
              const maxPts = topConstructors[0].points;
              const pct = (c.points / maxPts) * 100;
              return (
                <div key={c.team} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 font-mono text-[9px] text-white/20">{i + 1}</span>
                      {(() => {
                        const logoUrl = getConstructorLogoUrlByTeamName(c.team);
                        const abbr = TEAM_ABBREVIATIONS[c.team] ?? c.team.slice(0, 3).toUpperCase();
                        return (
                          <div className="flex items-center gap-1.5">
                            {logoUrl ? (
                              <img src={logoUrl} alt={c.team} className="max-h-3.5 max-w-[48px] object-contain" style={{ filter: `drop-shadow(0 0 2px #${c.colour}66)` }} />
                            ) : (
                              <span className="h-1.5 w-1.5 rounded-full" style={{ background: `#${c.colour}` }} />
                            )}
                            <span className="font-mono text-[10px] font-bold tracking-wider" style={{ color: `#${c.colour}` }}>
                              {abbr}
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                    <span className="font-mono text-[11px] tabular-nums text-white/45">{c.points}pts</span>
                  </div>
                  <div className="h-px overflow-hidden rounded-full" style={{ background: `rgba(${cR},${cG},${cB},0.12)` }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, background: `rgba(${cR},${cG},${cB},0.55)` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        </div>{/* ── end right panel ── */}
      </div>{/* ── end grid ── */}
    </div>
  );
}

// ─── Driver Season View ───────────────────────────────────────────────────────

interface DriverRaceResult {
  round: number;
  raceName: string;
  circuitCountry: string;
  date: string;
  grid: number;
  position: number | null;
  points: number;
  status: string;
  fastestLapRank: number | null;
}

interface ErgastRaceWithResult {
  round: string;
  raceName: string;
  Circuit: { circuitName: string; Location: { country: string } };
  date: string;
  Results: Array<{
    position: string;
    points: string;
    grid: string;
    laps: string;
    status: string;
    FastestLap?: { rank: string };
  }>;
}

const COUNTRY_NAME_TO_ISO3: Record<string, string> = {
  'Australia':              'AUS',
  'China':                  'CHN',
  'Japan':                  'JPN',
  'Bahrain':                'BHR',
  'Saudi Arabia':           'KSA',
  'United States':          'USA',
  'Italy':                  'ITA',
  'Monaco':                 'MON',
  'Canada':                 'CAN',
  'Spain':                  'ESP',
  'Austria':                'AUT',
  'Great Britain':          'GBR',
  'Hungary':                'HUN',
  'Belgium':                'BEL',
  'Netherlands':            'NED',
  'Singapore':              'SGP',
  'Mexico':                 'MEX',
  'Brazil':                 'BRA',
  'United Arab Emirates':   'UAE',
  'Qatar':                  'QAT',
  'Azerbaijan':             'AZE',
  'South Africa':           'RSA',
  'Argentina':              'ARG',
  'Portugal':               'POR',
  'Turkey':                 'TUR',
  'Malaysia':               'MYS',
  'Russia':                 'RUS',
};

function DriverSeasonView({
  driverStandings,
  year,
  accentColor,
  headshots,
}: {
  driverStandings: DriverStanding[];
  year: number;
  accentColor: string;
  headshots: Record<string, string>;
}) {
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [raceResults, setRaceResults] = useState<DriverRaceResult[]>([]);
  const [resultsLoading, setResultsLoading] = useState(false);

  // Derive the active code — fall back to championship leader if nothing selected yet
  const displayCode = selectedCode ?? (driverStandings[0]?.code ?? null);
  const selectedDriver = displayCode ? (driverStandings.find((d) => d.code === displayCode) ?? null) : null;

  useEffect(() => {
    if (!selectedDriver?.driverId) return;
    let cancelled = false;
    setResultsLoading(true);
    setRaceResults([]);
    fetch(`https://api.jolpi.ca/ergast/f1/${year}/drivers/${selectedDriver.driverId}/results.json`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const races: ErgastRaceWithResult[] = data?.MRData?.RaceTable?.Races ?? [];
        const parsed: DriverRaceResult[] = races.map((race) => {
          const result = race.Results?.[0];
          const posStr = result?.position ?? '';
          const pos = /^\d+$/.test(posStr) ? parseInt(posStr, 10) : null;
          return {
            round: parseInt(race.round, 10),
            raceName: race.raceName,
            circuitCountry: race.Circuit?.Location?.country ?? '',
            date: race.date,
            grid: parseInt(result?.grid ?? '0', 10),
            position: pos,
            points: parseFloat(result?.points ?? '0'),
            status: result?.status ?? '',
            fastestLapRank: result?.FastestLap?.rank ? parseInt(result.FastestLap.rank, 10) : null,
          };
        });
        setRaceResults(parsed);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setResultsLoading(false); });
    return () => { cancelled = true; };
  }, [selectedDriver?.driverId, year]);

  const colHex = selectedDriver
    ? (CONSTRUCTOR_COLOURS_BY_ID[selectedDriver.constructorId] ?? 'aaaaaa')
    : accentColor.replace('#', '');
  const col = `#${colHex}`;
  const cR = parseInt(colHex.slice(0, 2), 16);
  const cG = parseInt(colHex.slice(2, 4), 16);
  const cB = parseInt(colHex.slice(4, 6), 16);
  const headshot = displayCode ? (headshots[displayCode] ?? null) : null;

  const podiums = raceResults.filter((r) => r.position != null && r.position <= 3).length;
  const fastestLapCount = raceResults.filter((r) => r.fastestLapRank === 1).length;
  const totalPoints = raceResults.reduce((sum, r) => sum + r.points, 0);
  const finishedRaces = raceResults.filter((r) => r.position != null);
  const avgFinish =
    finishedRaces.length > 0
      ? finishedRaces.reduce((s, r) => s + (r.position ?? 0), 0) / finishedRaces.length
      : null;

  const posColor = (pos: number | null): string => {
    if (pos === null) return '#ef4444';
    if (pos === 1) return '#ffd700';
    if (pos <= 3) return '#a0a0a0';
    if (pos <= 10) return '#4ade80';
    return 'rgba(255,255,255,0.5)';
  };

  if (driverStandings.length === 0) {
    return (
      <div className="py-16 text-center text-sm text-white/30">
        No standings data available for {year}.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* ── Hero card — mirrors RaceResultHero layout ── */}
      <div
        className="overflow-hidden rounded-2xl relative"
        style={{ background: '#0a0a0a', border: `1px solid rgba(${cR},${cG},${cB},0.22)` }}
      >
        {/* Background glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: [
              `radial-gradient(ellipse 65% 100% at -5% 50%, rgba(${cR},${cG},${cB},0.11) 0%, transparent 60%)`,
              `radial-gradient(ellipse 35% 60% at 108% 50%, rgba(${cR},${cG},${cB},0.05) 0%, transparent 60%)`,
            ].join(','),
          }}
        />
        {/* Top colour bar */}
        <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, ${col}, ${col}00 70%)` }} />

        <div className="relative grid lg:grid-cols-[300px_1fr]">
          {/* ── Left: driver portrait panel ── */}
          <div
            className="relative flex flex-col justify-end overflow-hidden p-6 lg:border-r"
            style={{ borderColor: `${col}15`, minHeight: 260 }}
          >
            {/* Floor glow */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: `radial-gradient(ellipse 100% 70% at 50% 120%, rgba(${cR},${cG},${cB},0.22) 0%, transparent 60%)` }}
            />
            {/* Full-height driver image */}
            {headshot && (
              <img
                src={hiResUrl(headshot, '6col')}
                alt={`${selectedDriver?.givenName ?? ''} ${selectedDriver?.familyName ?? ''}`.trim() || (displayCode ?? '')}
                className="absolute bottom-0 right-0 h-[90%] w-auto object-contain object-bottom pointer-events-none select-none"
                style={{ filter: `drop-shadow(0 0 36px rgba(${cR},${cG},${cB},0.4))` }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            )}
            {/* Text overlay */}
            <div className="relative z-10">
              <div
                className="mb-2 inline-flex w-fit items-center gap-1.5 rounded px-2.5 py-1 text-[10px] font-black tracking-[0.15em] uppercase"
                style={{ background: col, color: '#000' }}
              >
                P{selectedDriver?.position} · {year} Championship
              </div>
              <div
                className="font-black leading-none tracking-tighter"
                style={{ fontSize: 40, color: col, lineHeight: 1 }}
              >
                {selectedDriver?.code}
              </div>
              <div className="mt-1 text-xs font-medium text-white/40">
                {selectedDriver?.givenName} {selectedDriver?.familyName}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {(() => {
                  const logoUrl = selectedDriver ? getConstructorLogoUrl(selectedDriver.constructorId) : null;
                  return logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={selectedDriver?.constructorName ?? ''}
                      className="h-4 object-contain"
                      style={{ filter: `drop-shadow(0 0 4px rgba(${cR},${cG},${cB},0.5))` }}
                    />
                  ) : (
                    <span className="font-mono text-xs font-bold" style={{ color: col }}>
                      {selectedDriver?.constructorName}
                    </span>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* ── Right: stats + driver picker ── */}
          <div className="flex flex-col gap-4 p-5">
            {/* Stat pills */}
            <div className="flex flex-wrap gap-3">
              {[
                { label: 'Points', value: selectedDriver?.points, accent: true },
                { label: 'Wins', value: selectedDriver?.wins ?? 0, hide: !selectedDriver?.wins },
                { label: 'Podiums', value: podiums, hide: podiums === 0 },
                { label: 'Fastest Laps', value: fastestLapCount, hide: fastestLapCount === 0, purple: true },
                { label: 'Avg Finish', value: avgFinish !== null ? `P${avgFinish.toFixed(1)}` : null, hide: avgFinish === null },
              ].filter((s) => !s.hide && s.value != null).map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl px-4 py-3"
                  style={{
                    background: s.accent
                      ? `rgba(${cR},${cG},${cB},0.1)`
                      : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${s.accent ? `rgba(${cR},${cG},${cB},0.25)` : 'rgba(255,255,255,0.07)'}`,
                  }}
                >
                  <div
                    className="font-mono text-2xl font-black tabular-nums"
                    style={{ color: s.accent ? col : s.purple ? '#c084fc' : 'rgba(255,255,255,0.7)' }}
                  >
                    {s.value}
                  </div>
                  <div className="mt-0.5 text-[9px] uppercase tracking-widest text-white/30">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Driver grid */}
            <div>
              <p className="mb-2 font-mono text-[9px] uppercase tracking-widest text-white/20">{year} Grid</p>
              <div
                className="grid gap-1"
                style={{
                  gridAutoFlow: 'column',
                  gridTemplateRows: `repeat(${Math.ceil(driverStandings.length / 4)}, auto)`,
                }}
              >
                {driverStandings.map((d) => {
                  const dColHex = CONSTRUCTOR_COLOURS_BY_ID[d.constructorId] ?? 'aaaaaa';
                  const dCol = `#${dColHex}`;
                  const isSelected = d.code === displayCode;
                  const dHeadshot = headshots[d.code];
                  return (
                    <button
                      key={d.code}
                      type="button"
                      onClick={() => setSelectedCode(d.code)}
                      className="group relative flex items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-all"
                      style={{
                        background: isSelected ? `#${dColHex}20` : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${isSelected ? `#${dColHex}50` : 'rgba(255,255,255,0.05)'}`,
                      }}
                    >
                      {!isSelected && (
                        <span
                          className="pointer-events-none absolute inset-0 rounded-lg opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                          style={{ boxShadow: `inset 0 0 0 1px ${dCol}44`, background: `${dCol}0a` }}
                        />
                      )}
                      <span className="w-4 shrink-0 text-right font-mono text-[9px] text-white/20">{d.position}</span>
                      <div
                        className="h-6 w-6 shrink-0 overflow-hidden rounded"
                        style={{ border: `1.5px solid ${dCol}50`, background: `${dCol}18` }}
                      >
                        {dHeadshot ? (
                          <img src={dHeadshot} alt={d.code} className="h-full w-full object-cover object-top" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[7px] font-black" style={{ color: dCol }}>
                            {d.code.slice(0, 2)}
                          </div>
                        )}
                      </div>
                      <span
                        className="text-xs font-bold truncate"
                        style={{ color: isSelected ? dCol : 'rgba(255,255,255,0.65)' }}
                      >
                        {d.code}
                      </span>
                      <span
                        className="ml-auto shrink-0 font-mono text-[9px] tabular-nums"
                        style={{ color: isSelected ? dCol : 'rgba(255,255,255,0.2)' }}
                      >
                        {d.points}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Race-by-race results ── */}
      <div
        className="rounded-xl border p-4"
        style={{ background: '#0e0e0e', borderColor: `rgba(${cR},${cG},${cB},0.15)` }}
      >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white/70">{year} Race-by-Race</h3>
                {raceResults.length > 0 && (
                  <span className="font-mono text-[10px] text-white/25">
                    {raceResults.length} {raceResults.length === 1 ? 'race' : 'races'}
                  </span>
                )}
              </div>
              {resultsLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3" style={{ opacity: 1 - i * 0.1 }}>
                      <div className="h-3 w-6 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.08)' }} />
                      <div className="h-3 flex-1 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
                      <div className="h-3 w-8 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
                      <div className="h-3 w-8 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
                      <div className="h-3 w-10 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
                    </div>
                  ))}
                </div>
              ) : raceResults.length === 0 ? (
                <p className="py-8 text-center text-sm text-white/30">No race results available for {year}.</p>
              ) : (
                <div className="space-y-1">
                  {/* Column headers */}
                  <div
                    className="grid items-center gap-2 px-2 pb-2 font-mono text-[9px] uppercase tracking-wider text-white/20"
                    style={{ gridTemplateColumns: '1.5rem 1.75rem 1fr 2.5rem 2.5rem 3.5rem' }}
                  >
                    <span>Rd</span>
                    <span />
                    <span>Race</span>
                    <span className="text-center">Grid</span>
                    <span className="text-center">Fin.</span>
                    <span className="text-right">Pts</span>
                  </div>

                  {raceResults.map((r) => {
                    const iso3 = COUNTRY_NAME_TO_ISO3[r.circuitCountry] ?? '';
                    const flag = iso3 ? countryFlag(iso3) : '🏁';
                    const isDNF = r.position === null;
                    const pCol = posColor(r.position);
                    const isFL = r.fastestLapRank === 1;
                    const isWin = r.position === 1;
                    const isPodium = r.position != null && r.position <= 3;
                    return (
                      <div
                        key={r.round}
                        className="grid items-center gap-2 rounded-lg px-2 py-1.5"
                        style={{
                          gridTemplateColumns: '1.5rem 1.75rem 1fr 2.5rem 2.5rem 3.5rem',
                          background: isWin
                            ? 'rgba(255,215,0,0.07)'
                            : isPodium
                            ? 'rgba(255,255,255,0.03)'
                            : 'transparent',
                          border: `1px solid ${isWin ? 'rgba(255,215,0,0.12)' : isPodium ? 'rgba(255,255,255,0.05)' : 'transparent'}`,
                        }}
                      >
                        <span className="font-mono text-[10px] text-white/25">{r.round}</span>
                        <span className="text-base leading-none">{flag}</span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="truncate text-xs font-medium text-white/80">
                              {shortGPName(r.raceName)}
                            </span>
                            {isFL && (
                              <span className="shrink-0 text-[9px] font-bold text-purple-400">⚡ FL</span>
                            )}
                          </div>
                          {isDNF && (
                            <span className="text-[9px] text-red-400/70">{r.status}</span>
                          )}
                        </div>
                        <span className="text-center font-mono text-[10px] text-white/35">
                          {r.grid === 0 ? 'PL' : `P${r.grid}`}
                        </span>
                        <span
                          className="text-center font-mono text-xs font-bold"
                          style={{ color: pCol }}
                        >
                          {isDNF ? 'DNF' : `P${r.position}`}
                        </span>
                        <span
                          className="text-right font-mono text-xs font-bold"
                          style={{ color: r.points > 0 ? col : 'rgba(255,255,255,0.18)' }}
                        >
                          {r.points > 0 ? `+${r.points}` : '—'}
                        </span>
                      </div>
                    );
                  })}

                  {/* Season total row */}
                  <div
                    className="grid items-center gap-2 px-2 py-2 mt-1"
                    style={{
                      gridTemplateColumns: '1.5rem 1.75rem 1fr 2.5rem 2.5rem 3.5rem',
                      borderTop: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <span /><span />
                    <span className="font-mono text-[9px] uppercase tracking-widest text-white/20">Season total</span>
                    <span />
                    <span className="text-center font-mono text-[10px] text-white/25">
                      {avgFinish !== null ? `~P${avgFinish.toFixed(1)}` : ''}
                    </span>
                    <span
                      className="text-right font-mono text-sm font-black"
                      style={{ color: col }}
                    >
                      {totalPoints}
                    </span>
                  </div>
                </div>
              )}
            </div>
    </div>
  );
}

// ─── Main dashboard ───────────────────────────────────────────────────────────

export default function F1Dashboard() {
  const [year, setYear] = useState(2026);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<number | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'positions' | 'laptimes' | 'tyres' | 'rc'>('positions');
  const [view, setView] = useState<'championship' | 'race' | 'driver'>('championship');

  // Data
  const [drivers, setDrivers] = useState<Driver[]>([]);
  // Accumulated headshots: code → url — never cleared so standings images never flash
  const [driverHeadshots, setDriverHeadshots] = useState<Record<string, string>>({});
  const [laps, setLaps] = useState<Lap[]>([]);
  const [stints, setStints] = useState<Stint[]>([]);
  const [rcMessages, setRcMessages] = useState<RaceControlMsg[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fadeIn, setFadeIn] = useState(false);

  // Season standings (fetched from Ergast/Jolpi.ca, keyed by year)
  const [driverStandings, setDriverStandings] = useState<DriverStanding[]>([]);
  const [constructorStandings, setConstructorStandings] = useState<ConstructorStanding[]>([]);
  const [standingsLoading, setStandingsLoading] = useState(false);
  const [standingsFadeIn, setStandingsFadeIn] = useState(false);

  // Lap time chart filter — empty set means "show all"
  const [chartSelectedDrivers, setChartSelectedDrivers] = useState<Set<string>>(new Set());

  // Fade content in after data loads
  useEffect(() => {
    if (!loading && drivers.length > 0) {
      const t = setTimeout(() => setFadeIn(true), 30);
      return () => clearTimeout(t);
    } else {
      setFadeIn(false);
    }
  }, [loading, drivers.length]);

  // Fetch meetings when year changes
  useEffect(() => {
    const controller = new AbortController();
    setMeetings([]);
    setSelectedMeeting(null);
    setSessions([]);
    setSelectedSession(null);
    apiFetch<Meeting[]>(`/meetings?year=${year}`, controller.signal)
      .then((data) => {
        // sort ascending (chronological) so R1 = first race visually
        const sorted = [...data].sort((a, b) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime());
        setMeetings(sorted);
        // most recent past = last entry whose date is before now
        const mostRecentPast = [...sorted].reverse().find((m) => new Date(m.date_start).getTime() < MODULE_NOW);
        if (mostRecentPast) setSelectedMeeting(mostRecentPast.meeting_key);
        else if (sorted.length) setSelectedMeeting(sorted[0].meeting_key);
      })
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === 'AbortError') return;
        setError('Failed to load meetings');
      });
    return () => controller.abort();
  }, [year]);

  // Fetch season standings from Ergast/Jolpi.ca when year changes
  useEffect(() => {
    setDriverStandings([]);
    setConstructorStandings([]);
    setStandingsLoading(true);
    setStandingsFadeIn(false);
    let cancelled = false;

    const JOLPI = 'https://api.jolpi.ca/ergast/f1';

    Promise.all([
      fetch(`${JOLPI}/${year}/driverStandings.json`).then((r) => r.json()),
      fetch(`${JOLPI}/${year}/constructorStandings.json`).then((r) => r.json()),
    ])
      .then(([driverData, constrData]) => {
        if (cancelled) return;
        const round = driverData?.MRData?.StandingsTable?.StandingsLists?.[0]?.round;
        const rawDrivers: DriverStanding[] = (
          driverData?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ?? []
        ).map((d: ErgastDriverEntry) => ({
          position: parseInt(d.position, 10),
          points: parseFloat(d.points),
          wins: parseInt(d.wins, 10),
          code: d.Driver?.code ?? d.Driver?.driverId?.slice(0, 3).toUpperCase() ?? '',
          driverId: d.Driver?.driverId ?? '',
          givenName: d.Driver?.givenName ?? '',
          familyName: d.Driver?.familyName ?? '',
          constructorName: d.Constructors?.[0]?.name ?? '',
          constructorId: d.Constructors?.[0]?.constructorId ?? '',
          round,
        }));
        setDriverStandings(rawDrivers);

        const rawConstrs: ConstructorStanding[] = (
          constrData?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings ?? []
        ).map((c: ErgastConstructorEntry) => ({
          position: parseInt(c.position, 10),
          points: parseFloat(c.points),
          wins: parseInt(c.wins, 10),
          name: c.Constructor?.name ?? '',
          constructorId: c.Constructor?.constructorId ?? '',
        }));
        setConstructorStandings(rawConstrs);
        setStandingsLoading(false);
        setTimeout(() => setStandingsFadeIn(true), 30);
      })
      .catch(() => {
        // Non-critical — standings tab will show empty state
      });

    return () => { cancelled = true; };
  }, [year]);

  // Fetch sessions when meeting changes
  useEffect(() => {
    if (!selectedMeeting) return;
    const controller = new AbortController();
    setSessions([]);
    setSelectedSession(null);
    apiFetch<Session[]>(`/sessions?meeting_key=${selectedMeeting}`, controller.signal)
      .then((data) => {
        setSessions(data);
        const race = data.find((s) => s.session_name === 'Race') ?? data[data.length - 1];
        if (race) setSelectedSession(race.session_key);
      })
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === 'AbortError') return;
        setError('Failed to load sessions');
      });
    return () => controller.abort();
  }, [selectedMeeting]);

  // Synchronously mark loading before browser paints to prevent stale-content flash
  useLayoutEffect(() => {
    if (!selectedSession) return;
    setLoading(true);
    setFadeIn(false);
    setDrivers([]);
    setLaps([]);
    setStints([]);
    setRcMessages([]);
    setError(null);
  }, [selectedSession]);

  // Fetch session data when session changes
  useEffect(() => {
    if (!selectedSession) return;
    const controller = new AbortController();
    const { signal } = controller;
    (async () => {
      try {
        // Sequential to stay within 3 req/s rate limit
        const driversData = await apiFetch<Driver[]>(`/drivers?session_key=${selectedSession}`, signal);
        setDrivers(driversData);
        // Merge into accumulator so standings images are never lost on session switch
        setDriverHeadshots((prev) => {
          const next = { ...prev };
          driversData.forEach((d) => { if (d.headshot_url) next[d.name_acronym] = d.headshot_url; });
          return next;
        });
        const stintsData = await apiFetch<Stint[]>(`/stints?session_key=${selectedSession}`, signal);
        setStints(stintsData);
        const rcData = await apiFetch<RaceControlMsg[]>(`/race_control?session_key=${selectedSession}`, signal);
        setRcMessages(rcData);
        // Fetch all laps in a single request — no per-driver splitting needed
        const allLaps = await apiFetch<Lap[]>(`/laps?session_key=${selectedSession}`, signal);
        setLaps(allLaps);
      } catch (e: unknown) {
        if (e instanceof DOMException && e.name === 'AbortError') return;
        setError('Failed to load session data. The OpenF1 API may be rate-limiting — try again in a moment.');
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [selectedSession]);

  // ── Derived data ──────────────────────────────────────────────────────────

  const totalLaps = Math.max(0, ...laps.map((l) => l.lap_number));
  const driverMap = Object.fromEntries(drivers.map((d) => [d.driver_number, d]));

  // Position-by-lap chart data — build from stints + approximate
  // OpenF1 position endpoint is sparse, so we derive from lap order instead
  const positionChartData = (() => {
    if (!laps.length) return [];
    const lapNums = Array.from(new Set(laps.map((l) => l.lap_number))).sort((a, b) => a - b);

    // Build cumulative time per driver per lap
    const cumulative: Record<number, Record<string, number>> = {}; // driverNumber -> lapNum -> cumTime
    for (const d of drivers) {
      let sum = 0;
      cumulative[d.driver_number] = {};
      const driverLaps = laps
        .filter((l) => l.driver_number === d.driver_number)
        .sort((a, b) => a.lap_number - b.lap_number);
      for (const l of driverLaps) {
        sum += l.lap_duration ?? 0;
        cumulative[d.driver_number][l.lap_number] = sum;
      }
    }

    return lapNums.map((lapNum) => {
      const lapGroup = laps.filter((l) => l.lap_number === lapNum && l.lap_duration != null);
      const row: Record<string, number | string> = { lap: lapNum };

      // Rank drivers by cumulative time so position and gap share the same source of truth
      const cumTimesAtLap = lapGroup
        .map((l) => ({ driverNum: l.driver_number, cum: cumulative[l.driver_number]?.[lapNum] ?? null }))
        .filter((x) => x.cum != null) as { driverNum: number; cum: number }[];

      // Sort ascending by cumulative time → P1 is first
      cumTimesAtLap.sort((a, b) => a.cum - b.cum);

      if (cumTimesAtLap.length) {
        const leaderCum = cumTimesAtLap[0].cum;
        cumTimesAtLap.forEach(({ driverNum, cum }, idx) => {
          const d = driverMap[driverNum];
          if (d) {
            row[d.name_acronym] = idx + 1;
            row[`${d.name_acronym}_gap`] = Math.round((cum - leaderCum) * 1000) / 1000;
          }
        });
      }
      return row;
    });
  })();

  // Lap time scatter data
  const lapTimeData = drivers.flatMap((d) => {
    return laps
      .filter((l) => l.driver_number === d.driver_number && l.lap_duration != null && l.lap_duration > 0)
      .map((l) => ({
        lap: l.lap_number,
        time: Math.round((l.lap_duration ?? 0) * 1000) / 1000,
        driver: d.name_acronym,
        color: d.team_colour,
        isPit: l.is_pit_out_lap,
      }));
  });

  // Pre-filter per driver — exclude lap 1 (rolling/standing start), pit-out laps,
  // and statistical outliers (>130 % of the driver's own fastest lap, i.e. SC/VSC laps)
  const lapTimeDataByDriver = Object.fromEntries(
    drivers.map((d) => {
      const base = lapTimeData.filter((l) => l.driver === d.name_acronym && !l.isPit && l.lap > 1);
      const driverMin = base.length ? Math.min(...base.map((l) => l.time)) : null;
      return [d.name_acronym, driverMin ? base.filter((l) => l.time <= driverMin * 1.3) : base];
    })
  );

  // Final positions — each driver's last known position across all laps.
  // Using only the absolute last lap breaks when the race winner completes an
  // extra lap (e.g. Abu Dhabi 2023 lap 59 has only 1 driver).
  const finalPositions: Record<string, number> = {};
  for (let i = positionChartData.length - 1; i >= 0; i--) {
    const row = positionChartData[i];
    for (const [key, val] of Object.entries(row)) {
      if (key !== 'lap' && !key.endsWith('_gap') && typeof val === 'number' && !(key in finalPositions)) {
        finalPositions[key] = val;
      }
    }
    // Stop early once every driver has been assigned a position
    if (drivers.length > 0 && Object.keys(finalPositions).length >= drivers.length) break;
  }

  // Unique teams for the filter bar
  const uniqueTeams = Array.from(new Map(drivers.map((d) => [d.team_name, { name: d.team_name, colour: d.team_colour }])).values());

  // Per-driver dot style — within each team, the second driver listed gets a hollow ring
  const driverStyleMap: Record<string, boolean> = {}; // true = hollow
  const _teamSeen = new Set<string>();
  for (const d of drivers) {
    driverStyleMap[d.name_acronym] = _teamSeen.has(d.team_name);
    _teamSeen.add(d.team_name);
  }

  // Drivers visible in the scatter chart (empty selection = all)
  const visibleDrivers = chartSelectedDrivers.size === 0 ? drivers : drivers.filter((d) => chartSelectedDrivers.has(d.name_acronym));

  const toggleDriver = (acronym: string) => {
    setChartSelectedDrivers((prev) => {
      const next = new Set(prev);
      if (next.has(acronym)) next.delete(acronym); else next.add(acronym);
      return next;
    });
  };

  const toggleTeam = (teamName: string) => {
    const teamDrivers = drivers.filter((d) => d.team_name === teamName).map((d) => d.name_acronym);
    setChartSelectedDrivers((prev) => {
      const allSelected = teamDrivers.every((a) => prev.has(a));
      const next = new Set(prev);
      if (allSelected) { teamDrivers.forEach((a) => next.delete(a)); }
      else { teamDrivers.forEach((a) => next.add(a)); }
      return next;
    });
  };

  // Tight Y-axis domain: min/max of valid lap times ± 5 %
  const validTimes = visibleDrivers.flatMap((d) => lapTimeDataByDriver[d.name_acronym] ?? []).map((l) => l.time);
  const ltMin = validTimes.length ? validTimes.reduce((a, b) => Math.min(a, b)) : 0;
  const ltMax = validTimes.length ? validTimes.reduce((a, b) => Math.max(a, b)) : 200;
  const ltPad = Math.max((ltMax - ltMin) * 0.05, 2);
  const lapTimeDomain: [number, number] = [Math.floor(ltMin - ltPad), Math.ceil(ltMax + ltPad)];

  // Fastest lap per driver for summary
  const fastestLaps = drivers.map((d) => {
    const driverLaps = laps.filter((l) => l.driver_number === d.driver_number && l.lap_duration && l.lap_duration > 60);
    const best = driverLaps.reduce<number | null>((min, l) => (l.lap_duration && (!min || l.lap_duration < min) ? l.lap_duration : min), null);
    return { driver: d, best };
  }).filter((x) => x.best).sort((a, b) => (a.best ?? 0) - (b.best ?? 0));

  const overallFastest = fastestLaps[0]?.best ?? null;
  const fastestLapDriver = fastestLaps[0]?.driver ?? null;

  // Derive race winner: driver with most laps completed, tie-broken by lowest total time.
  // Falls back to fastest lap holder for non-race sessions (qualifying, practice).
  const currentSession = sessions.find((s) => s.session_key === selectedSession);
  const isRaceSession = currentSession?.session_name === 'Race' || currentSession?.session_name === 'Sprint';
  const isQualifyingSession = /qualif|shootout/i.test(currentSession?.session_name ?? '');
  const isSprint = /sprint/i.test(currentSession?.session_name ?? '');
  const selectedMeetingName = meetings.find((m) => m.meeting_key === selectedMeeting)?.meeting_name ?? '';
  const isTesting = /test/i.test(selectedMeetingName);
  const isPractice = !isTesting && /practice|fp\d/i.test(currentSession?.session_name ?? '');
  const raceWinner = isRaceSession && laps.length > 0
    ? (() => {
        const totals = drivers.map((d) => {
          const dl = laps.filter((l) => l.driver_number === d.driver_number && l.lap_duration != null);
          const totalTime = dl.reduce((s, l) => s + (l.lap_duration ?? 0), 0);
          return { driver: d, lapCount: dl.length, totalTime };
        }).filter((x) => x.lapCount > 0);
        totals.sort((a, b) => b.lapCount - a.lapCount || a.totalTime - b.totalTime);
        return totals[0]?.driver ?? null;
      })()
    : null;

  const accentDriver = raceWinner ?? fastestLapDriver;
  const accentColor = accentDriver ? `#${accentDriver.team_colour}` : '#06b6d4';

  // Championship view uses the season champion's team colour for page accents
  const champHexRaw = driverStandings[0] ? (CONSTRUCTOR_COLOURS_BY_ID[driverStandings[0].constructorId] ?? 'e10600') : 'e10600';
  const champAccentColor = `#${champHexRaw}`;
  const pageAccent = (view === 'championship' || view === 'driver') && year < MODULE_YEAR && driverStandings.length > 0
    ? champAccentColor
    : accentColor;

  // Override the page-level scrollbar with the current accent colour while this component is mounted
  useEffect(() => {
    const styleId = 'f1-scrollbar-override';
    let el = document.getElementById(styleId) as HTMLStyleElement | null;
    if (!el) {
      el = document.createElement('style');
      el.id = styleId;
      document.head.appendChild(el);
    }
    el.textContent = `
      html { scrollbar-color: ${pageAccent}55 transparent; scrollbar-width: thin; }
      html::-webkit-scrollbar { width: 6px; }
      html::-webkit-scrollbar-track { background: transparent; }
      html::-webkit-scrollbar-thumb { background: ${pageAccent}55; border-radius: 99px; }
      html::-webkit-scrollbar-thumb:hover { background: ${pageAccent}99; }
    `;
    return () => { el?.remove(); };
  }, [pageAccent]);

  // ── Podium + constructor data (race sessions only) ─────────────────────────

  const podiumDrivers = isRaceSession
    ? [1, 2, 3]
        .map((pos) => {
          const acronym = Object.entries(finalPositions).find(([, p]) => p === pos)?.[0];
          const driver = drivers.find((d) => d.name_acronym === acronym);
          return driver ? { driver, pos } : null;
        })
        .filter((x): x is { driver: Driver; pos: number } => x != null)
    : [];

  const p2Acronym = Object.entries(finalPositions).find(([, p]) => p === 2)?.[0];
  const winMargin: number | null =
    isRaceSession && p2Acronym && positionChartData.length > 0
      ? ((positionChartData[positionChartData.length - 1][`${p2Acronym}_gap`] as number | undefined) ?? null)
      : null;

  const constructorPointsMap: Record<string, { team: string; colour: string; points: number }> = {};
  if (isRaceSession) {
    for (const [acronym, pos] of Object.entries(finalPositions)) {
      const driver = drivers.find((d) => d.name_acronym === acronym);
      if (!driver) continue;
      const pts = F1_POINTS[pos] ?? 0;
      if (!constructorPointsMap[driver.team_name]) {
        constructorPointsMap[driver.team_name] = { team: driver.team_name, colour: driver.team_colour, points: 0 };
      }
      constructorPointsMap[driver.team_name].points += pts;
    }
  }
  const topConstructors = Object.values(constructorPointsMap).sort((a, b) => b.points - a.points).slice(0, 3);

  const tabs = [
    { id: 'positions' as const, label: 'Positions', show: true },
    { id: 'laptimes' as const, label: 'Lap Times', show: true },
    { id: 'tyres' as const, label: 'Tyre Strategy', show: stints.length > 0 },
    { id: 'rc' as const, label: 'Race Control', show: rcMessages.length > 0 },
  ];

  return (
    <div
      className="h-full overflow-y-auto text-white"
      style={{
        backgroundColor: '#070707',
        backgroundImage: [
          `radial-gradient(ellipse 70% 35% at 50% 0%, rgba(${parseInt(pageAccent.slice(1,3),16)},${parseInt(pageAccent.slice(3,5),16)},${parseInt(pageAccent.slice(5,7),16)},0.09) 0%, transparent 70%)`,
          `radial-gradient(ellipse 50% 40% at 100% 100%, rgba(${parseInt(pageAccent.slice(1,3),16)},${parseInt(pageAccent.slice(3,5),16)},${parseInt(pageAccent.slice(5,7),16)},0.06) 0%, transparent 65%)`,
          `radial-gradient(ellipse 40% 30% at 0% 60%, rgba(${parseInt(pageAccent.slice(1,3),16)},${parseInt(pageAccent.slice(3,5),16)},${parseInt(pageAccent.slice(5,7),16)},0.04) 0%, transparent 60%)`,
          `url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='1' cy='1' r='0.8' fill='rgba(255,255,255,0.045)'/%3E%3C/svg%3E")`,
        ].join(', '),
        backgroundSize: 'auto, auto, auto, 24px 24px',
        scrollbarColor: `${pageAccent}55 transparent`,
        scrollbarWidth: 'thin',
      } as React.CSSProperties}
    >
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8">
          <div className="mb-1 flex items-center gap-3">
            <div className="h-px w-5 rounded-full" style={{ background: pageAccent }} />
            <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/25">OpenF1 · Live Data</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter leading-[1.05] sm:text-5xl">
            {view === 'championship' || view === 'driver' ? (
              <>{year}{' '}<span className="text-white/15">{view === 'driver' ? 'Drivers' : 'Season'}</span></>
            ) : (() => {
              const name = meetings.find((m) => m.meeting_key === selectedMeeting)?.meeting_name ?? 'F1';
              const isTestName = /test/i.test(name);
              return isTestName ? name : (
                <>{name.replace(/ Grand Prix$/i, '')}{' '}<span className="text-white/15">Grand Prix</span></>
              );
            })()}
          </h1>
          {view === 'race' && currentSession && (
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <span
                className="rounded px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest"
                style={{ background: `${accentColor}18`, color: accentColor, border: `1px solid ${accentColor}30` }}
              >
                {currentSession.session_name}
              </span>
              <span className="font-mono text-xs text-white/20">
                {meetings.find((m) => m.meeting_key === selectedMeeting)?.year ?? ''}
                {meetings.find((m) => m.meeting_key === selectedMeeting)?.country_code
                  ? ` · ${meetings.find((m) => m.meeting_key === selectedMeeting)!.country_code}`
                  : ''}
              </span>
            </div>
          )}
          {/* View nav */}
          <div className="mt-5 flex gap-1 rounded-xl border border-white/5 bg-white/[0.03] p-1 w-fit">
            {(['championship', 'race', 'driver'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`rounded-lg px-5 py-1.5 text-sm font-medium transition-colors cursor-pointer capitalize ${view !== v ? 'text-white/40 hover:text-white/70' : ''}`}
                style={view === v ? { background: `${pageAccent}25`, color: pageAccent } : {}}
              >
                {v === 'championship' ? 'Championship' : v === 'race' ? 'Race' : 'Drivers'}
              </button>
            ))}
          </div>
        </div>

        {view === 'race' && (<>
        {/* Session Selector */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <F1Select
            value={year}
            onChange={(v) => setYear(Number(v))}
            options={YEARS.map((y) => ({ label: String(y), value: y }))}
            accentColor={accentColor}
            minWidth="80px"
          />

          <RacePicker
            meetings={meetings}
            value={selectedMeeting}
            onChange={(key) => setSelectedMeeting(key)}
            accentColor={accentColor}
          />

          <F1Select
            value={selectedSession ?? ''}
            onChange={(v) => setSelectedSession(Number(v))}
            options={sessions.map((s) => ({ label: s.session_name, value: s.session_key }))}
            disabled={!sessions.length}
            accentColor={accentColor}
            minWidth="140px"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <DashboardSkeleton
            accentColor={accentColor}
            meetingName={meetings.find((m) => m.meeting_key === selectedMeeting)?.meeting_name}
          />
        )}

        {/* Content */}
        {!loading && drivers.length > 0 && (
          <div
            style={{
              opacity: fadeIn ? 1 : 0,
              transform: fadeIn ? 'translateY(0)' : 'translateY(10px)',
              transition: 'opacity 0.45s ease, transform 0.45s ease',
            }}
          >
            {/* Race result hero */}
            <RaceResultHero
              isRaceSession={isRaceSession}
              podiumDrivers={podiumDrivers}
              winMargin={winMargin}
              topConstructors={topConstructors}
              meetingName={selectedMeetingName}
              year={year}
            />

            {/* Qualifying hero */}
            {isQualifyingSession && (
              <QualiResultHero
                fastestLaps={fastestLaps}
                overallFastest={overallFastest}
                accentColor={accentColor}
                isSprint={isSprint}
              />
            )}

            {/* Testing hero */}
            {isTesting && (
              <TestingHero
                fastestLaps={fastestLaps}
                overallFastest={overallFastest}
                accentColor={accentColor}
                laps={laps}
                stints={stints}
              />
            )}

            {/* Practice hero */}
            {isPractice && (
              <PracticeResultHero
                fastestLaps={fastestLaps}
                overallFastest={overallFastest}
                accentColor={accentColor}
                laps={laps}
                stints={stints}
              />
            )}

            {/* Fastest lap summary cards — hidden for qualifying/practice/testing (heroes cover this) */}
            {!isQualifyingSession && !isPractice && !isTesting && <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {fastestLaps.slice(0, 5).map(({ driver, best }, i) => {
                const delta = i > 0 && overallFastest && best ? best - overallFastest : null;
                const col = `#${driver.team_colour}`;
                const isFirst = i === 0;
                const maxDelta = ((fastestLaps[Math.min(4, fastestLaps.length - 1)]?.best ?? 0) - (overallFastest ?? 0)) || 5;
                const fillPct = delta != null ? Math.max(4, 100 - (delta / maxDelta) * 96) : 100;

                return (
                  <div
                    key={driver.driver_number}
                    className="relative isolate overflow-hidden rounded-xl flex flex-col"
                    style={{ background: '#0e0e0e', border: `1px solid ${col}25` }}
                  >
                    {/* Radial colour bleed from top-right corner */}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{ background: `radial-gradient(ellipse at 115% -15%, ${col}22 0%, transparent 58%)` }}
                    />

                    {/* Watermark position number */}
                    <div
                      className="absolute -right-2 -bottom-6 font-black leading-none select-none pointer-events-none tabular-nums"
                      style={{ fontSize: 88, color: `${col}0e` }}
                    >
                      {i + 1}
                    </div>

                    <div className="relative flex flex-col flex-1 gap-2 p-3 pb-2">
                      {/* Rank badge + team badge */}
                      <div className="flex items-center justify-between gap-1">
                        <div
                          className="inline-flex items-center justify-center rounded-sm px-1.5 h-5 text-[10px] font-black tracking-wide"
                          style={{ background: col, color: '#000' }}
                        >
                          L{i + 1}
                        </div>
                        <TeamBadge teamName={driver.team_name} teamColour={driver.team_colour} />
                      </div>

                      {/* Headshot + name */}
                      <div className="flex items-center gap-2">
                        <div
                          className="h-9 w-9 shrink-0 overflow-hidden rounded-md"
                          style={{ outline: `2px solid ${col}35`, outlineOffset: -1 }}
                        >
                          {driver.headshot_url ? (
                            <img
                              src={driver.headshot_url}
                              alt={driver.name_acronym}
                              className="h-full w-full object-cover object-top"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                          ) : (
                            <div
                              className="flex h-full w-full items-center justify-center text-xs font-black"
                              style={{ background: `${col}25`, color: col }}
                            >
                              {driver.name_acronym.slice(0, 2)}
                            </div>
                          )}
                        </div>
                        <span className="text-sm font-black tracking-tight" style={{ color: col }}>
                          {driver.name_acronym}
                        </span>
                      </div>

                      {/* Lap time — hero text */}
                      <div
                        className="font-mono font-black text-white tabular-nums"
                        style={{ fontSize: 15, letterSpacing: '-0.02em' }}
                      >
                        {formatLapTime(best)}
                      </div>

                      {/* Delta or fastest indicator */}
                      <div className="text-[11px] font-mono leading-none" style={{ color: `${col}90` }}>
                        {isFirst
                          ? <span className="text-[9px] font-black uppercase tracking-[0.12em]" style={{ color: col }}>⚡ Fastest</span>
                          : delta != null ? `+${delta.toFixed(3)}s` : '—'
                        }
                      </div>
                    </div>

                    {/* Performance bar — fills proportional to how close to fastest */}
                    <div className="mx-3 mb-3 h-px rounded-full" style={{ background: `${col}18` }}>
                      <div className="h-full rounded-full" style={{ width: `${fillPct}%`, background: col }} />
                    </div>
                  </div>
                );
              })}
            </div>}

            {/* Tabs */}
            <div className="mb-4 flex gap-1 rounded-xl border border-white/5 bg-white/3 p-1 w-fit">
              {tabs.filter((t) => t.show).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
                    activeTab !== tab.id ? 'text-white/40 hover:text-white/70' : ''
                  }`}
                  style={activeTab === tab.id ? { background: `${accentColor}25`, color: accentColor } : {}}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ── Positions tab ── */}
            {activeTab === 'positions' && (
              <div className="rounded-xl border border-white/5 bg-white/3 p-4">
                <h2 className="mb-4 text-sm font-semibold text-white/60">Position by lap</h2>
                {positionChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={360}>
                    <LineChart data={positionChartData} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="lap" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} label={{ value: 'Lap', position: 'insideBottomRight', fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} />
                      <YAxis reversed domain={[1, 20]} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} tickFormatter={(v) => `P${v}`} />
                      <Tooltip content={<LapTooltip />} />
                      {drivers.map((d) => {
                        const isFeatured = accentDriver?.driver_number === d.driver_number;
                        return (
                          <Line
                            key={d.driver_number}
                            type="monotone"
                            dataKey={d.name_acronym}
                            stroke={`#${d.team_colour}`}
                            strokeWidth={isFeatured ? 2.5 : 1.5}
                            strokeOpacity={isFeatured ? 1 : 0.6}
                            dot={false}
                            connectNulls
                            name={d.name_acronym}
                          />
                        );
                      })}
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-white/30">No lap data available for this session.</p>
                )}
              </div>
            )}

            {/* ── Lap times tab ── */}
            {activeTab === 'laptimes' && (
              <div className="rounded-xl border border-white/5 bg-white/3 p-4">
                <h2 className="mb-1 text-sm font-semibold text-white/60">Lap time distribution</h2>
                <p className="mb-3 text-xs text-white/30">Each dot is one lap. Lap 1, pit-out laps, and SC/VSC outliers excluded.</p>

                {/* Filter bar */}
                <div className="mb-4 space-y-2">
                  {/* Team row */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setChartSelectedDrivers(new Set())}
                      className="rounded-md px-3 py-1 text-xs font-semibold transition-all"
                      style={{
                        background: chartSelectedDrivers.size === 0 ? accentColor : 'rgba(255,255,255,0.05)',
                        color: chartSelectedDrivers.size === 0 ? '#000' : 'rgba(255,255,255,0.5)',
                        border: `1px solid ${chartSelectedDrivers.size === 0 ? accentColor : 'rgba(255,255,255,0.08)'}`,
                      }}
                    >
                      All
                    </button>
                    {uniqueTeams.map((team) => {
                      const teamDriverAcronyms = drivers.filter((d) => d.team_name === team.name).map((d) => d.name_acronym);
                      const allActive = teamDriverAcronyms.every((a) => chartSelectedDrivers.has(a));
                      const someActive = teamDriverAcronyms.some((a) => chartSelectedDrivers.has(a));
                      const isActive = chartSelectedDrivers.size > 0 && (allActive || someActive);
                      return (
                        <button
                          key={team.name}
                          onClick={() => toggleTeam(team.name)}
                          className="rounded-md px-3 py-1 text-xs font-semibold transition-all"
                          style={{
                            background: allActive ? `#${team.colour}` : someActive ? `#${team.colour}33` : 'rgba(255,255,255,0.05)',
                            color: allActive ? '#000' : isActive ? `#${team.colour}` : 'rgba(255,255,255,0.5)',
                            border: `1px solid ${isActive ? `#${team.colour}` : 'rgba(255,255,255,0.08)'}`,
                          }}
                        >
                          {team.name.replace('Formula 1', 'F1').replace('Haas F1 Team', 'Haas').replace('Visa Cash App RB Formula One Team', 'RB').replace('Stake F1 Team Kick Sauber', 'Sauber').replace('MoneyGram Haas F1 Team', 'Haas')}
                        </button>
                      );
                    })}
                  </div>
                  {/* Driver row */}
                  {chartSelectedDrivers.size > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {drivers.map((d) => {
                        const active = chartSelectedDrivers.has(d.name_acronym);
                        const hollow = driverStyleMap[d.name_acronym] ?? false;
                        return (
                          <button
                            key={d.driver_number}
                            onClick={() => toggleDriver(d.name_acronym)}
                            className="rounded px-2 py-0.5 text-[11px] font-mono font-semibold transition-all flex items-center gap-1"
                            style={{
                              background: active ? `#${d.team_colour}22` : 'transparent',
                              color: active ? `#${d.team_colour}` : 'rgba(255,255,255,0.25)',
                              border: `1px ${hollow ? 'dashed' : 'solid'} ${active ? `#${d.team_colour}` : 'rgba(255,255,255,0.06)'}`,
                            }}
                          >
                            <span
                              style={{
                                display: 'inline-block',
                                width: 7,
                                height: 7,
                                borderRadius: '50%',
                                background: hollow ? 'transparent' : (active ? `#${d.team_colour}` : 'rgba(255,255,255,0.2)'),
                                border: hollow ? `1.5px solid ${active ? `#${d.team_colour}` : 'rgba(255,255,255,0.2)'}` : 'none',
                                flexShrink: 0,
                              }}
                            />
                            {d.name_acronym}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                <ResponsiveContainer width="100%" height={360}>
                  <ScatterChart margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="lap" type="number" name="Lap" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} label={{ value: 'Lap', position: 'insideBottomRight', fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} />
                    <YAxis dataKey="time" type="number" name="Time" tickFormatter={formatLapTime} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} width={55} domain={lapTimeDomain} />
                    {overallFastest && (
                      <ReferenceLine y={overallFastest} stroke={accentColor} strokeDasharray="4 4" strokeOpacity={0.5} />
                    )}
                    <Tooltip
                      cursor={{ strokeDasharray: '3 3', stroke: 'rgba(255,255,255,0.1)' }}
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const d = payload[0].payload as { driver: string; time: number; lap: number; color: string };
                        return (
                          <div className="rounded-lg border border-white/10 bg-black/90 px-3 py-2 text-xs backdrop-blur-sm">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="h-2 w-2 rounded-full" style={{ background: `#${d.color}` }} />
                              <span className="font-semibold text-white">{d.driver}</span>
                            </div>
                            <div className="text-white/60">Lap {d.lap} · <span className="font-mono text-white">{formatLapTime(d.time)}</span></div>
                          </div>
                        );
                      }}
                    />
                    {visibleDrivers.map((d) => {
                      const hollow = driverStyleMap[d.name_acronym] ?? false;
                      const color = `#${d.team_colour}`;
                      return (
                        <Scatter
                          key={d.driver_number}
                          name={d.name_acronym}
                          data={lapTimeDataByDriver[d.name_acronym] ?? []}
                          fill={hollow ? 'transparent' : color}
                          stroke={color}
                          strokeWidth={hollow ? 1.5 : 0}
                          fillOpacity={hollow ? 1 : 0.75}
                          r={hollow ? 4 : 3}
                          isAnimationActive={false}
                        />
                      );
                    })}
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* ── Tyre strategy tab ── */}
            {activeTab === 'tyres' && stints.length > 0 && (
              <div className="rounded-xl border border-white/5 bg-white/3 p-4">
                <h2 className="mb-4 text-sm font-semibold text-white/60">
                  Tyre strategy{totalLaps > 0 ? ` · ${totalLaps} laps` : ''}
                </h2>
                <TyreStrategy stints={stints} drivers={drivers} totalLaps={totalLaps} finalPositions={finalPositions} accentColor={accentColor} />
              </div>
            )}

            {/* ── Race control tab ── */}
            {activeTab === 'rc' && (
              <div
                className="rounded-xl border p-5"
                style={{
                  background: '#0e0e0e',
                  borderColor: `${accentColor}22`,
                  boxShadow: `0 0 40px ${accentColor}0a`,
                }}
              >
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-sm font-semibold text-white/80 tracking-wide">Race Control</h2>
                    <p className="text-[11px] text-white/30 mt-0.5">{rcMessages.length} messages</p>
                  </div>
                  <div
                    className="text-[10px] font-mono px-2 py-1 rounded"
                    style={{ background: accentColor + '18', color: accentColor, border: `1px solid ${accentColor}33` }}
                  >
                    LIVE FEED
                  </div>
                </div>
                <RaceControlFeed messages={rcMessages} drivers={drivers} accentColor={accentColor} />
              </div>
            )}


          </div>
        )}

        {!loading && !error && drivers.length === 0 && selectedSession && (
          <p className="text-sm text-white/30">Select a session above to load data.</p>
        )}
        </>)} {/* end race view */}

        {/* ── Championship view ── */}
        {view === 'championship' && (
          <div>
            <div className="mb-6">
              <F1Select
                value={year}
                onChange={(v) => setYear(Number(v))}
                options={YEARS.map((y) => ({ label: String(y), value: y }))}
                accentColor={pageAccent}
                minWidth="80px"
              />
            </div>
            <div className="mb-4 flex items-center gap-3">
              <div className="h-px w-5 rounded-full" style={{ background: pageAccent }} />
              <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/25">{year} Championship</span>
            </div>

            {!standingsLoading && year < MODULE_YEAR && driverStandings.length > 0 && (
              <SeasonChampionHero
                driverStandings={driverStandings}
                constructorStandings={constructorStandings}
                year={year}
                headshots={driverHeadshots}
              />
            )}

            {standingsLoading ? (
              /* ── Standings skeleton ── */
              <div
                className="rounded-xl border p-5 space-y-6"
                style={{ background: '#0e0e0e', borderColor: `${accentColor}22` }}
              >
                {/* Tab pills skeleton */}
                <div className="flex gap-2 mb-2">
                  {[80, 110].map((w) => (
                    <div key={w} className="h-7 rounded-lg animate-pulse" style={{ width: w, background: `${accentColor}18` }} />
                  ))}
                </div>
                {/* Row skeletons */}
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3" style={{ opacity: 1 - i * 0.07 }}>
                    {/* Position */}
                    <div className="w-5 h-3 rounded animate-pulse bg-white/10" />
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded animate-pulse" style={{ background: `${accentColor}15` }} />
                    {/* Name block */}
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 rounded animate-pulse bg-white/10" style={{ width: `${55 + Math.random() * 30}%` }} />
                      <div className="h-2 rounded animate-pulse bg-white/5" style={{ width: `${30 + Math.random() * 20}%` }} />
                    </div>
                    {/* Points */}
                    <div className="w-10 h-3 rounded animate-pulse bg-white/10" />
                  </div>
                ))}
              </div>
            ) : (
              <div
                className="rounded-xl border p-5"
                style={{
                  background: '#0e0e0e',
                  borderColor: `${accentColor}22`,
                  boxShadow: `0 0 40px ${accentColor}0a`,
                  opacity: standingsFadeIn ? 1 : 0,
                  transform: standingsFadeIn ? 'translateY(0)' : 'translateY(8px)',
                  transition: 'opacity 0.4s ease, transform 0.4s ease',
                }}
              >
                <StandingsView
                  driverStandings={driverStandings}
                  constructorStandings={constructorStandings}
                  year={year}
                  accentColor={pageAccent}
                  headshots={driverHeadshots}
                />
              </div>
            )}
          </div>
        )}

        {/* ── Driver view ── */}
        {view === 'driver' && (
          <div>
            <div className="mb-6">
              <F1Select
                value={year}
                onChange={(v) => setYear(Number(v))}
                options={YEARS.map((y) => ({ label: String(y), value: y }))}
                accentColor={pageAccent}
                minWidth="80px"
              />
            </div>
            <div className="mb-4 flex items-center gap-3">
              <div className="h-px w-5 rounded-full" style={{ background: pageAccent }} />
              <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/25">{year} Drivers</span>
            </div>
            {standingsLoading ? (
              <div
                className="rounded-xl border p-5 space-y-4"
                style={{ background: '#0e0e0e', borderColor: `${pageAccent}22` }}
              >
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3" style={{ opacity: 1 - i * 0.07 }}>
                    <div className="h-3 w-5 rounded animate-pulse bg-white/10" />
                    <div className="h-7 w-7 rounded animate-pulse" style={{ background: `${pageAccent}15` }} />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 rounded animate-pulse bg-white/10" style={{ width: '40%' }} />
                      <div className="h-2 rounded animate-pulse bg-white/5" style={{ width: '25%' }} />
                    </div>
                    <div className="h-3 w-8 rounded animate-pulse bg-white/10" />
                  </div>
                ))}
              </div>
            ) : (
              <DriverSeasonView
                key={year}
                driverStandings={driverStandings}
                year={year}
                accentColor={pageAccent}
                headshots={driverHeadshots}
              />
            )}
          </div>
        )}

        <p className="mt-8 text-xs text-white/20">Data via <a href="https://openf1.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-white/40">OpenF1</a> · not affiliated with Formula 1</p>
      </div>
    </div>
  );
}
