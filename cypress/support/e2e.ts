// Support entry-point — loaded automatically before every spec.
// Import custom commands so they are available in all tests.
import './commands';
// cypress-axe: injects axe-core into each page for WCAG 2.1 AA automated checks.
import 'cypress-axe';
// cypress-real-events: simulates real browser keyboard events (Tab, Enter, Escape…)
// via Chrome DevTools Protocol — required for proper keyboard navigation testing.
import 'cypress-real-events';

// ─── Global language fixture ──────────────────────────────────────────────────
// Force English for every test so that assertions against translated strings
// (e.g. 'LOGIN', 'Access denied', 'You have no bookings yet', 'Rooms and Guests')
// are stable regardless of the system / browser locale or i18n fallbackLng.
// The i18n LanguageDetector reads 'travelhub_language' from localStorage before
// any other detection strategy, so setting it here in window:before:load is
// guaranteed to take effect before React initialises the i18n singleton.
Cypress.on('window:before:load', (win) => {
  win.localStorage.setItem('travelhub_language', 'en');
});
