import type { IncomingMessage, ServerResponse } from 'node:http';

const BASE = 'https://trytagrugby.spawtz.com/Leagues';

function stripHtml(s: string) {
  return s
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ').replace(/&#\d+;/g, '')
    .trim();
}

// ── Standings ─────────────────────────────────────────────────────────────────

function parseStandings(html: string) {
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

    // Extract teamId from the anchor href in the team name cell
    const teamIdMatch = rawCells[1]?.[1].match(/TeamId=(\d+)/);
    const teamId = teamIdMatch ? parseInt(teamIdMatch[1]) : null;

    result.push({
      pos,
      teamId,
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

// ── Fixtures ──────────────────────────────────────────────────────────────────

function parseFixtures(html: string) {
  const results: {
    date: string; time: string; pitch: string;
    home: string; away: string;
    homeScore: number | null; awayScore: number | null; played: boolean;
  }[] = [];
  let currentDate = '';

  const rows = [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
  for (const row of rows) {
    const cells = [...row[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)]
      .map(c => stripHtml(c[1]));
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
        date: currentDate,
        time: nonEmpty[0],
        pitch: nonEmpty[1],
        home: nonEmpty[2],
        away: nonEmpty[4] ?? '',
        homeScore: scoreMatch ? parseInt(scoreMatch[1]) : null,
        awayScore: scoreMatch ? parseInt(scoreMatch[2]) : null,
        played: scoreMatch !== null,
      });
    }
  }
  return results;
}

// ── Team profile ──────────────────────────────────────────────────────────────

function parseTeamProfile(html: string, teamId: number) {
  // Team name from heading
  const nameMatch = html.match(/Team Profile for ([^<]+)</i);
  const name = nameMatch ? nameMatch[1].trim() : '';

  const tables = [...html.matchAll(/<table[^>]*>([\s\S]*?)<\/table>/gi)].map(m => m[1]);

  // ── Table 0: season fixtures + results
  const seasonMatches: {
    date: string; time: string; court: string;
    opposition: string; scoreFor: number | null; scoreAgainst: number | null;
    result: 'W' | 'L' | 'D' | null; label: string | null;
  }[] = [];

  if (tables[0]) {
    let pendingLabel: string | null = null;
    const rows = [...tables[0].matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
    for (const row of rows) {
      const cells = [...row[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)]
        .map(c => stripHtml(c[1]));
      const nonEmpty = cells.filter(c => c.length > 0);

      // Section label (e.g. "Grand Final", "3rd vs 4th") — skip generic headings
      if (nonEmpty.length === 1 && nonEmpty[0] && !/^(Date|Time|Court|Opposition|Result)/i.test(nonEmpty[0]) && !/^\d/.test(nonEmpty[0])) {
        if (/Fixtures and Results/i.test(nonEmpty[0])) continue;
        pendingLabel = nonEmpty[0];
        continue;
      }

      if (nonEmpty.length >= 4 && /\b20\d\d\b/.test(nonEmpty[0])) {
        const scoreMatch = nonEmpty[4]?.match(/^(\d+)\s*-\s*(\d+)$/);
        let result: 'W' | 'L' | 'D' | null = null;
        if (scoreMatch) {
          const sf = parseInt(scoreMatch[1]), sa = parseInt(scoreMatch[2]);
          result = sf > sa ? 'W' : sf < sa ? 'L' : 'D';
        }
        seasonMatches.push({
          date:           nonEmpty[0],
          time:           nonEmpty[1],
          court:          nonEmpty[2],
          opposition:     nonEmpty[3],
          scoreFor:       scoreMatch ? parseInt(scoreMatch[1]) : null,
          scoreAgainst:   scoreMatch ? parseInt(scoreMatch[2]) : null,
          result,
          label:          pendingLabel,
        });
        pendingLabel = null;
      }
    }
  }

  // ── Table 1: current season summary
  let currentPosition: number | null = null;
  let currentRecord: { w: number; l: number; d: number } | null = null;
  if (tables[1]) {
    const text = stripHtml(tables[1]);
    const posMatch   = text.match(/Position:\s*(\d+)/i);
    const recMatch   = text.match(/Won\s+(\d+),\s*Lost\s+(\d+),\s*Drawn\s+(\d+)/i);
    if (posMatch)  currentPosition = parseInt(posMatch[1]);
    if (recMatch)  currentRecord   = { w: parseInt(recMatch[1]), l: parseInt(recMatch[2]), d: parseInt(recMatch[3]) };
  }

  // ── Table 3: statistics (last3 / season / allTime)
  interface StatBlock { avgScored: number | null; avgConceded: number | null; avgPoints: number | null; biggestWin: string | null; biggestLoss: string | null; }
  const emptyBlock = (): StatBlock => ({ avgScored: null, avgConceded: null, avgPoints: null, biggestWin: null, biggestLoss: null });
  const stats: { last3: StatBlock; season: StatBlock; allTime: StatBlock } = { last3: emptyBlock(), season: emptyBlock(), allTime: emptyBlock() };

  if (tables[3]) {
    const rows = [...tables[3].matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
    for (const row of rows) {
      const cells = [...row[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)]
        .map(c => stripHtml(c[1]));
      if (cells.length < 4) continue;
      const label = cells[0].toLowerCase();
      const [l3, sea, all] = [cells[1], cells[2], cells[3]];
      if (label.includes('scored'))    { stats.last3.avgScored    = parseFloat(l3)||null; stats.season.avgScored    = parseFloat(sea)||null; stats.allTime.avgScored    = parseFloat(all)||null; }
      if (label.includes('conceded'))  { stats.last3.avgConceded  = parseFloat(l3)||null; stats.season.avgConceded  = parseFloat(sea)||null; stats.allTime.avgConceded  = parseFloat(all)||null; }
      if (label.includes('points'))    { stats.last3.avgPoints    = parseFloat(l3)||null; stats.season.avgPoints    = parseFloat(sea)||null; stats.allTime.avgPoints    = parseFloat(all)||null; }
      if (label.includes('biggest win'))  { stats.last3.biggestWin  = l3||null; stats.season.biggestWin  = sea||null; stats.allTime.biggestWin  = all||null; }
      if (label.includes('biggest loss')) { stats.last3.biggestLoss = l3||null; stats.season.biggestLoss = sea||null; stats.allTime.biggestLoss = all||null; }
    }
  }

  // ── Table 4: previous seasons
  const previousSeasons: { label: string; leagueId: number | null; seasonId: number | null; divisionId: number | null }[] = [];
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
      let leagueId: number | null = null, seasonId: number | null = null, divisionId: number | null = null;
      if (href) {
        const l = href[1].match(/LeagueId=(\d+)/);   if (l) leagueId   = parseInt(l[1]);
        const s = href[1].match(/SeasonId=(\d+)/);   if (s) seasonId   = parseInt(s[1]);
        const d = href[1].match(/DivisionId=(\d+)/); if (d) divisionId = parseInt(d[1]);
      }
      previousSeasons.push({ label, leagueId, seasonId, divisionId });
    }
  }

  // ── Table 5: player of the match awards
  const pomAwards: { player: string; team: string; awards: number }[] = [];
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

// ── Handler ───────────────────────────────────────────────────────────────────

type Req = IncomingMessage & { query: Record<string, string | string[] | undefined> };
type Res = ServerResponse & {
  status: (code: number) => Res;
  json: (body: unknown) => void;
  end: () => void;
};

export default async function handler(req: Req, res: Res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const q = req.query as Record<string, string | undefined>;
  const leagueId   = q.leagueId;
  const divisionId = q.divisionId;
  const seasonId   = q.seasonId ?? '95';
  const teamId     = q.teamId;
  const type       = q.type;

  // ── Team profile
  if (type === 'team-profile') {
    if (!leagueId || !divisionId || !teamId) {
      res.status(400).json({ error: 'Missing leagueId, divisionId or teamId' }); return;
    }
    const url = `${BASE}/TeamProfile?VenueId=0&LeagueId=${leagueId}&SeasonId=${seasonId}&DivisionId=${divisionId}&TeamId=${teamId}`;
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 8000);
      const upstream = await fetch(url, {
        signal: ctrl.signal,
        headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'text/html' },
        redirect: 'follow',
      });
      clearTimeout(timer);
      if (!upstream.ok) throw new Error(`Upstream ${upstream.status}`);
      const html = await upstream.text();
      const data = parseTeamProfile(html, parseInt(teamId));
      res.status(200).json({ data }); return;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(502).json({ error: msg }); return;
    }
  }

  // ── Standings / Fixtures
  if (!leagueId || !divisionId || !type) {
    res.status(400).json({ error: 'Missing leagueId, divisionId or type' }); return;
  }

  const path = type === 'standings' ? 'Standings' : 'Fixtures';
  const url = `${BASE}/${path}?SportId=0&VenueId=0&LeagueId=${leagueId}&SeasonId=${seasonId}&DivisionId=${divisionId}`;

  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    const upstream = await fetch(url, {
      signal: ctrl.signal,
      headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'text/html' },
      redirect: 'follow',
    });
    clearTimeout(timer);
    if (!upstream.ok) throw new Error(`Upstream ${upstream.status}`);
    const html = await upstream.text();
    const data = type === 'standings' ? parseStandings(html) : parseFixtures(html);
    res.status(200).json({ data }); return;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(502).json({ error: msg }); return;
  }
}

