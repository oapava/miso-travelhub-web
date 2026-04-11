import { render, screen, fireEvent } from '@testing-library/react';
import BookingDetailModal from '@/components/shared/BookingDetailModal/BookingDetailModal';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en', changeLanguage: jest.fn() },
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
