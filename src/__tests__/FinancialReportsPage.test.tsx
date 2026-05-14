import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import FinancialReportsPage from '@/pages/b2b/FinancialReportsPage/FinancialReportsPage';
import { useAuth } from '@/context/AuthContext';
import { bookingService, getHotelIdFromToken } from '@/services/booking.service';

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en', changeLanguage: jest.fn() },
  }),
}));

jest.mock('@/context/AuthContext', () => ({ useAuth: jest.fn() }));

jest.mock('@/context/CurrencyContext', () => ({
  useCurrency: () => ({ currency: 'USD', setCurrency: jest.fn(), supportedCurrencies: ['USD', 'COP', 'EUR', 'GBP'] }),
}));

jest.mock('@/services/booking.service', () => ({
  bookingService: {
    getHotelBookings: jest.fn(),
    getMyBookings: jest.fn(),
  },
  getHotelIdFromToken: jest.fn(),
}));

const mockUseAuth          = useAuth as jest.MockedFunction<typeof useAuth>;
const mockGetHotelBookings = bookingService.getHotelBookings as jest.Mock;
const mockGetHotelIdFromToken = getHotelIdFromToken as jest.Mock;
const mockLogout           = jest.fn();

// 4 deterministic mock bookings — 2 confirmed, 1 pending, 1 cancelled
const mockBookings = [
  {
    id: 'b1', codigo: 'RES-001', viajeroId: 'traveler1', habitacionId: 'room-1',
    nombreHabitacion: 'Ocean Suite',
    fechaCheckIn: '2026-05-06T00:00:00', fechaCheckOut: '2026-05-10T00:00:00',
    numHuespedes: 2, estado: 'CONFIRMADO',
    subtotal: 400, impuestos: 80, total: 480, moneda: 'USD',
  },
  {
    id: 'b2', codigo: 'RES-002', viajeroId: 'traveler2', habitacionId: 'room-2',
    nombreHabitacion: 'Deluxe Room',
    fechaCheckIn: '2026-05-04T00:00:00', fechaCheckOut: '2026-05-07T00:00:00',
    numHuespedes: 1, estado: 'CONFIRMADO',
    subtotal: 300, impuestos: 60, total: 360, moneda: 'USD',
  },
  {
    id: 'b3', codigo: 'RES-003', viajeroId: 'traveler3', habitacionId: 'room-3',
    nombreHabitacion: 'Standard Room',
    fechaCheckIn: '2026-05-01T00:00:00', fechaCheckOut: '2026-05-03T00:00:00',
    numHuespedes: 2, estado: 'PENDIENTE',
    subtotal: 200, impuestos: 40, total: 240, moneda: 'USD',
  },
  {
    id: 'b4', codigo: 'RES-004', viajeroId: 'traveler4', habitacionId: 'room-4',
    nombreHabitacion: 'Classic Room',
    fechaCheckIn: '2026-04-20T00:00:00', fechaCheckOut: '2026-04-22T00:00:00',
    numHuespedes: 1, estado: 'CANCELADO',
    subtotal: 180, impuestos: 36, total: 216, moneda: 'USD',
  },
];

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/business/financial-reports']}>
      <FinancialReportsPage />
    </MemoryRouter>,
  );

