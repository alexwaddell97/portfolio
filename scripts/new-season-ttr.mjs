/**
 * TTR Newcastle — new season bootstrapper
 *
 * Scrapes the TTR league list to find the real division IDs for the Newcastle
 * leagues in the next season, then updates every config location:
 *
 *   scripts/snapshot-ttr.mjs   — SEASON_ID + LEAGUES
 *   src/labs/TTRDashboard.tsx  — LEAGUES + SNAPSHOT_LEAGUE_KEY_BY_IDS
 *   api/ttr.ts                 — default seasonId
 *   public/data/ttr/season-N/  — creates index.json
 *
 * Usage:
 *   node scripts/new-season-ttr.mjs           # detect + apply
 *   node scripts/new-season-ttr.mjs --dry-run  # detect + preview, no writes
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = join(__dirname, '..');
const DRY_RUN   = process.argv.includes('--dry-run');

const LEAGUE_LIST_URL = 'https://trytagrugby.spawtz.com/ActionController/LeagueList?';

// Division name patterns to match against the league list labels
// Order must match: mon-cup, mon-plate, wed-cup, wed-plate, thu-cup, thu-plate
const DIVISION_PATTERNS = [
  { id: 'novos-mon-cup',   leagueId: 2159, pattern: /novos.*monday.*cup/i },
  { id: 'novos-mon-plate', leagueId: 2159, pattern: /novos.*monday.*plate/i },
  { id: 'novos-wed-cup',   leagueId: 2160, pattern: /novos.*wednesday.*cup/i },
  { id: 'novos-wed-plate', leagueId: 2160, pattern: /novos.*wednesday.*plate/i },
  { id: 'paddy-thu-cup',   leagueId: 2161, pattern: /paddy.*thursday.*cup/i },
  { id: 'paddy-thu-plate', leagueId: 2161, pattern: /paddy.*thursday.*plate/i },
];

// ── Read current config from snapshot-ttr.mjs ────────────────────────────────

function readCurrentConfig() {
  const snapshotPath = join(__dirname, 'snapshot-ttr.mjs');
  const src = readFileSync(snapshotPath, 'utf-8');
  const seasonMatch = src.match(/^const SEASON_ID\s*=\s*(\d+);/m);
  if (!seasonMatch) throw new Error('Could not find SEASON_ID in snapshot-ttr.mjs');
  return { seasonId: parseInt(seasonMatch[1]) };
}

// ── Fetch league list and extract Newcastle division IDs ─────────────────────

async function detectNewSeasonIds(newSeason) {
  console.log(`  Fetching league list…`);
  const ctrl  = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 15_000);
  let html;
  try {
    const res = await fetch(LEAGUE_LIST_URL, {
      signal:  ctrl.signal,
      headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'text/html' },
      redirect: 'follow',
    });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    html = await res.text();
  } catch (err) {
    clearTimeout(timer);
    throw new Error(`Failed to fetch league list: ${err.message}`);
  }

  // Extract all entries: { leagueId, seasonId, divisionId, label }
  // Each row looks like: LeagueId=NNNN&SeasonId=NN&DivisionId=NNNN
  const entryRe = /LeagueId=(\d+)[^"]*SeasonId=(\d+)[^"]*DivisionId=(\d+)/g;
  const entries = [];
  for (const m of html.matchAll(entryRe)) {
    entries.push({ leagueId: parseInt(m[1]), seasonId: parseInt(m[2]), divisionId: parseInt(m[3]) });
  }

  // Also extract division name labels — they appear in SpawtzLeagueListDivisionName spans
  // We'll associate them by position with the hrefs above
  const labelRe = /class="SpawtzLeagueListDivisionName">([^<]+)</g;
  const labels = [...html.matchAll(labelRe)].map(m => m[1].trim());

  // Build labeled entries by matching positions (each entry appears twice — fixtures + standings)
  // Deduplicate by divisionId
  const seen = new Set();
  const deduped = [];
  for (const entry of entries) {
    if (!seen.has(entry.divisionId)) {
      seen.add(entry.divisionId);
      deduped.push(entry);
    }
  }

  // Filter to only new season entries
  const newSeasonEntries = deduped.filter(e => e.seasonId === newSeason);

  if (newSeasonEntries.length === 0) {
    throw new Error(`No entries found for season ${newSeason} on the league list. The new season may not be published yet.`);
  }

  // Match labels to entries (labels and deduped entries are in the same DOM order)
  // We need to re-pair them — extract label+ids together from the HTML
  const rowRe = /class="SpawtzLeagueListDivisionName">([^<]+)<[\s\S]*?LeagueId=(\d+)[^"]*SeasonId=(\d+)[^"]*DivisionId=(\d+)/g;
  const rows = [];
  for (const m of html.matchAll(rowRe)) {
    rows.push({ label: m[1].trim(), leagueId: parseInt(m[2]), seasonId: parseInt(m[3]), divisionId: parseInt(m[4]) });
  }

  const newSeasonRows = rows.filter(r => r.seasonId === newSeason);
  console.log(`  Found ${newSeasonRows.length} divisions for season ${newSeason} on league list\n`);

  // Match each expected division pattern against the rows
  const result = [];
  for (const def of DIVISION_PATTERNS) {
    const match = newSeasonRows.find(r => r.leagueId === def.leagueId && def.pattern.test(r.label));
    if (!match) {
      throw new Error(
        `Could not find division matching "${def.pattern}" (leagueId ${def.leagueId}) for season ${newSeason}.\n` +
        `Available labels for this leagueId: ${newSeasonRows.filter(r => r.leagueId === def.leagueId).map(r => `"${r.label}"`).join(', ')}`
      );
    }
    console.log(`  ✓ ${def.id.padEnd(18)} → divisionId ${match.divisionId}  ("${match.label}")`);
    result.push({ ...def, divisionId: match.divisionId, seasonId: newSeason });
  }

  return result;
}

// ── Patch files ───────────────────────────────────────────────────────────────

function patch(filePath, oldStr, newStr, label) {
  const src = readFileSync(filePath, 'utf-8');
  if (!src.includes(oldStr)) {
    throw new Error(`patch failed — expected string not found in ${label}:\n${oldStr}`);
  }
  const patched = src.replace(oldStr, newStr);
  if (DRY_RUN) {
    console.log(`\n── [dry-run] ${label}`);
    console.log(`   ${filePath}`);
    return;
  }
  writeFileSync(filePath, patched, 'utf-8');
  console.log(`  patched  ${filePath}`);
}

// ── Build LEAGUES strings ─────────────────────────────────────────────────────

function buildSnapshotLeagues(divs) {
  const [mc, mp, wc, wp, tc, tp] = divs.map(d => d.divisionId);
  return `const LEAGUES = [
  { id: 'novos-mon-cup',   label: 'Novocastrians Mon — Cup',    leagueId: 2159, divisionId: ${mc} },
  { id: 'novos-mon-plate', label: 'Novocastrians Mon — Plate',  leagueId: 2159, divisionId: ${mp} },
  { id: 'novos-wed-cup',   label: 'Novocastrians Wed — Cup',    leagueId: 2160, divisionId: ${wc} },
  { id: 'novos-wed-plate', label: 'Novocastrians Wed — Plate',  leagueId: 2160, divisionId: ${wp} },
  { id: 'paddy-thu-cup',   label: "Paddy Freeman's Thu — Cup",   leagueId: 2161, divisionId: ${tc} },
  { id: 'paddy-thu-plate', label: "Paddy Freeman's Thu — Plate", leagueId: 2161, divisionId: ${tp} },
];`;
}

function buildDashboardLeagues(newSeason, divs) {
  const [mc, mp, wc, wp, tc, tp] = divs.map(d => d.divisionId);
  return `const LEAGUES: LeagueConfig[] = [
  { id: 'novos-mon-cup',   label: 'Novocastrians Mon — Cup',    shortLabel: 'Novos Mon Cup',   leagueId: 2159, divisionId: ${mc}, seasonId: ${newSeason}, venue: 'novos-mon', division: 'cup'   },
  { id: 'novos-mon-plate', label: 'Novocastrians Mon — Plate',  shortLabel: 'Novos Mon Plate', leagueId: 2159, divisionId: ${mp}, seasonId: ${newSeason}, venue: 'novos-mon', division: 'plate' },
  { id: 'novos-wed-cup',   label: 'Novocastrians Wed — Cup',    shortLabel: 'Novos Wed Cup',   leagueId: 2160, divisionId: ${wc}, seasonId: ${newSeason}, venue: 'novos-wed', division: 'cup'   },
  { id: 'novos-wed-plate', label: 'Novocastrians Wed — Plate',  shortLabel: 'Novos Wed Plate', leagueId: 2160, divisionId: ${wp}, seasonId: ${newSeason}, venue: 'novos-wed', division: 'plate' },
  { id: 'paddy-thu-cup',   label: "Paddy Freeman's Thu — Cup",   shortLabel: 'Paddy Thu Cup',   leagueId: 2161, divisionId: ${tc}, seasonId: ${newSeason}, venue: 'paddy-thu', division: 'cup'   },
  { id: 'paddy-thu-plate', label: "Paddy Freeman's Thu — Plate", shortLabel: 'Paddy Thu Plate', leagueId: 2161, divisionId: ${tp}, seasonId: ${newSeason}, venue: 'paddy-thu', division: 'plate' },
];`;
}

function buildSnapshotLeagueKeys(newSeason, divs) {
  const [mc, mp, wc, wp, tc, tp] = divs.map(d => d.divisionId);
  return `  '${newSeason}:2159:${mc}': 'novos-mon-cup',
  '${newSeason}:2159:${mp}': 'novos-mon-plate',
  '${newSeason}:2160:${wc}': 'novos-wed-cup',
  '${newSeason}:2160:${wp}': 'novos-wed-plate',
  '${newSeason}:2161:${tc}': 'paddy-thu-cup',
  '${newSeason}:2161:${tp}': 'paddy-thu-plate',`;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\nTTR Newcastle — new season bootstrapper\n');

  // 1. Read current config
  const { seasonId: currentSeason } = readCurrentConfig();
  const newSeason = currentSeason + 1;

  console.log(`  Current season : ${currentSeason}`);
  console.log(`  Detecting season : ${newSeason}…\n`);

  // 2. Scrape league list for real division IDs
  const divs = await detectNewSeasonIds(newSeason);

  console.log(`\n  ✓ All 6 divisions found for season ${newSeason}\n`);

  if (DRY_RUN) {
    console.log('── [dry-run] would apply the following changes:\n');
  }

  // 3. Patch snapshot-ttr.mjs
  const snapshotPath = join(__dirname, 'snapshot-ttr.mjs');
  const snapshotSrc  = readFileSync(snapshotPath, 'utf-8');

  patch(
    snapshotPath,
    snapshotSrc.match(/const SEASON_ID\s*=\s*\d+;/)[0],
    `const SEASON_ID = ${newSeason};`,
    'snapshot-ttr.mjs — SEASON_ID',
  );

  const oldSnapshotLeagues = snapshotSrc.match(/const LEAGUES = \[[\s\S]*?\];/)[0];
  patch(
    snapshotPath,
    oldSnapshotLeagues,
    buildSnapshotLeagues(divs),
    'snapshot-ttr.mjs — LEAGUES',
  );

  // 4. Patch TTRDashboard.tsx
  const dashPath = join(ROOT, 'src', 'labs', 'TTRDashboard.tsx');
  const dashSrc  = readFileSync(dashPath, 'utf-8');

  const oldDashLeagues = dashSrc.match(/const LEAGUES: LeagueConfig\[\] = \[[\s\S]*?\];/)[0];
  patch(
    dashPath,
    oldDashLeagues,
    buildDashboardLeagues(newSeason, divs),
    'TTRDashboard.tsx — LEAGUES',
  );

  // Prepend new season entries to SNAPSHOT_LEAGUE_KEY_BY_IDS
  const currentSeason96Line = `  '${currentSeason}:2159:`;
  const oldKeysBlock = dashSrc.match(new RegExp(`('${currentSeason}:\\d+:\\d+': '[\\s\\S]*?),\\s*\n  '9[0-9]`))?.[0];
  // Simpler: find the first line of the current season block and prepend before it
  const currentFirstKey = `  '${currentSeason}:2159:`;
  const currentFirstKeyIdx = dashSrc.indexOf(currentFirstKey);
  if (currentFirstKeyIdx !== -1) {
    const insertBefore = dashSrc.slice(currentFirstKeyIdx, currentFirstKeyIdx + currentFirstKey.length + 50).split('\n')[0];
    patch(
      dashPath,
      insertBefore,
      buildSnapshotLeagueKeys(newSeason, divs) + '\n' + insertBefore,
      'TTRDashboard.tsx — SNAPSHOT_LEAGUE_KEY_BY_IDS',
    );
  }

  // 5. Patch api/ttr.ts
  const apiPath = join(ROOT, 'api', 'ttr.ts');
  const apiSrc  = readFileSync(apiPath, 'utf-8');
  const oldDefault = apiSrc.match(/const seasonId\s*=\s*q\.seasonId \?\? '\d+';/)[0];
  patch(
    apiPath,
    oldDefault,
    `const seasonId   = q.seasonId ?? '${newSeason}';`,
    'api/ttr.ts — default seasonId',
  );

  // 6. Create season-N/index.json
  const indexDir  = join(ROOT, 'public', 'data', 'ttr', `season-${newSeason}`);
  const indexPath = join(indexDir, 'index.json');
  const indexData = JSON.stringify({ season: newSeason, dates: [], latestDate: null }, null, 2) + '\n';

  if (DRY_RUN) {
    console.log(`\n── [dry-run] would create → ${indexPath}`);
    console.log(indexData);
  } else {
    if (existsSync(indexPath)) {
      console.log(`  exists   ${indexPath} (skipped)`);
    } else {
      mkdirSync(indexDir, { recursive: true });
      writeFileSync(indexPath, indexData, 'utf-8');
      console.log(`  created  ${indexPath}`);
    }
  }

  console.log(`\nDone. Run  node scripts/snapshot-ttr.mjs  to capture the first snapshot.\n`);
}

main().catch(err => { console.error('\n' + err.message); process.exit(1); });
