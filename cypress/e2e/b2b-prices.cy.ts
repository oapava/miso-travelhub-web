/**
 * E2E — B2B Prices Manager page (/business/prices-manager)
 *
 * Covers:
 * - Page structure: header, sidebar, container
 * - Rooms table with base price column and config (→) button
 * - Rooms with base tariff show the price and a disabled config button (until modal)
 * - Rooms without base tariff show "Set price" button (inline edit)
 * - Inline edit form: price, discount, date fields + save/cancel
 * - Config button opens TarifaDetailModal
 * - TarifaDetailModal: base tariff display, variations table, add-variation form
 * - Add variation with percentage and fixed discount types
 * - Delete variation
 * - Error / empty / loading states
 *
 * API intercepts (glob patterns used with cy.intercept):
 *   GET  glob:api/v1/inventory/hoteles/(id)/habitaciones    → hotel-rooms.json
 *   GET  glob:api/v1/inventory/habitaciones/(id)/tarifas/base → room-base-tariff.json OR 404
 *   GET  glob:api/v1/inventory/habitaciones/(id)/tarifas      → []
 *   POST glob:api/v1/inventory/habitaciones/(id)/tarifas      → stub created tariff
 *   PATCH glob:api/v1/inventory/tarifas/(id)                  → stub updated tariff
 *   DELETE glob:api/v1/inventory/tarifas/(id)                 → 204
 */

import { SEL } from '../support/selectors';

const INTERCEPT_ROOMS        = '**/api/v1/inventory/hoteles/*/habitaciones';
const INTERCEPT_BASE_TARIFF  = '**/api/v1/inventory/habitaciones/*/tarifas/base';
const INTERCEPT_ALL_TARIFFS  = '**/api/v1/inventory/habitaciones/*/tarifas';
const INTERCEPT_CREATE_TARIFF = '**/api/v1/inventory/habitaciones/*/tarifas';
const INTERCEPT_PATCH_TARIFF = '**/api/v1/inventory/tarifas/*';
const INTERCEPT_DELETE_TARIFF = '**/api/v1/inventory/tarifas/*';

// ─── Shared setup helper ──────────────────────────────────────────────────────

/**
 * Login, intercept API calls and visit the prices manager.
 * - First room (room-suite-01)  → has a base tariff (fixture: room-base-tariff.json)
 * - Other rooms                  → no base tariff (404)
 */
function setupWithRooms() {
  cy.loginAsB2B();

  cy.intercept('GET', INTERCEPT_ROOMS, { fixture: 'hotel-rooms.json' }).as('getRooms');

  // Only room-suite-01 has a tariff — others return 404
  cy.intercept('GET', '**/api/v1/inventory/habitaciones/room-suite-01/tarifas/base', {
    fixture: 'room-base-tariff.json',
  }).as('getSuiteTariff');
  cy.intercept('GET', '**/api/v1/inventory/habitaciones/room-standard-01/tarifas/base', {
    statusCode: 404,
    body: { detail: 'Not found' },
  }).as('getStandardTariff');
  cy.intercept('GET', '**/api/v1/inventory/habitaciones/room-deluxe-01/tarifas/base', {
    statusCode: 404,
    body: { detail: 'Not found' },
  }).as('getDeluxeTariff');

  cy.visit('/business/prices-manager');
  cy.wait('@getRooms');
  // Wait for all three per-room tariff requests to settle so the table is
  // fully rendered before any test body runs.  Without these waits, the
  // test body's new intercepts can override the 404 stubs before the
  // component's Promise.allSettled resolves, preventing baseTariff from
  // being set to null and hiding the "Set price" button.
  cy.wait('@getSuiteTariff');
  cy.wait('@getStandardTariff');
  cy.wait('@getDeluxeTariff');
}

// ─── Page structure ────────────────────────────────────────────────────────────

describe('B2B Prices Manager — page structure', () => {
  beforeEach(setupWithRooms);

  it('renders the prices manager page container', () => {
    cy.getByTestId(SEL.PRICES_MANAGER_PAGE).should('be.visible');
  });

  it('renders the B2B header', () => {
    cy.getByTestId(SEL.PRICES_MANAGER_HEADER).should('be.visible');
  });

  it('renders the B2B sidebar', () => {
    cy.getByTestId(SEL.PRICES_MANAGER_SIDEBAR).should('be.visible');
  });

  it('shows the sidebar logout link', () => {
    cy.getByTestId(SEL.B2B_SIDEBAR_LOGOUT).should('be.visible');
  });
});

// ─── Rooms table ──────────────────────────────────────────────────────────────

