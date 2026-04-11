import { render, screen, fireEvent } from '@testing-library/react';
import BookingConfirmModal from '@/components/shared/BookingConfirmModal/BookingConfirmModal';

describe('BookingConfirmModal', () => {
  it('renders when isOpen is true', () => {
    render(<BookingConfirmModal isOpen={true} onClose={jest.fn()} />);
    expect(screen.getByTestId('booking-confirm-modal')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(<BookingConfirmModal isOpen={false} onClose={jest.fn()} />);
    expect(screen.queryByTestId('booking-confirm-modal')).not.toBeInTheDocument();
  });

  it('renders "Booking confirmation" heading', () => {
    render(<BookingConfirmModal isOpen={true} onClose={jest.fn()} />);
    expect(screen.getByText('Booking confirmation')).toBeInTheDocument();
  });

  it('renders "Booking Success!" text', () => {
    render(<BookingConfirmModal isOpen={true} onClose={jest.fn()} />);
    expect(screen.getByText('Booking Success!')).toBeInTheDocument();
  });

  it('renders default destination when not provided', () => {
    render(<BookingConfirmModal isOpen={true} onClose={jest.fn()} />);
    expect(screen.getByTestId('booking-confirm-modal-destination')).toHaveTextContent(
      'Paris, Francia',
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

  it('renders default check-in and check-out dates', () => {
    render(<BookingConfirmModal isOpen={true} onClose={jest.fn()} />);
    const tripInfo = screen.getByTestId('booking-confirm-modal-trip-info');
    expect(tripInfo).toHaveTextContent('19 Agu');
    expect(tripInfo).toHaveTextContent('3 Sep');
  });

  it('renders custom check-in and check-out dates', () => {
    render(
      <BookingConfirmModal
        isOpen={true}
        onClose={jest.fn()}
        checkIn="1 Jun"
        checkOut="5 Jun"
      />,
    );
    const tripInfo = screen.getByTestId('booking-confirm-modal-trip-info');
    expect(tripInfo).toHaveTextContent('1 Jun');
    expect(tripInfo).toHaveTextContent('5 Jun');
  });

  it('renders guest count', () => {
    render(<BookingConfirmModal isOpen={true} onClose={jest.fn()} guests={4} rooms={2} />);
    expect(screen.getByTestId('booking-confirm-modal-trip-info')).toHaveTextContent(
      '4 Guests, 2 Room',
    );
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
