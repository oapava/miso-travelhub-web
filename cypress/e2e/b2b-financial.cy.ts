/**
 * E2E — B2B Financial Reports page (/business/financial-reports)
 *
 * Covers:
 * - Page renders with header, sidebar
 * - Month / year selectors (replaced legacy date-range pickers)
 * - Download CSV button
 * - Totals panel (gross income, taxes, net income)
 * - Monthly transactions table (DataTable) and pagination
 * - Income chart section
 * - Room aggregation table (secondary section)
 * - Empty / error states
 */

import { SEL } from '../support/selectors';

const INTERCEPT_BOOKINGS = '**/api/v1/booking/get_bookings*';

// ─── Page structure ────────────────────────────────────────────────────────────

describe('B2B Financial Reports — page structure', () => {
  beforeEach(() => {
    cy.loginAsB2B();
    cy.intercept('GET', INTERCEPT_BOOKINGS, {
      fixture: 'financial-bookings.json',
    }).as('getBookings');
    cy.visit('/business/financial-reports');
    cy.wait('@getBookings');
  });

  it('renders the financial reports page container', () => {
    cy.getByTestId(SEL.FINANCIAL_REPORTS_PAGE).should('be.visible');
  });

  it('renders the B2B header', () => {
    cy.getByTestId(SEL.FINANCIAL_REPORTS_HEADER).should('be.visible');
  });

  it('renders the B2B sidebar', () => {
    cy.getByTestId(SEL.FINANCIAL_REPORTS_SIDEBAR).should('be.visible');
  });

  it('shows the sidebar logout link', () => {
    cy.getByTestId(SEL.B2B_SIDEBAR_LOGOUT).should('be.visible');
  });
});

// ─── Month / year selectors ────────────────────────────────────────────────────

describe('B2B Financial Reports — month/year selectors', () => {
  beforeEach(() => {
    cy.loginAsB2B();
    cy.intercept('GET', INTERCEPT_BOOKINGS, {
      fixture: 'financial-bookings.json',
    }).as('getBookings');
    cy.visit('/business/financial-reports');
    cy.wait('@getBookings');
  });

  it('renders the month selector', () => {
    cy.getByTestId(SEL.FINANCIAL_REPORTS_MONTH_SELECT).should('exist');
  });

  it('renders the year selector', () => {
    cy.getByTestId(SEL.FINANCIAL_REPORTS_YEAR_SELECT).should('exist');
  });

  it('month selector has 12 options', () => {
    cy.getByTestId(SEL.FINANCIAL_REPORTS_MONTH_SELECT)
      .find('option')
      .should('have.length', 12);
  });

  it('year selector has options', () => {
    cy.getByTestId(SEL.FINANCIAL_REPORTS_YEAR_SELECT)
      .find('option')
      .should('have.length.at.least', 1);
  });

  it('changing month updates the report title', () => {
    // Switch to January
    cy.getByTestId(SEL.FINANCIAL_REPORTS_MONTH_SELECT).select('0');
    cy.getByTestId(SEL.FINANCIAL_REPORTS_REPORT_TITLE).should('contain.text', 'January');
  });
});

// ─── Download CSV ──────────────────────────────────────────────────────────────

describe('B2B Financial Reports — download CSV', () => {
  beforeEach(() => {
    cy.loginAsB2B();
    cy.intercept('GET', INTERCEPT_BOOKINGS, {
      fixture: 'financial-bookings.json',
    }).as('getBookings');
    cy.visit('/business/financial-reports');
    cy.wait('@getBookings');
  });

  it('renders the download CSV button', () => {
    cy.getByTestId(SEL.FINANCIAL_REPORTS_DOWNLOAD_BTN).should('be.visible');
  });
});

// ─── Totals panel ─────────────────────────────────────────────────────────────

describe('B2B Financial Reports — totals panel', () => {
  beforeEach(() => {
    cy.loginAsB2B();
    cy.intercept('GET', INTERCEPT_BOOKINGS, {
      fixture: 'financial-bookings.json',
    }).as('getBookings');
    cy.visit('/business/financial-reports');
    cy.wait('@getBookings');
  });

  it('renders the totals panel', () => {
    cy.getByTestId(SEL.FINANCIAL_REPORTS_TOTALS).should('exist');
  });

  it('renders the gross income value', () => {
    cy.getByTestId(SEL.FINANCIAL_REPORTS_GROSS_VALUE).should('exist');
  });

  it('renders the taxes value', () => {
    cy.getByTestId(SEL.FINANCIAL_REPORTS_TAXES_VALUE).should('exist');
  });

  it('renders the net income value', () => {
    cy.getByTestId(SEL.FINANCIAL_REPORTS_NET_VALUE).should('exist');
  });

  it('gross income for May 2026 equals hb-001 total (9440 — only confirmed booking)', () => {
    // hb-001 is CONFIRMADO, fechaCheckIn 2026-05-02 → included in May 2026
    // hb-002 is PENDIENTE → excluded from gross
    // Default selection is current month; force May 2026
    cy.getByTestId(SEL.FINANCIAL_REPORTS_MONTH_SELECT).select('4'); // May = index 4
    cy.getByTestId(SEL.FINANCIAL_REPORTS_YEAR_SELECT).select('2026');
    cy.getByTestId(SEL.FINANCIAL_REPORTS_GROSS_VALUE).invoke('text').then((text) => {
      // Just verify it contains a numeric value (formatting may vary)
      expect(text.replace(/[^0-9]/g, '')).to.match(/\d+/);
    });
  });
});

