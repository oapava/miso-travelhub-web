import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BookingManagerPage from '@/pages/b2b/BookingManagerPage/BookingManagerPage';

// ── Mocks ────────────────────────────────────────────────────────────────────

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
    updateBooking: jest.fn(),
  },
  getHotelIdFromToken: jest.fn(),
  HotelBooking: {},
}));

// Mock the three modals so their internal rendering doesn't interfere
jest.mock('@/components/shared/BookingDetailModal/BookingDetailModal', () => ({
  __esModule: true,
  default: ({ isOpen, dataTestId }: { isOpen: boolean; dataTestId?: string }) =>
    isOpen ? <div data-testid={dataTestId ?? 'booking-detail-modal'} /> : null,
}));

jest.mock(
  '@/components/shared/BookingConfirmActionModal/BookingConfirmActionModal',
  () => ({
    __esModule: true,
    default: ({ isOpen, dataTestId }: { isOpen: boolean; dataTestId?: string }) =>
      isOpen ? <div data-testid={dataTestId ?? 'booking-confirm-action-modal'} /> : null,
  }),
);

jest.mock('@/components/shared/BookingCancelModal/BookingCancelModal', () => ({
  __esModule: true,
  default: ({ isOpen, dataTestId }: { isOpen: boolean; dataTestId?: string }) =>
    isOpen ? <div data-testid={dataTestId ?? 'booking-cancel-modal'} /> : null,
}));

import { useAuth } from '@/context/AuthContext';
import { bookingService, getHotelIdFromToken } from '@/services/booking.service';

const mockUseAuth        = useAuth as jest.MockedFunction<typeof useAuth>;
const mockGetBookings    = bookingService.getHotelBookings as jest.Mock;
const mockGetMyBookings  = bookingService.getMyBookings as jest.Mock;
const mockGetHotelId     = getHotelIdFromToken as jest.Mock;
const mockUpdateBooking  = bookingService.updateBooking as jest.Mock;

// ── JWT helpers ──────────────────────────────────────────────────────────────

function buildFakeToken(hotelId: string): string {
  const payload = btoa(JSON.stringify({ hotel_id: hotelId, sub: 'u1', role: 'hotel_admin' }))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  return `header.${payload}.signature`;
}

// ── Fixtures ─────────────────────────────────────────────────────────────────

const TOKEN   = buildFakeToken('hotel-42');
const HOTEL_ID = 'hotel-42';

const mockBookings = [
  {
    id: 'b1', codigo: 'CODE001', viajeroId: 'user-aaa', habitacionId: 'room-1',
    fechaCheckIn: '2026-09-01T00:00:00', fechaCheckOut: '2026-09-05T00:00:00',
    numHuespedes: 2, estado: 'PENDIENTE', subtotal: 400, impuestos: 80, total: 480, moneda: 'USD',
  },
  {
    id: 'b2', codigo: 'CODE002', viajeroId: 'user-bbb', habitacionId: 'room-2',
    fechaCheckIn: '2026-10-01T00:00:00', fechaCheckOut: '2026-10-03T00:00:00',
    numHuespedes: 1, estado: 'CONFIRMADO', subtotal: 200, impuestos: 40, total: 240, moneda: 'USD',
  },
  {
    id: 'b3', codigo: 'CODE003', viajeroId: 'user-ccc', habitacionId: 'room-3',
    fechaCheckIn: '2026-11-10T00:00:00', fechaCheckOut: '2026-11-15T00:00:00',
    numHuespedes: 3, estado: 'CANCELADO', subtotal: 500, impuestos: 100, total: 600, moneda: 'EUR',
  },
];

const authState = {
  isAuthenticated: true,
  user: null,
  accessToken: TOKEN,
  login: jest.fn(),
  logout: jest.fn(),
};

