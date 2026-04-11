import { render, screen, fireEvent } from '@testing-library/react';
import BookingCancelModal from '@/components/shared/BookingCancelModal/BookingCancelModal';

describe('BookingCancelModal', () => {
  it('renders when isOpen is true', () => {
    render(<BookingCancelModal isOpen={true} onClose={jest.fn()} />);
    expect(screen.getByTestId('booking-cancel-modal')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(<BookingCancelModal isOpen={false} onClose={jest.fn()} />);
    expect(screen.queryByTestId('booking-cancel-modal')).not.toBeInTheDocument();
  });

  it('renders the cancellation title', () => {
    render(<BookingCancelModal isOpen={true} onClose={jest.fn()} />);
    expect(screen.getByTestId('booking-cancel-modal-title')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure to Cancel/i)).toBeInTheDocument();
  });

  it('renders the subtitle with hotel name', () => {
    render(<BookingCancelModal isOpen={true} onClose={jest.fn()} />);
    expect(screen.getByTestId('booking-cancel-modal-subtitle')).toBeInTheDocument();
    expect(screen.getByText(/La Perla, Medellín/i)).toBeInTheDocument();
  });

  it('renders the confirm button', () => {
    render(<BookingCancelModal isOpen={true} onClose={jest.fn()} />);
    expect(screen.getByTestId('booking-cancel-modal-confirm-btn')).toBeInTheDocument();
  });

  it('calls onConfirm and onClose when confirm button is clicked', () => {
    const onConfirm = jest.fn();
    const onClose = jest.fn();
    render(<BookingCancelModal isOpen={true} onClose={onClose} onConfirm={onConfirm} />);
    fireEvent.click(screen.getByTestId('booking-cancel-modal-confirm-btn'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose without error when onConfirm is not provided', () => {
    const onClose = jest.fn();
    render(<BookingCancelModal isOpen={true} onClose={onClose} />);
    fireEvent.click(screen.getByTestId('booking-cancel-modal-confirm-btn'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('uses custom dataTestId', () => {
    render(<BookingCancelModal isOpen={true} onClose={jest.fn()} dataTestId="custom-cancel" />);
    expect(screen.getByTestId('custom-cancel')).toBeInTheDocument();
    expect(screen.getByTestId('custom-cancel-confirm-btn')).toBeInTheDocument();
  });

  it('calls onClose when close button (X) is clicked', () => {
    const onClose = jest.fn();
    render(<BookingCancelModal isOpen={true} onClose={onClose} />);
    fireEvent.click(screen.getByLabelText('Close modal'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