describe('B2B Prices Manager — rooms table', () => {
  beforeEach(setupWithRooms);

  it('renders the data table once rooms are loaded', () => {
    cy.getByTestId(SEL.PRICES_MANAGER_TABLE).should('exist');
  });

  it('renders at least one room row', () => {
    cy.get('[data-testid^="prices-manager-base-price-"]').should('have.length.at.least', 1);
  });

  it('renders a config (→) button for each room', () => {
    cy.get('[data-testid^="prices-manager-config-btn-"]').should('have.length', 3);
  });

  it('room WITH a base tariff shows a price value (room-suite-01)', () => {
    cy.getByTestId(`prices-manager-base-price-room-suite-01`)
      .should('contain.text', '200');
  });

  it('config button is ENABLED for room with base tariff (room-suite-01)', () => {
    cy.getByTestId(`prices-manager-config-btn-room-suite-01`).should('not.be.disabled');
  });

  it('room WITHOUT a base tariff shows the "Set price" button (room-standard-01)', () => {
    cy.getByTestId(`prices-manager-edit-btn-room-standard-01`).should('be.visible');
  });

  it('config button is DISABLED for room without base tariff (room-standard-01)', () => {
    cy.getByTestId(`prices-manager-config-btn-room-standard-01`).should('be.disabled');
  });
});

// ─── Inline set-price form ────────────────────────────────────────────────────

describe('B2B Prices Manager — inline set-price form', () => {
  beforeEach(setupWithRooms);

  it('clicking "Set price" shows the inline edit form for that room', () => {
    cy.getByTestId(`prices-manager-edit-btn-room-standard-01`).click();
    cy.getByTestId(`prices-manager-inline-edit-room-standard-01`).should('be.visible');
  });

  it('inline edit form has a price input', () => {
    cy.getByTestId(`prices-manager-edit-btn-room-standard-01`).click();
    cy.getByTestId(`prices-manager-edit-price-room-standard-01`).should('exist');
  });

  it('inline edit form has a discount input', () => {
    cy.getByTestId(`prices-manager-edit-btn-room-standard-01`).click();
    cy.getByTestId(`prices-manager-edit-discount-room-standard-01`).should('exist');
  });

  it('inline edit form has start-date and end-date inputs', () => {
    cy.getByTestId(`prices-manager-edit-btn-room-standard-01`).click();
    cy.getByTestId(`prices-manager-edit-start-room-standard-01`).should('exist');
    cy.getByTestId(`prices-manager-edit-end-room-standard-01`).should('exist');
  });

  it('cancel button hides the inline edit form', () => {
    cy.getByTestId(`prices-manager-edit-btn-room-standard-01`).click();
    cy.getByTestId(`prices-manager-inline-edit-room-standard-01`).should('be.visible');
    cy.getByTestId(`prices-manager-cancel-btn-room-standard-01`).click();
    cy.getByTestId(`prices-manager-inline-edit-room-standard-01`).should('not.exist');
  });

  it('save button is disabled when price is empty', () => {
    cy.getByTestId(`prices-manager-edit-btn-room-standard-01`).click();
    cy.getByTestId(`prices-manager-save-btn-room-standard-01`).should('be.disabled');
  });

  it('saving a new base price calls createTariff and updates the row', () => {
    const newTariff = {
      id: 'tariff-new-01',
      habitacionId: 'room-standard-01',
      precioBase: 150,
      descuento: 0,
      moneda: 'USD',
      fechaInicio: null,
      fechaFin: null,
    };
    cy.intercept('POST', INTERCEPT_CREATE_TARIFF, {
      statusCode: 201,
      body: newTariff,
    }).as('createTariff');
    // Also stub the refresh call made by handleCloseModal
    cy.intercept('GET', '**/api/v1/inventory/habitaciones/room-standard-01/tarifas/base', {
      body: newTariff,
    }).as('refreshTariff');

    cy.getByTestId(`prices-manager-edit-btn-room-standard-01`).click();
    cy.getByTestId(`prices-manager-edit-price-room-standard-01`).clear().type('150');
    cy.getByTestId(`prices-manager-edit-start-room-standard-01`).type('2026-01-01');
    cy.getByTestId(`prices-manager-edit-end-room-standard-01`).type('2026-12-31');
    cy.getByTestId(`prices-manager-save-btn-room-standard-01`).click();
    cy.wait('@createTariff');

    // After save, inline edit should close
    cy.getByTestId(`prices-manager-inline-edit-room-standard-01`).should('not.exist');
  });
});

// ─── TarifaDetailModal ────────────────────────────────────────────────────────

