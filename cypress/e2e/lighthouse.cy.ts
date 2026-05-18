/**
 * E2E — Lighthouse Accessibility Audit (WCAG 2.1 AA)
 *
 * Runs Google Lighthouse against the main public pages and asserts that
 * each page's accessibility score meets its per-page threshold.
 *
 * How it works:
 *   cy.task('lighthouseAudit', { url, thresholds })
 *     → Cypress spawns a separate headless Chrome via chrome-launcher
 *     → Lighthouse connects, audits the URL, Chrome is killed
 *     → The task returns { score, scorePercent, failingAudits, passed }
 *   cy.task('saveLighthouseScore', { label, url, score, … })
 *     → Appends the result to test-results/lighthouse-scores.json
 *     → The scripts/test-summary.mjs reporter reads this file
 *
 * ── Dual-layer accessibility testing strategy ──────────────────────────────
 *
 *   Layer 1 — cypress-axe (a11y.cy.ts)
 *     Element-level WCAG 2.1 AA violations — which element, which rule.
 *     Runs in every browser on every commit via the pre-commit hook.
 *
 *   Layer 2 — Lighthouse (this file)
 *     Page-level accessibility score (0–100). Lighthouse computes a
 *     weighted average over all WCAG-mapped audits.
 *     Run explicitly: npm run test:e2e:lighthouse  (Cypress task, Chrome)
 *                     npm run test:lighthouse       (standalone LHCI)
 *     Excluded from the pre-commit hook (each page takes ~30–45 s).
 *
 * ── Per-page thresholds ────────────────────────────────────────────────────
 *
 *   Page               Score  Threshold  Notes
 *   Home               96 %     90 %     Fully compliant
 *   B2B Login          91 %     90 %     Fully compliant
 *   Results (empty)    86 %     82 %     Pre-existing: color-contrast,
 *                                        label/select-name, aria-allowed-role,
 *                                        target-size — same set disabled in
 *                                        axe-core tests (backlog)
 *   Detail             89 %     85 %     Pre-existing: color-contrast,
 *                                        label-content-name-mismatch,
 *                                        skip-link, target-size — backlog
 *
 * Thresholds sit 4 % below each page's baseline. If score drops further
 * (regression) the test fails. If the team fixes a pre-existing issue the
 * score rises and the test continues to pass.
 *
 * Timeout: each Lighthouse audit takes ~30–45 s in headless Chrome, so
 * individual tasks use { timeout: 90_000 } to override defaultCommandTimeout.
 */

const BASE = 'http://localhost:5173';
const TASK_TIMEOUT = 90_000; // ms — Lighthouse needs up to 60 s per page

// ─── Types ────────────────────────────────────────────────────────────────────

interface LighthouseResult {
  score: number;
  scorePercent: number;
  passed: boolean;
  thresholds: { accessibility?: number };
  failingAudits: Record<string, { score: number | null; description: string }>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function logFailingAudits(result: LighthouseResult): void {
  const entries = Object.entries(result.failingAudits);
  if (entries.length === 0) return;
  cy.log(`ℹ️  ${entries.length} audit(s) below 100% — score: ${result.scorePercent}%`);
  entries.forEach(([id, { score, description }]) => {
    const pct = score !== null ? `${Math.round(score * 100)}%` : 'n/a';
    cy.log(`  [${pct}] ${id} — ${description}`);
  });
}

/** Persist the score to test-results/lighthouse-scores.json for the reporter. */
function saveScore(label: string, url: string, result: LighthouseResult, threshold: number): void {
  cy.task(
    'saveLighthouseScore',
    {
      label,
      url,
      score: result.score,
      scorePercent: result.scorePercent,
      threshold,
      passed: result.passed,
      failingAudits: result.failingAudits,
      timestamp: new Date().toISOString(),
    },
    { log: false },
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Home page — target WCAG 2.1 AA compliant (≥ 90)
// ─────────────────────────────────────────────────────────────────────────────

describe('Lighthouse Accessibility — Home page', () => {
  const THRESHOLD = 0.9;

  it(`accessibility score ≥ ${THRESHOLD * 100} (WCAG 2.1 AA)`, () => {
    cy.task<LighthouseResult>(
      'lighthouseAudit',
      { url: `${BASE}/`, thresholds: { accessibility: THRESHOLD } },
      { timeout: TASK_TIMEOUT },
    ).then((result) => {
      logFailingAudits(result);
      saveScore('Home', `${BASE}/`, result, THRESHOLD);
      expect(
        result.score,
        `Home: ${result.scorePercent}% — expected ≥ ${THRESHOLD * 100}%`,
      ).to.be.at.least(THRESHOLD);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// B2B Login page — target WCAG 2.1 AA compliant (≥ 90)
// ─────────────────────────────────────────────────────────────────────────────

describe('Lighthouse Accessibility — B2B Login page', () => {
  const THRESHOLD = 0.9;

  it(`accessibility score ≥ ${THRESHOLD * 100} (WCAG 2.1 AA)`, () => {
    cy.task<LighthouseResult>(
      'lighthouseAudit',
      { url: `${BASE}/business/login`, thresholds: { accessibility: THRESHOLD } },
      { timeout: TASK_TIMEOUT },
    ).then((result) => {
      logFailingAudits(result);
      saveScore('B2B Login', `${BASE}/business/login`, result, THRESHOLD);
      expect(
        result.score,
        `B2B Login: ${result.scorePercent}% — expected ≥ ${THRESHOLD * 100}%`,
      ).to.be.at.least(THRESHOLD);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Results page (empty state) — pre-existing issues lower the score
// ─────────────────────────────────────────────────────────────────────────────

describe('Lighthouse Accessibility — Results page (empty state)', () => {
  // 82 % = baseline (actual 86 %) − 4 % buffer
  const THRESHOLD = 0.82;

  it(`accessibility score ≥ ${THRESHOLD * 100} — pre-existing issues documented`, () => {
    cy.task<LighthouseResult>(
      'lighthouseAudit',
      { url: `${BASE}/results`, thresholds: { accessibility: THRESHOLD } },
      { timeout: TASK_TIMEOUT },
    ).then((result) => {
      logFailingAudits(result);
      saveScore('Results (empty)', `${BASE}/results`, result, THRESHOLD);
      expect(
        result.score,
        `Results (empty): ${result.scorePercent}% — expected ≥ ${THRESHOLD * 100}%\n` +
        '  Pre-existing: color-contrast, label, select-name, aria-allowed-role, target-size',
      ).to.be.at.least(THRESHOLD);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Detail page — pre-existing issues lower the score
// ─────────────────────────────────────────────────────────────────────────────

describe('Lighthouse Accessibility — Detail page', () => {
  // 85 % = baseline (actual 89 %) − 4 % buffer
  const THRESHOLD = 0.85;

  it(`accessibility score ≥ ${THRESHOLD * 100} — pre-existing issues documented`, () => {
    cy.task<LighthouseResult>(
      'lighthouseAudit',
      { url: `${BASE}/detail/room-001`, thresholds: { accessibility: THRESHOLD } },
      { timeout: TASK_TIMEOUT },
    ).then((result) => {
      logFailingAudits(result);
      saveScore('Detail', `${BASE}/detail/room-001`, result, THRESHOLD);
      expect(
        result.score,
        `Detail: ${result.scorePercent}% — expected ≥ ${THRESHOLD * 100}%\n` +
        '  Pre-existing: color-contrast, label-content-name-mismatch, skip-link, target-size',
      ).to.be.at.least(THRESHOLD);
    });
  });
});