describe('FinancialReportsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: {
        id: 'u1', email: 'admin@hotel.com', username: 'admin', nombre: 'Admin Hotel',
        rol: 'hotel_admin', telefono: null, pais: 'CO', idioma: 'es', moneda_preferida: 'USD',
      },
      accessToken: 'token-abc',
      login: jest.fn(),
      logout: mockLogout,
    });
    mockGetHotelIdFromToken.mockReturnValue('hotel-123');
    mockGetHotelBookings.mockResolvedValue(mockBookings);

    // Mock browser APIs unavailable in jsdom
    global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = jest.fn();
  });

  // ── Structure ──────────────────────────────────────────────────────────────

  it('renders the page container', () => {
    renderPage();
    expect(screen.getByTestId('financial-reports-page')).toBeInTheDocument();
  });

  it('renders the B2B header', () => {
    renderPage();
    expect(screen.getByTestId('financial-reports-header')).toBeInTheDocument();
  });

  it('renders the B2B sidebar', () => {
    renderPage();
    expect(screen.getByTestId('financial-reports-sidebar')).toBeInTheDocument();
  });

  it('renders the Financial Reports title', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /Financial Reports/i })).toBeInTheDocument();
  });

  // ── Date filters ───────────────────────────────────────────────────────────

  it('renders date range inputs', () => {
    renderPage();
    expect(screen.getByTestId('financial-reports-start-date')).toBeInTheDocument();
    expect(screen.getByTestId('financial-reports-end-date')).toBeInTheDocument();
  });

  it('updates start date when input changes', () => {
    renderPage();
    const startInput = screen.getByTestId('financial-reports-start-date') as HTMLInputElement;
    fireEvent.change(startInput, { target: { value: '2024-01-01' } });
    expect(startInput.value).toBe('2024-01-01');
  });

  it('updates end date when input changes', () => {
    renderPage();
    const endInput = screen.getByTestId('financial-reports-end-date') as HTMLInputElement;
    fireEvent.change(endInput, { target: { value: '2026-12-31' } });
    expect(endInput.value).toBe('2026-12-31');
  });

  // ── Download button ────────────────────────────────────────────────────────

  it('renders the Download CSV button', () => {
    renderPage();
    expect(screen.getByTestId('financial-reports-download-btn')).toBeInTheDocument();
    expect(screen.getByTestId('financial-reports-download-btn')).toHaveTextContent('Download CSV');
  });

  it('download button triggers CSV export without throwing', async () => {
    renderPage();
    // Wait for async data to settle, then fire the click
    await waitFor(() =>
      expect(mockGetHotelBookings).toHaveBeenCalled(),
    );
    expect(() =>
      fireEvent.click(screen.getByTestId('financial-reports-download-btn')),
    ).not.toThrow();
    expect(global.URL.createObjectURL).toHaveBeenCalled();
  });

  // ── Table ──────────────────────────────────────────────────────────────────

  it('renders the bookings data table', () => {
    renderPage();
    expect(screen.getByTestId('financial-reports-table')).toBeInTheDocument();
  });

  it('renders 3 room rows after data loads (b4 cancelled excluded)', async () => {
    renderPage();
    await waitFor(() => {
      const rows = screen.getAllByTestId(/financial-reports-table-row-/);
      expect(rows.length).toBe(3);
    });
  });

  it('renders the Booking places table subtitle', () => {
    renderPage();
    expect(screen.getByText('Booking places table')).toBeInTheDocument();
  });

  it('renders table headers', () => {
    renderPage();
    expect(screen.getByText('Place')).toBeInTheDocument();
    expect(screen.getByText('Total reservations')).toBeInTheDocument();
    expect(screen.getByText('Sales')).toBeInTheDocument();
    expect(screen.getByText('Commissions')).toBeInTheDocument();
    expect(screen.getByText('Payout Status')).toBeInTheDocument();
  });

  it('shows room names in the table after loading', async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByText('Ocean Suite')).toBeInTheDocument(),
    );
  });

  // ── Pagination ─────────────────────────────────────────────────────────────

  it('renders the pagination component', () => {
    renderPage();
    expect(screen.getByTestId('financial-reports-pagination')).toBeInTheDocument();
  });

  // ── KPI / summary ─────────────────────────────────────────────────────────

  it('renders the Total Income stat card', () => {
    renderPage();
    expect(screen.getByTestId('financial-reports-total-income')).toBeInTheDocument();
    expect(screen.getByText('Total Income')).toBeInTheDocument();
  });

  it('calculates total income excluding cancelled bookings', async () => {
    // b1 $480 + b2 $360 + b3 $240 = $1,080 (b4 is CANCELADO, excluded)
    renderPage();
    await waitFor(() =>
      expect(screen.getByTestId('financial-reports-total-income')).toHaveTextContent('$1,080'),
    );
  });

  it('renders the Income Graphic section', () => {
    renderPage();
    expect(screen.getByText('Income Graphic')).toBeInTheDocument();
  });

  it('renders the income chart element', () => {
    renderPage();
    expect(screen.getByTestId('financial-reports-income-chart')).toBeInTheDocument();
  });

  it('renders the Total Occupation section', () => {
    renderPage();
    expect(screen.getByText('Total Occupation')).toBeInTheDocument();
  });

  it('calculates 50% occupation rate for 2 confirmed out of 4', async () => {
    // 2 CONFIRMADO / 4 total = 50%
    renderPage();
    await waitFor(() =>
      expect(screen.getByTestId('financial-reports-occupation-pct')).toHaveTextContent('50%'),
    );
  });

  // ── API call ───────────────────────────────────────────────────────────────

  it('calls getHotelBookings with the hotel ID, token and currency', async () => {
    renderPage();
    await waitFor(() =>
      expect(mockGetHotelBookings).toHaveBeenCalledWith('hotel-123', 'token-abc', 'USD'),
    );
  });

  // ── Error state ────────────────────────────────────────────────────────────

  it('shows error message when API call fails', async () => {
    mockGetHotelBookings.mockRejectedValueOnce(new Error('Server error'));
    renderPage();
    await waitFor(() =>
      expect(screen.getByTestId('financial-reports-error')).toHaveTextContent('Server error'),
    );
  });

  // ── Logout ─────────────────────────────────────────────────────────────────

  it('logout button is clickable without throwing', () => {
    renderPage();
    expect(() => fireEvent.click(screen.getByTestId('b2b-sidebar-logout'))).not.toThrow();
  });

  it('calls logout from AuthContext when logout button is clicked', () => {
    renderPage();
    fireEvent.click(screen.getByTestId('b2b-sidebar-logout'));
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });
});