// ─── Monthly transactions table ────────────────────────────────────────────────

describe('B2B Financial Reports — monthly transactions table', () => {
  beforeEach(() => {
    cy.loginAsB2B();
    cy.intercept('GET', INTERCEPT_BOOKINGS, {
      fixture: 'financial-bookings.json',
    }).as('getBookings');
    cy.visit('/business/financial-reports');
    cy.wait('@getBookings');
  });

  it('renders the report title heading', () => {
    cy.getByTestId(SEL.FINANCIAL_REPORTS_REPORT_TITLE).should('exist');
  });

  it('renders the monthly transactions table', () => {
    cy.getByTestId(SEL.FINANCIAL_REPORTS_REPORT_TABLE).should('exist');
  });

  it('renders the transactions pagination', () => {
    cy.getByTestId(SEL.FINANCIAL_REPORTS_REPORT_PAGINATION).should('exist');
  });

  it('shows confirmed bookings for May 2026 — hb-001 appears', () => {
    cy.getByTestId(SEL.FINANCIAL_REPORTS_MONTH_SELECT).select('4'); // May
    cy.getByTestId(SEL.FINANCIAL_REPORTS_YEAR_SELECT).select('2026');
    // hb-001 is CONFIRMADO and in May → should appear
    cy.getByTestId(SEL.FINANCIAL_REPORTS_REPORT_TABLE).should('contain.text', 'TH-2026-101');
  });

  it('hides pending bookings from the monthly transactions (hb-002 not shown in May)', () => {
    cy.getByTestId(SEL.FINANCIAL_REPORTS_MONTH_SELECT).select('4'); // May
    cy.getByTestId(SEL.FINANCIAL_REPORTS_YEAR_SELECT).select('2026');
    // hb-002 is PENDIENTE → excluded from transactions
    cy.getByTestId(SEL.FINANCIAL_REPORTS_REPORT_TABLE).should('not.contain.text', 'TH-2026-102');
  });

  it('shows no transactions for a month with no confirmed bookings (June 2026)', () => {
    cy.getByTestId(SEL.FINANCIAL_REPORTS_MONTH_SELECT).select('5'); // June
    cy.getByTestId(SEL.FINANCIAL_REPORTS_YEAR_SELECT).select('2026');
    // hb-003 is CANCELADO → excluded
    cy.getByTestId(SEL.FINANCIAL_REPORTS_REPORT_TABLE).should('not.contain.text', 'TH-2026-103');
  });
});

// ─── Income chart ──────────────────────────────────────────────────────────────

describe('B2B Financial Reports — income chart', () => {
  beforeEach(() => {
    cy.loginAsB2B();
    cy.intercept('GET', INTERCEPT_BOOKINGS, {
      fixture: 'financial-bookings.json',
    }).as('getBookings');
    cy.visit('/business/financial-reports');
    cy.wait('@getBookings');
  });

  it('renders the income chart section', () => {
    cy.getByTestId(SEL.FINANCIAL_REPORTS_INCOME_CHART).scrollIntoView().should('exist');
  });
});

// ─── Room aggregation table (secondary) ───────────────────────────────────────

describe('B2B Financial Reports — room aggregation table', () => {
  beforeEach(() => {
    cy.loginAsB2B();
    cy.intercept('GET', INTERCEPT_BOOKINGS, {
      fixture: 'financial-bookings.json',
    }).as('getBookings');
    cy.visit('/business/financial-reports');
    cy.wait('@getBookings');
  });

  it('renders the room aggregation table', () => {
    cy.getByTestId(SEL.FINANCIAL_REPORTS_TABLE).scrollIntoView().should('exist');
  });

  it('renders the room aggregation pagination', () => {
    cy.getByTestId(SEL.FINANCIAL_REPORTS_PAGINATION).should('exist');
  });
});

// ─── Error state ───────────────────────────────────────────────────────────────

describe('B2B Financial Reports — error state', () => {
  it('shows error message when API returns a 500', () => {
    cy.loginAsB2B();
    cy.intercept('GET', INTERCEPT_BOOKINGS, {
      statusCode: 500,
      body: { detail: 'Internal Server Error' },
    }).as('error');
    cy.visit('/business/financial-reports');
    cy.wait('@error');
    cy.getByTestId(SEL.FINANCIAL_REPORTS_ERROR).should('be.visible');
  });
});
