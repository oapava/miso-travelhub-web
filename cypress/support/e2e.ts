// Support entry-point — loaded automatically before every spec.
// Import custom commands so they are available in all tests.
import './commands';
// cypress-axe: injects axe-core into each page for WCAG 2.1 AA automated checks.
import 'cypress-axe';
// cypress-real-events: simulates real browser keyboard events (Tab, Enter, Escape…)
// via Chrome DevTools Protocol — required for proper keyboard navigation testing.
import 'cypress-real-events';