describe('B2B Prices Manager — TarifaDetailModal opens', () => {
  beforeEach(() => {
    setupWithRooms();
    // Stub tariff list for the modal
    cy.intercept('GET', '**/api/v1/inventory/habitaciones/room-suite-01/tarifas', {
      body: [],
    }).as('getVariations');
  });

  it('clicking config (→) on a room with tariff opens the modal', () => {
    cy.getByTestId(`prices-manager-config-btn-room-suite-01`).click();
    cy.getByTestId(SEL.TARIFF_MODAL_CONTAINER).should('be.visible');
  });

  it('modal shows the room type as title', () => {
    cy.getByTestId(`prices-manager-config-btn-room-suite-01`).click();
    cy.getByTestId(SEL.TARIFF_MODAL_TITLE).should('contain.text', 'Suite');
  });

  it('modal shows loading state while fetching tariffs', () => {
    // Delay the response so we can see the loading indicator
    cy.intercept('GET', '**/api/v1/inventory/habitaciones/room-suite-01/tarifas/base', (req) => {
      req.reply({ delay: 1000, fixture: 'room-base-tariff.json' });
    }).as('slowTariff');
    cy.getByTestId(`prices-manager-config-btn-room-suite-01`).click();
    cy.getByTestId(SEL.TARIFF_MODAL_LOADING).should('exist');
  });

  it('modal shows base tariff price after loading', () => {
    cy.getByTestId(`prices-manager-config-btn-room-suite-01`).click();
    cy.wait('@getVariations');
    cy.getByTestId(SEL.TARIFF_MODAL_BASE_PRICE).should('contain.text', '200');
  });

  it('modal shows base tariff discount percentage', () => {
    cy.getByTestId(`prices-manager-config-btn-room-suite-01`).click();
    cy.wait('@getVariations');
    cy.getByTestId(SEL.TARIFF_MODAL_BASE_DISCOUNT).should('contain.text', '10%');
  });

  it('modal shows "no variations" when list is empty', () => {
    cy.getByTestId(`prices-manager-config-btn-room-suite-01`).click();
    cy.wait('@getVariations');
    cy.getByTestId(SEL.TARIFF_MODAL_NO_VARIATIONS).should('be.visible');
  });

  it('close button dismisses the modal', () => {
    cy.getByTestId(`prices-manager-config-btn-room-suite-01`).click();
    cy.getByTestId(SEL.TARIFF_MODAL_CONTAINER).should('be.visible');
    cy.getByTestId(SEL.TARIFF_MODAL_CLOSE_BTN).click();
    cy.getByTestId(SEL.TARIFF_MODAL_CONTAINER).should('not.exist');
  });
});

// ─── TarifaDetailModal — add variation form ────────────────────────────────────

