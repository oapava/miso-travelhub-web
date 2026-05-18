import { render, screen, fireEvent } from '@testing-library/react';
import BookingDetailModal from '@/components/shared/BookingDetailModal/BookingDetailModal';
import { HotelBooking } from '@/services/booking.service';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en', changeLanguage: jest.fn() },
  }),
}));

jest.mock('@/context/CurrencyContext', () => ({
  useCurrency: () => ({
    currency: 'USD',
    setCurrency: jest.fn(),
    supportedCurrencies: ['USD', 'COP', 'EUR', 'GBP'],
  }),
}));

describe('BookingDetailModal', () => {
  it('renders when isOpen is true', () => {
    render(<BookingDetailModal isOpen={true} onClose={jest.fn()} />);
    expect(screen.getByTestId('booking-detail-modal')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(<BookingDetailModal isOpen={false} onClose={jest.fn()} />);
    expect(screen.queryByTestId('booking-detail-modal')).not.toBeInTheDocument();
  });

  it('renders client name', () => {
    render(<BookingDetailModal isOpen={true} onClose={jest.fn()} />);
    expect(screen.getByTestId('booking-detail-modal-client-name')).toHaveTextContent(
      'Carlos Perea',
    );
  });

  it('renders hotel reservation subtitle', () => {
    render(<BookingDetailModal isOpen={true} onClose={jest.fn()} />);
    expect(screen.getByTestId('booking-detail-modal-subtitle')).toHaveTextContent(
      'Reserved: La Perla, Medellín',
    );
  });

  it('renders the ACTIVE status badge', () => {
    render(<BookingDetailModal isOpen={true} onClose={jest.fn()} />);
    expect(screen.getByTestId('booking-detail-modal-active-badge')).toHaveTextContent('ACTIVE');
  });

  it('renders the hotel name in the card', () => {
    render(<BookingDetailModal isOpen={true} onClose={jest.fn()} />);
    expect(screen.getByTestId('booking-detail-modal-hotel-title')).toHaveTextContent('La Perla');
  });

  it('renders hotel location', () => {
    render(<BookingDetailModal isOpen={true} onClose={jest.fn()} />);
    expect(screen.getByTestId('booking-detail-modal-location')).toHaveTextContent(
      'Medellín, Colombia',
    );
  });

  it('renders the star rating', () => {
    render(<BookingDetailModal isOpen={true} onClose={jest.fn()} />);
    expect(screen.getByTestId('booking-detail-modal-star-rating')).toBeInTheDocument();
  });

  it('renders CONFIRM and CANCEL action buttons', () => {
    render(<BookingDetailModal isOpen={true} onClose={jest.fn()} />);
    expect(screen.getByTestId('booking-detail-modal-confirm-btn')).toBeInTheDocument();
    expect(screen.getByTestId('booking-detail-modal-cancel-btn')).toBeInTheDocument();
  });

  it('calls onConfirm when CONFIRM button is clicked', () => {
    const onConfirm = jest.fn();
    render(<BookingDetailModal isOpen={true} onClose={jest.fn()} onConfirm={onConfirm} />);
    fireEvent.click(screen.getByTestId('booking-detail-modal-confirm-btn'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when CANCEL button is clicked', () => {
    const onCancel = jest.fn();
    render(<BookingDetailModal isOpen={true} onClose={jest.fn()} onCancel={onCancel} />);
    fireEvent.click(screen.getByTestId('booking-detail-modal-cancel-btn'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the modal X button is clicked', () => {
    const onClose = jest.fn();
    render(<BookingDetailModal isOpen={true} onClose={onClose} />);
    fireEvent.click(screen.getByLabelText('Close modal'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not throw when onConfirm is not provided', () => {
    render(<BookingDetailModal isOpen={true} onClose={jest.fn()} />);
    expect(() =>
      fireEvent.click(screen.getByTestId('booking-detail-modal-confirm-btn')),
    ).not.toThrow();
  });

  it('does not throw when onCancel is not provided', () => {
    render(<BookingDetailModal isOpen={true} onClose={jest.fn()} />);
    expect(() =>
      fireEvent.click(screen.getByTestId('booking-detail-modal-cancel-btn')),
    ).not.toThrow();
  });

  it('uses custom dataTestId prefix', () => {
    render(<BookingDetailModal isOpen={true} onClose={jest.fn()} dataTestId="custom-detail" />);
    expect(screen.getByTestId('custom-detail')).toBeInTheDocument();
    expect(screen.getByTestId('custom-detail-confirm-btn')).toBeInTheDocument();
  });
});

// ── Rich view — driven by the `booking` prop ──────────────────────────────────

const mockBooking: HotelBooking = {
  id: 'b1',
  codigo: 'RES-001',
  viajeroId: 'traveler-abc',
  habitacionId: 'room-h1',
  nombreHabitacion: 'Ocean Suite',
  fechaCheckIn: '2026-08-10T00:00:00',
  fechaCheckOut: '2026-08-15T00:00:00',
  numHuespedes: 2,
  estado: 'CONFIRMADO',
  subtotal: 500,
  impuestos: 100,
  total: 600,
  moneda: 'USD',
  emailHuesped: 'traveler@email.com',
  telefonoHuesped: '+57 300 123 4567',
  horaEstimadaLlegada: '3:00 PM',
  solicitudesEspeciales: 'Vegan menu, late check-out',
};

describe('BookingDetailModal — rich view (booking prop)', () => {
  const renderRich = (overrides: Partial<HotelBooking> = {}) =>
    render(
      <BookingDetailModal
        isOpen={true}
        onClose={jest.fn()}
        booking={{ ...mockBooking, ...overrides }}
      />,
    );

  // ── Visibility ────────────────────────────────────────────────────────────

  it('renders the modal when isOpen is true', () => {
    renderRich();
    expect(screen.getByTestId('booking-detail-modal')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(<BookingDetailModal isOpen={false} onClose={jest.fn()} booking={mockBooking} />);
    expect(screen.queryByTestId('booking-detail-modal')).not.toBeInTheDocument();
  });

  // ── Header ────────────────────────────────────────────────────────────────

  it('renders the booking code in the header', () => {
    renderRich();
    expect(screen.getByTestId('booking-detail-modal-booking-code')).toHaveTextContent('RES-001');
  });

  it('renders the status badge with normalised estado', () => {
    renderRich();
    expect(screen.getByTestId('booking-detail-modal-active-badge')).toHaveTextContent('Confirmado');
  });

  // ── Guest information section ─────────────────────────────────────────────

  it('renders the guest section', () => {
    renderRich();
    expect(screen.getByTestId('booking-detail-modal-guest-section')).toBeInTheDocument();
  });

  it('renders the guest ID (viajeroId)', () => {
    renderRich();
    expect(screen.getByTestId('booking-detail-modal-client-name')).toHaveTextContent('traveler-abc');
  });

  it('renders the guest email when provided', () => {
    renderRich();
    expect(screen.getByTestId('booking-detail-modal-guest-email')).toHaveTextContent(
      'traveler@email.com',
    );
  });

  it('does not render the email row when emailHuesped is absent', () => {
    renderRich({ emailHuesped: undefined });
    expect(screen.queryByTestId('booking-detail-modal-guest-email')).not.toBeInTheDocument();
  });

  it('renders the guest phone when provided', () => {
    renderRich();
    expect(screen.getByTestId('booking-detail-modal-guest-phone')).toHaveTextContent(
      '+57 300 123 4567',
    );
  });

  it('does not render the phone row when telefonoHuesped is absent', () => {
    renderRich({ telefonoHuesped: undefined });
    expect(screen.queryByTestId('booking-detail-modal-guest-phone')).not.toBeInTheDocument();
  });

  it('renders the estimated arrival time when provided', () => {
    renderRich();
    expect(screen.getByTestId('booking-detail-modal-arrival-time')).toHaveTextContent('3:00 PM');
  });

  it('does not render the arrival row when horaEstimadaLlegada is absent', () => {
    renderRich({ horaEstimadaLlegada: undefined });
    expect(screen.queryByTestId('booking-detail-modal-arrival-time')).not.toBeInTheDocument();
  });

  // ── Room & dates section ──────────────────────────────────────────────────

  it('renders the dates section', () => {
    renderRich();
    expect(screen.getByTestId('booking-detail-modal-dates-section')).toBeInTheDocument();
  });

  it('renders the room name from nombreHabitacion', () => {
    renderRich();
    expect(screen.getByTestId('booking-detail-modal-room')).toHaveTextContent('Ocean Suite');
  });

  it('falls back to habitacionId when nombreHabitacion is absent', () => {
    renderRich({ nombreHabitacion: undefined });
    expect(screen.getByTestId('booking-detail-modal-room')).toHaveTextContent('room-h1');
  });

  it('renders check-in date formatted as DD/MM/YY', () => {
    renderRich();
    expect(screen.getByTestId('booking-detail-modal-checkin')).toHaveTextContent('10/08/26');
  });

  it('renders check-out date formatted as DD/MM/YY', () => {
    renderRich();
    expect(screen.getByTestId('booking-detail-modal-checkout')).toHaveTextContent('15/08/26');
  });

  it('renders the nights count', () => {
    renderRich();
    expect(screen.getByTestId('booking-detail-modal-nights')).toHaveTextContent('5 nights');
  });

  it('renders the guests count', () => {
    renderRich();
    expect(screen.getByTestId('booking-detail-modal-guests-count')).toHaveTextContent('2 adults');
  });

  it('renders "adult" (singular) when numHuespedes is 1', () => {
    renderRich({ numHuespedes: 1 });
    expect(screen.getByTestId('booking-detail-modal-guests-count')).toHaveTextContent('1 adult');
  });

  // ── Financial section ─────────────────────────────────────────────────────

  it('renders the financial section', () => {
    renderRich();
    expect(screen.getByTestId('booking-detail-modal-financial-section')).toBeInTheDocument();
  });

  it('renders the subtotal', () => {
    renderRich();
    expect(screen.getByTestId('booking-detail-modal-subtotal')).toBeInTheDocument();
  });

  it('renders the taxes', () => {
    renderRich();
    expect(screen.getByTestId('booking-detail-modal-taxes')).toBeInTheDocument();
  });

  it('renders the total', () => {
    renderRich();
    expect(screen.getByTestId('booking-detail-modal-total')).toBeInTheDocument();
  });

  // ── Special requests section ──────────────────────────────────────────────

  it('renders special requests when solicitudesEspeciales is present', () => {
    renderRich();
    expect(screen.getByTestId('booking-detail-modal-special-requests')).toHaveTextContent(
      'Vegan menu, late check-out',
    );
  });

  it('does not render special-requests section when solicitudesEspeciales is absent', () => {
    renderRich({ solicitudesEspeciales: undefined });
    expect(
      screen.queryByTestId('booking-detail-modal-special-requests'),
    ).not.toBeInTheDocument();
  });

  // ── nombreUser guest display ──────────────────────────────────────────────

  it('prefers nombreUser over viajeroId for guest display', () => {
    renderRich({ nombreUser: 'Ana García' });
    expect(screen.getByTestId('booking-detail-modal-client-name')).toHaveTextContent('Ana García');
  });

  it('falls back to viajeroId when nombreUser is absent', () => {
    renderRich({ nombreUser: undefined });
    expect(screen.getByTestId('booking-detail-modal-client-name')).toHaveTextContent('traveler-abc');
  });

  it('falls back to emailHuesped when both nombreUser and viajeroId are empty', () => {
    renderRich({ nombreUser: undefined, viajeroId: '' });
    expect(screen.getByTestId('booking-detail-modal-client-name')).toHaveTextContent(
      'traveler@email.com',
    );
  });

  // ── Property section ──────────────────────────────────────────────────────

  it('renders the property section', () => {
    renderRich();
    expect(screen.getByTestId('booking-detail-modal-property-section')).toBeInTheDocument();
  });

  it('renders nombreHotel when provided', () => {
    renderRich({ nombreHotel: 'Hotel La Perla' });
    expect(screen.getByTestId('booking-detail-modal-hotel-name')).toHaveTextContent('Hotel La Perla');
  });

  it('does not render the hotel row when nombreHotel is absent', () => {
    renderRich({ nombreHotel: undefined });
    expect(screen.queryByTestId('booking-detail-modal-hotel-name')).not.toBeInTheDocument();
  });

  it('renders location as "ciudad, pais" when both are provided', () => {
    renderRich({ ciudad: 'Medellín', pais: 'Colombia' });
    expect(screen.getByTestId('booking-detail-modal-location')).toHaveTextContent(
      'Medellín, Colombia',
    );
  });

  it('renders only ciudad when pais is absent', () => {
    renderRich({ ciudad: 'Medellín', pais: undefined });
    expect(screen.getByTestId('booking-detail-modal-location')).toHaveTextContent('Medellín');
    expect(screen.getByTestId('booking-detail-modal-location')).not.toHaveTextContent(',');
  });

  it('renders only pais when ciudad is absent', () => {
    renderRich({ ciudad: undefined, pais: 'Colombia' });
    expect(screen.getByTestId('booking-detail-modal-location')).toHaveTextContent('Colombia');
  });

  it('does not render the location row when both ciudad and pais are absent', () => {
    renderRich({ ciudad: undefined, pais: undefined });
    expect(screen.queryByTestId('booking-detail-modal-location')).not.toBeInTheDocument();
  });

  it('renders tipo_habitacion when provided', () => {
    renderRich({ tipo_habitacion: 'Suite' });
    expect(screen.getByTestId('booking-detail-modal-room-type')).toHaveTextContent('Suite');
  });

  it('does not render tipo_habitacion row when absent', () => {
    renderRich({ tipo_habitacion: undefined });
    expect(screen.queryByTestId('booking-detail-modal-room-type')).not.toBeInTheDocument();
  });

  it('renders categoria when provided', () => {
    renderRich({ categoria: 'Luxury' });
    expect(screen.getByTestId('booking-detail-modal-category')).toHaveTextContent('Luxury');
  });

  it('does not render categoria row when absent', () => {
    renderRich({ categoria: undefined });
    expect(screen.queryByTestId('booking-detail-modal-category')).not.toBeInTheDocument();
  });

  it('renders tamano_habitacion when provided', () => {
    renderRich({ tamano_habitacion: '55 m²' });
    expect(screen.getByTestId('booking-detail-modal-room-size')).toHaveTextContent('55 m²');
  });

  it('does not render tamano_habitacion row when absent', () => {
    renderRich({ tamano_habitacion: undefined });
    expect(screen.queryByTestId('booking-detail-modal-room-size')).not.toBeInTheDocument();
  });

  it('renders all property fields at once when all are provided', () => {
    renderRich({
      nombreHotel: 'Grand Hotel',
      ciudad: 'Bogotá',
      pais: 'Colombia',
      tipo_habitacion: 'Deluxe',
      categoria: 'Business',
      tamano_habitacion: '40 m²',
    });
    expect(screen.getByTestId('booking-detail-modal-hotel-name')).toHaveTextContent('Grand Hotel');
    expect(screen.getByTestId('booking-detail-modal-location')).toHaveTextContent('Bogotá, Colombia');
    expect(screen.getByTestId('booking-detail-modal-room-type')).toHaveTextContent('Deluxe');
    expect(screen.getByTestId('booking-detail-modal-category')).toHaveTextContent('Business');
    expect(screen.getByTestId('booking-detail-modal-room-size')).toHaveTextContent('40 m²');
  });

  // ── Stay details section ──────────────────────────────────────────────────

  it('renders the stay details section', () => {
    renderRich();
    expect(screen.getByTestId('booking-detail-modal-dates-section')).toBeInTheDocument();
  });

  it('renders numHuespedes in the stay details section', () => {
    renderRich({ numHuespedes: 3 });
    expect(screen.getByTestId('booking-detail-modal-guests-count')).toHaveTextContent('3 adults');
  });

  // ── Actions ───────────────────────────────────────────────────────────────

  it('renders CONFIRM and CANCEL buttons', () => {
    renderRich();
    expect(screen.getByTestId('booking-detail-modal-confirm-btn')).toBeInTheDocument();
    expect(screen.getByTestId('booking-detail-modal-cancel-btn')).toBeInTheDocument();
  });

  it('calls onConfirm when CONFIRM is clicked', () => {
    const onConfirm = jest.fn();
    render(
      <BookingDetailModal
        isOpen={true}
        onClose={jest.fn()}
        onConfirm={onConfirm}
        booking={mockBooking}
      />,
    );
    fireEvent.click(screen.getByTestId('booking-detail-modal-confirm-btn'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when CANCEL is clicked', () => {
    const onCancel = jest.fn();
    render(
      <BookingDetailModal
        isOpen={true}
        onClose={jest.fn()}
        onCancel={onCancel}
        booking={mockBooking}
      />,
    );
    fireEvent.click(screen.getByTestId('booking-detail-modal-cancel-btn'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the modal X button is clicked', () => {
    const onClose = jest.fn();
    render(<BookingDetailModal isOpen={true} onClose={onClose} booking={mockBooking} />);
    fireEvent.click(screen.getByLabelText('Close modal'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // ── Terminal-state button disabling ──────────────────────────────────────

  const TERMINAL_STATES = [
    'CANCELADA',
    'CANCELADO',
    'REEMBOLSADA',
    'REEMBOLSADO',
    'REEMBOLSANDO',
    'PAGADA',
    'PAGADO',
  ] as const;

  const ACTIVE_STATES = ['PENDIENTE', 'CONFIRMADO', 'CONFIRMADA'] as const;

  TERMINAL_STATES.forEach((estado) => {
    it(`disables CONFIRM and CANCEL buttons when estado is ${estado}`, () => {
      renderRich({ estado });
      expect(screen.getByTestId('booking-detail-modal-confirm-btn')).toBeDisabled();
      expect(screen.getByTestId('booking-detail-modal-cancel-btn')).toBeDisabled();
    });
  });

  ACTIVE_STATES.forEach((estado) => {
    it(`keeps CONFIRM and CANCEL buttons enabled when estado is ${estado}`, () => {
      renderRich({ estado });
      expect(screen.getByTestId('booking-detail-modal-confirm-btn')).not.toBeDisabled();
      expect(screen.getByTestId('booking-detail-modal-cancel-btn')).not.toBeDisabled();
    });
  });

  it('does not call onConfirm when CONFIRM button is disabled (terminal state)', () => {
    const onConfirm = jest.fn();
    render(
      <BookingDetailModal
        isOpen={true}
        onClose={jest.fn()}
        onConfirm={onConfirm}
        booking={{ ...mockBooking, estado: 'CANCELADA' }}
      />,
    );
    fireEvent.click(screen.getByTestId('booking-detail-modal-confirm-btn'));
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('does not call onCancel when CANCEL button is disabled (terminal state)', () => {
    const onCancel = jest.fn();
    render(
      <BookingDetailModal
        isOpen={true}
        onClose={jest.fn()}
        onCancel={onCancel}
        booking={{ ...mockBooking, estado: 'REEMBOLSADA' }}
      />,
    );
    fireEvent.click(screen.getByTestId('booking-detail-modal-cancel-btn'));
    expect(onCancel).not.toHaveBeenCalled();
  });
});
