/**
 * E2E — Hotel Detail page
 *
 * Covers:
 * - Page renders for a given hotelId param
 * - Gallery, tabs, sidebar, amenities, description, location, map visible
 * - Reviews section renders (loading → list or empty state)
 * - Booking sidebar shows rooms/guests selector
 * - Unauthenticated user sees login prompt (review form hidden)
 * - Authenticated user sees the review write form
 */

import { SEL, sel } from '../support/selectors';

const HOTEL_ID = 'room-001';
const DETAIL_URL = `/detail/${HOTEL_ID}`;

describe('Detail page — structure', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/api/v1/booking/reviews_hotel*', { fixture: 'reviews.json' }).as(
      'getReviews',
    );
    cy.visit(DETAIL_URL);
  });

  it('renders the detail page container', () => {
    cy.getByTestId(SEL.DETAIL_PAGE).should('be.visible');
  });

  it('renders the gallery section', () => {
    cy.getByTestId(SEL.DETAIL_GALLERY).should('exist');
  });

  it('renders the tab navigation', () => {
    cy.getByTestId(SEL.DETAIL_TABS).should('be.visible');
  });

  it('renders the booking sidebar (fixed-position aside exists)', () => {
    // The sidebar uses position:fixed so visibility is asserted via existence + scrollIntoView
    cy.getByTestId(SEL.DETAIL_SIDEBAR).should('exist').scrollIntoView();
    cy.getByTestId(SEL.DETAIL_SIDEBAR).should('be.visible');
  });

  it('renders the rooms/guests selector in the sidebar', () => {
    cy.getByTestId(SEL.DETAIL_ROOMS_GUESTS).should('exist');
  });

  it('renders the description tab content', () => {
    cy.getByTestId(SEL.DETAIL_DESCRIPTION).should('exist');
  });

  it('renders the amenities section', () => {
    cy.getByTestId(SEL.DETAIL_AMENITIES).should('exist');
  });

  it('renders the location section', () => {
    cy.getByTestId(SEL.DETAIL_LOCATION).should('exist');
  });

  it('renders the map placeholder', () => {
    cy.getByTestId(SEL.DETAIL_MAP).should('exist');
  });

  it('compact search bar is visible in header', () => {
    cy.getByTestId(SEL.SEARCH_BAR_LOCATION).should('be.visible');
  });

  it('favorite and share buttons are visible', () => {
    cy.getByTestId(SEL.FAVORITE_BTN).should('be.visible');
    cy.getByTestId(SEL.SHARE_BTN).should('be.visible');
  });

  it('add-review button is always present in the DOM', () => {
    cy.getByTestId(SEL.ADD_REVIEW_BTN).should('exist');
  });
});

describe('Detail page — reviews (unauthenticated)', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/api/v1/booking/reviews_hotel*', { fixture: 'reviews.json' }).as(
      'getReviews',
    );
    cy.visit(DETAIL_URL);
  });

  it('shows the login prompt for unauthenticated users', () => {
    cy.getByTestId(SEL.REVIEW_LOGIN_PROMPT).should('be.visible');
  });

  it('does NOT show the review write form for unauthenticated users', () => {
    // review-form is inside the isAuthenticated branch
    cy.get(sel(SEL.REVIEW_FORM)).should('not.exist');
  });
});

describe('Detail page — reviews (authenticated)', () => {
  beforeEach(() => {
    cy.loginAsB2C();
    cy.intercept('GET', '**/api/v1/booking/reviews_hotel*', { fixture: 'reviews.json' }).as(
      'getReviews',
    );
    cy.visit(DETAIL_URL);
  });

  it('shows the review write form for authenticated users', () => {
    cy.getByTestId(SEL.REVIEW_FORM).should('be.visible');
  });

  it('does NOT show the login prompt for authenticated users', () => {
    cy.get(sel(SEL.REVIEW_LOGIN_PROMPT)).should('not.exist');
  });
});
