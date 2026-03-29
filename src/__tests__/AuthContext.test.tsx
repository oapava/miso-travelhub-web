import { render, screen, fireEvent } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import type { TokenResponse, UserResponse } from '@/services/auth.service';

const mockToken: TokenResponse = {
  access_token: 'access_123',
  refresh_token: 'refresh_456',
  token_type: 'bearer',
  expires_in: 900,
};

const mockUser: UserResponse = {
  id: 'user-uuid',
  email: 'test@example.com',
  username: 'testuser',
  nombre: 'Test User',
  telefono: null,
  pais: 'us',
  idioma: 'en',
  moneda_preferida: 'USD',
  mfa_activo: false,
  rol: 'traveler',
  fecha_registro: '2024-01-01T00:00:00Z',
};

// ─── Test consumer component ───────────────────────────────────────────────────

const TestConsumer: React.FC = () => {
  const { isAuthenticated, user, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="auth-status">{isAuthenticated ? 'authenticated' : 'not-authenticated'}</span>
      <span data-testid="user-name">{user?.nombre ?? 'no-user'}</span>
      <span data-testid="user-email">{user?.email ?? 'no-email'}</span>
      <button onClick={() => login(mockToken, mockUser)} data-testid="login-btn">Login</button>
      <button onClick={logout} data-testid="logout-btn">Logout</button>
    </div>
  );
};

beforeEach(() => {
  localStorage.clear();
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('AuthContext', () => {
  it('starts unauthenticated when no session in localStorage', () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
    expect(screen.getByTestId('user-name')).toHaveTextContent('no-user');
  });

  it('authenticates user and persists session to localStorage on login', () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    fireEvent.click(screen.getByTestId('login-btn'));

    expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
    expect(screen.getByTestId('user-name')).toHaveTextContent('Test User');

    const stored = JSON.parse(localStorage.getItem('travelhub_session')!);
    expect(stored.accessToken).toBe('access_123');
    expect(stored.refreshToken).toBe('refresh_456');
    expect(stored.user.nombre).toBe('Test User');
    expect(stored.user.email).toBe('test@example.com');
    expect(stored.expiresAt).toBeGreaterThan(Date.now());
  });

  it('stores all user profile fields in session', () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    fireEvent.click(screen.getByTestId('login-btn'));

    const stored = JSON.parse(localStorage.getItem('travelhub_session')!);
    expect(stored.user).toMatchObject({
      id: 'user-uuid',
      email: 'test@example.com',
      username: 'testuser',
      nombre: 'Test User',
      rol: 'traveler',
      idioma: 'en',
      moneda_preferida: 'USD',
    });
  });

  it('clears user state and localStorage on logout', () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    fireEvent.click(screen.getByTestId('login-btn'));
    fireEvent.click(screen.getByTestId('logout-btn'));

    expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
    expect(screen.getByTestId('user-name')).toHaveTextContent('no-user');
    expect(localStorage.getItem('travelhub_session')).toBeNull();
  });

  it('restores valid session from localStorage on mount', () => {
    const session = {
      accessToken: 'stored_token',
      refreshToken: 'stored_refresh',
      expiresAt: Date.now() + 600_000,
      user: {
        id: 'stored-uuid',
        email: 'stored@example.com',
        username: 'storeduser',
        nombre: 'Stored User',
        rol: 'traveler',
        telefono: null,
        pais: null,
        idioma: 'es',
        moneda_preferida: 'USD',
      },
    };
    localStorage.setItem('travelhub_session', JSON.stringify(session));

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
    expect(screen.getByTestId('user-name')).toHaveTextContent('Stored User');
    expect(screen.getByTestId('user-email')).toHaveTextContent('stored@example.com');
  });

  it('does not restore expired session and removes it from localStorage', () => {
    const expired = {
      accessToken: 'expired_token',
      refreshToken: 'expired_refresh',
      expiresAt: Date.now() - 1_000,
      user: { id: 'uuid', email: 'old@example.com', username: 'old', nombre: 'Old User', rol: 'traveler', telefono: null, pais: null, idioma: 'es', moneda_preferida: 'USD' },
    };
    localStorage.setItem('travelhub_session', JSON.stringify(expired));

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
    expect(localStorage.getItem('travelhub_session')).toBeNull();
  });

  it('handles corrupt localStorage data gracefully', () => {
    localStorage.setItem('travelhub_session', 'not-valid-json{{');

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
    expect(localStorage.getItem('travelhub_session')).toBeNull();
  });
});
