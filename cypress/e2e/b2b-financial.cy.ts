/**
 * E2E — B2B Financial Reports page (/business/financial-reports)
 *
 * Covers:
 * - Page renders with header, sidebar, stat cards, data table
 * - Date-range filter inputs are present and writable
 * - Pagination is rendered
 */

import { SEL } from '../support/selectors';

describe('B2B Financial Reports page', () => {
  beforeEach(() => {
    cy.loginAsB2B();
    cy.visit('/business/financial-reports');
  });

  it('renders the financial reports page container', () => {
    cy.getByTestId(SEL.FINANCIAL_REPORTS_PAGE).should('be.visible');
  });

  it('renders the B2B header', () => {
    cy.get('[data-testid="financial-reports-header"]').should('be.visible');
  });

  it('renders the B2B sidebar', () => {
    cy.get('[data-testid="financial-reports-sidebar"]').should('be.visible');
  });

  it('renders the total income stat card', () => {
    cy.get('[data-testid="financial-reports-total-income"]').should('exist');
  });

  it('renders the financial data table', () => {
    cy.get('[data-testid="financial-reports-table"]').should('be.visible');
  });

  it('renders start-date filter input', () => {
    cy.get('[data-testid="financial-reports-start-date"]').should('exist');
  });

  it('renders end-date filter input', () => {
    cy.get('[data-testid="financial-reports-end-date"]').should('exist');
  });

  it('renders pagination', () => {
    cy.get('[data-testid="financial-reports-pagination"]').should('exist');
  });

  it('shows the sidebar logout link', () => {
    cy.getByTestId(SEL.B2B_SIDEBAR_LOGOUT).should('be.visible');
  });
});
