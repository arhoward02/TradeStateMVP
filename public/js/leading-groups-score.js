/**
 * Leading Groups scoring — Industry ranks + Theme % returns.
 * Weights: 1M 45% / 1W 35% / 3M 20% (renormalize over available).
 * Tags: LEADING (top 5) > REEMERGING > HEATING UP (one tag per row).
 *
 * Universes:
 * - Industry: Deepvue ranks are always out of 73 (even if only ~31 rows are pasted).
 * - Themes: placement among the pasted batch (normally all 31 themes).
 */

const WEIGHTS = { p1m: 0.45, p1w: 0.35, p3m: 0.2 };
const INDUSTRY_UNIVERSE = 73;
const THEME_UNIVERSE = 31;

function isPresent(v) {
  return v !== null && v !== undefined && v !== '' && !Number.isNaN(Number(v));
}

function round1(n) {
  if (n === null || n === undefined || Number.isNaN(n)) return null;
  return Math.round(n * 10) / 10;
}

function compositeScore(p1w, p1m, p3m) {
  let sum = 0;
  let wSum = 0;
  if (isPresent(p1m)) {
    sum += Number(p1m) * WEIGHTS.p1m;
    wSum += WEIGHTS.p1m;
  }
  if (isPresent(p1w)) {
    sum += Number(p1w) * WEIGHTS.p1w;
    wSum += WEIGHTS.p1w;
  }
  if (isPresent(p3m)) {
    sum += Number(p3m) * WEIGHTS.p3m;
    wSum += WEIGHTS.p3m;
  }
  if (wSum === 0) return null;
  return sum / wSum;
}

function normalizeKey(name) {
  return String(name || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

/** Split a CSV line, honoring double-quoted fields. */
function splitCsvLine(line) {
  const cols = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (c === ',' && !inQuotes) {
      cols.push(cur.trim());
      cur = '';
      continue;
    }
    cur += c;
  }
  cols.push(cur.trim());
  return cols;
}

/**
 * Parse CSV text: Name, 1W, 1M, 3M
 * Supports header row; blank lines skipped.
 */
export function parseCsv(text) {
  const lines = String(text || '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (!lines.length) return [];

  const rows = [];
  for (let i = 0; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]);
    if (cols.length < 2) continue;

    const name = cols[0];
    if (!name) continue;
    if (i === 0 && /^name$/i.test(name) && /1\s*w/i.test(cols[1] || '')) continue;

    const parseNum = (s) => {
      if (s === undefined || s === null || s === '' || s === '-') return null;
      const cleaned = String(s).replace(/%/g, '').replace(/,/g, '').trim();
      if (cleaned === '' || cleaned === '-') return null;
      const n = Number(cleaned);
      return Number.isFinite(n) ? n : null;
    };

    rows.push({
      name,
      w1w: parseNum(cols[1]),
      w1m: parseNum(cols[2]),
      w3m: parseNum(cols[3]),
      source: 'csv',
    });
  }
  return rows;
}

/**
 * Classify a numeric triad as industry ranks vs theme % returns.
 * Ranks: all present values are integers in [1, 73].
 */
export function classifyBoard(row) {
  const vals = [row.w1w, row.w1m, row.w3m].filter(isPresent).map(Number);
  if (!vals.length) return 'theme';
  const lookLikeRanks = vals.every(
    (v) => Number.isInteger(v) && v >= 1 && v <= INDUSTRY_UNIVERSE,
  );
  return lookLikeRanks ? 'industry' : 'theme';
}

/**
 * Merge OCR rows with CSV overrides (CSV wins on same name).
 */
export function mergeRows(ocrIndustry, ocrThemes, csvRows) {
  const indMap = new Map();
  const themeMap = new Map();

  for (const r of ocrIndustry || []) {
    indMap.set(normalizeKey(r.name), { ...r, source: r.source || 'ocr' });
  }
  for (const r of ocrThemes || []) {
    themeMap.set(normalizeKey(r.name), { ...r, source: r.source || 'ocr' });
  }

  for (const r of csvRows || []) {
    const key = normalizeKey(r.name);
    if (!key) continue;
    const inInd = indMap.has(key);
    const inTheme = themeMap.has(key);
    if (inInd && !inTheme) {
      indMap.set(key, { ...r, source: 'csv' });
    } else if (inTheme && !inInd) {
      themeMap.set(key, { ...r, source: 'csv' });
    } else if (inInd && inTheme) {
      const board = classifyBoard(r);
      if (board === 'industry') indMap.set(key, { ...r, source: 'csv' });
      else themeMap.set(key, { ...r, source: 'csv' });
    } else {
      const board = classifyBoard(r);
      if (board === 'industry') indMap.set(key, { ...r, source: 'csv' });
      else themeMap.set(key, { ...r, source: 'csv' });
    }
  }

  return {
    industry: Array.from(indMap.values()),
    themes: Array.from(themeMap.values()),
  };
}

/** Industry: rank → percentile 0–100 against fixed 73-industry universe. */
export function industryPercentiles(rows) {
  const maxRank = INDUSTRY_UNIVERSE;

  return (rows || []).map((r) => {
    const toP = (rank) => {
      if (!isPresent(rank)) return null;
      const clamped = Math.min(Math.max(Number(rank), 1), maxRank);
      return ((maxRank - clamped) / maxRank) * 100;
    };
    const p1w = toP(r.w1w);
    const p1m = toP(r.w1m);
    const p3m = toP(r.w3m);
    return {
      name: r.name,
      w1w: r.w1w,
      w1m: r.w1m,
      w3m: r.w3m,
      p1w,
      p1m,
      p3m,
      score: round1(compositeScore(p1w, p1m, p3m)),
      source: r.source,
      maxRank,
    };
  });
}

