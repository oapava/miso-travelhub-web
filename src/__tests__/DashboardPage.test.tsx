import { render, screen, waitFor } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DashboardPage from '@/pages/b2b/DashboardPage/DashboardPage';
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

// 4 deterministic mock bookings
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
    <MemoryRouter initialEntries={['/business']}>
      <DashboardPage />
    </MemoryRouter>,
  );

describe('DashboardPage', () => {
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
  });

  // ── Structure ──────────────────────────────────────────────────────────────

  it('renders the dashboard page container', () => {
    renderPage();
    expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
  });

  it('renders the B2B header', () => {
    renderPage();
    expect(screen.getByTestId('dashboard-header')).toBeInTheDocument();
  });

  it('renders the B2B sidebar', () => {
    renderPage();
    expect(screen.getByTestId('dashboard-sidebar')).toBeInTheDocument();
  });

  it('renders the dashboard title', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /Travelhub/i })).toBeInTheDocument();
  });

  // ── KPI cards ─────────────────────────────────────────────────────────────

  it("renders the Today's Bookings stat card", () => {
    renderPage();
    expect(screen.getByTestId('dashboard-bookings-card')).toBeInTheDocument();
    expect(screen.getByText('b2b.dashboard.todaysBookings')).toBeInTheDocument();
  });

  it('renders the Incomes stat card', () => {
    renderPage();
    expect(screen.getByTestId('dashboard-incomes-card')).toBeInTheDocument();
    expect(screen.getByText('b2b.dashboard.incomes')).toBeInTheDocument();
  });

  it('renders the Confirmed stat card', () => {
    renderPage();
    const card = screen.getByTestId('dashboard-confirmed-card');
    expect(card).toBeInTheDocument();
    expect(card).toHaveTextContent('b2b.dashboard.confirmed');
  });

  it('renders the Pending stat card', () => {
    renderPage();
    const card = screen.getByTestId('dashboard-pending-card');
    expect(card).toBeInTheDocument();
    expect(card).toHaveTextContent('b2b.dashboard.pending');
  });

  // ── API call ───────────────────────────────────────────────────────────────

  it('calls getHotelBookings with the hotel ID, token and currency', async () => {
    renderPage();
    await waitFor(() =>
      expect(mockGetHotelBookings).toHaveBeenCalledWith('hotel-123', 'token-abc', 'USD'),
    );
  });

  // ── Last Bookings table ────────────────────────────────────────────────────

  it('renders the Last Bookings data table', () => {
    renderPage();
    expect(screen.getByText('b2b.dashboard.lastBookings')).toBeInTheDocument();
  });

  it('renders the bookings table with data rows after loading', async () => {
    renderPage();
    await waitFor(() => {
      const rows = screen.getAllByTestId(/dashboard-last-bookings-row-/);
      expect(rows.length).toBe(4);
    });
  });

  it('renders table header columns', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('b2b.dashboard.colName')).toBeInTheDocument();
      expect(screen.getByText('b2b.dashboard.colDaysNights')).toBeInTheDocument();
      expect(screen.getByText('b2b.dashboard.colGuests')).toBeInTheDocument();
      expect(screen.getByText('b2b.dashboard.colStart')).toBeInTheDocument();
      expect(screen.getByText('b2b.dashboard.colEnd')).toBeInTheDocument();
    });
  });

  it('shows traveler ID in the bookings table', async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByText('traveler1')).toBeInTheDocument(),
    );
  });

  // ── Occupation rate ────────────────────────────────────────────────────────

  it('renders the Occupation Rate section', () => {
    renderPage();
    expect(screen.getByText('b2b.dashboard.occupationRate')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-occupation-badge')).toBeInTheDocument();
  });

  it('renders occupation badge with percentage format', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByTestId('dashboard-occupation-badge')).toHaveTextContent(/\d+%/);
    });
  });

  it('calculates 50% occupation rate for 2 confirmed out of 4', async () => {
    // mockBookings: 2 confirmed, 1 pending, 1 cancelled → 50%
    renderPage();
    await waitFor(() => {
      expect(screen.getByTestId('dashboard-occupation-badge')).toHaveTextContent('50%');
    });
  });

  // ── Income chart ───────────────────────────────────────────────────────────

  it('renders the monthly income chart', () => {
    renderPage();
    expect(screen.getByTestId('dashboard-income-chart')).toBeInTheDocument();
  });

  it('renders 6 month labels in the income chart', async () => {
    renderPage();
    await waitFor(() => {
      // 6 month labels present
      const labels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      const present = labels.filter(m => screen.queryByText(m) !== null);
      expect(present.length).toBe(6);
    });
  });

  // ── Error state ────────────────────────────────────────────────────────────

  it('shows error message when API call fails', async () => {
    mockGetHotelBookings.mockRejectedValueOnce(new Error('Server error'));
    renderPage();
    await waitFor(() =>
      expect(screen.getByTestId('dashboard-error')).toHaveTextContent('Server error'),
    );
  });

  // ── Logout ─────────────────────────────────────────────────────────────────

  it('logout button is present and clickable without throwing', () => {
    renderPage();
    const logoutBtn = screen.getByTestId('b2b-sidebar-logout');
    expect(() => fireEvent.click(logoutBtn)).not.toThrow();
  });

  it('calls logout from AuthContext when logout button is clicked', () => {
    renderPage();
    fireEvent.click(screen.getByTestId('b2b-sidebar-logout'));
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });
});
