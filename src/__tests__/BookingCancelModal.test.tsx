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

  it('calls onConfirm when confirm button is clicked (parent controls closing)', () => {
    const onConfirm = jest.fn();
    const onClose = jest.fn();
    render(<BookingCancelModal isOpen={true} onClose={onClose} onConfirm={onConfirm} />);
    fireEvent.click(screen.getByTestId('booking-cancel-modal-confirm-btn'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    // onClose is NOT called automatically — the parent is responsible for closing
    expect(onClose).not.toHaveBeenCalled();
  });

  it('does not throw when confirm button is clicked without onConfirm prop', () => {
    const onClose = jest.fn();
    render(<BookingCancelModal isOpen={true} onClose={onClose} />);
    expect(() =>
      fireEvent.click(screen.getByTestId('booking-cancel-modal-confirm-btn')),
    ).not.toThrow();
  });

  it('disables confirm button and shows loading text when isLoading is true', () => {
    render(<BookingCancelModal isOpen={true} onClose={jest.fn()} isLoading={true} />);
    const btn = screen.getByTestId('booking-cancel-modal-confirm-btn');
    expect(btn).toBeDisabled();
    expect(btn).toHaveTextContent('CANCELLING…');
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
