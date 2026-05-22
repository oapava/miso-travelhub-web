/**
 * Custom Cypress commands used across all E2E specs.
 *
 * cy.getByTestId(id)   — shorthand for cy.get('[data-testid="…"]')
 * cy.loginAsB2C()      — seeds localStorage with a valid traveler session
 * cy.loginAsB2B()      — seeds localStorage with a valid hotel-admin session
 */

// ─── Type augmentation ────────────────────────────────────────────────────────

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /** cy.get('[data-testid="<id>"]') shorthand */
      getByTestId(id: string): Chainable<JQuery<HTMLElement>>;

      /** Seed localStorage with a traveler (B2C) session so ProtectedRoute passes */
      loginAsB2C(): void;

      /** Seed localStorage with a hotel-admin (B2B) session */
      loginAsB2B(): void;
    }
  }
}

// ─── SESSION CONSTANTS ────────────────────────────────────────────────────────

const SESSION_KEY = 'travelhub_session';

/**
 * Fake JWT for a B2C traveler.
 * Payload: { sub: "traveler@test.com", rol: "traveler", exp: 9999999999 }
 */
const B2C_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' +
  '.eyJzdWIiOiJ0cmF2ZWxlckB0ZXN0LmNvbSIsInJvbCI6InRyYXZlbGVyIiwiZXhwIjo5OTk5OTk5OTk5fQ' +
  '.fake_signature';

/**
 * Fake JWT for a B2B hotel admin.
 * Payload: { hotel_id: "hotel-test-123", sub: "admin@hotel.com", rol: "hotel_admin", exp: 9999999999 }
 */
const B2B_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' +
  '.eyJob3RlbF9pZCI6ImhvdGVsLXRlc3QtMTIzIiwic3ViIjoiYWRtaW5AaG90ZWwuY29tIiwicm9sIjoiaG90ZWxfYWRtaW4iLCJleHAiOjk5OTk5OTk5OTl9' +
  '.fake_signature';

const B2C_USER = {
  id: 'traveler-001',
  email: 'traveler@test.com',
  username: 'test_traveler',
  nombre: 'Test Traveler',
  rol: 'traveler',
  telefono: '+1 555 0100',
  pais: 'Colombia',
  idioma: 'en',
  moneda_preferida: 'USD',
};

const B2B_USER = {
  id: 'admin-001',
  email: 'admin@hotel.com',
  username: 'hotel_admin',
  nombre: 'Hotel Admin',
  rol: 'hotel_admin',
  telefono: '+1 555 0200',
  pais: 'Colombia',
  idioma: 'en',
  moneda_preferida: 'USD',
};

// ─── Command implementations ──────────────────────────────────────────────────

Cypress.Commands.add('getByTestId', (id: string) => {
  return cy.get(`[data-testid="${id}"]`);
});

Cypress.Commands.add('loginAsB2C', () => {
  const session = {
    accessToken: B2C_TOKEN,
    refreshToken: 'fake-refresh-b2c',
    expiresAt: Date.now() + 3_600_000, // 1 hour from now
    user: B2C_USER,
  };
  // Store the session in Cypress.env so the window:before:load handler in
  // e2e.ts can inject it into localStorage BEFORE React initialises AuthContext.
  // This avoids a double cy.visit and guarantees accessToken is non-null on the
  // very first render of the target page.
  Cypress.env('PENDING_SESSION', JSON.stringify(session));
});

Cypress.Commands.add('loginAsB2B', () => {
  const session = {
    accessToken: B2B_TOKEN,
    refreshToken: 'fake-refresh-b2b',
    expiresAt: Date.now() + 3_600_000,
    user: B2B_USER,
  };
  // Same approach as loginAsB2C — schedule the session for the next cy.visit.
  Cypress.env('PENDING_SESSION', JSON.stringify(session));
});
