import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BookingsPage from '@/pages/b2c/BookingsPage/BookingsPage';

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

jest.mock('@/components/shared/LoginModal/LoginModal', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('@/components/shared/SignUpModal/SignUpModal', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('@/components/shared/BookingDetailModal/BookingDetailModal', () => ({
  __esModule: true,
  default: ({ isOpen, booking, dataTestId }: { isOpen: boolean; booking?: { nombreHotel?: string }; dataTestId?: string }) =>
    isOpen ? (
      <div data-testid={dataTestId ?? 'bookings-detail-modal'}>
        {booking?.nombreHotel && <span>{booking.nombreHotel}</span>}
      </div>
    ) : null,
}));

jest.mock('@/services/booking.service', () => ({
  bookingService: {
    getMyBookings: jest.fn(),
    updateBooking: jest.fn(),
  },
}));

import { useAuth } from '@/context/AuthContext';
import { bookingService } from '@/services/booking.service';

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockGetMyBookings = bookingService.getMyBookings as jest.Mock;
const mockUpdateBooking = bookingService.updateBooking as jest.Mock;

const unauthUser = {
  isAuthenticated: false, user: null, accessToken: null,
  login: jest.fn(), logout: jest.fn(),
};
const authUser = {
  isAuthenticated: true,
  user: { nombre: 'Test User', email: 'test@test.com' } as ReturnType<typeof useAuth>['user'],
  accessToken: 'my-token',
  login: jest.fn(), logout: jest.fn(),
};

const mockBookings = [
  {
    id: 'b1', habitacionId: 'h1', nombreUser: 'Test User',
    nombreHotel: 'Grand Cypress Hotel', descripcion: 'Vista ciudad',
    ciudad: 'Medellín', pais: 'Colombia', direccion: 'Calle 100',
    estrellas: 4, distancia: '1.2km from center', acceso: 'Metro',
    tipo: 'Doble', categoria: 'Deluxe',
    tipo_habitacion: 'deluxe', tipo_cama: ['king'], tamano_habitacion: '35m2',
    amenidades: ['AC', 'WiFi'],
    imagenes: ['https://example.com/hotel1.jpg'],
    fechaCheckIn: '2025-08-10T00:00:00', fechaCheckOut: '2025-08-15T00:00:00',
    numHuespedes: 2, estado: 'CONFIRMADA', subtotal: 500, impuestos: 100, total: 600, moneda: 'USD',
  },
  {
    id: 'b2', habitacionId: 'h2', nombreUser: 'Test User',
    nombreHotel: 'Boutique City Villa', descripcion: 'Suite premium',
    ciudad: 'Bogotá', pais: 'Colombia', direccion: 'Cra 7',
    estrellas: 5, distancia: '2.5km from center', acceso: 'Bus',
    tipo: 'Suite', categoria: 'Premium',
    tipo_habitacion: 'suite', tipo_cama: ['queen'], tamano_habitacion: '50m2',
    amenidades: ['Pool', 'Spa'],
    imagenes: [],
    fechaCheckIn: '2024-09-01T00:00:00', fechaCheckOut: '2024-09-05T00:00:00',
    numHuespedes: 1, estado: 'CANCELADA', subtotal: 300, impuestos: 60, total: 360, moneda: 'USD',
  },
  {
    id: 'b3', habitacionId: 'h3', nombreUser: 'Test User',
    nombreHotel: 'Seaside Resort', descripcion: 'Vista al mar',
    ciudad: 'Cartagena', pais: 'Colombia', direccion: 'Avenida el Mar',
    estrellas: 3, distancia: '0.5km from center', acceso: 'Walk',
    tipo: 'Standard', categoria: 'Economy',
    tipo_habitacion: 'standard', tipo_cama: ['double'], tamano_habitacion: '25m2',
    amenidades: ['Beach'],
    imagenes: [],
    fechaCheckIn: '2024-10-01T00:00:00', fechaCheckOut: '2024-10-03T00:00:00',
    numHuespedes: 2, estado: 'PENDIENTE', subtotal: 200, impuestos: 40, total: 240, moneda: 'COP',
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
    expect(screen.getByText('bookings.title')).toBeInTheDocument();
  });

  it('renders the account sidebar', () => {
    renderPage();
    expect(screen.getByTestId('bookings-sidebar')).toBeInTheDocument();
  });

  it('shows empty state when not authenticated', async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.queryByText('bookings.loading')).not.toBeInTheDocument(),
    );
    expect(screen.getByText('bookings.empty')).toBeInTheDocument();
  });

  it('shows loading state while fetching bookings', () => {
    mockUseAuth.mockReturnValue(authUser as ReturnType<typeof useAuth>);
    mockGetMyBookings.mockReturnValue(new Promise(() => {})); // never resolves
    renderPage();
    expect(screen.getByText('bookings.loading')).toBeInTheDocument();
  });

  it('calls getMyBookings with the access token and active currency', async () => {
    mockUseAuth.mockReturnValue(authUser as ReturnType<typeof useAuth>);
    renderPage();
    await waitFor(() =>
      expect(mockGetMyBookings).toHaveBeenCalledWith('my-token', { moneda: 'USD' }),
    );
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

  it('renders hotel names', async () => {
    mockUseAuth.mockReturnValue(authUser as ReturnType<typeof useAuth>);
    mockGetMyBookings.mockResolvedValue(mockBookings);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/Grand Cypress Hotel/)).toBeInTheDocument();
      expect(screen.getByText(/Boutique City Villa/)).toBeInTheDocument();
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
      expect(screen.getByText('bookings.empty')).toBeInTheDocument(),
    );
  });

  // ── PAY button (CONFIRMADA bookings) ─────────────────────────────────────────

  it('renders PAY NOW button for CONFIRMADA booking', async () => {
    mockUseAuth.mockReturnValue(authUser as ReturnType<typeof useAuth>);
    mockGetMyBookings.mockResolvedValue(mockBookings);
    renderPage();
    await waitFor(() =>
      expect(screen.getByTestId('booking-pay-btn-b1')).toBeInTheDocument(),
    );
  });

  it('PAY NOW button href contains invoiceId, currency and amount for CONFIRMADA booking', async () => {
    mockUseAuth.mockReturnValue(authUser as ReturnType<typeof useAuth>);
    mockGetMyBookings.mockResolvedValue(mockBookings);
    renderPage();
    await waitFor(() => {
      const payBtn = screen.getByTestId('booking-pay-btn-b1');
      expect(payBtn).toHaveAttribute('href', expect.stringContaining('invoiceId=b1'));
      expect(payBtn).toHaveAttribute('href', expect.stringContaining('currency=USD'));
      expect(payBtn).toHaveAttribute('href', expect.stringContaining('amount=600'));
      expect(payBtn).toHaveAttribute('href', expect.stringContaining('returnUrl='));
    });
  });

  it('does NOT render PAY NOW for CANCELADA booking', async () => {
    mockUseAuth.mockReturnValue(authUser as ReturnType<typeof useAuth>);
    mockGetMyBookings.mockResolvedValue(mockBookings);
    renderPage();
    await waitFor(() =>
      expect(screen.queryByTestId('booking-pay-btn-b2')).not.toBeInTheDocument(),
    );
  });

  it('does NOT render PAY NOW for PENDIENTE booking', async () => {
    mockUseAuth.mockReturnValue(authUser as ReturnType<typeof useAuth>);
    mockGetMyBookings.mockResolvedValue(mockBookings);
    renderPage();
    await waitFor(() =>
      expect(screen.queryByTestId('booking-pay-btn-b3')).not.toBeInTheDocument(),
    );
  });

  // ── Pending info tooltip ──────────────────────────────────────────────────────

  it('renders pending info icon for PENDIENTE booking', async () => {
    mockUseAuth.mockReturnValue(authUser as ReturnType<typeof useAuth>);
    mockGetMyBookings.mockResolvedValue(mockBookings);
    renderPage();
    await waitFor(() =>
      expect(screen.getByTestId('booking-pending-info-b3')).toBeInTheDocument(),
    );
  });

  it('does NOT render pending info icon for CONFIRMADA booking', async () => {
    mockUseAuth.mockReturnValue(authUser as ReturnType<typeof useAuth>);
    mockGetMyBookings.mockResolvedValue(mockBookings);
    renderPage();
    await waitFor(() =>
      expect(screen.queryByTestId('booking-pending-info-b1')).not.toBeInTheDocument(),
    );
  });

  it('pending info tooltip contains payment explanation text', async () => {
    mockUseAuth.mockReturnValue(authUser as ReturnType<typeof useAuth>);
    mockGetMyBookings.mockResolvedValue(mockBookings);
    renderPage();
    await waitFor(() => {
      const info = screen.getByTestId('booking-pending-info-b3');
      expect(info).toHaveTextContent(/bookings\.pendingNotice/i);
    });
  });

  it('PAY NOW returnUrl contains /account/bookings', async () => {
    mockUseAuth.mockReturnValue(authUser as ReturnType<typeof useAuth>);
    mockGetMyBookings.mockResolvedValue(mockBookings);
    renderPage();
    await waitFor(() => {
      const payBtn = screen.getByTestId('booking-pay-btn-b1');
      const href = payBtn.getAttribute('href') ?? '';
      expect(decodeURIComponent(href)).toContain('/account/bookings');
    });
  });

  // ── Cancel booking ─────────────────────────────────────────────────────────

  it('renders CANCEL button for CONFIRMADA booking', async () => {
    mockUseAuth.mockReturnValue(authUser as ReturnType<typeof useAuth>);
    mockGetMyBookings.mockResolvedValue(mockBookings);
    renderPage();
    await waitFor(() => {
      expect(screen.getByTestId('booking-cancel-btn-b1')).toBeInTheDocument();
    });
  });

  it('renders CANCEL button for PENDIENTE booking', async () => {
    mockUseAuth.mockReturnValue(authUser as ReturnType<typeof useAuth>);
    mockGetMyBookings.mockResolvedValue(mockBookings);
    renderPage();
    await waitFor(() => {
      expect(screen.getByTestId('booking-cancel-btn-b3')).toBeInTheDocument();
    });
  });

  it('does NOT render CANCEL button for already CANCELADA booking', async () => {
    mockUseAuth.mockReturnValue(authUser as ReturnType<typeof useAuth>);
    mockGetMyBookings.mockResolvedValue(mockBookings);
    renderPage();
    await waitFor(() => {
      expect(screen.queryByTestId('booking-cancel-btn-b2')).not.toBeInTheDocument();
    });
  });

  it('opens cancel modal when CANCEL button is clicked', async () => {
    mockUseAuth.mockReturnValue(authUser as ReturnType<typeof useAuth>);
    mockGetMyBookings.mockResolvedValue(mockBookings);
    renderPage();
    await waitFor(() => {
      fireEvent.click(screen.getByTestId('booking-cancel-btn-b1'));
    });
    const modal = screen.getByTestId('bookings-cancel-modal');
    expect(modal).toBeInTheDocument();
    expect(within(modal).getByText(/Grand Cypress Hotel/i)).toBeInTheDocument();
  });

  it('calls updateBooking with CANCELADA when confirm is clicked in modal', async () => {
    mockUseAuth.mockReturnValue(authUser as ReturnType<typeof useAuth>);
    mockGetMyBookings.mockResolvedValue(mockBookings);
    mockUpdateBooking.mockResolvedValue({});
    renderPage();
    await waitFor(() => {
      fireEvent.click(screen.getByTestId('booking-cancel-btn-b1'));
    });
    fireEvent.click(screen.getByTestId('bookings-cancel-modal-confirm-btn'));
    await waitFor(() => {
      expect(mockUpdateBooking).toHaveBeenCalledWith('b1', 'CANCELADA', 'my-token');
    });
  });

  it('shows error and closes modal when cancel is attempted on check-in day', async () => {
    const today = new Date();
    const todayISO = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, '0'),
      String(today.getDate()).padStart(2, '0'),
    ].join('-');
    const sameDayBooking = { ...mockBookings[0], id: 'b-today', fechaCheckIn: `${todayISO}T00:00:00` };
    mockUseAuth.mockReturnValue(authUser as ReturnType<typeof useAuth>);
    mockGetMyBookings.mockResolvedValue([sameDayBooking]);
    renderPage();
    await waitFor(() => {
      fireEvent.click(screen.getByTestId('booking-cancel-btn-b-today'));
    });
    fireEvent.click(screen.getByTestId('bookings-cancel-modal-confirm-btn'));
    await waitFor(() => {
      expect(mockUpdateBooking).not.toHaveBeenCalled();
      expect(screen.queryByTestId('bookings-cancel-modal')).not.toBeInTheDocument();
    });
  });

  it('does NOT render CANCEL button for REEMBOLSANDO booking', async () => {
    const refundingBooking = { ...mockBookings[0], id: 'b-ref', estado: 'REEMBOLSANDO' };
    mockUseAuth.mockReturnValue(authUser as ReturnType<typeof useAuth>);
    mockGetMyBookings.mockResolvedValue([refundingBooking]);
    renderPage();
    await waitFor(() => {
      expect(screen.queryByTestId('booking-cancel-btn-b-ref')).not.toBeInTheDocument();
    });
  });

  it('renders REFUNDING label for REEMBOLSANDO booking in English', async () => {
    const refundingBooking = { ...mockBookings[0], id: 'b-ref2', estado: 'REEMBOLSANDO' };
    mockUseAuth.mockReturnValue(authUser as ReturnType<typeof useAuth>);
    mockGetMyBookings.mockResolvedValue([refundingBooking]);
    renderPage();
    await waitFor(() => {
      expect(screen.getByTestId('booking-status-b-ref2')).toHaveTextContent('REFUNDING');
    });
  });

  it('closes cancel modal and updates status after successful cancellation', async () => {
    mockUseAuth.mockReturnValue(authUser as ReturnType<typeof useAuth>);
    mockGetMyBookings.mockResolvedValue(mockBookings);
    mockUpdateBooking.mockResolvedValue({});
    renderPage();
    await waitFor(() => {
      fireEvent.click(screen.getByTestId('booking-cancel-btn-b1'));
    });
    fireEvent.click(screen.getByTestId('bookings-cancel-modal-confirm-btn'));
    await waitFor(() => {
      expect(screen.queryByTestId('bookings-cancel-modal')).not.toBeInTheDocument();
    });
    // Cancel button should be gone for the now-cancelled booking
    await waitFor(() => {
      expect(screen.queryByTestId('booking-cancel-btn-b1')).not.toBeInTheDocument();
    });
  });

  // ── DETAIL button ────────────────────────────────────────────────────────────

  it('renders a DETAIL button for each booking', async () => {
    mockUseAuth.mockReturnValue(authUser as ReturnType<typeof useAuth>);
    mockGetMyBookings.mockResolvedValue(mockBookings);
    renderPage();
    await waitFor(() => {
      expect(screen.getByTestId('booking-detail-btn-b1')).toBeInTheDocument();
      expect(screen.getByTestId('booking-detail-btn-b2')).toBeInTheDocument();
    });
  });

  it('opens the detail modal when DETAIL button is clicked', async () => {
    mockUseAuth.mockReturnValue(authUser as ReturnType<typeof useAuth>);
    mockGetMyBookings.mockResolvedValue(mockBookings);
    renderPage();
    await waitFor(() => screen.getByTestId('booking-detail-btn-b1'));
    fireEvent.click(screen.getByTestId('booking-detail-btn-b1'));
    expect(screen.getByTestId('bookings-detail-modal')).toBeInTheDocument();
  });

  it('detail modal shows the hotel name of the clicked booking', async () => {
    mockUseAuth.mockReturnValue(authUser as ReturnType<typeof useAuth>);
    mockGetMyBookings.mockResolvedValue(mockBookings);
    renderPage();
    await waitFor(() => screen.getByTestId('booking-detail-btn-b1'));
    fireEvent.click(screen.getByTestId('booking-detail-btn-b1'));
    expect(within(screen.getByTestId('bookings-detail-modal')).getByText('Grand Cypress Hotel')).toBeInTheDocument();
  });

  it('detail modal is not visible before any DETAIL button is clicked', async () => {
    mockUseAuth.mockReturnValue(authUser as ReturnType<typeof useAuth>);
    mockGetMyBookings.mockResolvedValue(mockBookings);
    renderPage();
    await waitFor(() => screen.getByTestId('booking-detail-btn-b1'));
    expect(screen.queryByTestId('bookings-detail-modal')).not.toBeInTheDocument();
  });

  it('opens detail modal for second booking when its DETAIL button is clicked', async () => {
    mockUseAuth.mockReturnValue(authUser as ReturnType<typeof useAuth>);
    mockGetMyBookings.mockResolvedValue(mockBookings);
    renderPage();
    await waitFor(() => screen.getByTestId('booking-detail-btn-b2'));
    fireEvent.click(screen.getByTestId('booking-detail-btn-b2'));
    expect(within(screen.getByTestId('bookings-detail-modal')).getByText('Boutique City Villa')).toBeInTheDocument();
  });
});
