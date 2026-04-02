/**
 * TTR Newcastle — seasonal snapshot script
 *
 * Scrapes standings + fixtures for all 6 Newcastle leagues and writes a
 * dated JSON file to public/data/ttr/season-{id}/YYYY-MM-DD.json.
 *
 * Also keeps public/data/ttr/season-{id}/latest.json and an index.json
 * listing every snapshot date so the frontend can discover history.
 *
 * Usage:
 *   node scripts/snapshot-ttr.mjs          # write snapshot for today
 *   node scripts/snapshot-ttr.mjs --dry-run # print to stdout, no writes
 */

import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = join(__dirname, '..');
const DRY_RUN   = process.argv.includes('--dry-run');

// ── League config ─────────────────────────────────────────────────────────────

const SEASON_ID = 95;

const LEAGUES = [
  { id: 'parks-cup',     label: 'The Parks — Cup',          leagueId: 2074, divisionId: 8151 },
  { id: 'parks-plate',   label: 'The Parks — Plate',         leagueId: 2074, divisionId: 8152 },
  { id: 'rgs-wed-cup',   label: 'RGS Newcastle Wed — Cup',   leagueId: 2075, divisionId: 8159 },
  { id: 'rgs-wed-plate', label: 'RGS Newcastle Wed — Plate', leagueId: 2075, divisionId: 8160 },
  { id: 'rgs-thu-cup',   label: 'RGS Newcastle Thu — Cup',   leagueId: 2076, divisionId: 8165 },
  { id: 'rgs-thu-plate', label: 'RGS Newcastle Thu — Plate', leagueId: 2076, divisionId: 8166 },
];

const BASE = 'https://trytagrugby.spawtz.com/Leagues';

// ── HTML parsers (mirrors api/ttr.ts) ────────────────────────────────────────

function stripHtml(s) {
  return s
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#\d+;/g, '')
    .trim();
}

