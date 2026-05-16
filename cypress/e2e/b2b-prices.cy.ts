/**
 * E2E — B2B Prices Manager page (/business/prices-manager)
 *
 * Covers:
 * - Page renders with header, sidebar, data table
 * - Inline price and discount inputs are rendered per row
 * - Pagination is rendered
 * - Price input values are editable
 */

import { SEL } from '../support/selectors';

describe('B2B Prices Manager page', () => {
  beforeEach(() => {
    cy.loginAsB2B();
    cy.visit('/business/prices-manager');
  });

  it('renders the prices manager page container', () => {
    cy.getByTestId(SEL.PRICES_MANAGER_PAGE).should('be.visible');
  });

  it('renders the B2B header', () => {
    cy.get('[data-testid="prices-manager-header"]').should('be.visible');
  });

  it('renders the B2B sidebar', () => {
    cy.get('[data-testid="prices-manager-sidebar"]').should('be.visible');
  });

  it('renders the data table', () => {
    cy.get('[data-testid="prices-manager-table"]').should('be.visible');
  });

  it('renders inline price input fields', () => {
    cy.get('[data-testid^="prices-manager-price-input-"]').should('have.length.at.least', 1);
  });

  it('renders inline discount input fields', () => {
    cy.get('[data-testid^="prices-manager-discount-input-"]').should('have.length.at.least', 1);
  });

  it('renders pagination', () => {
    cy.get('[data-testid="prices-manager-pagination"]').should('exist');
  });

  it('price input is editable', () => {
    // Use {selectall} to replace the controlled input value in React
    cy.get('[data-testid^="prices-manager-price-input-"]')
      .first()
      .type('{selectall}99')
      .should('have.value', '99');
  });

  it('discount input is editable', () => {
    cy.get('[data-testid^="prices-manager-discount-input-"]')
      .first()
      .type('{selectall}15%')
      .should('have.value', '15%');
  });

  it('shows the sidebar logout link', () => {
    cy.getByTestId(SEL.B2B_SIDEBAR_LOGOUT).should('be.visible');
  });
});
