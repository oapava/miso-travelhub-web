/**
 * E2E — B2B Dashboard page (/business)
 *
 * Covers:
 * - Page renders with stat cards and recent-bookings table
 * - B2B header and sidebar are present
 * - Sidebar navigation links are visible
 * - Logout link is available in sidebar
 */

import { SEL, sel } from '../support/selectors';

describe('B2B Dashboard page', () => {
  beforeEach(() => {
    cy.loginAsB2B();
    cy.visit('/business');
  });

  it('renders the dashboard page container', () => {
    cy.getByTestId(SEL.DASHBOARD_PAGE).should('be.visible');
  });

  it('renders the B2B header', () => {
    cy.get('[data-testid="dashboard-header"]').should('be.visible');
  });

  it('renders the B2B sidebar', () => {
    cy.get('[data-testid="dashboard-sidebar"]').should('be.visible');
  });

  it('renders at least one stat card', () => {
    cy.get('[data-testid^="dashboard-"][data-testid$="-card"]').should('have.length.at.least', 1);
  });

  it('renders the last bookings table', () => {
    cy.get('[data-testid="dashboard-last-bookings"]').should('be.visible');
  });

  it('shows the sidebar logout link', () => {
    cy.getByTestId(SEL.B2B_SIDEBAR_LOGOUT).should('be.visible');
  });

  it('sidebar has navigation links to main B2B sections', () => {
    // The sidebar menu items get testids like "b2b-sidebar-booking-manager" etc.
    cy.get('[data-testid^="b2b-sidebar-"]').should('have.length.at.least', 2);
  });
});
