/**
 * E2E — B2B Booking Manager page (/business/booking-manager)
 *
 * Covers:
 * - Page renders header, sidebar, filters, table
 * - Bookings load from the hotel-specific API (hotel_id in JWT)
 * - Table rows render with correct columns
 * - Client-name filter narrows the list
 * - State filter narrows the list
 * - Detail modal opens when clicking the detail button
 * - Confirm-action modal opens when clicking Confirm
 * - Cancel modal opens when clicking Cancel
 * - Pagination is rendered
 *
 * NOTE: data-testid is placed on the native <input>/<select> element by the
 * Input/Select components, so we interact with the elements directly
 * (no .find('input') needed).
 */

import { SEL, sel } from '../support/selectors';

const INTERCEPT_HOTEL_BOOKINGS = '**/api/v1/booking/bookings_hotel*';

describe('B2B Booking Manager — page structure', () => {
  beforeEach(() => {
    cy.loginAsB2B();
    cy.intercept('GET', INTERCEPT_HOTEL_BOOKINGS, {
      fixture: 'hotel-bookings.json',
    }).as('getHotelBookings');
    cy.visit('/business/booking-manager');
    cy.wait('@getHotelBookings');
  });

  it('renders the booking manager page container', () => {
    cy.getByTestId(SEL.BOOKING_MANAGER_PAGE).should('be.visible');
  });

  it('renders the B2B header', () => {
    cy.getByTestId(SEL.BOOKING_MANAGER_HEADER).should('be.visible');
  });

  it('renders the B2B sidebar', () => {
    cy.getByTestId(SEL.BOOKING_MANAGER_SIDEBAR).should('be.visible');
  });

  it('renders the client name filter input', () => {
    // data-testid is on the <input> element itself
    cy.getByTestId(SEL.BOOKING_MANAGER_CLIENT_FILTER).should('be.visible');
  });

  it('renders the state filter select', () => {
    // data-testid is on the <select> element itself
    cy.getByTestId(SEL.BOOKING_MANAGER_STATE_FILTER).should('be.visible');
  });

  it('renders the start date filter', () => {
    cy.getByTestId(SEL.BOOKING_MANAGER_START_DATE).should('be.visible');
  });

  it('renders the end date filter', () => {
    cy.getByTestId(SEL.BOOKING_MANAGER_END_DATE).should('be.visible');
  });

  it('renders pagination', () => {
    cy.getByTestId(SEL.BOOKING_MANAGER_PAGINATION).should('exist');
  });
});

describe('B2B Booking Manager — table data', () => {
  beforeEach(() => {
    cy.loginAsB2B();
    cy.intercept('GET', INTERCEPT_HOTEL_BOOKINGS, {
      fixture: 'hotel-bookings.json',
    }).as('getHotelBookings');
    cy.visit('/business/booking-manager');
    cy.wait('@getHotelBookings');
  });

  it('renders the data table', () => {
    cy.getByTestId(SEL.BOOKING_MANAGER_TABLE).should('be.visible');
  });

  it('table has at least one data row', () => {
    cy.get('[data-testid^="booking-manager-table-row-"]').should('have.length.at.least', 1);
  });

  it('each row has client, state, start/end date cells', () => {
    cy.get('[data-testid^="booking-client-"]').first().should('be.visible');
    cy.get('[data-testid^="booking-state-"]').first().should('be.visible');
    cy.get('[data-testid^="booking-start-"]').first().should('be.visible');
    cy.get('[data-testid^="booking-end-"]').first().should('be.visible');
  });

  it('each row has Confirm, Cancel and Detail action buttons', () => {
    // Buttons may be clipped by table overflow — use exist + scrollIntoView
    cy.get('[data-testid^="booking-confirm-btn-"]').first().should('exist').scrollIntoView();
    cy.get('[data-testid^="booking-cancel-btn-"]').first().should('exist');
    cy.get('[data-testid^="booking-detail-btn-"]').first().should('exist');
  });
});

