import { render, screen, fireEvent } from '@testing-library/react';
import BookingConfirmActionModal from '@/components/shared/BookingConfirmActionModal/BookingConfirmActionModal';

describe('BookingConfirmActionModal', () => {
  it('renders when isOpen is true', () => {
    render(<BookingConfirmActionModal isOpen={true} onClose={jest.fn()} />);
    expect(screen.getByTestId('booking-confirm-action-modal')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(<BookingConfirmActionModal isOpen={false} onClose={jest.fn()} />);
    expect(screen.queryByTestId('booking-confirm-action-modal')).not.toBeInTheDocument();
  });

  it('renders the confirmation title', () => {
    render(<BookingConfirmActionModal isOpen={true} onClose={jest.fn()} />);
    expect(screen.getByTestId('booking-confirm-action-modal-title')).toBeInTheDocument();
    expect(screen.getByText(/You have confirm/i)).toBeInTheDocument();
  });

  it('renders the subtitle with hotel name', () => {
    render(<BookingConfirmActionModal isOpen={true} onClose={jest.fn()} />);
    expect(screen.getByTestId('booking-confirm-action-modal-subtitle')).toBeInTheDocument();
    expect(screen.getByText(/La Perla, Medellín/i)).toBeInTheDocument();
  });

  it('renders the close button', () => {
    render(<BookingConfirmActionModal isOpen={true} onClose={jest.fn()} />);
    expect(screen.getByTestId('booking-confirm-action-modal-close-btn')).toBeInTheDocument();
    expect(screen.getByTestId('booking-confirm-action-modal-close-btn')).toHaveTextContent(
      'CLOSE',
    );
  });

  it('calls onClose when the CLOSE button is clicked', () => {
    const onClose = jest.fn();
    render(<BookingConfirmActionModal isOpen={true} onClose={onClose} />);
    fireEvent.click(screen.getByTestId('booking-confirm-action-modal-close-btn'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the X button (modal close) is clicked', () => {
    const onClose = jest.fn();
    render(<BookingConfirmActionModal isOpen={true} onClose={onClose} />);
    fireEvent.click(screen.getByLabelText('Close modal'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('uses custom dataTestId prefix', () => {
    render(
      <BookingConfirmActionModal isOpen={true} onClose={jest.fn()} dataTestId="custom-action" />,
    );
    expect(screen.getByTestId('custom-action')).toBeInTheDocument();
    expect(screen.getByTestId('custom-action-close-btn')).toBeInTheDocument();
  });
});
