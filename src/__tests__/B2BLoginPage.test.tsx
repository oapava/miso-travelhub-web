import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import B2BLoginPage from '@/pages/b2b/B2BLoginPage/B2BLoginPage';

// ── Mocks ────────────────────────────────────────────────────────────────────
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en', changeLanguage: jest.fn() },
  }),
}));

jest.mock('@/services/auth.service', () => ({
  authService: {
    login: jest.fn(),
    getCurrentUser: jest.fn(),
    register: jest.fn(),
  },
}));

jest.mock('@/context/AuthContext', () => ({ useAuth: jest.fn() }));

import { authService } from '@/services/auth.service';
import { useAuth } from '@/context/AuthContext';

const mockLogin        = authService.login as jest.Mock;
const mockGetUser      = authService.getCurrentUser as jest.Mock;
const mockUseAuth      = useAuth as jest.MockedFunction<typeof useAuth>;
const mockContextLogin = jest.fn();

const mockToken = {
  access_token: 'access-abc', refresh_token: 'refresh-xyz',
  token_type: 'bearer', expires_in: 900,
};
const mockUser = {
  id: 'u1', email: 'admin@hotel.com', username: 'admin', nombre: 'Admin',
  telefono: '', pais: 'CO', idioma: 'es', moneda_preferida: 'USD',
  mfa_activo: false, rol: 'hotel_admin', fecha_registro: '2025-01-01',
};

const renderPage = () =>
  render(
    <MemoryRouter>
      <B2BLoginPage />
    </MemoryRouter>,
  );

