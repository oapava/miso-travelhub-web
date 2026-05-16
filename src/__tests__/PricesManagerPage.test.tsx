import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PricesManagerPage from '@/pages/b2b/PricesManagerPage/PricesManagerPage';
import { useAuth } from '@/context/AuthContext';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en', changeLanguage: jest.fn() },
  }),
}));

jest.mock('@/context/AuthContext', () => ({ useAuth: jest.fn() }));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockLogout = jest.fn();

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/business/prices-manager']}>
      <PricesManagerPage />
    </MemoryRouter>,
  );

describe('PricesManagerPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
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
      logout: mockLogout,
    });
  });
  it('renders the page container', () => {
    renderPage();
    expect(screen.getByTestId('prices-manager-page')).toBeInTheDocument();
  });

  it('renders the B2B header', () => {
    renderPage();
    expect(screen.getByTestId('prices-manager-header')).toBeInTheDocument();
    expect(screen.getByText('Travelhub/Prices Manager')).toBeInTheDocument();
  });

  it('renders the B2B sidebar', () => {
    renderPage();
    expect(screen.getByTestId('prices-manager-sidebar')).toBeInTheDocument();
  });

  it('renders the Prices Manager title', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /Prices Manager/i })).toBeInTheDocument();
  });

  it('renders the booking places table subtitle', () => {
    renderPage();
    expect(screen.getByText('Booking places table')).toBeInTheDocument();
  });

  it('renders the data table', () => {
    renderPage();
    expect(screen.getByTestId('prices-manager-table')).toBeInTheDocument();
  });

  it('renders price input for first row', () => {
    renderPage();
    expect(screen.getByTestId('prices-manager-price-input-1')).toBeInTheDocument();
  });

  it('renders discount input for first row', () => {
    renderPage();
    expect(screen.getByTestId('prices-manager-discount-input-1')).toBeInTheDocument();
  });

  it('updates price input when changed', () => {
    renderPage();
    const priceInput = screen.getByTestId('prices-manager-price-input-1') as HTMLInputElement;
    fireEvent.change(priceInput, { target: { value: '$80' } });
    expect(priceInput.value).toBe('$80');
  });

  it('updates discount input when changed', () => {
    renderPage();
    const discountInput = screen.getByTestId(
      'prices-manager-discount-input-1',
    ) as HTMLInputElement;
    fireEvent.change(discountInput, { target: { value: '20%' } });
    expect(discountInput.value).toBe('20%');
  });

  it('renders the pagination component', () => {
    renderPage();
    expect(screen.getByTestId('prices-manager-pagination')).toBeInTheDocument();
  });

  it('renders table column headers', () => {
    renderPage();
    expect(screen.getByText('Place')).toBeInTheDocument();
    expect(screen.getByText('Price(Night)')).toBeInTheDocument();
    expect(screen.getByText('Discount')).toBeInTheDocument();
    expect(screen.getByText('Payout Status')).toBeInTheDocument();
  });

  it('changes page when pagination is clicked', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Page 2' }));
    expect(screen.getByRole('button', { name: 'Page 2' })).toHaveClass(
      'pagination__button--active',
    );
  });

  it('logout button is clickable without throwing', () => {
    renderPage();
    expect(() => fireEvent.click(screen.getByTestId('b2b-sidebar-logout'))).not.toThrow();
  });

  it('calls logout from AuthContext when logout button is clicked', () => {
    renderPage();
    fireEvent.click(screen.getByTestId('b2b-sidebar-logout'));
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('updates price input when changed', () => {
    renderPage();
    const priceInput = screen.getByTestId('prices-manager-price-input-1') as HTMLInputElement;
    fireEvent.change(priceInput, { target: { value: '250' } });
    expect(priceInput.value).toBe('250');
  });

  it('updates discount input when changed', () => {
    renderPage();
    const discountInput = screen.getByTestId('prices-manager-discount-input-1') as HTMLInputElement;
    fireEvent.change(discountInput, { target: { value: '15' } });
    expect(discountInput.value).toBe('15');
  });
});