/**
 * Themes: within-batch percentile per timeframe (relative to others present).
 * Higher return → higher percentile.
 */
export function themePercentiles(rows) {
  const list = rows || [];
  const keys = ['w1w', 'w1m', 'w3m'];
  const pKeys = { w1w: 'p1w', w1m: 'p1m', w3m: 'p3m' };
  const percentiles = list.map(() => ({ p1w: null, p1m: null, p3m: null }));

  for (const key of keys) {
    const indexed = list
      .map((r, i) => ({ i, v: r[key] }))
      .filter((x) => isPresent(x.v));
    indexed.sort((a, b) => Number(b.v) - Number(a.v));
    const n = indexed.length;
    indexed.forEach((item, rankIndex) => {
      const p = n === 1 ? 100 : ((n - 1 - rankIndex) / (n - 1)) * 100;
      percentiles[item.i][pKeys[key]] = p;
    });
  }

  return list.map((r, i) => {
    const { p1w, p1m, p3m } = percentiles[i];
    return {
      name: r.name,
      w1w: r.w1w,
      w1m: r.w1m,
      w3m: r.w3m,
      p1w,
      p1m,
      p3m,
      score: round1(compositeScore(p1w, p1m, p3m)),
      source: r.source,
    };
  });
}

/**
 * Apply LEADING / REEMERGING / HEATING UP tags.
 * Priority: LEADING > REEMERGING > HEATING UP.
 */
export function classifyTags(scoredRows) {
  const rows = (scoredRows || [])
    .filter((r) => r.score !== null && r.score !== undefined)
    .slice()
    .sort(
      (a, b) =>
        b.score - a.score || String(a.name).localeCompare(String(b.name)),
    );

  const leadingKeys = new Set();
  rows.slice(0, 5).forEach((r) => leadingKeys.add(normalizeKey(r.name)));

  const nonLeading = rows.filter((r) => !leadingKeys.has(normalizeKey(r.name)));

  // REEMERGING: p3m >= 66 AND p1m <= 50 AND p1w > p1m + 5; top 5 by p3m
  const reemergingKeys = new Set();
  nonLeading
    .filter(
      (r) =>
        isPresent(r.p3m) &&
        isPresent(r.p1m) &&
        isPresent(r.p1w) &&
        Number(r.p3m) >= 66 &&
        Number(r.p1m) <= 50 &&
        Number(r.p1w) > Number(r.p1m) + 5,
    )
    .sort(
      (a, b) =>
        Number(b.p3m) - Number(a.p3m) ||
        String(a.name).localeCompare(String(b.name)),
    )
    .slice(0, 5)
    .forEach((r) => reemergingKeys.add(normalizeKey(r.name)));

  // HEATING UP: delta = p1w - p3m > 0; top 5 by delta (among non-leading)
  const heatingKeys = new Set();
  nonLeading
    .map((r) => ({
      r,
      delta:
        isPresent(r.p1w) && isPresent(r.p3m)
          ? Number(r.p1w) - Number(r.p3m)
          : null,
    }))
    .filter((x) => x.delta !== null && x.delta > 0)
    .sort(
      (a, b) =>
        b.delta - a.delta ||
        String(a.r.name).localeCompare(String(b.r.name)),
    )
    .slice(0, 5)
    .forEach((x) => heatingKeys.add(normalizeKey(x.r.name)));

  return rows.map((r, i) => {
    const key = normalizeKey(r.name);
    let tag = null;
    if (leadingKeys.has(key)) tag = 'LEADING';
    else if (reemergingKeys.has(key)) tag = 'REEMERGING';
    else if (heatingKeys.has(key)) tag = 'HEATING UP';

    return {
      ...r,
      rank: i + 1,
      leading: tag === 'LEADING',
      reemerging: tag === 'REEMERGING',
      heatingUp: tag === 'HEATING UP',
      tag,
    };
  });
}

export function rankIndustry(rows) {
  return classifyTags(industryPercentiles(rows));
}

export function rankThemes(rows) {
  return classifyTags(themePercentiles(rows));
}

/**
 * Full pipeline from CSV text (+ optional OCR arrays) → scored boards.
 */
export function computeRankings({
  csvText = '',
  ocrIndustry = [],
  ocrThemes = [],
} = {}) {
  const csvRows = parseCsv(csvText);
  const { industry, themes } = mergeRows(ocrIndustry, ocrThemes, csvRows);
  const industryRanked = rankIndustry(industry);
  const themesRanked = rankThemes(themes);
  const total = industryRanked.length + themesRanked.length;
  const tagged =
    industryRanked.filter((r) => r.tag).length +
    themesRanked.filter((r) => r.tag).length;
  return {
    industry: industryRanked,
    themes: themesRanked,
    total,
    status:
      total > 0
        ? `${total} entries tracked — ${tagged} tagged (Leading / Reemerging / Heating Up)`
        : 'No entries — paste screenshots or add CSV rows, then Compute Rankings.',
  };
}

if (typeof window !== 'undefined') {
  window.LeadingGroupsScore = {
    WEIGHTS,
    INDUSTRY_UNIVERSE,
    THEME_UNIVERSE,
    parseCsv,
    classifyBoard,
    mergeRows,
    industryPercentiles,
    themePercentiles,
    classifyTags,
    rankIndustry,
    rankThemes,
    computeRankings,
  };
}
