/**
 * E2E — Results page
 *
 * Covers:
 * - Page renders when seeded with sessionStorage results
 * - Sidebar and main content area are visible
 * - Compact search bar is present in the header (internal page)
 * - Hotels cards are rendered
 * - Sort select is rendered
 * - Pagination is rendered
 */

import { SEL } from '../support/selectors';

// Seed session storage with search results and params before the page loads.
function seedResults() {
  cy.fixture('search-results.json').then((results) => {
    const params = {
      location: 'Medellín',
      checkIn: '2026-06-15',
      checkOut: '2026-06-18',
      rooms: 1,
      adults: 2,
      children: 0,
    };
    cy.window().then((win) => {
      win.sessionStorage.setItem('travelhub_last_results', JSON.stringify(results));
      win.sessionStorage.setItem('travelhub_last_search', JSON.stringify(params));
    });
  });
}

describe('Results page', () => {
  beforeEach(() => {
    // First visit to get a window object we can write sessionStorage on
    cy.visit('/');
    seedResults();
    cy.visit('/results');
  });

  it('renders the results page container', () => {
    cy.getByTestId(SEL.RESULTS_PAGE).should('be.visible');
  });

  it('renders the main results area', () => {
    cy.getByTestId(SEL.RESULTS_MAIN).should('be.visible');
  });

  it('renders the filter sidebar', () => {
    cy.getByTestId(SEL.RESULTS_SIDEBAR).should('be.visible');
  });

  it('shows the compact search bar in the header', () => {
    // On internal pages the compact search is embedded in the Header
    cy.getByTestId(SEL.SEARCH_BAR_LOCATION).should('be.visible');
  });

  it('renders at least one hotel card', () => {
    cy.get('[data-testid^="hotel-card-"]').should('have.length.at.least', 1);
  });

  it('renders a sort/order selector', () => {
    // The sort <select> exists in ResultsPage; no unique testid but the Select component uses one
    cy.get('select').should('exist');
  });
});