describe('B2B Prices Manager — TarifaDetailModal add variation', () => {
  beforeEach(() => {
    setupWithRooms();
    cy.intercept('GET', '**/api/v1/inventory/habitaciones/room-suite-01/tarifas', {
      body: [],
    }).as('getVariations');
    cy.getByTestId(`prices-manager-config-btn-room-suite-01`).click();
    cy.wait('@getVariations');
  });

  it('renders the add-variation form section', () => {
    cy.getByTestId(SEL.TARIFF_MODAL_FORM).should('be.visible');
  });

  it('renders discount type selector in add form', () => {
    cy.getByTestId(SEL.TARIFF_MODAL_FORM_DISC_TYPE).should('exist');
  });

  it('discount type selector has percentage and fixed options', () => {
    cy.getByTestId(SEL.TARIFF_MODAL_FORM_DISC_TYPE).find('option').should('have.length', 2);
  });

  it('Add button is disabled when form is empty', () => {
    cy.getByTestId(SEL.TARIFF_MODAL_ADD_BTN).should('be.disabled');
  });

  it('shows final price preview when price and discount are filled', () => {
    cy.getByTestId(SEL.TARIFF_MODAL_FORM_PRICE).type('200');
    cy.getByTestId(SEL.TARIFF_MODAL_FORM_DISC_VALUE).type('20');
    // 200 * (1 - 20/100) = 160
    cy.getByTestId(SEL.TARIFF_MODAL_FORM_PREVIEW).should('contain.text', '160.00');
  });

  it('Add button becomes enabled when all fields are filled', () => {
    cy.getByTestId(SEL.TARIFF_MODAL_FORM_PRICE).type('200');
    cy.getByTestId(SEL.TARIFF_MODAL_FORM_DISC_VALUE).type('10');
    cy.getByTestId(SEL.TARIFF_MODAL_FORM_START).type('2026-11-01');
    cy.getByTestId(SEL.TARIFF_MODAL_FORM_END).type('2026-11-30');
    cy.getByTestId(SEL.TARIFF_MODAL_ADD_BTN).should('not.be.disabled');
  });

  it('successfully adds a percentage-discount variation', () => {
    const newVariation = {
      id: 'var-new-01',
      habitacionId: 'room-suite-01',
      precioBase: 180,
      descuento: 0.10,
      moneda: 'USD',
      fechaInicio: '2026-11-01T00:00:00+00:00',
      fechaFin: '2026-11-30T23:59:59+00:00',
    };
    cy.intercept('POST', '**/api/v1/inventory/habitaciones/room-suite-01/tarifas', {
      statusCode: 201,
      body: newVariation,
    }).as('createVariation');
    // Stub the re-fetch that happens after add
    cy.intercept('GET', '**/api/v1/inventory/habitaciones/room-suite-01/tarifas', {
      body: [newVariation],
    }).as('getVariationsUpdated');

    cy.getByTestId(SEL.TARIFF_MODAL_FORM_PRICE).type('180');
    cy.getByTestId(SEL.TARIFF_MODAL_FORM_DISC_VALUE).type('10');
    cy.getByTestId(SEL.TARIFF_MODAL_FORM_START).type('2026-11-01');
    cy.getByTestId(SEL.TARIFF_MODAL_FORM_END).type('2026-11-30');
    cy.getByTestId(SEL.TARIFF_MODAL_ADD_BTN).click();
    cy.wait('@createVariation');
    cy.wait('@getVariationsUpdated');

    // Variation table now visible
    cy.getByTestId(SEL.TARIFF_MODAL_VARIATIONS_TABLE).should('be.visible');
  });

  it('successfully adds a fixed-discount variation', () => {
    const newVariation = {
      id: 'var-fixed-01',
      habitacionId: 'room-suite-01',
      precioBase: 200,
      descuento: 0.25,
      moneda: 'USD',
      fechaInicio: '2026-12-01T00:00:00+00:00',
      fechaFin: '2026-12-31T23:59:59+00:00',
    };
    cy.intercept('POST', '**/api/v1/inventory/habitaciones/room-suite-01/tarifas', {
      statusCode: 201,
      body: newVariation,
    }).as('createFixed');
    cy.intercept('GET', '**/api/v1/inventory/habitaciones/room-suite-01/tarifas', {
      body: [newVariation],
    }).as('getVariationsFixed');

    // Switch to fixed discount type
    cy.getByTestId(SEL.TARIFF_MODAL_FORM_DISC_TYPE).select('fixed');
    cy.getByTestId(SEL.TARIFF_MODAL_FORM_PRICE).type('200');
    cy.getByTestId(SEL.TARIFF_MODAL_FORM_DISC_VALUE).type('50'); // 50/200 = 0.25
    cy.getByTestId(SEL.TARIFF_MODAL_FORM_START).type('2026-12-01');
    cy.getByTestId(SEL.TARIFF_MODAL_FORM_END).type('2026-12-31');
    cy.getByTestId(SEL.TARIFF_MODAL_ADD_BTN).click();
    cy.wait('@createFixed');
    cy.wait('@getVariationsFixed');

    cy.getByTestId(SEL.TARIFF_MODAL_VARIATIONS_TABLE).should('be.visible');
  });
});

// ─── TarifaDetailModal — variations list ──────────────────────────────────────