describe('B2B Booking Manager — filters', () => {
  beforeEach(() => {
    cy.loginAsB2B();
    cy.intercept('GET', INTERCEPT_HOTEL_BOOKINGS, {
      fixture: 'hotel-bookings.json',
    }).as('getHotelBookings');
    cy.visit('/business/booking-manager');
    cy.wait('@getHotelBookings');
  });

  it('client filter hides non-matching rows', () => {
    // data-testid IS the <input> — type directly
    cy.getByTestId(SEL.BOOKING_MANAGER_CLIENT_FILTER).type('zzz-no-match-zzz');
    cy.get('[data-testid^="booking-client-"]').should('not.exist');
    cy.getByTestId(SEL.BOOKING_MANAGER_EMPTY).should('be.visible');
  });

  it('state filter shows only matching rows', () => {
    // data-testid IS the <select> — select directly
    cy.getByTestId(SEL.BOOKING_MANAGER_STATE_FILTER).select('PENDIENTE');
    // Fixture has 1 PENDIENTE booking
    cy.get('[data-testid^="booking-state-"]').should('have.length', 1);
  });

  it('clearing the state filter shows all rows again', () => {
    cy.getByTestId(SEL.BOOKING_MANAGER_STATE_FILTER).select('PENDIENTE');
    cy.get('[data-testid^="booking-state-"]').should('have.length', 1);
    cy.getByTestId(SEL.BOOKING_MANAGER_STATE_FILTER).select('');
    cy.get('[data-testid^="booking-state-"]').should('have.length', 3);
  });
});

describe('B2B Booking Manager — modals', () => {
  beforeEach(() => {
    cy.loginAsB2B();
    cy.intercept('GET', INTERCEPT_HOTEL_BOOKINGS, {
      fixture: 'hotel-bookings.json',
    }).as('getHotelBookings');
    cy.visit('/business/booking-manager');
    cy.wait('@getHotelBookings');
  });

  it('opens the detail modal when clicking the detail button', () => {
    cy.get('[data-testid^="booking-detail-btn-"]').first().click({ force: true });
    cy.getByTestId(SEL.BOOKING_DETAIL_MODAL_CONTAINER).should('be.visible');
  });

  it('closes the detail modal via the modal close button', () => {
    cy.get('[data-testid^="booking-detail-btn-"]').first().click({ force: true });
    cy.getByTestId(SEL.BOOKING_DETAIL_MODAL_CONTAINER).should('be.visible');
    // Modal component renders close button as `${dataTestId}-close`
    cy.get('[data-testid="booking-detail-modal-close"]').click();
    cy.get(sel(SEL.BOOKING_DETAIL_MODAL_CONTAINER)).should('not.exist');
  });

  it('opens the confirm-action modal when clicking Confirm', () => {
    cy.get('[data-testid^="booking-confirm-btn-"]').first().click({ force: true });
    cy.getByTestId(SEL.BOOKING_CONFIRM_ACTION_MODAL_CONTAINER).should('be.visible');
  });

  it('opens the cancel modal when clicking Cancel', () => {
    cy.get('[data-testid^="booking-cancel-btn-"]').first().click({ force: true });
    cy.getByTestId(SEL.BOOKING_CANCEL_MODAL_CONTAINER).should('be.visible');
  });
});

describe('B2B Booking Manager — empty state', () => {
  it('shows empty state when API returns no bookings', () => {
    cy.loginAsB2B();
    cy.intercept('GET', INTERCEPT_HOTEL_BOOKINGS, { body: [] }).as('empty');
    cy.visit('/business/booking-manager');
    cy.wait('@empty');
    cy.getByTestId(SEL.BOOKING_MANAGER_EMPTY).should('be.visible');
  });

  it('shows error state when API returns a 500', () => {
    cy.loginAsB2B();
    cy.intercept('GET', INTERCEPT_HOTEL_BOOKINGS, {
      statusCode: 500,
      body: { detail: 'Internal Server Error' },
    }).as('error');
    cy.visit('/business/booking-manager');
    cy.wait('@error');
    cy.getByTestId(SEL.BOOKING_MANAGER_ERROR).should('be.visible');
  });
});
