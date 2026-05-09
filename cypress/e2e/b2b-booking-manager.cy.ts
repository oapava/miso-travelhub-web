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
    // Intercept the PATCH so handleConfirmBooking resolves and setIsConfirmOpen(true) is called
    cy.intercept('PATCH', '**/api/v1/booking/update/**', {
      statusCode: 200,
      body: {
        id: 'hb-001', codigo: 'TH-2026-101', viajeroId: 'c3e7a1f2-0001',
        habitacionId: 'room-A', nombreHabitacion: 'La Perla Suite',
        fechaCheckIn: '2026-05-01T12:00:00', fechaCheckOut: '2026-05-05T12:00:00',
        numHuespedes: 2, estado: 'CONFIRMADO',
        subtotal: 8000, impuestos: 1440, total: 9440, moneda: 'USD',
      },
    }).as('updateBooking');
    cy.get('[data-testid^="booking-confirm-btn-"]').first().click({ force: true });
    cy.wait('@updateBooking');
    cy.getByTestId(SEL.BOOKING_CONFIRM_ACTION_MODAL_CONTAINER).should('be.visible');
  });

  it('opens the cancel modal when clicking Cancel', () => {
    cy.get('[data-testid^="booking-cancel-btn-"]').first().click({ force: true });
    cy.getByTestId(SEL.BOOKING_CANCEL_MODAL_CONTAINER).should('be.visible');
  });
});

describe('B2B Booking Manager — detail modal content', () => {
  beforeEach(() => {
    cy.loginAsB2B();
    cy.intercept('GET', INTERCEPT_HOTEL_BOOKINGS, {
      fixture: 'hotel-bookings.json',
    }).as('getHotelBookings');
    cy.visit('/business/booking-manager');
    cy.wait('@getHotelBookings');
    // Open the detail modal for the first booking (hb-001 — has all fields)
    cy.get('[data-testid^="booking-detail-btn-"]').first().click({ force: true });
    cy.getByTestId(SEL.BOOKING_DETAIL_MODAL_CONTAINER).should('be.visible');
  });

  it('renders the booking code in the modal header', () => {
    cy.getByTestId(SEL.BOOKING_DETAIL_MODAL_BOOKING_CODE).should('contain.text', 'TH-2026-101');
  });

  it('renders the status badge', () => {
    cy.getByTestId(SEL.BOOKING_DETAIL_MODAL_ACTIVE_BADGE).should('be.visible');
  });

  // ── Guest information ────────────────────────────────────────────────────

  it('renders the guest information section', () => {
    cy.getByTestId(SEL.BOOKING_DETAIL_MODAL_GUEST_SECTION).should('be.visible');
  });

  it('shows nombreUser as the guest display name', () => {
    cy.getByTestId(SEL.BOOKING_DETAIL_MODAL_CLIENT_NAME).should('contain.text', 'Ana García');
  });

  it('shows guest email when provided in fixture', () => {
    cy.getByTestId(SEL.BOOKING_DETAIL_MODAL_GUEST_EMAIL).should('contain.text', 'ana.garcia@email.com');
  });

  it('shows guest phone when provided in fixture', () => {
    cy.getByTestId(SEL.BOOKING_DETAIL_MODAL_GUEST_PHONE).should('contain.text', '+57 300 111 2222');
  });

  it('shows estimated arrival time when provided in fixture', () => {
    cy.getByTestId(SEL.BOOKING_DETAIL_MODAL_ARRIVAL_TIME).should('contain.text', '3:00 PM');
  });

  // ── Property section ─────────────────────────────────────────────────────

  it('renders the property section', () => {
    cy.getByTestId(SEL.BOOKING_DETAIL_MODAL_PROPERTY_SECTION).should('be.visible');
  });

  it('shows the hotel name in the property section', () => {
    cy.getByTestId(SEL.BOOKING_DETAIL_MODAL_HOTEL_NAME).should('contain.text', 'Hotel La Perla');
  });

  it('shows ciudad and pais as location', () => {
    cy.getByTestId(SEL.BOOKING_DETAIL_MODAL_LOCATION).should('contain.text', 'Medellín').and('contain.text', 'Colombia');
  });

  it('shows the room name', () => {
    cy.getByTestId(SEL.BOOKING_DETAIL_MODAL_ROOM).should('contain.text', 'La Perla Suite');
  });

  it('shows tipo_habitacion when provided', () => {
    cy.getByTestId(SEL.BOOKING_DETAIL_MODAL_ROOM_TYPE).should('contain.text', 'Suite');
  });

  it('shows categoria when provided', () => {
    cy.getByTestId(SEL.BOOKING_DETAIL_MODAL_CATEGORY).should('contain.text', 'Luxury');
  });

  it('shows tamano_habitacion when provided', () => {
    cy.getByTestId(SEL.BOOKING_DETAIL_MODAL_ROOM_SIZE).should('contain.text', '55 m²');
  });

  // ── Stay details ─────────────────────────────────────────────────────────

  it('renders the stay details section', () => {
    cy.getByTestId(SEL.BOOKING_DETAIL_MODAL_DATES_SECTION).should('be.visible');
  });

  it('shows numHuespedes in stay details', () => {
    cy.getByTestId(SEL.BOOKING_DETAIL_MODAL_GUESTS_COUNT).should('contain.text', '2 adults');
  });

  it('shows check-in date', () => {
    cy.getByTestId(SEL.BOOKING_DETAIL_MODAL_CHECKIN).should('contain.text', '01/05/26');
  });

  it('shows check-out date', () => {
    cy.getByTestId(SEL.BOOKING_DETAIL_MODAL_CHECKOUT).should('contain.text', '05/05/26');
  });

  it('shows nights count', () => {
    cy.getByTestId(SEL.BOOKING_DETAIL_MODAL_NIGHTS).should('contain.text', '4 nights');
  });

  // ── Financial section ────────────────────────────────────────────────────

  it('renders the financial section', () => {
    cy.getByTestId(SEL.BOOKING_DETAIL_MODAL_FINANCIAL_SECTION).should('be.visible');
  });

  it('shows the booking total', () => {
    // Modal content may extend beyond viewport — scroll the element into view first
    cy.getByTestId(SEL.BOOKING_DETAIL_MODAL_TOTAL).scrollIntoView().should('exist');
  });

  // ── Special requests ─────────────────────────────────────────────────────

  it('shows special requests when provided', () => {
    cy.getByTestId(SEL.BOOKING_DETAIL_MODAL_SPECIAL_REQUESTS)
      .scrollIntoView()
      .should('contain.text', 'Vista al mar');
  });

  // ── Actions ──────────────────────────────────────────────────────────────

  it('shows CONFIRM and CANCEL action buttons inside the modal', () => {
    cy.getByTestId(SEL.BOOKING_DETAIL_MODAL_CONFIRM_BTN).scrollIntoView().should('exist');
    cy.getByTestId(SEL.BOOKING_DETAIL_MODAL_CANCEL_BTN).scrollIntoView().should('exist');
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
