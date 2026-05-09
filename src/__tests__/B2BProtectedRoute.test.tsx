import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import B2BProtectedRoute from '@/routes/B2BProtectedRoute';
import { useAuth } from '@/context/AuthContext';

jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

const authenticated = {
  isAuthenticated: true,
  user: {
    id: 'u1',
    email: 'admin@hotel.com',
    username: 'admin',
    nombre: 'Admin Hotel',
    rol: 'hotel_admin',
    telefono: null,
    pais: 'CO',
    idioma: 'es',
    moneda_preferida: 'USD',
  },
  accessToken: 'token-abc',
  login: jest.fn(),
  logout: jest.fn(),
};

const unauthenticated = {
  isAuthenticated: false,
  user: null,
  accessToken: null,
  login: jest.fn(),
  logout: jest.fn(),
};

const renderWithRoutes = (initialPath: string) =>
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route
          path="/business/login"
          element={<div data-testid="b2b-login-page">B2B Login</div>}
        />
        <Route
          path="/business"
          element={
            <B2BProtectedRoute>
              <div data-testid="b2b-protected-content">B2B Protected Content</div>
            </B2BProtectedRoute>
          }
        />
        <Route
          path="/business/booking-manager"
          element={
            <B2BProtectedRoute>
              <div data-testid="b2b-booking-manager">Booking Manager</div>
            </B2BProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>,
  );

describe('B2BProtectedRoute', () => {
  it('renders children when user is authenticated', () => {
    mockUseAuth.mockReturnValue(authenticated);
    renderWithRoutes('/business');
    expect(screen.getByTestId('b2b-protected-content')).toBeInTheDocument();
    expect(screen.queryByTestId('b2b-login-page')).not.toBeInTheDocument();
  });

  it('redirects to /business/login when user is not authenticated', () => {
    mockUseAuth.mockReturnValue(unauthenticated);
    renderWithRoutes('/business');
    expect(screen.queryByTestId('b2b-protected-content')).not.toBeInTheDocument();
    expect(screen.getByTestId('b2b-login-page')).toBeInTheDocument();
  });

  it('does not render protected content at all when unauthenticated', () => {
    mockUseAuth.mockReturnValue(unauthenticated);
    renderWithRoutes('/business');
    expect(screen.queryByText('B2B Protected Content')).not.toBeInTheDocument();
  });

  it('renders children on a nested B2B route when authenticated', () => {
    mockUseAuth.mockReturnValue(authenticated);
    renderWithRoutes('/business/booking-manager');
    expect(screen.getByTestId('b2b-booking-manager')).toBeInTheDocument();
  });

  it('redirects nested B2B route to /business/login when unauthenticated', () => {
    mockUseAuth.mockReturnValue(unauthenticated);
    renderWithRoutes('/business/booking-manager');
    expect(screen.queryByTestId('b2b-booking-manager')).not.toBeInTheDocument();
    expect(screen.getByTestId('b2b-login-page')).toBeInTheDocument();
  });
});
