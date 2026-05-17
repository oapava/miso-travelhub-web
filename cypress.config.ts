import { defineConfig } from 'cypress';
import fs from 'fs';
import path from 'path';

// ─── Result-file paths ────────────────────────────────────────────────────────
const RESULTS_DIR = path.join(process.cwd(), 'test-results');

function ensureResultsDir() {
  if (!fs.existsSync(RESULTS_DIR)) fs.mkdirSync(RESULTS_DIR, { recursive: true });
}

// ─── Lighthouse types ─────────────────────────────────────────────────────────
interface LighthouseAuditInput {
  url: string;
  thresholds?: { accessibility?: number };
}

interface LighthouseAuditResult {
  score: number;
  scorePercent: number;
  passed: boolean;
  thresholds: { accessibility?: number };
  failingAudits: Record<string, { score: number | null; description: string }>;
}

// ─── Lighthouse score entry (persisted to test-results/lighthouse-scores.json)─
interface LighthouseScoreEntry {
  label: string;
  url: string;
  score: number;
  scorePercent: number;
  threshold: number;
  passed: boolean;
  failingAudits: Record<string, { score: number | null; description: string }>;
  timestamp: string;
}

// ─── Cypress after:run result shape (partial) ─────────────────────────────────
interface CypressRunResult {
  browserName: string;
  browserVersion: string;
  totalDuration: number;
  totalTests: number;
  totalPassed: number;
  totalFailed: number;
  totalPending: number;
  totalSkipped: number;
  startedTestsAt: string;
  runs: CypressSpecRun[];
}

interface CypressSpecRun {
  spec: { relative: string; name: string };
  stats: {
    tests: number;
    passes: number;
    failures: number;
    pending: number;
    skipped: number;
    duration: number;
  };
  tests: CypressTestResult[];
}

interface CypressTestResult {
  title: string[];
  state: 'passed' | 'failed' | 'pending';
  duration: number;
  displayError?: string | null;
}

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    setupNodeEvents(on) {

      // ── After every cypress run: persist structured JSON for the reporter ────
      on('after:run', (results) => {
        ensureResultsDir();
        const r = results as unknown as CypressRunResult;
        const browser = r.browserName ?? 'unknown';

        // Write per-browser file, e.g. test-results/cypress-chrome.json
        const outPath = path.join(RESULTS_DIR, `cypress-${browser}.json`);
        fs.writeFileSync(outPath, JSON.stringify(r, null, 2));
        return null;
      });

      on('task', {

        // ── axe-core violations logger ─────────────────────────────────────────
        a11yViolations(violations: { id: string; impact: string; description: string; nodes: unknown[] }[]) {
          if (violations.length === 0) return null;
          console.table(violations.map(({ id, impact, description, nodes }) => ({
            id,
            impact: impact?.toUpperCase(),
            description,
            affected: (nodes as unknown[]).length,
          })));
          return null;
        },

        // ── Persist a Lighthouse score for the reporter ────────────────────────
        saveLighthouseScore(entry: LighthouseScoreEntry) {
          ensureResultsDir();
          const outPath = path.join(RESULTS_DIR, 'lighthouse-scores.json');
          const existing: { pages: LighthouseScoreEntry[] } = fs.existsSync(outPath)
            ? JSON.parse(fs.readFileSync(outPath, 'utf8'))
            : { pages: [] };

          // Replace existing entry for same label (keep latest run)
          existing.pages = existing.pages.filter((p) => p.label !== entry.label);
          existing.pages.push(entry);

          fs.writeFileSync(outPath, JSON.stringify(existing, null, 2));
          return null;
        },

        // ── Lighthouse WCAG 2.1 AA accessibility audit ─────────────────────────
        // Launches a dedicated headless Chrome, runs Lighthouse against the URL
        // (the Vite dev server already running during Cypress), closes Chrome.
        async lighthouseAudit({ url, thresholds = { accessibility: 0.9 } }: LighthouseAuditInput): Promise<LighthouseAuditResult> {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { launch } = (await import('chrome-launcher')) as any;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const lighthouse = ((await import('lighthouse')) as any).default;

          const chrome = await launch({
            chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu'],
          });

          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const runnerResult: any = await lighthouse(url, {
              port: chrome.port,
              output: 'json',
              logLevel: 'error',
              onlyCategories: ['accessibility'],
              formFactor: 'desktop',
              screenEmulation: {
                mobile: false,
                width: 1280,
                height: 800,
                deviceScaleFactor: 1,
                disabled: false,
              },
            });

            const lhr = runnerResult.lhr;
            const score: number = lhr.categories.accessibility.score ?? 0;

            const failingAudits: LighthouseAuditResult['failingAudits'] = {};
            for (const [id, audit] of Object.entries(lhr.audits) as [string, Record<string, unknown>][]) {
              const auditScore = audit.score as number | null;
              const displayMode = audit.scoreDisplayMode as string;
              if (auditScore !== null && auditScore < 1 && displayMode !== 'manual' && displayMode !== 'informative') {
                failingAudits[id] = {
                  score: auditScore,
                  description: audit.description as string,
                };
              }
            }

            return {
              score,
              scorePercent: Math.round(score * 100),
              passed: score >= (thresholds.accessibility ?? 0.9),
              thresholds,
              failingAudits,
            };
          } finally {
            await chrome.kill();
          }
        },
      });
    },
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: 'cypress/support/e2e.ts',
    fixturesFolder: 'cypress/fixtures',
    viewportWidth: 1280,
    viewportHeight: 800,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 6000,
    requestTimeout: 8000,
    responseTimeout: 8000,
    pageLoadTimeout: 20000,
  },
});
