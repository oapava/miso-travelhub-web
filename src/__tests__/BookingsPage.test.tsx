import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BookingsPage from '@/pages/b2c/BookingsPage/BookingsPage';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en', changeLanguage: jest.fn() },
  }),
}));

jest.mock('@/context/AuthContext', () => ({ useAuth: jest.fn() }));

jest.mock('@/components/shared/LoginModal/LoginModal', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('@/components/shared/SignUpModal/SignUpModal', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@/services/booking.service', () => ({
  bookingService: { getMyBookings: jest.fn() },
}));

import { useAuth } from '@/context/AuthContext';
import { bookingService } from '@/services/booking.service';

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockGetMyBookings = bookingService.getMyBookings as jest.Mock;

const unauthUser = {
  isAuthenticated: false, user: null, accessToken: null,
  login: jest.fn(), logout: jest.fn(),
};
const authUser = {
  isAuthenticated: true,
  user: { nombre: 'Test User', email: 'test@test.com' } as Parameters<typeof mockUseAuth>[0]['user'],
  accessToken: 'my-token',
  login: jest.fn(), logout: jest.fn(),
};

const mockBookings = [
  {
    id: 'b1', codigo: 'CODE-001', viajeroId: 'u1', habitacionId: 'h1',
    fechaCheckIn: '2025-08-10T00:00:00', fechaCheckOut: '2025-08-15T00:00:00',
    numHuespedes: 2, estado: 'CONFIRMADA', subtotal: 500, impuestos: 100, total: 600, moneda: 'USD',
  },
  {
    id: 'b2', codigo: 'CODE-002', viajeroId: 'u1', habitacionId: 'h2',
    fechaCheckIn: '2024-09-01T00:00:00', fechaCheckOut: '2024-09-05T00:00:00',
    numHuespedes: 1, estado: 'CANCELADA', subtotal: 300, impuestos: 60, total: 360, moneda: 'USD',
  },
];

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/account/bookings']}>
      <BookingsPage />
    </MemoryRouter>,
  );

describe('BookingsPage', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockUseAuth.mockReturnValue(unauthUser as ReturnType<typeof useAuth>);
    mockGetMyBookings.mockResolvedValue([]);
  });

  it('renders the bookings page container', () => {
    renderPage();
    expect(screen.getByTestId('bookings-page')).toBeInTheDocument();
  });

  it('renders the Booking History title', () => {
    renderPage();
    expect(screen.getByText('Booking History')).toBeInTheDocument();
  });

  it('renders the account sidebar', () => {
    renderPage();
    expect(screen.getByTestId('bookings-sidebar')).toBeInTheDocument();
  });

  it('shows empty state when not authenticated', async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.queryByText('Loading bookings...')).not.toBeInTheDocument(),
    );
    expect(screen.getByText('You have no bookings yet.')).toBeInTheDocument();
  });

  it('shows loading state while fetching bookings', () => {
    mockUseAuth.mockReturnValue(authUser as ReturnType<typeof useAuth>);
    mockGetMyBookings.mockReturnValue(new Promise(() => {})); // never resolves
    renderPage();
    expect(screen.getByText('Loading bookings...')).toBeInTheDocument();
  });

  it('calls getMyBookings with the access token', async () => {
    mockUseAuth.mockReturnValue(authUser as ReturnType<typeof useAuth>);
    renderPage();
    await waitFor(() => expect(mockGetMyBookings).toHaveBeenCalledWith('my-token'));
  });

  it('renders booking items when loaded', async () => {
    mockUseAuth.mockReturnValue(authUser as ReturnType<typeof useAuth>);
    mockGetMyBookings.mockResolvedValue(mockBookings);
    renderPage();
    await waitFor(() => {
      expect(screen.getByTestId('booking-item-b1')).toBeInTheDocument();
      expect(screen.getByTestId('booking-item-b2')).toBeInTheDocument();
    });
  });

  it('renders booking groups grouped by month', async () => {
    mockUseAuth.mockReturnValue(authUser as ReturnType<typeof useAuth>);
    mockGetMyBookings.mockResolvedValue(mockBookings);
    renderPage();
    await waitFor(() => {
      expect(screen.getByTestId('booking-group-0')).toBeInTheDocument();
      expect(screen.getByTestId('booking-group-1')).toBeInTheDocument();
    });
  });

  it('renders booking codes', async () => {
    mockUseAuth.mockReturnValue(authUser as ReturnType<typeof useAuth>);
    mockGetMyBookings.mockResolvedValue(mockBookings);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/CODE-001/)).toBeInTheDocument();
      expect(screen.getByText(/CODE-002/)).toBeInTheDocument();
    });
  });

  it('renders status badges for each booking', async () => {
    mockUseAuth.mockReturnValue(authUser as ReturnType<typeof useAuth>);
    mockGetMyBookings.mockResolvedValue(mockBookings);
    renderPage();
    await waitFor(() => {
      expect(screen.getByTestId('booking-status-b1')).toBeInTheDocument();
      expect(screen.getByTestId('booking-status-b2')).toBeInTheDocument();
    });
  });

  it('shows error message when getMyBookings fails', async () => {
    mockUseAuth.mockReturnValue(authUser as ReturnType<typeof useAuth>);
    mockGetMyBookings.mockRejectedValue(new Error('Network error'));
    renderPage();
    await waitFor(() =>
      expect(screen.getByText(/Network error/)).toBeInTheDocument(),
    );
  });

  it('shows empty state when bookings list is empty', async () => {
    mockUseAuth.mockReturnValue(authUser as ReturnType<typeof useAuth>);
    mockGetMyBookings.mockResolvedValue([]);
    renderPage();
    await waitFor(() =>
      expect(screen.getByText('You have no bookings yet.')).toBeInTheDocument(),
    );
  });
});
