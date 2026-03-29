import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '@/routes/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';

jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

const authenticated = {
  isAuthenticated: true,
  user: { id: 'uuid', email: 'test@example.com', username: 'testuser', nombre: 'Test User', rol: 'traveler', telefono: null, pais: null, idioma: 'en', moneda_preferida: 'USD' },
  accessToken: 'token123',
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

const renderWithRoute = (initialPath: string) =>
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/" element={<div data-testid="home-page">Home</div>} />
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <div data-testid="protected-content">Protected Content</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  );

describe('ProtectedRoute', () => {
  it('renders children when user is authenticated', () => {
    mockUseAuth.mockReturnValue(authenticated);

    renderWithRoute('/account');

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.queryByTestId('home-page')).not.toBeInTheDocument();
  });

  it('redirects to home when user is not authenticated', () => {
    mockUseAuth.mockReturnValue(unauthenticated);

    renderWithRoute('/account');

    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });

  it('does not render protected content at all when unauthenticated', () => {
    mockUseAuth.mockReturnValue(unauthenticated);

    renderWithRoute('/account');

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});
