/**
 * TTR Newcastle — new season bootstrapper
 *
 * Probes the TTR website for the next season, verifies division IDs,
 * then updates every config location so you can immediately start snapshotting:
 *
 *   scripts/snapshot-ttr.mjs   — SEASON_ID + LEAGUES
 *   src/labs/TTRDashboard.tsx  — LEAGUES
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

const BASE = 'https://trytagrugby.spawtz.com/Leagues';

// ── The three leagues whose IDs stay constant across seasons ──────────────────

const LEAGUE_DEFS = [
  { leagueId: 2159, venue: 'novos-mon', cupId: 'novos-mon-cup',   plateId: 'novos-mon-plate', cupLabel: 'Novocastrians Mon — Cup',    plateLabel: 'Novocastrians Mon — Plate' },
  { leagueId: 2160, venue: 'novos-wed', cupId: 'novos-wed-cup',   plateId: 'novos-wed-plate', cupLabel: 'Novocastrians Wed — Cup',    plateLabel: 'Novocastrians Wed — Plate' },
  { leagueId: 2161, venue: 'paddy-thu', cupId: 'paddy-thu-cup',   plateId: 'paddy-thu-plate', cupLabel: "Paddy Freeman's Thu — Cup",  plateLabel: "Paddy Freeman's Thu — Plate" },
];

// ── Read current config from snapshot-ttr.mjs ────────────────────────────────

function readCurrentConfig() {
  const snapshotPath = join(__dirname, 'snapshot-ttr.mjs');
  const src = readFileSync(snapshotPath, 'utf-8');

  const seasonMatch = src.match(/^const SEASON_ID\s*=\s*(\d+);/m);
  if (!seasonMatch) throw new Error('Could not find SEASON_ID in snapshot-ttr.mjs');

  // Extract all divisionIds from the LEAGUES array
  const divMatches = [...src.matchAll(/divisionId:\s*(\d+)/g)];
  if (divMatches.length !== 6) throw new Error(`Expected 6 divisionId entries, found ${divMatches.length}`);

  return {
    seasonId: parseInt(seasonMatch[1]),
    // Division IDs are ordered: mon-cup, mon-plate, wed-cup, wed-plate, thu-cup, thu-plate
    divisionIds: divMatches.map(m => parseInt(m[1])),
  };
}

// ── Probe a single standings page to verify it's valid ───────────────────────

async function probe(leagueId, seasonId, divisionId) {
  const url = `${BASE}/Standings?SportId=0&VenueId=0&LeagueId=${leagueId}&SeasonId=${seasonId}&DivisionId=${divisionId}`;
  const ctrl  = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 10_000);
  try {
    const res = await fetch(url, {
      signal:  ctrl.signal,
      headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'text/html' },
      redirect: 'follow',
    });
    clearTimeout(timer);
    if (!res.ok) return { ok: false };
    const html = await res.text();
    // A valid standings page contains a division heading; a stale/missing one doesn't
    const hasStandings = /Current Standings/i.test(html);
    return { ok: hasStandings };
  } catch {
    clearTimeout(timer);
    return { ok: false };
  }
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

function buildSnapshotLeagues(newDivIds) {
  const [mc, mp, wc, wp, tc, tp] = newDivIds;
  return `const LEAGUES = [
  { id: 'novos-mon-cup',   label: 'Novocastrians Mon — Cup',    leagueId: 2159, divisionId: ${mc} },
  { id: 'novos-mon-plate', label: 'Novocastrians Mon — Plate',  leagueId: 2159, divisionId: ${mp} },
  { id: 'novos-wed-cup',   label: 'Novocastrians Wed — Cup',    leagueId: 2160, divisionId: ${wc} },
  { id: 'novos-wed-plate', label: 'Novocastrians Wed — Plate',  leagueId: 2160, divisionId: ${wp} },
  { id: 'paddy-thu-cup',   label: "Paddy Freeman's Thu — Cup",   leagueId: 2161, divisionId: ${tc} },
  { id: 'paddy-thu-plate', label: "Paddy Freeman's Thu — Plate", leagueId: 2161, divisionId: ${tp} },
];`;
}

function buildDashboardLeagues(newSeasonId, newDivIds) {
  const [mc, mp, wc, wp, tc, tp] = newDivIds;
  return `const LEAGUES: LeagueConfig[] = [
  { id: 'novos-mon-cup',   label: 'Novocastrians Mon — Cup',    shortLabel: 'Novos Mon Cup',   leagueId: 2159, divisionId: ${mc}, seasonId: ${newSeasonId}, venue: 'novos-mon', division: 'cup'   },
  { id: 'novos-mon-plate', label: 'Novocastrians Mon — Plate',  shortLabel: 'Novos Mon Plate', leagueId: 2159, divisionId: ${mp}, seasonId: ${newSeasonId}, venue: 'novos-mon', division: 'plate' },
  { id: 'novos-wed-cup',   label: 'Novocastrians Wed — Cup',    shortLabel: 'Novos Wed Cup',   leagueId: 2160, divisionId: ${wc}, seasonId: ${newSeasonId}, venue: 'novos-wed', division: 'cup'   },
  { id: 'novos-wed-plate', label: 'Novocastrians Wed — Plate',  shortLabel: 'Novos Wed Plate', leagueId: 2160, divisionId: ${wp}, seasonId: ${newSeasonId}, venue: 'novos-wed', division: 'plate' },
  { id: 'paddy-thu-cup',   label: "Paddy Freeman's Thu — Cup",   shortLabel: 'Paddy Thu Cup',   leagueId: 2161, divisionId: ${tc}, seasonId: ${newSeasonId}, venue: 'paddy-thu', division: 'cup'   },
  { id: 'paddy-thu-plate', label: "Paddy Freeman's Thu — Plate", shortLabel: 'Paddy Thu Plate', leagueId: 2161, divisionId: ${tp}, seasonId: ${newSeasonId}, venue: 'paddy-thu', division: 'plate' },
];`;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\nTTR Newcastle — new season bootstrapper\n');

  // 1. Read current config
  const { seasonId: currentSeason, divisionIds: currentDivIds } = readCurrentConfig();
  const newSeason    = currentSeason + 1;
  const currentMaxDiv = Math.max(...currentDivIds);

  console.log(`  Current season : ${currentSeason}  (divisionIds ${Math.min(...currentDivIds)}–${currentMaxDiv})`);
  console.log(`  Probing season : ${newSeason}…\n`);

  // 2. Division IDs increment by 6 each season (one per division across all 3 leagues).
  //    Probe candidate IDs starting from currentMaxDiv + 1.
  const candidateStart = currentMaxDiv + 1;
  const candidateIds   = [0, 1, 2, 3, 4, 5].map(i => candidateStart + i);

  // Verify each candidate belongs to the expected leagueId
  // Order: mon-cup(2159), mon-plate(2159), wed-cup(2160), wed-plate(2160), thu-cup(2161), thu-plate(2161)
  const leagueIdForCandidate = [2159, 2159, 2160, 2160, 2161, 2161];

  process.stdout.write('  Verifying division IDs:');
  const results = await Promise.all(
    candidateIds.map((divId, i) => probe(leagueIdForCandidate[i], newSeason, divId))
  );

  const allOk = results.every(r => r.ok);

  results.forEach((r, i) => {
    process.stdout.write(` ${candidateIds[i]}${r.ok ? '✓' : '✗'}`);
  });
  console.log('');

  if (!allOk) {
    const failed = candidateIds.filter((_, i) => !results[i].ok);
    console.error(`\n  ✗ Season ${newSeason} could not be confirmed — failed division IDs: ${failed.join(', ')}`);
    console.error('    The season may not have started yet, or the division IDs have changed.');
    console.error('    Check https://trytagrugby.spawtz.com manually and update snapshot-ttr.mjs by hand.\n');
    process.exit(1);
  }

  console.log(`\n  ✓ Season ${newSeason} confirmed (divisionIds ${candidateStart}–${candidateStart + 5})\n`);

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
    buildSnapshotLeagues(candidateIds),
    'snapshot-ttr.mjs — LEAGUES',
  );

  // 4. Patch TTRDashboard.tsx
  const dashPath = join(ROOT, 'src', 'labs', 'TTRDashboard.tsx');
  const dashSrc  = readFileSync(dashPath, 'utf-8');
  const oldDashLeagues = dashSrc.match(/const LEAGUES: LeagueConfig\[\] = \[[\s\S]*?\];/)[0];
  patch(
    dashPath,
    oldDashLeagues,
    buildDashboardLeagues(newSeason, candidateIds),
    'TTRDashboard.tsx — LEAGUES',
  );

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