const noAuthState = {
  isAuthenticated: false,
  user: null,
  accessToken: null,
  login: jest.fn(),
  logout: jest.fn(),
};

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/business/booking-manager']}>
      <BookingManagerPage />
    </MemoryRouter>,
  );

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('BookingManagerPage', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockUseAuth.mockReturnValue(authState);
    mockGetHotelId.mockReturnValue(HOTEL_ID);
    mockGetBookings.mockResolvedValue(mockBookings);
    mockGetMyBookings.mockResolvedValue(mockBookings);
    // Default: updateBooking succeeds and returns the updated booking
    mockUpdateBooking.mockResolvedValue({ ...mockBookings[0], estado: 'CONFIRMADO' });
  });

  // ── Structural rendering ─────────────────────────────────────────────────

  it('renders the page container', () => {
    renderPage();
    expect(screen.getByTestId('booking-manager-page')).toBeInTheDocument();
  });

  it('renders the B2B header', () => {
    renderPage();
    expect(screen.getByTestId('booking-manager-header')).toBeInTheDocument();
  });

  it('renders the B2B sidebar', () => {
    renderPage();
    expect(screen.getByTestId('booking-manager-sidebar')).toBeInTheDocument();
  });

  it('renders the Booking Manager title', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /b2b\.bookingManager\.title/i })).toBeInTheDocument();
  });

  it('renders state filter', () => {
    renderPage();
    expect(screen.getByTestId('booking-manager-state-filter')).toBeInTheDocument();
  });

  it('renders client filter', () => {
    renderPage();
    expect(screen.getByTestId('booking-manager-client-filter')).toBeInTheDocument();
  });

  it('renders start date filter', () => {
    renderPage();
    expect(screen.getByTestId('booking-manager-start-date')).toBeInTheDocument();
  });

  it('renders end date filter', () => {
    renderPage();
    expect(screen.getByTestId('booking-manager-end-date')).toBeInTheDocument();
  });

  it('renders the pagination component', () => {
    renderPage();
    expect(screen.getByTestId('booking-manager-pagination')).toBeInTheDocument();
  });

  // ── API integration ──────────────────────────────────────────────────────

  it('calls getHotelIdFromToken with the access token on mount', async () => {
    renderPage();
    await waitFor(() => expect(mockGetHotelId).toHaveBeenCalledWith(TOKEN));
  });

  it('calls getHotelBookings with hotelId, token and currency on mount', async () => {
    renderPage();
    await waitFor(() =>
      expect(mockGetBookings).toHaveBeenCalledWith(HOTEL_ID, TOKEN, 'USD'),
    );
  });

  it('does not call getHotelBookings when accessToken is null', () => {
    mockUseAuth.mockReturnValue(noAuthState);
    renderPage();
    expect(mockGetBookings).not.toHaveBeenCalled();
  });

  it('falls back to getMyBookings with currency when hotelId cannot be decoded', async () => {
    mockGetHotelId.mockReturnValueOnce(null);
    renderPage();
    await waitFor(() =>
      expect(mockGetMyBookings).toHaveBeenCalledWith(TOKEN, { moneda: 'USD' }),
    );
    expect(mockGetBookings).not.toHaveBeenCalled();
  });

  it('renders bookings in the table after loading', async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByTestId('booking-manager-table')).toBeInTheDocument(),
    );
  });

  it('shows correct booking codes in the table', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('CODE001')).toBeInTheDocument());
    expect(screen.getByText('CODE002')).toBeInTheDocument();
    expect(screen.getByText('CODE003')).toBeInTheDocument();
  });

  it('shows formatted estado in the table', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Pendiente')).toBeInTheDocument());
    expect(screen.getByText('Confirmado')).toBeInTheDocument();
    expect(screen.getByText('Cancelado')).toBeInTheDocument();
  });

  it('shows guest counts in the table', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByTestId('booking-guests-b1')).toHaveTextContent('2'));
    expect(screen.getByTestId('booking-guests-b2')).toHaveTextContent('1');
    expect(screen.getByTestId('booking-guests-b3')).toHaveTextContent('3');
  });

  // ── Action buttons ───────────────────────────────────────────────────────

  it('renders CONFIRM button for each booking row', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByTestId('booking-confirm-btn-b1')).toBeInTheDocument();
      expect(screen.getByTestId('booking-confirm-btn-b2')).toBeInTheDocument();
      expect(screen.getByTestId('booking-confirm-btn-b3')).toBeInTheDocument();
    });
  });

  it('renders CANCEL button for each booking row', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByTestId('booking-cancel-btn-b1')).toBeInTheDocument();
      expect(screen.getByTestId('booking-cancel-btn-b2')).toBeInTheDocument();
      expect(screen.getByTestId('booking-cancel-btn-b3')).toBeInTheDocument();
    });
  });

  it('renders DETAIL button for each booking row', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByTestId('booking-detail-btn-b1')).toBeInTheDocument();
    });
  });

  it('opens detail modal when DETAIL button is clicked', async () => {
    renderPage();
    await waitFor(() => screen.getByTestId('booking-detail-btn-b1'));
    fireEvent.click(screen.getByTestId('booking-detail-btn-b1'));
    expect(screen.getByTestId('booking-detail-modal')).toBeInTheDocument();
  });

  it('opens confirm modal after CONFIRM button calls API successfully', async () => {
    renderPage();
    await waitFor(() => screen.getByTestId('booking-confirm-btn-b1'));
    fireEvent.click(screen.getByTestId('booking-confirm-btn-b1'));
    await waitFor(() =>
      expect(screen.getByTestId('booking-confirm-action-modal')).toBeInTheDocument(),
    );
  });

  it('calls updateBooking with CONFIRMADA when CONFIRM button is clicked', async () => {
    renderPage();
    await waitFor(() => screen.getByTestId('booking-confirm-btn-b1'));
    fireEvent.click(screen.getByTestId('booking-confirm-btn-b1'));
    await waitFor(() =>
      expect(mockUpdateBooking).toHaveBeenCalledWith('b1', 'CONFIRMADA', TOKEN),
    );
  });

  it('updates the booking state in the list after confirmation', async () => {
    mockUpdateBooking.mockResolvedValueOnce({ ...mockBookings[0], estado: 'CONFIRMADO' });
    renderPage();
    await waitFor(() => screen.getByTestId('booking-confirm-btn-b1'));
    fireEvent.click(screen.getByTestId('booking-confirm-btn-b1'));
    await waitFor(() =>
      expect(screen.getByTestId('booking-state-b1')).toHaveTextContent('Confirmado'),
    );
  });

  it('shows action error when CONFIRM API call fails', async () => {
    mockUpdateBooking.mockRejectedValueOnce(new Error('Service error'));
    renderPage();
    await waitFor(() => screen.getByTestId('booking-confirm-btn-b1'));
    fireEvent.click(screen.getByTestId('booking-confirm-btn-b1'));
    await waitFor(() =>
      expect(screen.getByTestId('booking-manager-action-error')).toHaveTextContent('Service error'),
    );
  });

  it('opens cancel modal when CANCEL button is clicked', async () => {
    renderPage();
    await waitFor(() => screen.getByTestId('booking-cancel-btn-b1'));
    fireEvent.click(screen.getByTestId('booking-cancel-btn-b1'));
    expect(screen.getByTestId('booking-cancel-modal')).toBeInTheDocument();
  });

  // ── Loading state ────────────────────────────────────────────────────────

  it('shows loading indicator while fetching', async () => {
    let resolve!: (v: typeof mockBookings) => void;
    mockGetBookings.mockReturnValueOnce(new Promise((res) => { resolve = res; }));
    renderPage();
    expect(screen.getByTestId('booking-manager-loading')).toBeInTheDocument();
    await waitFor(async () => resolve(mockBookings));
    await waitFor(() =>
      expect(screen.queryByTestId('booking-manager-loading')).not.toBeInTheDocument(),
    );
  });

  // ── Error state ──────────────────────────────────────────────────────────

  it('shows error message when getHotelBookings fails', async () => {
    mockGetBookings.mockRejectedValueOnce(new Error('Service unavailable'));
    renderPage();
    await waitFor(() =>
      expect(screen.getByTestId('booking-manager-error')).toHaveTextContent('Service unavailable'),
    );
  });

  it('shows generic error when reject value is not an Error', async () => {
    mockGetBookings.mockRejectedValueOnce('unexpected');
    renderPage();
    await waitFor(() =>
      expect(screen.getByTestId('booking-manager-error')).toHaveTextContent(
        'b2b.bookingManager.couldNotLoadBookings',
      ),
    );
  });

  it('does not render table when there is an error', async () => {
    mockGetBookings.mockRejectedValueOnce(new Error('fail'));
    renderPage();
    await waitFor(() =>
      expect(screen.queryByTestId('booking-manager-table')).not.toBeInTheDocument(),
    );
  });

  // ── Empty state ──────────────────────────────────────────────────────────

  it('shows empty state when no bookings are returned', async () => {
    mockGetBookings.mockResolvedValueOnce([]);
    renderPage();
    await waitFor(() =>
      expect(screen.getByTestId('booking-manager-empty')).toBeInTheDocument(),
    );
  });

  // ── State filter ─────────────────────────────────────────────────────────

  it('filters bookings by PENDIENTE state', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByTestId('booking-manager-table')).toBeInTheDocument());

    fireEvent.change(screen.getByTestId('booking-manager-state-filter'), {
      target: { value: 'PENDIENTE' },
    });

    await waitFor(() => expect(screen.getByText('CODE001')).toBeInTheDocument());
    expect(screen.queryByText('CODE002')).not.toBeInTheDocument();
    expect(screen.queryByText('CODE003')).not.toBeInTheDocument();
  });

  it('shows all bookings when state filter is cleared', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByTestId('booking-manager-table')).toBeInTheDocument());

    fireEvent.change(screen.getByTestId('booking-manager-state-filter'), {
      target: { value: 'CONFIRMADO' },
    });
    fireEvent.change(screen.getByTestId('booking-manager-state-filter'), {
      target: { value: '' },
    });

    await waitFor(() => {
      expect(screen.getByText('CODE001')).toBeInTheDocument();
      expect(screen.getByText('CODE002')).toBeInTheDocument();
      expect(screen.getByText('CODE003')).toBeInTheDocument();
    });
  });

  // ── Client filter ────────────────────────────────────────────────────────

  it('filters bookings by client (viajeroId substring)', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByTestId('booking-manager-table')).toBeInTheDocument());

    fireEvent.change(screen.getByTestId('booking-manager-client-filter'), {
      target: { value: 'user-aaa' },
    });

    await waitFor(() => expect(screen.getByText('CODE001')).toBeInTheDocument());
    expect(screen.queryByText('CODE002')).not.toBeInTheDocument();
    expect(screen.queryByText('CODE003')).not.toBeInTheDocument();
  });

  // ── Date filters ─────────────────────────────────────────────────────────

  it('filters by start date — excludes bookings before that date', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByTestId('booking-manager-table')).toBeInTheDocument());

    fireEvent.change(screen.getByTestId('booking-manager-start-date'), {
      target: { value: '2026-10-01' },
    });

    await waitFor(() => {
      expect(screen.queryByText('CODE001')).not.toBeInTheDocument();
      expect(screen.getByText('CODE002')).toBeInTheDocument();
      expect(screen.getByText('CODE003')).toBeInTheDocument();
    });
  });

  it('filters by end date — excludes bookings beyond that date', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByTestId('booking-manager-table')).toBeInTheDocument());

    fireEvent.change(screen.getByTestId('booking-manager-end-date'), {
      target: { value: '2026-10-05' },
    });

    await waitFor(() => {
      expect(screen.getByText('CODE001')).toBeInTheDocument();
      expect(screen.getByText('CODE002')).toBeInTheDocument();
      expect(screen.queryByText('CODE003')).not.toBeInTheDocument();
    });
  });

  it('shows empty state when filters leave no matching bookings', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByTestId('booking-manager-table')).toBeInTheDocument());

    fireEvent.change(screen.getByTestId('booking-manager-state-filter'), {
      target: { value: 'CANCELADO' },
    });
    fireEvent.change(screen.getByTestId('booking-manager-start-date'), {
      target: { value: '2027-01-01' },
    });

    await waitFor(() =>
      expect(screen.getByTestId('booking-manager-empty')).toBeInTheDocument(),
    );
  });

  // ── Terminal-state button disabling ──────────────────────────────────────

  const terminalBooking = (id: string, estado: string) => ({
    id,
    codigo: `CODE-${id.toUpperCase()}`,
    viajeroId: `user-${id}`,
    habitacionId: `room-${id}`,
    fechaCheckIn: '2026-09-01T00:00:00',
    fechaCheckOut: '2026-09-05T00:00:00',
    numHuespedes: 1,
    estado,
    subtotal: 100,
    impuestos: 20,
    total: 120,
    moneda: 'USD',
  });

  it('disables CONFIRM and CANCEL buttons for a CANCELADA booking', async () => {
    mockGetBookings.mockResolvedValueOnce([terminalBooking('tc1', 'CANCELADA')]);
    renderPage();
    await waitFor(() => {
      expect(screen.getByTestId('booking-confirm-btn-tc1')).toBeDisabled();
      expect(screen.getByTestId('booking-cancel-btn-tc1')).toBeDisabled();
    });
  });

  it('disables CONFIRM and CANCEL buttons for a CANCELADO booking', async () => {
    mockGetBookings.mockResolvedValueOnce([terminalBooking('tc2', 'CANCELADO')]);
    renderPage();
    await waitFor(() => {
      expect(screen.getByTestId('booking-confirm-btn-tc2')).toBeDisabled();
      expect(screen.getByTestId('booking-cancel-btn-tc2')).toBeDisabled();
    });
  });

  it('disables CONFIRM and CANCEL buttons for a REEMBOLSADA booking', async () => {
    mockGetBookings.mockResolvedValueOnce([terminalBooking('tr1', 'REEMBOLSADA')]);
    renderPage();
    await waitFor(() => {
      expect(screen.getByTestId('booking-confirm-btn-tr1')).toBeDisabled();
      expect(screen.getByTestId('booking-cancel-btn-tr1')).toBeDisabled();
    });
  });

  it('disables CONFIRM and CANCEL buttons for a REEMBOLSADO booking', async () => {
    mockGetBookings.mockResolvedValueOnce([terminalBooking('tr2', 'REEMBOLSADO')]);
    renderPage();
    await waitFor(() => {
      expect(screen.getByTestId('booking-confirm-btn-tr2')).toBeDisabled();
      expect(screen.getByTestId('booking-cancel-btn-tr2')).toBeDisabled();
    });
  });

  it('disables CONFIRM and CANCEL buttons for a REEMBOLSANDO booking', async () => {
    mockGetBookings.mockResolvedValueOnce([terminalBooking('tr3', 'REEMBOLSANDO')]);
    renderPage();
    await waitFor(() => {
      expect(screen.getByTestId('booking-confirm-btn-tr3')).toBeDisabled();
      expect(screen.getByTestId('booking-cancel-btn-tr3')).toBeDisabled();
    });
  });

  it('disables CONFIRM and CANCEL buttons for a PAGADA booking', async () => {
    mockGetBookings.mockResolvedValueOnce([terminalBooking('tp1', 'PAGADA')]);
    renderPage();
    await waitFor(() => {
      expect(screen.getByTestId('booking-confirm-btn-tp1')).toBeDisabled();
      expect(screen.getByTestId('booking-cancel-btn-tp1')).toBeDisabled();
    });
  });

  it('keeps CONFIRM and CANCEL buttons enabled for a PENDIENTE booking', async () => {
    mockGetBookings.mockResolvedValueOnce([terminalBooking('ta1', 'PENDIENTE')]);
    renderPage();
    await waitFor(() => {
      expect(screen.getByTestId('booking-confirm-btn-ta1')).not.toBeDisabled();
      expect(screen.getByTestId('booking-cancel-btn-ta1')).not.toBeDisabled();
    });
  });

  it('keeps CONFIRM and CANCEL buttons enabled for a CONFIRMADO booking', async () => {
    mockGetBookings.mockResolvedValueOnce([terminalBooking('ta2', 'CONFIRMADO')]);
    renderPage();
    await waitFor(() => {
      expect(screen.getByTestId('booking-confirm-btn-ta2')).not.toBeDisabled();
      expect(screen.getByTestId('booking-cancel-btn-ta2')).not.toBeDisabled();
    });
  });
});
