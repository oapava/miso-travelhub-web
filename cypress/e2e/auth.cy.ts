/**
 * E2E — Authentication flows
 *
 * Covers:
 * - Open login modal from header
 * - Login form renders with email/password fields
 * - Successful login updates header to authenticated state
 * - Error shown for bad credentials
 * - Open sign-up modal from header
 * - Sign-up form renders all required fields
 * - Logout clears session and returns to unauthenticated state
 *
 * API endpoints (from auth.service.ts):
 *   POST  /api/v1/auth/login
 *   POST  /api/v1/auth/register
 *   GET   /api/v1/auth/me
 */

import { SEL, sel } from '../support/selectors';

describe('Authentication — login modal', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('opens the login modal when clicking the login button', () => {
    cy.getByTestId(SEL.HEADER_LOGIN_BUTTON).click();
    cy.getByTestId(SEL.LOGIN_MODAL_CONTAINER).should('be.visible');
  });

  it('login modal has email and password inputs', () => {
    cy.getByTestId(SEL.HEADER_LOGIN_BUTTON).click();
    cy.getByTestId(SEL.LOGIN_MODAL_EMAIL).should('be.visible');
    cy.getByTestId(SEL.LOGIN_MODAL_PASSWORD).should('be.visible');
  });

  it('shows error message on failed login', () => {
    cy.intercept('POST', '**/api/v1/auth/login', {
      statusCode: 401,
      body: { detail: 'Invalid credentials' },
    }).as('loginFail');

    cy.getByTestId(SEL.HEADER_LOGIN_BUTTON).click();
    cy.getByTestId(SEL.LOGIN_MODAL_EMAIL).type('wrong@example.com');
    cy.getByTestId(SEL.LOGIN_MODAL_PASSWORD).type('wrongpass');
    cy.getByTestId(SEL.LOGIN_MODAL_LOGIN_BTN).click();

    cy.wait('@loginFail');
    cy.getByTestId(SEL.LOGIN_MODAL_ERROR).should('be.visible');
  });

  it('logs in successfully and shows account/logout in header', () => {
    cy.intercept('POST', '**/api/v1/auth/login', { fixture: 'auth-token.json' }).as('loginOk');
    cy.intercept('GET', '**/api/v1/auth/me', { fixture: 'user-traveler.json' }).as('meOk');

    cy.getByTestId(SEL.HEADER_LOGIN_BUTTON).click();
    cy.getByTestId(SEL.LOGIN_MODAL_EMAIL).type('traveler@test.com');
    cy.getByTestId(SEL.LOGIN_MODAL_PASSWORD).type('password123');
    cy.getByTestId(SEL.LOGIN_MODAL_LOGIN_BTN).click();

    cy.wait('@loginOk');
    cy.wait('@meOk');

    cy.getByTestId(SEL.HEADER_ACCOUNT).should('be.visible');
    cy.getByTestId(SEL.HEADER_LOGOUT).should('be.visible');
  });
});

describe('Authentication — sign-up modal', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('opens the sign-up modal when clicking the sign-up button', () => {
    cy.getByTestId(SEL.HEADER_SIGNUP_BUTTON).click();
    cy.getByTestId(SEL.SIGNUP_MODAL_CONTAINER).should('be.visible');
  });

  it('sign-up form renders required inputs', () => {
    cy.getByTestId(SEL.HEADER_SIGNUP_BUTTON).click();
    cy.getByTestId(SEL.SIGNUP_MODAL_EMAIL).should('be.visible');
    cy.getByTestId(SEL.SIGNUP_MODAL_FULLNAME).should('be.visible');
    cy.getByTestId(SEL.SIGNUP_MODAL_USERNAME).should('be.visible');
    cy.getByTestId(SEL.SIGNUP_MODAL_PASSWORD).should('be.visible');
  });

  it('shows error on failed sign-up', () => {
    cy.intercept('POST', '**/api/v1/auth/register', {
      statusCode: 400,
      body: { detail: 'Email already registered' },
    }).as('registerFail');

    cy.getByTestId(SEL.HEADER_SIGNUP_BUTTON).click();
    cy.getByTestId(SEL.SIGNUP_MODAL_EMAIL).type('existing@test.com');
    cy.getByTestId(SEL.SIGNUP_MODAL_FULLNAME).type('Existing User');
    cy.getByTestId(SEL.SIGNUP_MODAL_USERNAME).type('existinguser');
    cy.getByTestId(SEL.SIGNUP_MODAL_PASSWORD).type('password123');
    cy.getByTestId('signup-modal-repeat-password').type('password123');
    cy.getByTestId(SEL.SIGNUP_MODAL_SIGN_IN).click();

    cy.wait('@registerFail');
    cy.getByTestId(SEL.SIGNUP_MODAL_ERROR).should('be.visible');
  });

  it('registers successfully, auto-logs in, and shows account link', () => {
    cy.intercept('POST', '**/api/v1/auth/register', { statusCode: 201, body: {} }).as(
      'registerOk',
    );
    cy.intercept('POST', '**/api/v1/auth/login', { fixture: 'auth-token.json' }).as('loginOk');
    cy.intercept('GET', '**/api/v1/auth/me', { fixture: 'user-traveler.json' }).as('meOk');

    cy.getByTestId(SEL.HEADER_SIGNUP_BUTTON).click();
    cy.getByTestId(SEL.SIGNUP_MODAL_EMAIL).type('newuser@test.com');
    cy.getByTestId(SEL.SIGNUP_MODAL_FULLNAME).type('New User');
    cy.getByTestId(SEL.SIGNUP_MODAL_USERNAME).type('newuser');
    cy.getByTestId(SEL.SIGNUP_MODAL_PASSWORD).type('password123');
    cy.getByTestId('signup-modal-repeat-password').type('password123');
    cy.getByTestId(SEL.SIGNUP_MODAL_SIGN_IN).click();

    cy.wait('@registerOk');
    cy.wait('@loginOk');
    cy.wait('@meOk');

    cy.getByTestId(SEL.HEADER_ACCOUNT).should('be.visible');
  });
});

describe('Authentication — logout', () => {
  it('clears session and returns to unauthenticated state', () => {
    cy.loginAsB2C();
    cy.visit('/');
    cy.getByTestId(SEL.HEADER_LOGOUT).should('be.visible').click();
    cy.getByTestId(SEL.HEADER_LOGIN_BUTTON).should('be.visible');
    cy.get(sel(SEL.HEADER_ACCOUNT)).should('not.exist');
  });
});
