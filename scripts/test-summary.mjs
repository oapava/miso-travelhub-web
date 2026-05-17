/**
 * scripts/test-summary.mjs
 *
 * Reads test-results/cypress-{browser}.json (written by the after:run Cypress
 * hook) and test-results/lighthouse-scores.json (written by saveLighthouseScore
 * task) and prints a formatted terminal report with:
 *
 *   1. Cross-browser E2E summary  (per spec, Chrome vs Firefox)
 *   2. WCAG 2.1 AA Lighthouse scores
 *   3. Detailed test cases (per spec, with pass/fail/skip state)
 *
 * Usage:
 *   node scripts/test-summary.mjs          # reads test-results/
 *   node scripts/test-summary.mjs --no-cases  # skip test-case listing
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = join(__dirname, '..');
const DIR       = join(ROOT, 'test-results');

const SHOW_CASES = !process.argv.includes('--no-cases');

// ─── ANSI colour helpers ──────────────────────────────────────────────────────

const A = {
  reset:   '\x1b[0m',
  bold:    '\x1b[1m',
  dim:     '\x1b[2m',
  green:   '\x1b[32m',
  red:     '\x1b[31m',
  yellow:  '\x1b[33m',
  cyan:    '\x1b[36m',
  blue:    '\x1b[34m',
  magenta: '\x1b[35m',
  white:   '\x1b[97m',
  bgGreen: '\x1b[42m',
  bgRed:   '\x1b[41m',
  bgBlue:  '\x1b[44m',
};

const clr  = (c, s) => `${c}${s}${A.reset}`;
const bold = (s)    => clr(A.bold, s);
const dim  = (s)    => clr(A.dim, s);
const grn  = (s)    => clr(A.green, s);
const red  = (s)    => clr(A.red, s);
const yel  = (s)    => clr(A.yellow, s);
const cyn  = (s)    => clr(A.cyan, s);
const mag  = (s)    => clr(A.magenta, s);

// ─── ASCII table primitives ───────────────────────────────────────────────────

/**
 * Build a plain-string fixed-width cell (no ANSI codes, so column widths are
 * accurate). Truncates with '…' if too long.
 */
function cell(str, width, align = 'left') {
  const s = String(str ?? '');
  const visible = stripAnsi(s);
  const len = visible.length;
  if (len >= width) return s.slice(0, width - 1) + '…';
  const pad = width - len;
  if (align === 'right')  return ' '.repeat(pad) + s;
  if (align === 'center') return ' '.repeat(Math.floor(pad / 2)) + s + ' '.repeat(Math.ceil(pad / 2));
  return s + ' '.repeat(pad);
}

