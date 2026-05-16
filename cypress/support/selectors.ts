/**
 * Central registry of every data-testid used in the application.
 *
 * Rule: each data-testid is declared ONCE here.
 * Tests import from this file — no inline testid strings in specs.
 *
 * Usage:
 *   import { SEL, sel } from '../support/selectors';
 *   cy.get(sel(SEL.HOME_PAGE))        // → [data-testid="home-page"]
 *   cy.getByTestId(SEL.HOME_PAGE)     // equivalent shorthand via custom command
 */

// ─── Page containers ────────────────────────────────────────────────────────────

export const SEL = {
  // ── B2C pages ──────────────────────────────────────────────────────────────
  HOME_PAGE:             'home-page',
  HOME_HERO:             'home-page-hero',
  HOME_TOP_HOTELS:       'home-page-top-hotels',

  RESULTS_PAGE:          'results-page',
  RESULTS_MAIN:          'results-main',
  RESULTS_SIDEBAR:       'results-sidebar',

  DETAIL_PAGE:           'detail-page',
  DETAIL_GALLERY:        'detail-gallery',
  DETAIL_TABS:           'detail-tabs',
  DETAIL_SIDEBAR:        'detail-sidebar',
  DETAIL_AMENITIES:      'detail-amenities',
  DETAIL_DESCRIPTION:    'detail-description',
  DETAIL_LOCATION:       'detail-location',
  DETAIL_MAP:            'detail-map',
  DETAIL_REVIEW_COUNT:   'detail-review-count',
  DETAIL_ROOMS_GUESTS:   'detail-rooms-guests',
  DETAIL_BOOKING_ERROR:  'detail-booking-error',
  DETAIL_PRICE_ERROR:    'detail-price-error',
  FAVORITE_BTN:          'favorite-btn',
  SHARE_BTN:             'share-btn',

  ACCOUNT_PAGE:          'account-page',
  ACCOUNT_MAIN:          'account-main',
  ACCOUNT_FORM:          'account-form',

  BOOKINGS_PAGE:         'bookings-page',
  BOOKINGS_MAIN:         'bookings-main',

  NOTIFICATIONS_PAGE:    'notifications-page',
  NOTIFICATIONS_MAIN:    'notifications-main',
  NOTIFICATIONS_LIST:    'notifications-list',

  // ── Header ──────────────────────────────────────────────────────────────────
  HEADER_LANGUAGE_TOGGLE: 'header-language-toggle',
  HEADER_ACCOUNT:          'header-account',
  HEADER_LOGOUT:           'header-logout',
  HEADER_LOGIN_BUTTON:     'header-login-button',
  HEADER_SIGNUP_BUTTON:    'header-signup-button',

  // ── Search bar ──────────────────────────────────────────────────────────────
  SEARCH_BAR_LOCATION:      'search-bar-location',
  SEARCH_BAR_GUESTS_TOGGLE: 'search-bar-guests-toggle',

  // ── Account sidebar (B2C) ───────────────────────────────────────────────────
  BOOKINGS_SIDEBAR:        'bookings-sidebar',
  NOTIFICATIONS_SIDEBAR:   'notifications-sidebar',
  ACCOUNT_SIDEBAR_LOGOUT:  'account-sidebar-logout',

  // ── Filter bar ──────────────────────────────────────────────────────────────
  FILTER_MAP_VIEW:         'filter-map-view',

  // ── Reviews ─────────────────────────────────────────────────────────────────
  REVIEWS_LIST:            'reviews-list',
  REVIEWS_LOADING:         'reviews-loading',
  REVIEWS_ERROR:           'reviews-error',
  REVIEWS_EMPTY:           'reviews-empty',
  REVIEW_FORM:             'review-form',
  ADD_REVIEW_BTN:          'add-review-btn',
  REVIEW_LOGIN_PROMPT:     'review-login-prompt',
  REVIEW_SUCCESS:          'review-success',

  // ── Login modal ─────────────────────────────────────────────────────────────
  LOGIN_MODAL:             'login-modal',          // wraps the Modal; becomes the overlay
  LOGIN_MODAL_CONTAINER:   'login-modal-container',
  LOGIN_MODAL_FORM:        'login-modal-form',
  LOGIN_MODAL_EMAIL:       'login-modal-email',
  LOGIN_MODAL_PASSWORD:    'login-modal-password',
  LOGIN_MODAL_ERROR:       'login-modal-error',
  LOGIN_MODAL_ACTIONS:     'login-modal-actions',
  LOGIN_MODAL_SIGN_IN:     'login-modal-sign-in',
  LOGIN_MODAL_LOGIN_BTN:   'login-modal-login',

  // ── Sign-up modal ────────────────────────────────────────────────────────────
  SIGNUP_MODAL:            'signup-modal',
  SIGNUP_MODAL_CONTAINER:  'signup-modal-container',
  SIGNUP_MODAL_FORM:       'signup-modal-form',
  SIGNUP_MODAL_EMAIL:      'signup-modal-email',
  SIGNUP_MODAL_FULLNAME:   'signup-modal-fullname',
  SIGNUP_MODAL_USERNAME:   'signup-modal-username',
  SIGNUP_MODAL_PASSWORD:   'signup-modal-password',
  SIGNUP_MODAL_ERROR:      'signup-modal-error',
  SIGNUP_MODAL_SIGN_IN:    'signup-modal-sign-in',

  // ── B2B pages ───────────────────────────────────────────────────────────────
  B2B_LOGIN_PAGE:       'b2b-login-page',
  B2B_LOGIN_EMAIL:      'b2b-login-email',
  B2B_LOGIN_PASSWORD:   'b2b-login-password',
  B2B_LOGIN_SUBMIT:     'b2b-login-submit',
  B2B_LOGIN_ERROR:      'b2b-login-error',
  B2B_LOGIN_IMAGE:      'b2b-login-image-placeholder',

  B2B_HEADER_LANGUAGE:       'b2b-header-language',
  B2B_HEADER_NOTIFICATIONS:  'b2b-header-notifications',
  B2B_SIDEBAR_LOGOUT:        'b2b-sidebar-logout',

  DASHBOARD_PAGE:        'dashboard-page',

  BOOKING_MANAGER_PAGE:         'booking-manager-page',
  BOOKING_MANAGER_TABLE:        'booking-manager-table',
  BOOKING_MANAGER_LOADING:      'booking-manager-loading',
  BOOKING_MANAGER_ERROR:        'booking-manager-error',
  BOOKING_MANAGER_EMPTY:        'booking-manager-empty',
  BOOKING_MANAGER_CLIENT_FILTER: 'booking-manager-client-filter',
  BOOKING_MANAGER_STATE_FILTER:  'booking-manager-state-filter',
  BOOKING_MANAGER_START_DATE:    'booking-manager-start-date',
  BOOKING_MANAGER_END_DATE:      'booking-manager-end-date',
  BOOKING_MANAGER_PAGINATION:    'booking-manager-pagination',
  BOOKING_MANAGER_HEADER:        'booking-manager-header',
  BOOKING_MANAGER_SIDEBAR:       'booking-manager-sidebar',

  FINANCIAL_REPORTS_PAGE:         'financial-reports-page',
  FINANCIAL_REPORTS_HEADER:       'financial-reports-header',
  FINANCIAL_REPORTS_SIDEBAR:      'financial-reports-sidebar',
  FINANCIAL_REPORTS_TABLE:        'financial-reports-table',
  FINANCIAL_REPORTS_PAGINATION:   'financial-reports-pagination',
  FINANCIAL_REPORTS_START_DATE:   'financial-reports-start-date',
  FINANCIAL_REPORTS_END_DATE:     'financial-reports-end-date',
  FINANCIAL_REPORTS_TOTAL_INCOME: 'financial-reports-total-income',

  PRICES_MANAGER_PAGE:       'prices-manager-page',
  PRICES_MANAGER_HEADER:     'prices-manager-header',
  PRICES_MANAGER_SIDEBAR:    'prices-manager-sidebar',
  PRICES_MANAGER_TABLE:      'prices-manager-table',
  PRICES_MANAGER_PAGINATION: 'prices-manager-pagination',

  // ── B2B booking modals ───────────────────────────────────────────────────────
  BOOKING_DETAIL_MODAL:                    'booking-detail-modal',
  BOOKING_DETAIL_MODAL_CONTAINER:          'booking-detail-modal-container',
  BOOKING_DETAIL_MODAL_HEADER:             'booking-detail-modal-header',
  BOOKING_DETAIL_MODAL_BOOKING_CODE:       'booking-detail-modal-booking-code',
  BOOKING_DETAIL_MODAL_ACTIVE_BADGE:       'booking-detail-modal-active-badge',
  // ── Guest information section
  BOOKING_DETAIL_MODAL_GUEST_SECTION:      'booking-detail-modal-guest-section',
  BOOKING_DETAIL_MODAL_CLIENT_NAME:        'booking-detail-modal-client-name',
  BOOKING_DETAIL_MODAL_GUEST_EMAIL:        'booking-detail-modal-guest-email',
  BOOKING_DETAIL_MODAL_GUEST_PHONE:        'booking-detail-modal-guest-phone',
  BOOKING_DETAIL_MODAL_ARRIVAL_TIME:       'booking-detail-modal-arrival-time',
  // ── Property section
  BOOKING_DETAIL_MODAL_PROPERTY_SECTION:   'booking-detail-modal-property-section',
  BOOKING_DETAIL_MODAL_HOTEL_NAME:         'booking-detail-modal-hotel-name',
  BOOKING_DETAIL_MODAL_LOCATION:           'booking-detail-modal-location',
  BOOKING_DETAIL_MODAL_ROOM:               'booking-detail-modal-room',
  BOOKING_DETAIL_MODAL_ROOM_TYPE:          'booking-detail-modal-room-type',
  BOOKING_DETAIL_MODAL_CATEGORY:           'booking-detail-modal-category',
  BOOKING_DETAIL_MODAL_ROOM_SIZE:          'booking-detail-modal-room-size',
  // ── Stay details section
  BOOKING_DETAIL_MODAL_DATES_SECTION:      'booking-detail-modal-dates-section',
  BOOKING_DETAIL_MODAL_GUESTS_COUNT:       'booking-detail-modal-guests-count',
  BOOKING_DETAIL_MODAL_CHECKIN:            'booking-detail-modal-checkin',
  BOOKING_DETAIL_MODAL_CHECKOUT:           'booking-detail-modal-checkout',
  BOOKING_DETAIL_MODAL_NIGHTS:             'booking-detail-modal-nights',
  // ── Financial section
  BOOKING_DETAIL_MODAL_FINANCIAL_SECTION:  'booking-detail-modal-financial-section',
  BOOKING_DETAIL_MODAL_TOTAL:              'booking-detail-modal-total',
  // ── Special requests
  BOOKING_DETAIL_MODAL_SPECIAL_REQUESTS:   'booking-detail-modal-special-requests',
  // ── Actions
  BOOKING_DETAIL_MODAL_CONFIRM_BTN:        'booking-detail-modal-confirm-btn',
  BOOKING_DETAIL_MODAL_CANCEL_BTN:         'booking-detail-modal-cancel-btn',

  BOOKING_CONFIRM_ACTION_MODAL:            'booking-confirm-action-modal',
  BOOKING_CONFIRM_ACTION_MODAL_CONTAINER:  'booking-confirm-action-modal-container',
  BOOKING_CANCEL_MODAL:                    'booking-cancel-modal',
  BOOKING_CANCEL_MODAL_CONTAINER:          'booking-cancel-modal-container',

  // ── Booking confirm modal (B2C room detail) ──────────────────────────────────
  BOOKING_CONFIRM_MODAL:  'booking-confirm-modal',
} as const;

/** Returns a CSS attribute selector for the given data-testid value. */
export const sel = (testId: string): string => `[data-testid="${testId}"]`;