describe('B2B Prices Manager — TarifaDetailModal variations list', () => {
  const existingVariation = {
    id: 'var-001',
    habitacionId: 'room-suite-01',
    precioBase: 150,
    descuento: 0.20,
    moneda: 'USD',
    fechaInicio: '2026-11-01T00:00:00+00:00',
    fechaFin: '2026-11-30T23:59:59+00:00',
  };

  beforeEach(() => {
    setupWithRooms();
    cy.intercept('GET', '**/api/v1/inventory/habitaciones/room-suite-01/tarifas', {
      body: [existingVariation],
    }).as('getVariations');
    cy.getByTestId(`prices-manager-config-btn-room-suite-01`).click();
    cy.wait('@getVariations');
  });

  it('renders the variations table', () => {
    cy.getByTestId(SEL.TARIFF_MODAL_VARIATIONS_TABLE).should('be.visible');
  });

  it('shows the variation row', () => {
    cy.get(`[data-testid="prices-manager-tariff-modal-variation-row-var-001"]`)
      .should('be.visible');
  });

  it('variation row shows price and discount', () => {
    cy.get(`[data-testid="prices-manager-tariff-modal-variation-row-var-001"]`)
      .should('contain.text', '150')
      .and('contain.text', '20%');
  });

  it('each variation has Edit and Delete buttons', () => {
    cy.get(`[data-testid="prices-manager-tariff-modal-edit-btn-var-001"]`).should('exist');
    cy.get(`[data-testid="prices-manager-tariff-modal-delete-var-001"]`).should('exist');
  });

  it('clicking Edit shows the inline edit row', () => {
    cy.get(`[data-testid="prices-manager-tariff-modal-edit-btn-var-001"]`).click();
    cy.get(`[data-testid="prices-manager-tariff-modal-edit-row-var-001"]`).should('be.visible');
  });

  it('edit row is pre-populated with variation values', () => {
    cy.get(`[data-testid="prices-manager-tariff-modal-edit-btn-var-001"]`).click();
    cy.get(`[data-testid="prices-manager-tariff-modal-edit-price-var-001"]`)
      .should('have.value', '150');
    cy.get(`[data-testid="prices-manager-tariff-modal-edit-var-001-discount-value"]`)
      .should('have.value', '20'); // 0.20 * 100 = 20
  });

  it('clicking Cancel in edit row hides it', () => {
    cy.get(`[data-testid="prices-manager-tariff-modal-edit-btn-var-001"]`).click();
    cy.get(`[data-testid="prices-manager-tariff-modal-edit-row-var-001"]`).should('be.visible');
    cy.get(`[data-testid="prices-manager-tariff-modal-edit-cancel-var-001"]`).click();
    cy.get(`[data-testid="prices-manager-tariff-modal-edit-row-var-001"]`).should('not.exist');
  });

  it('saving an edit calls PATCH and updates the row', () => {
    const updated = { ...existingVariation, precioBase: 160, descuento: 0.15 };
    cy.intercept('PATCH', `**/api/v1/inventory/tarifas/var-001`, {
      statusCode: 200,
      body: updated,
    }).as('patchVariation');

    cy.get(`[data-testid="prices-manager-tariff-modal-edit-btn-var-001"]`).click();
    cy.get(`[data-testid="prices-manager-tariff-modal-edit-price-var-001"]`)
      .clear().type('160');
    cy.get(`[data-testid="prices-manager-tariff-modal-edit-var-001-discount-value"]`)
      .clear().type('15');
    cy.get(`[data-testid="prices-manager-tariff-modal-edit-save-var-001"]`).click();
    cy.wait('@patchVariation');

    // Edit row should close after successful save
    cy.get(`[data-testid="prices-manager-tariff-modal-edit-row-var-001"]`).should('not.exist');
  });

  it('deleting a variation removes it from the list', () => {
    cy.intercept('DELETE', `**/api/v1/inventory/tarifas/var-001`, {
      statusCode: 204,
      body: {},
    }).as('deleteVariation');

    cy.get(`[data-testid="prices-manager-tariff-modal-delete-var-001"]`).click();
    cy.wait('@deleteVariation');

    // After delete, "no variations" message should appear
    cy.getByTestId(SEL.TARIFF_MODAL_NO_VARIATIONS).should('be.visible');
  });
});

// ─── Loading / error / empty states ───────────────────────────────────────────

describe('B2B Prices Manager — loading & error states', () => {
  it('shows loading indicator while rooms are being fetched', () => {
    cy.loginAsB2B();
    cy.intercept('GET', INTERCEPT_ROOMS, (req) => {
      req.reply({ delay: 500, fixture: 'hotel-rooms.json' });
    }).as('slowRooms');
    cy.visit('/business/prices-manager');
    cy.getByTestId(SEL.PRICES_MANAGER_LOADING).should('exist');
    cy.wait('@slowRooms');
  });

  it('shows error state when rooms API returns a 500', () => {
    cy.loginAsB2B();
    cy.intercept('GET', INTERCEPT_ROOMS, {
      statusCode: 500,
      body: { detail: 'Server error' },
    }).as('roomsError');
    cy.visit('/business/prices-manager');
    cy.wait('@roomsError');
    cy.getByTestId(SEL.PRICES_MANAGER_ERROR).should('be.visible');
  });

  it('shows empty state when rooms API returns empty array', () => {
    cy.loginAsB2B();
    cy.intercept('GET', INTERCEPT_ROOMS, { body: [] }).as('emptyRooms');
    cy.intercept('GET', INTERCEPT_BASE_TARIFF, { statusCode: 404, body: {} });
    cy.visit('/business/prices-manager');
    cy.wait('@emptyRooms');
    cy.getByTestId(SEL.PRICES_MANAGER_EMPTY).should('be.visible');
  });
});