describe('B2BLoginPage', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockUseAuth.mockReturnValue({
      isAuthenticated: false, user: null, accessToken: null,
      login: mockContextLogin, logout: jest.fn(),
    });
    mockLogin.mockResolvedValue(mockToken);
    mockGetUser.mockResolvedValue(mockUser);
  });

  // ── Rendering ────────────────────────────────────────────────────────────
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
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('b2b.login.heading');
  });

  it('renders the subtitle', () => {
    renderPage();
    expect(screen.getByText('b2b.login.subtitle')).toBeInTheDocument();
  });

  it('renders email and password inputs', () => {
    renderPage();
    expect(screen.getByTestId('b2b-login-email')).toBeInTheDocument();
    expect(screen.getByTestId('b2b-login-password')).toBeInTheDocument();
  });

  it('renders the LOGIN submit button', () => {
    renderPage();
    const btn = screen.getByTestId('b2b-login-submit');
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveTextContent('b2b.login.loginBtn');
  });

  it('renders forgot password and sign-up links', () => {
    renderPage();
    expect(screen.getByText('b2b.login.forgotPassword')).toBeInTheDocument();
    expect(screen.getByText('b2b.login.signUp')).toBeInTheDocument();
  });

  it('renders the image placeholder', () => {
    renderPage();
    expect(screen.getByTestId('b2b-login-image-placeholder')).toBeInTheDocument();
  });

  // ── Field interaction ────────────────────────────────────────────────────
  it('updates email field when user types', () => {
    renderPage();
    const input = screen.getByTestId('b2b-login-email') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'admin@hotel.com' } });
    expect(input.value).toBe('admin@hotel.com');
  });

  it('updates password field when user types', () => {
    renderPage();
    const input = screen.getByTestId('b2b-login-password') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'secret123' } });
    expect(input.value).toBe('secret123');
  });

  // ── Submit with empty fields ─────────────────────────────────────────────
  it('does not call authService when form is submitted with empty fields', () => {
    renderPage();
    fireEvent.submit(screen.getByTestId('b2b-login-submit').closest('form')!);
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('page is still rendered after submitting empty form', () => {
    renderPage();
    fireEvent.submit(screen.getByTestId('b2b-login-submit').closest('form')!);
    expect(screen.getByTestId('b2b-login-page')).toBeInTheDocument();
  });

  // ── Successful login ─────────────────────────────────────────────────────
  it('calls authService.login with email and password', async () => {
    renderPage();
    fireEvent.change(screen.getByTestId('b2b-login-email'), {
      target: { value: 'admin@hotel.com' },
    });
    fireEvent.change(screen.getByTestId('b2b-login-password'), {
      target: { value: 'password123' },
    });
    fireEvent.submit(screen.getByTestId('b2b-login-submit').closest('form')!);
    await waitFor(() =>
      expect(mockLogin).toHaveBeenCalledWith('admin@hotel.com', 'password123'),
    );
  });

  it('calls authService.getCurrentUser with the access token', async () => {
    renderPage();
    fireEvent.change(screen.getByTestId('b2b-login-email'), {
      target: { value: 'admin@hotel.com' },
    });
    fireEvent.change(screen.getByTestId('b2b-login-password'), {
      target: { value: 'password123' },
    });
    fireEvent.submit(screen.getByTestId('b2b-login-submit').closest('form')!);
    await waitFor(() => expect(mockGetUser).toHaveBeenCalledWith('access-abc'));
  });

  it('calls context login with token and user on success', async () => {
    renderPage();
    fireEvent.change(screen.getByTestId('b2b-login-email'), {
      target: { value: 'admin@hotel.com' },
    });
    fireEvent.change(screen.getByTestId('b2b-login-password'), {
      target: { value: 'password123' },
    });
    fireEvent.submit(screen.getByTestId('b2b-login-submit').closest('form')!);
    await waitFor(() =>
      expect(mockContextLogin).toHaveBeenCalledWith(mockToken, mockUser),
    );
  });

  it('navigates to /business after successful login', async () => {
    renderPage();
    fireEvent.change(screen.getByTestId('b2b-login-email'), {
      target: { value: 'admin@hotel.com' },
    });
    fireEvent.change(screen.getByTestId('b2b-login-password'), {
      target: { value: 'password123' },
    });
    fireEvent.submit(screen.getByTestId('b2b-login-submit').closest('form')!);
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/business'));
  });

  // ── Error handling ───────────────────────────────────────────────────────
  it('shows error message when login fails', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'));
    renderPage();
    fireEvent.change(screen.getByTestId('b2b-login-email'), {
      target: { value: 'wrong@email.com' },
    });
    fireEvent.change(screen.getByTestId('b2b-login-password'), {
      target: { value: 'wrong' },
    });
    fireEvent.submit(screen.getByTestId('b2b-login-submit').closest('form')!);
    await waitFor(() =>
      expect(screen.getByTestId('b2b-login-error')).toHaveTextContent('Invalid credentials'),
    );
  });

  it('shows generic error when login rejects with non-Error value', async () => {
    mockLogin.mockRejectedValueOnce('unexpected');
    renderPage();
    fireEvent.change(screen.getByTestId('b2b-login-email'), {
      target: { value: 'a@b.com' },
    });
    fireEvent.change(screen.getByTestId('b2b-login-password'), {
      target: { value: 'pass' },
    });
    fireEvent.submit(screen.getByTestId('b2b-login-submit').closest('form')!);
    await waitFor(() =>
      expect(screen.getByTestId('b2b-login-error')).toHaveTextContent(
        'b2b.login.loginFailed',
      ),
    );
  });

  it('does not navigate when login fails', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Bad request'));
    renderPage();
    fireEvent.change(screen.getByTestId('b2b-login-email'), {
      target: { value: 'a@b.com' },
    });
    fireEvent.change(screen.getByTestId('b2b-login-password'), {
      target: { value: 'pass' },
    });
    fireEvent.submit(screen.getByTestId('b2b-login-submit').closest('form')!);
    await waitFor(() => expect(mockLogin).toHaveBeenCalled());
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  // ── Role guard ───────────────────────────────────────────────────────────
  it('shows access-denied error when logged-in user has traveler role', async () => {
    const travelerUser = { ...mockUser, rol: 'traveler' };
    mockGetUser.mockResolvedValueOnce(travelerUser);
    renderPage();
    fireEvent.change(screen.getByTestId('b2b-login-email'), {
      target: { value: 'traveler@email.com' },
    });
    fireEvent.change(screen.getByTestId('b2b-login-password'), {
      target: { value: 'pass123' },
    });
    fireEvent.submit(screen.getByTestId('b2b-login-submit').closest('form')!);
    await waitFor(() =>
      expect(screen.getByTestId('b2b-login-error')).toHaveTextContent(
        'b2b.login.accessDenied',
      ),
    );
  });

  it('does not call contextLogin when user has traveler role', async () => {
    const travelerUser = { ...mockUser, rol: 'traveler' };
    mockGetUser.mockResolvedValueOnce(travelerUser);
    renderPage();
    fireEvent.change(screen.getByTestId('b2b-login-email'), {
      target: { value: 'traveler@email.com' },
    });
    fireEvent.change(screen.getByTestId('b2b-login-password'), {
      target: { value: 'pass123' },
    });
    fireEvent.submit(screen.getByTestId('b2b-login-submit').closest('form')!);
    await waitFor(() => expect(mockGetUser).toHaveBeenCalled());
    expect(mockContextLogin).not.toHaveBeenCalled();
  });

  it('does not navigate when user has traveler role', async () => {
    const travelerUser = { ...mockUser, rol: 'traveler' };
    mockGetUser.mockResolvedValueOnce(travelerUser);
    renderPage();
    fireEvent.change(screen.getByTestId('b2b-login-email'), {
      target: { value: 'traveler@email.com' },
    });
    fireEvent.change(screen.getByTestId('b2b-login-password'), {
      target: { value: 'pass123' },
    });
    fireEvent.submit(screen.getByTestId('b2b-login-submit').closest('form')!);
    await waitFor(() => expect(mockGetUser).toHaveBeenCalled());
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('allows login for hotel_admin role', async () => {
    const adminUser = { ...mockUser, rol: 'hotel_admin' };
    mockGetUser.mockResolvedValueOnce(adminUser);
    renderPage();
    fireEvent.change(screen.getByTestId('b2b-login-email'), {
      target: { value: 'admin@hotel.com' },
    });
    fireEvent.change(screen.getByTestId('b2b-login-password'), {
      target: { value: 'password123' },
    });
    fireEvent.submit(screen.getByTestId('b2b-login-submit').closest('form')!);
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/business'));
  });

  it('allows login for platform_admin role', async () => {
    const platformAdmin = { ...mockUser, rol: 'platform_admin' };
    mockGetUser.mockResolvedValueOnce(platformAdmin);
    renderPage();
    fireEvent.change(screen.getByTestId('b2b-login-email'), {
      target: { value: 'admin@platform.com' },
    });
    fireEvent.change(screen.getByTestId('b2b-login-password'), {
      target: { value: 'password123' },
    });
    fireEvent.submit(screen.getByTestId('b2b-login-submit').closest('form')!);
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/business'));
  });

  // ── Loading state ────────────────────────────────────────────────────────
  it('shows LOGGING IN… and disables button while in flight', async () => {
    let resolve!: (v: typeof mockToken) => void;
    mockLogin.mockReturnValueOnce(new Promise((res) => { resolve = res; }));
    renderPage();
    fireEvent.change(screen.getByTestId('b2b-login-email'), {
      target: { value: 'a@b.com' },
    });
    fireEvent.change(screen.getByTestId('b2b-login-password'), {
      target: { value: 'pass' },
    });
    fireEvent.submit(screen.getByTestId('b2b-login-submit').closest('form')!);
    await waitFor(() => {
      expect(screen.getByTestId('b2b-login-submit')).toHaveTextContent('b2b.login.loggingIn');
      expect(screen.getByTestId('b2b-login-submit')).toBeDisabled();
    });
    await waitFor(async () => resolve(mockToken));
  });
});