function parseStandings(html) {
  const tableMatch =
    html.match(/<table[^>]*class="[^"]*STTable[^"]*"[^>]*>([\s\S]*?)<\/table>/i) ??
    html.match(/<table[^>]*>([\s\S]*?)<\/table>/i);
  if (!tableMatch) return [];

  const rows = [...tableMatch[1].matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
  const result = [];

  for (const row of rows) {
    const rawCells = [...row[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)];
    const cells = rawCells.map(c => stripHtml(c[1]));
    if (cells.length < 5 || /^(Team|Pld|W|L)$/i.test(cells[1] ?? '')) continue;
    const pos = parseInt(cells[0]);
    if (Number.isNaN(pos)) continue;
    const teamIdMatch = rawCells[1]?.[1].match(/TeamId=(\d+)/);
    const teamId = teamIdMatch ? parseInt(teamIdMatch[1]) : null;
    result.push({
      pos, teamId,
      team: cells[1] ?? '',
      pld:  parseInt(cells[2])  || 0,
      w:    parseInt(cells[3])  || 0,
      l:    parseInt(cells[4])  || 0,
      d:    parseInt(cells[5])  || 0,
      f:    parseInt(cells[8])  || 0,
      a:    parseInt(cells[9])  || 0,
      diff: parseInt(cells[10]) || 0,
      pts:  parseInt(cells[12]) || 0,
    });
  }
  return result;
}

function parseFixtures(html) {
  const results = [];
  let currentDate = '';

  const rows = [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
  for (const row of rows) {
    const cells = [...row[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map(c => stripHtml(c[1]));
    const nonEmpty = cells.filter(c => c.length > 0);

    if (nonEmpty.length === 1 && /\b20\d\d\b/.test(nonEmpty[0])) {
      currentDate = nonEmpty[0];
      continue;
    }

    if (nonEmpty.length >= 4) {
      const timeMatch = nonEmpty[0].match(/^\d{1,2}:\d{2}/);
      if (!timeMatch) continue;
      const scoreStr = nonEmpty[3];
      const scoreMatch = scoreStr.match(/^(\d+)\s*-\s*(\d+)$/);
      results.push({
        date:      currentDate,
        time:      nonEmpty[0],
        pitch:     nonEmpty[1],
        home:      nonEmpty[2],
        away:      nonEmpty[4] ?? '',
        homeScore: scoreMatch ? parseInt(scoreMatch[1]) : null,
        awayScore: scoreMatch ? parseInt(scoreMatch[2]) : null,
        played:    scoreMatch !== null,
      });
    }
  }
  return results;
}

function parseTeamProfile(html, teamId) {
  const nameMatch = html.match(/Team Profile for ([^<]+)</i);
  const name = nameMatch ? nameMatch[1].trim() : '';

  const tables = [...html.matchAll(/<table[^>]*>([\s\S]*?)<\/table>/gi)].map(m => m[1]);

  // Table 0: season fixtures + results
  const seasonMatches = [];
  if (tables[0]) {
    let pendingLabel = null;
    const rows = [...tables[0].matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
    for (const row of rows) {
      const cells = [...row[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map(c => stripHtml(c[1]));
      const nonEmpty = cells.filter(c => c.length > 0);
      if (nonEmpty.length === 1 && nonEmpty[0] &&
          !/^(Date|Time|Court|Opposition|Result)/i.test(nonEmpty[0]) &&
          !/^\d/.test(nonEmpty[0])) {
        if (/Fixtures and Results/i.test(nonEmpty[0])) continue;
        pendingLabel = nonEmpty[0];
        continue;
      }
      if (nonEmpty.length >= 4 && /\b20\d\d\b/.test(nonEmpty[0])) {
        const scoreMatch = nonEmpty[4]?.match(/^(\d+)\s*-\s*(\d+)$/);
        let result = null;
        if (scoreMatch) {
          const sf = parseInt(scoreMatch[1]), sa = parseInt(scoreMatch[2]);
          result = sf > sa ? 'W' : sf < sa ? 'L' : 'D';
        }
        seasonMatches.push({
          date:         nonEmpty[0],
          time:         nonEmpty[1],
          court:        nonEmpty[2],
          opposition:   nonEmpty[3],
          scoreFor:     scoreMatch ? parseInt(scoreMatch[1]) : null,
          scoreAgainst: scoreMatch ? parseInt(scoreMatch[2]) : null,
          result,
          label:        pendingLabel,
        });
        pendingLabel = null;
      }
    }
  }

  // Table 1: current season summary
  let currentPosition = null;
  let currentRecord = null;
  if (tables[1]) {
    const text = stripHtml(tables[1]);
    const posMatch = text.match(/Position:\s*(\d+)/i);
    const recMatch = text.match(/Won\s+(\d+),\s*Lost\s+(\d+),\s*Drawn\s+(\d+)/i);
    if (posMatch) currentPosition = parseInt(posMatch[1]);
    if (recMatch) currentRecord = { w: parseInt(recMatch[1]), l: parseInt(recMatch[2]), d: parseInt(recMatch[3]) };
  }

  // Table 3: statistics
  const emptyBlock = () => ({ avgScored: null, avgConceded: null, avgPoints: null, biggestWin: null, biggestLoss: null });
  const stats = { last3: emptyBlock(), season: emptyBlock(), allTime: emptyBlock() };
  if (tables[3]) {
    const rows = [...tables[3].matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
    for (const row of rows) {
      const cells = [...row[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map(c => stripHtml(c[1]));
      if (cells.length < 4) continue;
      const label = cells[0].toLowerCase();
      const [l3, sea, all] = [cells[1], cells[2], cells[3]];
      if (label.includes('scored'))       { stats.last3.avgScored    = parseFloat(l3)||null; stats.season.avgScored    = parseFloat(sea)||null; stats.allTime.avgScored    = parseFloat(all)||null; }
      if (label.includes('conceded'))     { stats.last3.avgConceded  = parseFloat(l3)||null; stats.season.avgConceded  = parseFloat(sea)||null; stats.allTime.avgConceded  = parseFloat(all)||null; }
      if (label.includes('points'))       { stats.last3.avgPoints    = parseFloat(l3)||null; stats.season.avgPoints    = parseFloat(sea)||null; stats.allTime.avgPoints    = parseFloat(all)||null; }
      if (label.includes('biggest win'))  { stats.last3.biggestWin   = l3||null;             stats.season.biggestWin   = sea||null;             stats.allTime.biggestWin   = all||null; }
      if (label.includes('biggest loss')) { stats.last3.biggestLoss  = l3||null;             stats.season.biggestLoss  = sea||null;             stats.allTime.biggestLoss  = all||null; }
    }
  }

  // Table 4: previous seasons
  const previousSeasons = [];
  if (tables[4]) {
    const rows = [...tables[4].matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
    for (const row of rows) {
      const rawCell = row[1].match(/<td[^>]*>([\s\S]*?)<\/td>/i);
      if (!rawCell) continue;
      const href = rawCell[1].match(/href="([^"]+)"/);
      const label = stripHtml(rawCell[1]);
      if (!label || /^(Previous Seasons|Season)$/i.test(label)) continue;
      // Only include rows that are actual season links (must have SeasonId in href)
      if (!href || !/SeasonId=\d+/i.test(href[1])) continue;
      let leagueId = null, seasonId = null, divisionId = null;
      if (href) {
        const l = href[1].match(/LeagueId=(\d+)/);   if (l) leagueId   = parseInt(l[1]);
        const s = href[1].match(/SeasonId=(\d+)/);   if (s) seasonId   = parseInt(s[1]);
        const d = href[1].match(/DivisionId=(\d+)/); if (d) divisionId = parseInt(d[1]);
      }
      previousSeasons.push({ label, leagueId, seasonId, divisionId });
    }
  }

  // Table 5: player of the match awards
  const pomAwards = [];
  if (tables[5]) {
    const rows = [...tables[5].matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
    for (const row of rows) {
      const cells = [...row[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(c => stripHtml(c[1]));
      if (cells.length < 3 || /^Player$/i.test(cells[0])) continue;
      const awards = parseInt(cells[2]);
      if (cells[0] && !Number.isNaN(awards)) {
        pomAwards.push({ player: cells[0].trim(), team: cells[1].trim(), awards });
      }
    }
  }

  return { teamId, name, currentPosition, currentRecord, seasonMatches, stats, previousSeasons, pomAwards };
}

// ── Fetch helpers ─────────────────────────────────────────────────────────────

async function fetchPage(url) {
  const ctrl  = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 12_000);
  try {
    const res = await fetch(url, {
      signal:   ctrl.signal,
      headers:  { 'User-Agent': 'Mozilla/5.0', Accept: 'text/html' },
      redirect: 'follow',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} — ${url}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

async function fetchLeague(league) {
  const common = `SportId=0&VenueId=0&LeagueId=${league.leagueId}&SeasonId=${SEASON_ID}&DivisionId=${league.divisionId}`;

  const [standingsHtml, fixturesHtml] = await Promise.all([
    fetchPage(`${BASE}/Standings?${common}`),
    fetchPage(`${BASE}/Fixtures?${common}`),
  ]);

  const standings = parseStandings(standingsHtml);
  const fixtures  = parseFixtures(fixturesHtml);

  // Fetch all team profiles in parallel
  const teamIds = [...new Set(standings.map(s => s.teamId).filter(Boolean))];
  const teamProfiles = {};
  await Promise.all(teamIds.map(async teamId => {
    const profileUrl = `${BASE}/TeamProfile?VenueId=0&LeagueId=${league.leagueId}&SeasonId=${SEASON_ID}&DivisionId=${league.divisionId}&TeamId=${teamId}`;
    try {
      const html = await fetchPage(profileUrl);
      teamProfiles[teamId] = parseTeamProfile(html, teamId);
    } catch (err) {
      teamProfiles[teamId] = { teamId, error: err.message };
    }
  }));

  return { standings, fixtures, teamProfiles };
}

// ── File helpers ──────────────────────────────────────────────────────────────

function writeJson(filePath, data) {
  if (DRY_RUN) {
    console.log(`\n── [dry-run] would write → ${filePath}`);
    return;
  }
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
  console.log(`  wrote → ${filePath}`);
}

function updateIndex(dir, date) {
  if (DRY_RUN) return;
  const indexPath = join(dir, 'index.json');
  let existing = { season: SEASON_ID, dates: [] };
  if (existsSync(indexPath)) {
    existing = JSON.parse(readFileSync(indexPath, 'utf-8'));
  }
  if (!existing.dates.includes(date)) {
    existing.dates = [...existing.dates, date].sort();
  }
  existing.latestDate = existing.dates[existing.dates.length - 1];
  writeJson(indexPath, existing);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const today = new Date().toISOString().slice(0, 10);
  const outDir = join(ROOT, 'public', 'data', 'ttr', `season-${SEASON_ID}`);

  console.log(`\nTTR Newcastle snapshot — ${today}${DRY_RUN ? ' [DRY RUN]' : ''}`);
  console.log(`Output: ${outDir}\n`);

  const snapshot = {
    capturedAt: new Date().toISOString(),
    season:     SEASON_ID,
    date:       today,
    leagues:    {},
  };

  for (const league of LEAGUES) {
    process.stdout.write(`  Fetching ${league.id} …`);
    try {
      snapshot.leagues[league.id] = await fetchLeague(league);
      const { standings: s, fixtures: f, teamProfiles: tp } = snapshot.leagues[league.id];
      const played    = Math.round(s.reduce((sum, t) => sum + t.pld, 0) / 2);
      const pomTotal  = Object.values(tp).reduce((n, p) => n + (p.pomAwards?.length ?? 0), 0);
      const prevTotal = Object.values(tp).reduce((n, p) => n + (p.previousSeasons?.length ?? 0), 0);
      console.log(` ✓  (${s.length} teams, ${played} played, ${f.length} upcoming, ${pomTotal} PoM awards, ${prevTotal} prev-season entries)`);
    } catch (err) {
      console.log(` ✗  ${err.message}`);
      snapshot.leagues[league.id] = { error: err.message, standings: [], fixtures: [], teamProfiles: {} };
    }
  }

  const snapshotPath = join(outDir, `${today}.json`);
  const latestPath   = join(outDir, 'latest.json');

  writeJson(snapshotPath, snapshot);
  writeJson(latestPath, snapshot);
  updateIndex(outDir, today);

  if (DRY_RUN) {
    console.log('\n── [dry-run] snapshot preview:');
    console.log(JSON.stringify(snapshot, null, 2).slice(0, 1200) + '\n…');
  }

  console.log('\nDone.\n');
}

main().catch(err => { console.error(err); process.exit(1); });
