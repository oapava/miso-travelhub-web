/**
 * E2E — B2B Login page  (/business/login)
 *
 * Covers:
 * - Page structure renders
 * - Email and password inputs are present
 * - Error shown for invalid credentials or traveler role
 * - Successful login navigates to /business (dashboard)
 *
 * Note: B2B Input fields have data-testid on the <input> element directly
 * (Input component places data-testid on the native element, not a wrapper).
 *
 * Auth endpoint: POST /api/v1/auth/login
 * Me endpoint:   GET  /api/v1/auth/me
 */

import { SEL } from '../support/selectors';

describe('B2B Login page', () => {
  beforeEach(() => {
    cy.visit('/business/login');
  });

  it('renders the B2B login page', () => {
    cy.getByTestId(SEL.B2B_LOGIN_PAGE).should('be.visible');
  });

  it('renders the email input', () => {
    // data-testid is on the <input> element itself
    cy.getByTestId(SEL.B2B_LOGIN_EMAIL).should('be.visible').and('have.attr', 'type', 'email');
  });

  it('renders the password input', () => {
    cy.getByTestId(SEL.B2B_LOGIN_PASSWORD).should('be.visible').and('have.attr', 'type', 'password');
  });

  it('renders the submit button', () => {
    cy.getByTestId(SEL.B2B_LOGIN_SUBMIT).should('be.visible').and('contain.text', 'LOGIN');
  });

  it('renders the right-side image placeholder', () => {
    cy.getByTestId(SEL.B2B_LOGIN_IMAGE).should('exist');
  });

  it('shows error for invalid credentials (401)', () => {
    cy.intercept('POST', '**/api/v1/auth/login', {
      statusCode: 401,
      body: { detail: 'Invalid credentials' },
    }).as('loginFail');

    cy.getByTestId(SEL.B2B_LOGIN_EMAIL).type('wrong@hotel.com');
    cy.getByTestId(SEL.B2B_LOGIN_PASSWORD).type('badpassword');
    cy.getByTestId(SEL.B2B_LOGIN_SUBMIT).click();

    cy.wait('@loginFail');
    cy.getByTestId(SEL.B2B_LOGIN_ERROR).should('be.visible');
  });

  it('shows access-denied error when a traveler tries to log in', () => {
    cy.intercept('POST', '**/api/v1/auth/login', { fixture: 'auth-token.json' }).as(
      'loginTraveler',
    );
    cy.intercept('GET', '**/api/v1/auth/me', { fixture: 'user-traveler.json' }).as('meTraveler');

    cy.getByTestId(SEL.B2B_LOGIN_EMAIL).type('traveler@test.com');
    cy.getByTestId(SEL.B2B_LOGIN_PASSWORD).type('password123');
    cy.getByTestId(SEL.B2B_LOGIN_SUBMIT).click();

    cy.wait('@loginTraveler');
    cy.wait('@meTraveler');
    cy.getByTestId(SEL.B2B_LOGIN_ERROR)
      .should('be.visible')
      .and('contain.text', 'Access denied');
  });

  it('navigates to dashboard on successful hotel-admin login', () => {
    cy.intercept('POST', '**/api/v1/auth/login', { fixture: 'auth-token-b2b.json' }).as(
      'loginAdmin',
    );
    cy.intercept('GET', '**/api/v1/auth/me', { fixture: 'user-admin.json' }).as('meAdmin');
    // Suppress any downstream booking API calls
    cy.intercept('GET', '**/api/v1/booking/**', { body: [] }).as('bookings');

    cy.getByTestId(SEL.B2B_LOGIN_EMAIL).type('admin@hotel.com');
    cy.getByTestId(SEL.B2B_LOGIN_PASSWORD).type('adminpass');
    cy.getByTestId(SEL.B2B_LOGIN_SUBMIT).click();

    cy.wait('@loginAdmin');
    cy.wait('@meAdmin');

    // B2BLoginPage navigates to /business after successful login
    cy.url().should('include', '/business');
    cy.getByTestId(SEL.DASHBOARD_PAGE).should('be.visible');
  });
});
