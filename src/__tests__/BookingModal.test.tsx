import { render, screen, fireEvent } from '@testing-library/react';
import BookingModal from '@/components/shared/BookingModal/BookingModal';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en', changeLanguage: jest.fn() },
  }),
}));

describe('BookingModal', () => {
  it('renders when isOpen is true', () => {
    render(<BookingModal isOpen={true} onClose={jest.fn()} />);
    expect(screen.getByTestId('booking-modal')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(<BookingModal isOpen={false} onClose={jest.fn()} />);
    expect(screen.queryByTestId('booking-modal')).not.toBeInTheDocument();
  });

  it('renders "Booking confirmation" heading', () => {
    render(<BookingModal isOpen={true} onClose={jest.fn()} />);
    expect(screen.getByText('Booking confirmation')).toBeInTheDocument();
  });

  it('renders the Payment Method section', () => {
    render(<BookingModal isOpen={true} onClose={jest.fn()} />);
    expect(screen.getByText('Payment Method')).toBeInTheDocument();
    expect(screen.getByTestId('booking-modal-payment-chip')).toHaveTextContent(
      'Credit / Debit card',
    );
  });

  it('renders default destination', () => {
    render(<BookingModal isOpen={true} onClose={jest.fn()} />);
    expect(screen.getByTestId('booking-modal-destination')).toHaveTextContent('Paris, Francia');
  });

  it('renders custom destination', () => {
    render(<BookingModal isOpen={true} onClose={jest.fn()} destination="Cartagena, Colombia" />);
    expect(screen.getByTestId('booking-modal-destination')).toHaveTextContent(
      'Cartagena, Colombia',
    );
  });

  it('renders trip info with dates and guests', () => {
    render(<BookingModal isOpen={true} onClose={jest.fn()} checkIn="1 Jul" checkOut="5 Jul" guests={3} rooms={2} />);
    const tripInfo = screen.getByTestId('booking-modal-trip-info');
    expect(tripInfo).toHaveTextContent('1 Jul');
    expect(tripInfo).toHaveTextContent('5 Jul');
    expect(tripInfo).toHaveTextContent('3 Guests, 2 Room');
  });

  it('renders the CONTINUE button', () => {
    render(<BookingModal isOpen={true} onClose={jest.fn()} />);
    expect(screen.getByTestId('booking-modal-continue')).toHaveTextContent('CONTINUE');
  });

  it('calls onContinue and onClose when CONTINUE is clicked', () => {
    const onContinue = jest.fn();
    const onClose = jest.fn();
    render(<BookingModal isOpen={true} onClose={onClose} onContinue={onContinue} />);
    fireEvent.click(screen.getByTestId('booking-modal-continue'));
    expect(onContinue).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose without error when onContinue is not provided', () => {
    const onClose = jest.fn();
    render(<BookingModal isOpen={true} onClose={onClose} />);
    fireEvent.click(screen.getByTestId('booking-modal-continue'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the modal overlay close button is clicked', () => {
    const onClose = jest.fn();
    render(<BookingModal isOpen={true} onClose={onClose} />);
    fireEvent.click(screen.getByLabelText('Close booking modal'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders the price display', () => {
    render(<BookingModal isOpen={true} onClose={jest.fn()} />);
    expect(screen.getByTestId('booking-modal-price')).toBeInTheDocument();
  });

  it('uses custom dataTestId prefix', () => {
    render(<BookingModal isOpen={true} onClose={jest.fn()} dataTestId="custom-booking" />);
    expect(screen.getByTestId('custom-booking')).toBeInTheDocument();
    expect(screen.getByTestId('custom-booking-continue')).toBeInTheDocument();
  });
});
