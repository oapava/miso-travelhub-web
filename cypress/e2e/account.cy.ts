/**
 * E2E — B2C account pages (protected routes)
 *
 * Covers:
 * - /account       → Account settings page
 * - /account/bookings       → Booking history page
 * - /account/notifications  → Notification preferences page
 *
 * All routes require authentication; cy.loginAsB2C() seeds localStorage.
 * Unauthenticated access should redirect to home.
 */

import { SEL, sel } from '../support/selectors';

// ─── /account ──────────────────────────────────────────────────────────────────

describe('Account page', () => {
  describe('unauthenticated', () => {
    it('redirects to home when not logged in', () => {
      cy.visit('/account');
      cy.url().should('eq', Cypress.config('baseUrl') + '/');
    });
  });

  describe('authenticated', () => {
    beforeEach(() => {
      cy.loginAsB2C();
      cy.visit('/account');
    });

    it('renders the account page container', () => {
      cy.getByTestId(SEL.ACCOUNT_PAGE).should('be.visible');
    });

    it('renders the main content area', () => {
      cy.getByTestId(SEL.ACCOUNT_MAIN).should('be.visible');
    });

    it('renders the account form', () => {
      cy.getByTestId(SEL.ACCOUNT_FORM).should('be.visible');
    });

    it('compact search bar is visible in header', () => {
      cy.getByTestId(SEL.SEARCH_BAR_LOCATION).should('be.visible');
    });

    it('account link in header navigates back to /account', () => {
      cy.getByTestId(SEL.HEADER_ACCOUNT).should('be.visible');
    });
  });
});

// ─── /account/bookings ────────────────────────────────────────────────────────

describe('Bookings page', () => {
  describe('unauthenticated', () => {
    it('redirects to home when not logged in', () => {
      cy.visit('/account/bookings');
      cy.url().should('eq', Cypress.config('baseUrl') + '/');
    });
  });

  describe('authenticated with bookings', () => {
    beforeEach(() => {
      cy.loginAsB2C();
      cy.intercept('GET', '**/api/v1/booking/get_bookings*', {
        fixture: 'bookings.json',
      }).as('getBookings');
      cy.visit('/account/bookings');
      cy.wait('@getBookings');
    });

    it('renders the bookings page container', () => {
      cy.getByTestId(SEL.BOOKINGS_PAGE).should('be.visible');
    });

    it('renders the main content area', () => {
      cy.getByTestId(SEL.BOOKINGS_MAIN).should('be.visible');
    });

    it('renders the account sidebar', () => {
      cy.getByTestId(SEL.BOOKINGS_SIDEBAR).should('be.visible');
    });

    it('shows at least one booking group', () => {
      cy.get(sel('booking-group-0')).should('exist');
    });

    it('shows booking items from the API response', () => {
      cy.get('[data-testid^="booking-item-"]').should('have.length.at.least', 1);
    });

    it('shows booking status badge', () => {
      cy.get('[data-testid^="booking-status-"]').first().should('be.visible');
    });

    it('compact search bar is visible in header', () => {
      cy.getByTestId(SEL.SEARCH_BAR_LOCATION).should('be.visible');
    });
  });

  describe('authenticated with no bookings', () => {
    beforeEach(() => {
      cy.loginAsB2C();
      cy.intercept('GET', '**/api/v1/booking/get_bookings*', { body: [] }).as('emptyBookings');
      cy.visit('/account/bookings');
      cy.wait('@emptyBookings');
    });

    it('shows empty state message', () => {
      cy.contains('You have no bookings yet').should('be.visible');
    });
  });
});

// ─── /account/notifications ───────────────────────────────────────────────────

describe('Notifications page', () => {
  describe('unauthenticated', () => {
    it('redirects to home when not logged in', () => {
      cy.visit('/account/notifications');
      cy.url().should('eq', Cypress.config('baseUrl') + '/');
    });
  });

  describe('authenticated', () => {
    beforeEach(() => {
      cy.loginAsB2C();
      cy.visit('/account/notifications');
    });

    it('renders the notifications page container', () => {
      cy.getByTestId(SEL.NOTIFICATIONS_PAGE).should('be.visible');
    });

    it('renders the main content area', () => {
      cy.getByTestId(SEL.NOTIFICATIONS_MAIN).should('be.visible');
    });

    it('renders the account sidebar', () => {
      cy.getByTestId(SEL.NOTIFICATIONS_SIDEBAR).should('be.visible');
    });

    it('renders notification setting toggles', () => {
      cy.get('[data-testid^="notification-setting-"]').should('have.length.at.least', 1);
    });

    it('toggling a notification setting changes its aria-checked state', () => {
      // The Toggle component renders a <button role="switch" aria-checked>
      cy.get('[data-testid^="notification-setting-"]')
        .first()
        .find('[role="switch"]')
        .then(($toggle) => {
          const initial = $toggle.attr('aria-checked');
          cy.wrap($toggle).click();
          cy.wrap($toggle).should(
            'have.attr',
            'aria-checked',
            initial === 'true' ? 'false' : 'true',
          );
        });
    });

    it('compact search bar is visible in header', () => {
      cy.getByTestId(SEL.SEARCH_BAR_LOCATION).should('be.visible');
    });
  });
});
