import { Modal } from '@/components/ui';
import './BookingConfirmModal.scss';

interface BookingResponse {
  id: string;
  codigo: string;
  viajeroId: string;
  habitacionId: string;
  fechaCheckIn: string;
  fechaCheckOut: string;
  numHuespedes: number;
  estado: string;
  subtotal: number;
  impuestos: number;
  total: number;
  moneda: string;
}

interface BookingConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  destination?: string;
  bookingResult?: BookingResponse | null;
  dataTestId?: string;
}

function formatDate(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  } catch {
    return isoDate;
  }
}

function formatPrice(price: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency,
  }).format(price);
}

const BookingConfirmModal: React.FC<BookingConfirmModalProps> = ({
  isOpen,
  onClose,
  destination = 'Hotel Destination',
  bookingResult = null,
  dataTestId = 'booking-confirm-modal',
}) => {
  // Use booking result if available, otherwise use defaults
  const confirmationCode = bookingResult?.codigo || 'N/A';
  const checkIn = bookingResult?.fechaCheckIn 
    ? formatDate(bookingResult.fechaCheckIn) 
    : 'TBD';
  const checkOut = bookingResult?.fechaCheckOut 
    ? formatDate(bookingResult.fechaCheckOut) 
    : 'TBD';
  const guests = bookingResult?.numHuespedes || 1;
  const totalPrice = bookingResult?.total || 0;
  const currency = bookingResult?.moneda || 'USD';
  const subtotal = bookingResult?.subtotal || 0;
  const taxes = bookingResult?.impuestos || 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="medium"
      dataTestId={dataTestId}
      className="booking-confirm-modal"
    >
      <div className="booking-confirm-modal__container" data-testid={`${dataTestId}-container`}>
        <div className="booking-confirm-modal__image-placeholder" data-testid={`${dataTestId}-image`}>
          <div className="booking-confirm-modal__image-content">✓</div>
        </div>

        <div className="booking-confirm-modal__header" data-testid={`${dataTestId}-header`}>
          <h2 className="booking-confirm-modal__title">Booking Confirmed!</h2>
          <p className="booking-confirm-modal__code" data-testid={`${dataTestId}-code`}>
            Confirmation Code: <strong>{confirmationCode}</strong>
          </p>
        </div>

        <div className="booking-confirm-modal__details" data-testid={`${dataTestId}-details`}>
          <div className="booking-confirm-modal__destination" data-testid={`${dataTestId}-destination`}>
            {destination}
          </div>

          <div className="booking-confirm-modal__trip-info" data-testid={`${dataTestId}-trip-info`}>
            <span className="booking-confirm-modal__dates">{checkIn} → {checkOut}</span>
            <span className="booking-confirm-modal__guests">{guests} Guest{guests !== 1 ? 's' : ''}</span>
          </div>
        </div>

        <div className="booking-confirm-modal__price-breakdown" data-testid={`${dataTestId}-price-breakdown`}>
          <div className="booking-confirm-modal__price-row">
            <span>Subtotal:</span>
            <span>{formatPrice(subtotal, currency)}</span>
          </div>
          <div className="booking-confirm-modal__price-row">
            <span>Taxes & Fees:</span>
            <span>{formatPrice(taxes, currency)}</span>
          </div>
          <div className="booking-confirm-modal__price-row booking-confirm-modal__price-row--total">
            <span>Total:</span>
            <span data-testid={`${dataTestId}-total-price`}>{formatPrice(totalPrice, currency)}</span>
          </div>
        </div>

        <div className="booking-confirm-modal__success-section" data-testid={`${dataTestId}-success`}>
          <div className="booking-confirm-modal__checkmark-circle" data-testid={`${dataTestId}-checkmark`}>
            <span className="booking-confirm-modal__checkmark">✓</span>
          </div>
          <h3 className="booking-confirm-modal__success-text">Your booking is confirmed!</h3>
        </div>
      </div>
    </Modal>
  );
};

export default BookingConfirmModal;