function stripAnsi(s) {
  return s.replace(/\x1b\[[0-9;]*m/g, '');
}

function hline(cols, left = '├', mid = '┼', right = '┤', h = '─') {
  return left + cols.map(w => h.repeat(w + 2)).join(mid) + right;
}

function tline(cols, left = '┌', mid = '┬', right = '┐') {
  return hline(cols, left, mid, right, '─');
}

function bline(cols, left = '└', mid = '┴', right = '┘') {
  return hline(cols, left, mid, right, '─');
}

function row(cells, widths, aligns = []) {
  const parts = cells.map((c, i) => ` ${cell(c, widths[i], aligns[i] || 'left')} `);
  return '│' + parts.join('│') + '│';
}

function banner(title, width = 90) {
  const pad = Math.max(0, width - 2 - stripAnsi(title).length);
  const l = Math.floor(pad / 2);
  const r = Math.ceil(pad / 2);
  return [
    '╔' + '═'.repeat(width - 2) + '╗',
    '║' + ' '.repeat(l) + title + ' '.repeat(r) + '║',
    '╚' + '═'.repeat(width - 2) + '╝',
  ].join('\n');
}

function divider(label, width = 90) {
  const line = `── ${bold(label)} `;
  const plain = `── ${label} `;
  const fill = '─'.repeat(Math.max(0, width - stripAnsi(plain).length));
  return `\n${A.dim}${line}${fill}${A.reset}`;
}

// ─── Read result files ────────────────────────────────────────────────────────

function readJSON(file) {
  const p = join(DIR, file);
  if (!existsSync(p)) return null;
  try { return JSON.parse(readFileSync(p, 'utf8')); } catch { return null; }
}

const chrome    = readJSON('cypress-chrome.json');
const firefox   = readJSON('cypress-firefox.json');
const lhScores  = readJSON('lighthouse-scores.json');

if (!chrome && !firefox && !lhScores) {
  console.log(yel('\n  ⚠  No test results found in test-results/. Run the tests first.\n'));
  process.exit(0);
}

// ─── Build spec map (merges Chrome + Firefox data) ───────────────────────────

/**
 * Returns a Map<specName, { chrome, firefox }> where each value has:
 *   { tests, passed, failed, skipped, testCases: [{title, state}] }
 */
function buildSpecMap(chromeData, firefoxData) {
  const map = new Map();

  function addBrowser(data, browserKey) {
    if (!data || !data.runs) return;
    for (const run of data.runs) {
      const name = basename(run.spec.relative);
      if (!map.has(name)) map.set(name, { chrome: null, firefox: null, testCases: [] });
      const entry = map.get(name);
      entry[browserKey] = {
        tests:   run.stats.tests,
        passed:  run.stats.passes,
        failed:  run.stats.failures,
        skipped: (run.stats.pending ?? 0) + (run.stats.skipped ?? 0),
      };
      // Collect test cases from whichever browser we process first
      if (entry.testCases.length === 0 && run.tests) {
        entry.testCases = run.tests.map(t => ({
          title: t.title.join(' › '),
          state: t.state,
          error: t.displayError ?? null,
        }));
      }
    }
  }

  addBrowser(chromeData,  'chrome');
  addBrowser(firefoxData, 'firefox');
  return map;
}

const specMap = buildSpecMap(chrome, firefox);

// ─── Aggregate totals ─────────────────────────────────────────────────────────

function totals(data) {
  if (!data) return null;
  return {
    tests:   data.totalTests   ?? 0,
    passed:  data.totalPassed  ?? 0,
    failed:  data.totalFailed  ?? 0,
    skipped: (data.totalPending ?? 0) + (data.totalSkipped ?? 0),
    browser: data.browserName  ?? '?',
    dur:     data.totalDuration ?? 0,
  };
}

const chrTot = totals(chrome);
const ffTot  = totals(firefox);

// ─── Browser cell formatter ───────────────────────────────────────────────────

function browserCell(stat) {
  if (!stat) return dim('  —  ');
  if (stat.failed > 0) return red(`✗ ${stat.failed} FAIL`);
  const skip = stat.skipped > 0 ? dim(` +${stat.skipped}⏭`) : '';
  return grn('✓') + ` ${stat.passed}/${stat.tests}` + skip;
}

function overallCell(tot) {
  if (!tot) return dim('  —  ');
  if (tot.failed > 0) return red(`✗ FAILED (${tot.failed})`);
  return grn('✅ PASSED');
}

// ─── State icon for individual test cases ─────────────────────────────────────

function stateIcon(state) {
  if (state === 'passed')  return grn('✓');
  if (state === 'failed')  return red('✗');
  return yel('⏭');
}

// ─── Duration formatter ───────────────────────────────────────────────────────

function fmtMs(ms) {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`;
}

// ─────────────────────────────────────────────────────────────────────────────
// PRINT THE REPORT
// ─────────────────────────────────────────────────────────────────────────────

const WIDTH = 100;
const ts = new Date().toLocaleString('en-US', {
  weekday: 'short', year: 'numeric', month: 'short', day: '2-digit',
  hour: '2-digit', minute: '2-digit', second: '2-digit',
});

console.log('\n');
console.log(banner(bold('  TravelHub Web — Test Report  ') + dim(`  ${ts}  `), WIDTH));

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 1 — Cross-Browser E2E Results
// ═══════════════════════════════════════════════════════════════════════════════

if (specMap.size > 0) {
  console.log(divider('🌐  CROSS-BROWSER E2E RESULTS', WIDTH));
  console.log();

  // Column widths: Spec | Tests | Pass | Fail | Skip | Chrome | Firefox
  const W = [33, 5, 5, 5, 5, 17, 17];

  const headers = ['Spec', 'Total', 'Pass', 'Fail', 'Skip', '🌐 Chrome', '🦊 Firefox'];
  const align   = ['left', 'right', 'right', 'right', 'right', 'left', 'left'];

  console.log(tline(W));
  console.log(row(headers.map((h, i) => bold(h)), W, align));
  console.log(hline(W));

  // One row per spec (sorted alphabetically)
  const sortedSpecs = [...specMap.entries()].sort(([a], [b]) => a.localeCompare(b));

  for (const [name, data] of sortedSpecs) {
    const chrStat = data.chrome;
    const ffStat  = data.firefox;

    // Use Chrome stats as primary for totals (Firefox may skip some tests)
    const primary = chrStat ?? ffStat;
    const t = primary?.tests   ?? 0;
    const p = primary?.passed  ?? 0;
    const f = (chrStat?.failed ?? 0) + (ffStat?.failed ?? 0); // any failure in any browser
    const s = primary?.skipped ?? 0;

    const specLabel = name.replace('.cy.ts', '');
    const failCol   = f > 0 ? red(String(f)) : dim(String(f));

    console.log(row([
      specLabel,
      t,
      grn(String(p)),
      failCol,
      s > 0 ? yel(String(s)) : dim(String(s)),
      browserCell(chrStat),
      browserCell(ffStat),
    ], W, align));
  }

  console.log(hline(W));

  // Totals row
  const totalTests   = chrTot?.tests   ?? ffTot?.tests   ?? 0;
  const totalPassed  = chrTot?.passed  ?? ffTot?.passed  ?? 0;
  const totalFailed  = (chrTot?.failed ?? 0) + (ffTot?.failed ?? 0);
  const totalSkipped = chrTot?.skipped ?? ffTot?.skipped ?? 0;

  console.log(row([
    bold('TOTAL'),
    bold(String(totalTests)),
    grn(bold(String(totalPassed))),
    totalFailed > 0 ? red(bold(String(totalFailed))) : dim('0'),
    totalSkipped > 0 ? yel(String(totalSkipped)) : dim('0'),
    overallCell(chrTot),
    overallCell(ffTot),
  ], W, align));

  console.log(bline(W));

  // Duration
  const parts = [];
  if (chrTot) parts.push(`Chrome: ${fmtMs(chrTot.dur)}`);
  if (ffTot)  parts.push(`Firefox: ${fmtMs(ffTot.dur)}`);
  if (parts.length) console.log(dim(`  Duration — ${parts.join(' · ')}`));

  // Notes
  if (specMap.has('a11y.cy.ts')) {
    const data = specMap.get('a11y.cy.ts');
    const skipped = data.firefox?.skipped ?? data.chrome?.skipped ?? 0;
    if (skipped > 0) {
      console.log(yel(`  ⚠  a11y.cy.ts → ${skipped} keyboard-navigation tests skipped in Firefox`) +
        dim(' (cypress-real-events uses CDP, not available in Firefox)'));
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 2 — WCAG 2.1 AA Lighthouse Accessibility
// ═══════════════════════════════════════════════════════════════════════════════

if (lhScores && lhScores.pages && lhScores.pages.length > 0) {
  console.log(divider('♿  WCAG 2.1 AA — LIGHTHOUSE ACCESSIBILITY AUDIT', WIDTH));
  console.log();

  const W = [28, 34, 7, 9, 24];
  const headers = ['Page', 'URL', 'Score', 'Threshold', 'Status'];
  const align   = ['left', 'left', 'right', 'center', 'left'];

  console.log(tline(W));
  console.log(row(headers.map(bold), W, align));
  console.log(hline(W));

  for (const page of lhScores.pages) {
    const scorePct = Math.round(page.score * 100);
    const thrPct   = Math.round(page.threshold * 100);
    const isAA     = page.threshold >= 0.9;

    let scoreStr = `${scorePct}%`;
    if (scorePct >= 90) scoreStr = grn(scoreStr);
    else if (scorePct >= 82) scoreStr = yel(scoreStr);
    else scoreStr = red(scoreStr);

    let status;
    if (!page.passed) {
      status = red('✗ BELOW THRESHOLD');
    } else if (isAA && scorePct >= 90) {
      status = grn('✅ WCAG 2.1 AA Compliant');
    } else {
      status = yel('⚠  Passes threshold · pre-existing issues');
    }

    const urlShort = page.url.replace('http://localhost:5173', '');

    console.log(row([
      page.label,
      urlShort || '/',
      scoreStr,
      `≥ ${thrPct}%`,
      status,
    ], W, align));
  }

  console.log(bline(W));

  // Backlog note
  const hasBacklog = lhScores.pages.some(p => p.threshold < 0.9);
  if (hasBacklog) {
    console.log(dim('  ℹ  Pre-existing known issues (accessibility backlog):'));
    console.log(dim('     color-contrast · label / select-name (custom component pattern)'));
    console.log(dim('     label-content-name-mismatch · target-size · aria-allowed-role'));
  }
} else {
  console.log(divider('♿  WCAG 2.1 AA — LIGHTHOUSE ACCESSIBILITY AUDIT', WIDTH));
  console.log();
  console.log(dim('  No Lighthouse results found.'));
  console.log(dim('  Run:  npm run test:e2e:lighthouse   or   npm run test:lighthouse'));
  console.log();
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 3 — Detailed Test Cases
// ═══════════════════════════════════════════════════════════════════════════════

if (SHOW_CASES && specMap.size > 0) {
  console.log(divider('📋  CASOS PROBADOS — Detailed Test Cases by Spec', WIDTH));

  const sortedSpecs = [...specMap.entries()].sort(([a], [b]) => a.localeCompare(b));

  for (const [name, data] of sortedSpecs) {
    const chrStat = data.chrome;
    const primary = chrStat ?? data.firefox;
    if (!primary) continue;

    const t = primary.tests;
    const p = primary.passed;
    const f = primary.failed;
    const s = primary.skipped;

    const statSummary = [
      grn(`${p} passed`),
      f > 0 ? red(`${f} failed`) : null,
      s > 0 ? yel(`${s} skipped`) : null,
    ].filter(Boolean).join(', ');

    console.log();
    console.log(`  ${bold(cyn(name))}  ${dim(`(${t} tests · ${statSummary})`)}`);
    console.log('  ' + '─'.repeat(WIDTH - 4));

    for (const tc of data.testCases) {
      const icon = stateIcon(tc.state);
      const label = tc.state === 'pending' ? dim(tc.title) : tc.title;
      console.log(`    ${icon}  ${label}`);
      if (tc.state === 'failed' && tc.error) {
        console.log(red(`       ↳ ${tc.error.split('\n')[0]}`));
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// OVERALL VERDICT
// ═══════════════════════════════════════════════════════════════════════════════

console.log();

const e2eFailed = (chrTot?.failed ?? 0) + (ffTot?.failed ?? 0);
const lhFailed  = lhScores?.pages?.filter(p => !p.passed).length ?? 0;
const allOk     = e2eFailed === 0 && lhFailed === 0;

if (allOk) {
  const totalTests = chrTot?.tests ?? ffTot?.tests ?? 0;
  console.log(
    clr(A.bgGreen + A.bold + A.white,
      `  ✅  ALL TESTS PASSED  ` +
      `(${totalTests} E2E tests · ${lhScores?.pages?.length ?? 0} Lighthouse audits)  `
    )
  );
} else {
  const msgs = [];
  if (e2eFailed > 0) msgs.push(`${e2eFailed} E2E test(s) failed`);
  if (lhFailed  > 0) msgs.push(`${lhFailed} Lighthouse page(s) below threshold`);
  console.log(
    clr(A.bgRed + A.bold + A.white,
      `  ✗  ${msgs.join(' · ')}  `
    )
  );
}

console.log();
