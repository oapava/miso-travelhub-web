import { render, screen, fireEvent } from '@testing-library/react';
import BookingConfirmModal from '@/components/shared/BookingConfirmModal/BookingConfirmModal';

const mockBookingResult = {
  id: 'b1',
  codigo: 'CODE123',
  viajeroId: 'u1',
  habitacionId: 'h1',
  fechaCheckIn: '2026-06-01T00:00:00',
  fechaCheckOut: '2026-06-05T00:00:00',
  numHuespedes: 4,
  estado: 'PENDIENTE',
  subtotal: 800,
  impuestos: 160,
  total: 960,
  moneda: 'EUR',
};

describe('BookingConfirmModal', () => {
  it('renders when isOpen is true', () => {
    render(<BookingConfirmModal isOpen={true} onClose={jest.fn()} />);
    expect(screen.getByTestId('booking-confirm-modal')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(<BookingConfirmModal isOpen={false} onClose={jest.fn()} />);
    expect(screen.queryByTestId('booking-confirm-modal')).not.toBeInTheDocument();
  });

  it('renders "Booking Confirmed!" heading', () => {
    render(<BookingConfirmModal isOpen={true} onClose={jest.fn()} />);
    expect(screen.getByText('Booking Confirmed!')).toBeInTheDocument();
  });

  it('renders "Your booking is confirmed!" success text', () => {
    render(<BookingConfirmModal isOpen={true} onClose={jest.fn()} />);
    expect(screen.getByText('Your booking is confirmed!')).toBeInTheDocument();
  });

  it('renders default destination when not provided', () => {
    render(<BookingConfirmModal isOpen={true} onClose={jest.fn()} />);
    expect(screen.getByTestId('booking-confirm-modal-destination')).toHaveTextContent(
      'Hotel Destination',
    );
  });

  it('renders custom destination when provided', () => {
    render(
      <BookingConfirmModal isOpen={true} onClose={jest.fn()} destination="Bogotá, Colombia" />,
    );
    expect(screen.getByTestId('booking-confirm-modal-destination')).toHaveTextContent(
      'Bogotá, Colombia',
    );
  });

  it('renders TBD dates when no bookingResult provided', () => {
    render(<BookingConfirmModal isOpen={true} onClose={jest.fn()} />);
    const tripInfo = screen.getByTestId('booking-confirm-modal-trip-info');
    expect(tripInfo).toHaveTextContent('TBD');
  });

  it('renders formatted dates from bookingResult', () => {
    render(
      <BookingConfirmModal
        isOpen={true}
        onClose={jest.fn()}
        bookingResult={mockBookingResult}
      />,
    );
    const tripInfo = screen.getByTestId('booking-confirm-modal-trip-info');
    expect(tripInfo).toHaveTextContent('2026');
  });

  it('renders guest count from bookingResult', () => {
    render(
      <BookingConfirmModal
        isOpen={true}
        onClose={jest.fn()}
        bookingResult={mockBookingResult}
      />,
    );
    expect(screen.getByTestId('booking-confirm-modal-trip-info')).toHaveTextContent('4 Guests');
  });

  it('renders default 1 Guest when no bookingResult provided', () => {
    render(<BookingConfirmModal isOpen={true} onClose={jest.fn()} />);
    expect(screen.getByTestId('booking-confirm-modal-trip-info')).toHaveTextContent('1 Guest');
  });

  it('renders confirmation code from bookingResult', () => {
    render(
      <BookingConfirmModal
        isOpen={true}
        onClose={jest.fn()}
        bookingResult={mockBookingResult}
      />,
    );
    expect(screen.getByTestId('booking-confirm-modal-code')).toHaveTextContent('CODE123');
  });

  it('renders N/A code when no bookingResult provided', () => {
    render(<BookingConfirmModal isOpen={true} onClose={jest.fn()} />);
    expect(screen.getByTestId('booking-confirm-modal-code')).toHaveTextContent('N/A');
  });

  it('calls onClose when the close button (X) is clicked', () => {
    const onClose = jest.fn();
    render(<BookingConfirmModal isOpen={true} onClose={onClose} />);
    fireEvent.click(screen.getByLabelText('Close modal'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('uses custom dataTestId prefix', () => {
    render(
      <BookingConfirmModal isOpen={true} onClose={jest.fn()} dataTestId="custom-confirm" />,
    );
    expect(screen.getByTestId('custom-confirm')).toBeInTheDocument();
    expect(screen.getByTestId('custom-confirm-header')).toBeInTheDocument();
  });
});
