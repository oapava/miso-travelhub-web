// Support entry-point — loaded automatically before every spec.
// Import custom commands so they are available in all tests.
import './commands';
// cypress-axe: injects axe-core into each page for WCAG 2.1 AA automated checks.
import 'cypress-axe';
// cypress-real-events: simulates real browser keyboard events (Tab, Enter, Escape…)
// via Chrome DevTools Protocol — required for proper keyboard navigation testing.
import 'cypress-real-events';

// ─── Global window:before:load ────────────────────────────────────────────────
// Fires before React mounts on EVERY cy.visit.  We use this hook to:
//
//   1. Force English so text-based assertions are locale-stable.
//      (i18n LanguageDetector reads 'travelhub_language' before any other
//      detection strategy, so the key must be present before the bundle runs.)
//
//   2. Inject any pending auth session written by cy.loginAsB2C() /
//      cy.loginAsB2B() into localStorage BEFORE AuthContext initialises.
//      This eliminates the race condition where the session was previously
//      written after the first cy.visit('/') and then lost when
//      cy.visit('/target-page') triggered a fresh window with testIsolation.
Cypress.on('window:before:load', (win) => {
  // 1. Language
  win.localStorage.setItem('travelhub_language', 'en');

  // 2. Auth session (if a login command was called before this visit)
  const pendingSession = Cypress.env('PENDING_SESSION') as string | undefined;
  if (pendingSession) {
    win.localStorage.setItem('travelhub_session', pendingSession);
    // Clear so subsequent visits in the same test don't re-inject it
    // (the app's own logout flow should control session removal).
    Cypress.env('PENDING_SESSION', null);
  }
});
