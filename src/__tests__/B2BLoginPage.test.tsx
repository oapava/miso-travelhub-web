import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import B2BLoginPage from '@/pages/b2b/B2BLoginPage/B2BLoginPage';

const renderPage = () =>
  render(
    <MemoryRouter>
      <B2BLoginPage />
    </MemoryRouter>,
  );

describe('B2BLoginPage', () => {
  it('renders the page container', () => {
    renderPage();
    expect(screen.getByTestId('b2b-login-page')).toBeInTheDocument();
  });

  it('renders the logo', () => {
    renderPage();
    expect(screen.getByTestId('b2b-login-logo')).toBeInTheDocument();
  });

  it('renders the welcome heading', () => {
    renderPage();
    expect(screen.getByText(/Hello,/i)).toBeInTheDocument();
    expect(screen.getByText(/Welcome Back!/i)).toBeInTheDocument();
  });

  it('renders the subtitle', () => {
    renderPage();
    expect(screen.getByText(/We are happy to see you/i)).toBeInTheDocument();
  });

  it('renders email input', () => {
    renderPage();
    expect(screen.getByTestId('b2b-login-email')).toBeInTheDocument();
  });

  it('renders password input', () => {
    renderPage();
    expect(screen.getByTestId('b2b-login-password')).toBeInTheDocument();
  });

  it('renders the login submit button', () => {
    renderPage();
    expect(screen.getByTestId('b2b-login-submit')).toBeInTheDocument();
    expect(screen.getByTestId('b2b-login-submit')).toHaveTextContent('LOGIN');
  });

  it('renders the forgot password link', () => {
    renderPage();
    expect(screen.getByText(/Forgot your password/i)).toBeInTheDocument();
  });

  it('renders the sign up link', () => {
    renderPage();
    expect(screen.getByText(/Sign up for free/i)).toBeInTheDocument();
  });

  it('updates email field when user types', () => {
    renderPage();
    const emailInput = screen.getByTestId('b2b-login-email') as HTMLInputElement;
    fireEvent.change(emailInput, { target: { value: 'admin@hotel.com' } });
    expect(emailInput.value).toBe('admin@hotel.com');
  });

  it('updates password field when user types', () => {
    renderPage();
    const passwordInput = screen.getByTestId('b2b-login-password') as HTMLInputElement;
    fireEvent.change(passwordInput, { target: { value: 'secret123' } });
    expect(passwordInput.value).toBe('secret123');
  });

  it('does not navigate when form is submitted with empty fields', () => {
    renderPage();
    fireEvent.submit(screen.getByTestId('b2b-login-submit').closest('form')!);
    // Page should still be rendered (no navigation occurred)
    expect(screen.getByTestId('b2b-login-page')).toBeInTheDocument();
  });

  it('renders the image placeholder section', () => {
    renderPage();
    expect(screen.getByTestId('b2b-login-image-placeholder')).toBeInTheDocument();
  });
});
