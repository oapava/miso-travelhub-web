/**
 * E2E — Home page
 *
 * Covers:
 * - Page renders with hero and top-hotels sections
 * - Language toggle is accessible
 * - Login / Sign-up buttons visible for unauthenticated users
 * - Compact search bar is NOT shown in header on home route
 */

import { SEL, sel } from '../support/selectors';

describe('Home page', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('loads the home page container', () => {
    cy.getByTestId(SEL.HOME_PAGE).should('be.visible');
  });

  it('renders the hero section', () => {
    cy.getByTestId(SEL.HOME_HERO).should('be.visible');
  });

  it('renders the top hotels section', () => {
    cy.getByTestId(SEL.HOME_TOP_HOTELS).should('be.visible');
  });

  it('header does NOT show the compact search bar on home', () => {
    // The Header hides its compact SearchBar on home (showSearchBar = false).
    // The hero section has its own expanded SearchBar — we only check the <header> element.
    cy.get('header').find(sel(SEL.SEARCH_BAR_LOCATION)).should('not.exist');
  });

  it('shows login and sign-up buttons when unauthenticated', () => {
    cy.getByTestId(SEL.HEADER_LOGIN_BUTTON).should('be.visible');
    cy.getByTestId(SEL.HEADER_SIGNUP_BUTTON).should('be.visible');
  });

  it('language toggle button is visible', () => {
    cy.getByTestId(SEL.HEADER_LANGUAGE_TOGGLE).should('be.visible');
  });

  it('clicking the language toggle changes the language label', () => {
    cy.getByTestId(SEL.HEADER_LANGUAGE_TOGGLE).then(($btn) => {
      const initial = $btn.text().trim();
      cy.getByTestId(SEL.HEADER_LANGUAGE_TOGGLE).click();
      cy.getByTestId(SEL.HEADER_LANGUAGE_TOGGLE)
        .invoke('text')
        .then((next) => {
          expect(next.trim()).not.to.equal(initial);
        });
    });
  });

  it('does not show account/logout links when unauthenticated', () => {
    cy.get(sel(SEL.HEADER_ACCOUNT)).should('not.exist');
    cy.get(sel(SEL.HEADER_LOGOUT)).should('not.exist');
  });

  it('shows account and logout links when authenticated', () => {
    cy.loginAsB2C();
    cy.visit('/');
    cy.getByTestId(SEL.HEADER_ACCOUNT).should('be.visible');
    cy.getByTestId(SEL.HEADER_LOGOUT).should('be.visible');
  });
});
