import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AccountPage from '@/pages/b2c/AccountPage/AccountPage';
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

jest.mock('@/components/shared/LoginModal/LoginModal', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('@/components/shared/SignUpModal/SignUpModal', () => ({
  __esModule: true,
  default: () => null,
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

const mockUser = {
  id: 'uuid-1',
  email: 'john@example.com',
  username: 'johndoe',
  nombre: 'John Doe',
  telefono: '+57300123',
  pais: 'france',
  idioma: 'en',
  moneda_preferida: 'USD',
  mfa_activo: false,
  rol: 'traveler' as const,
  fecha_registro: '2024-01-01T00:00:00Z',
};

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/account']}>
      <AccountPage />
    </MemoryRouter>,
  );

describe('AccountPage', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: mockUser,
      accessToken: 'token123',
      login: jest.fn(),
      logout: jest.fn(),
    });
  });

  it('renders the account page container', () => {
    renderPage();
    expect(screen.getByTestId('account-page')).toBeInTheDocument();
  });

  it('renders the Account Information title', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: 'account.title' })).toBeInTheDocument();
    expect(screen.getByText('account.subtitle')).toBeInTheDocument();
  });

  it('renders the account form', () => {
    renderPage();
    expect(screen.getByTestId('account-form')).toBeInTheDocument();
  });

  it('populates name field with user nombre', () => {
    renderPage();
    const nameInput = screen.getByTestId('account-name') as HTMLInputElement;
    expect(nameInput.value).toBe('John Doe');
  });

  it('populates username field with user username', () => {
    renderPage();
    const usernameInput = screen.getByTestId('account-username') as HTMLInputElement;
    expect(usernameInput.value).toBe('johndoe');
  });

  it('populates phone field with user telefono', () => {
    renderPage();
    const phoneInput = screen.getByTestId('account-phone') as HTMLInputElement;
    expect(phoneInput.value).toBe('+57300123');
  });

  it('renders the password field as disabled', () => {
    renderPage();
    expect(screen.getByTestId('account-password')).toBeDisabled();
  });

  it('renders the save button', () => {
    renderPage();
    expect(screen.getByTestId('account-save')).toBeInTheDocument();
  });

  it('renders the change password button', () => {
    renderPage();
    expect(screen.getByTestId('account-change-password')).toBeInTheDocument();
  });

  it('renders country select', () => {
    renderPage();
    expect(screen.getByTestId('account-country')).toBeInTheDocument();
  });

  it('renders language select', () => {
    renderPage();
    expect(screen.getByTestId('account-language')).toBeInTheDocument();
  });

  it('renders currency select', () => {
    renderPage();
    expect(screen.getByTestId('account-currency')).toBeInTheDocument();
  });

  it('renders status select', () => {
    renderPage();
    expect(screen.getByTestId('account-status')).toBeInTheDocument();
  });

  it('updates name input when user types', () => {
    renderPage();
    const nameInput = screen.getByTestId('account-name') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });
    expect(nameInput.value).toBe('Jane Doe');
  });

  it('updates username input when user types', () => {
    renderPage();
    const usernameInput = screen.getByTestId('account-username') as HTMLInputElement;
    fireEvent.change(usernameInput, { target: { value: 'newuser' } });
    expect(usernameInput.value).toBe('newuser');
  });

  it('updates phone input when user types', () => {
    renderPage();
    const phoneInput = screen.getByTestId('account-phone') as HTMLInputElement;
    fireEvent.change(phoneInput, { target: { value: '+12345678' } });
    expect(phoneInput.value).toBe('+12345678');
  });

  it('renders with empty fields when user is null', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      accessToken: null,
      login: jest.fn(),
      logout: jest.fn(),
    });
    renderPage();
    const nameInput = screen.getByTestId('account-name') as HTMLInputElement;
    expect(nameInput.value).toBe('');
  });

  it('renders the account sidebar', () => {
    renderPage();
    expect(screen.getByTestId('account-sidebar')).toBeInTheDocument();
  });
});
