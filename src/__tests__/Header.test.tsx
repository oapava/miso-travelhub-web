import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from '@/components/layout/Header/Header';
import { useAuth } from '@/context/AuthContext';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en', changeLanguage: jest.fn() },
  }),
}));

jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/context/CurrencyContext', () => ({
  useCurrency: () => ({ currency: 'USD', setCurrency: jest.fn(), supportedCurrencies: ['USD', 'COP', 'EUR', 'GBP'] }),
}));

// Prevent modals from rendering in header tests
jest.mock('@/components/shared/LoginModal/LoginModal', () => ({ __esModule: true, default: () => null }));
jest.mock('@/components/shared/SignUpModal/SignUpModal', () => ({ __esModule: true, default: () => null }));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

const unauthenticatedState = {
  isAuthenticated: false,
  user: null,
  accessToken: null,
  login: jest.fn(),
  logout: jest.fn(),
};

const authenticatedState = {
  isAuthenticated: true,
  user: {
    id: 'uuid',
    email: 'test@example.com',
    username: 'testuser',
    nombre: 'Test User',
    rol: 'traveler',
    telefono: null,
    pais: null,
    idioma: 'en',
    moneda_preferida: 'USD',
  },
  accessToken: 'token123',
  login: jest.fn(),
  logout: jest.fn(),
};

const renderHeader = () =>
  render(
    <MemoryRouter>
      <Header />
    </MemoryRouter>
  );

describe('Header – unauthenticated', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue(unauthenticatedState);
  });

  it('shows LOGIN and SIGN UP buttons', () => {
    renderHeader();

    expect(screen.getByTestId('header-login-button')).toBeInTheDocument();
    expect(screen.getByTestId('header-signup-button')).toBeInTheDocument();
  });

  it('does not show user info or logout link', () => {
    renderHeader();

    expect(screen.queryByTestId('header-logout')).not.toBeInTheDocument();
    expect(screen.queryByTestId('header-account')).not.toBeInTheDocument();
  });
});

describe('Header – authenticated', () => {
  const mockLogout = jest.fn();

  beforeEach(() => {
    mockUseAuth.mockReturnValue({ ...authenticatedState, logout: mockLogout });
  });

  it('shows the authenticated user name', () => {
    renderHeader();

    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('shows Account link pointing to /account', () => {
    renderHeader();

    const accountLink = screen.getByTestId('header-account');
    expect(accountLink).toBeInTheDocument();
    expect(accountLink).toHaveAttribute('href', '/account');
  });

  it('shows Logout button', () => {
    renderHeader();

    expect(screen.getByTestId('header-logout')).toBeInTheDocument();
  });

  it('does not show login or sign-up buttons', () => {
    renderHeader();

    expect(screen.queryByTestId('header-login-button')).not.toBeInTheDocument();
    expect(screen.queryByTestId('header-signup-button')).not.toBeInTheDocument();
  });

  it('calls logout from context when Logout button is clicked', () => {
    renderHeader();

    fireEvent.click(screen.getByTestId('header-logout'));

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('shows the user avatar icon when authenticated', () => {
    renderHeader();

    // Avatar renders an SVG icon (not a text initial)
    const avatar = document.querySelector('.header__user-avatar');
    expect(avatar).toBeInTheDocument();
    expect(avatar?.querySelector('svg')).toBeInTheDocument();
  });
});
