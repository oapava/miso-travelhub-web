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
  /** Called when user clicks "Go to My Bookings" — navigate to /account/bookings */
  onGoToBookings?: () => void;
  destination?: string;
  bookingResult?: BookingResponse | null;
  imageUrl?: string;
  dataTestId?: string;
}

function formatDate(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return isoDate;
  }
}

const CheckmarkIcon: React.FC = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={3}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="booking-confirm-modal__checkmark-icon"
    aria-hidden="true"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const BookingConfirmModal: React.FC<BookingConfirmModalProps> = ({
  isOpen,
  onClose,
  onGoToBookings,
  destination = 'Hotel Destination',
  bookingResult = null,
  imageUrl,
  dataTestId = 'booking-confirm-modal',
}) => {
  const checkIn  = bookingResult?.fechaCheckIn  ? formatDate(bookingResult.fechaCheckIn)  : 'TBD';
  const checkOut = bookingResult?.fechaCheckOut ? formatDate(bookingResult.fechaCheckOut) : 'TBD';
  const guests   = bookingResult?.numHuespedes ?? 1;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="large"
      dataTestId={dataTestId}
      className="booking-confirm-modal"
    >
      <div className="booking-confirm-modal__container" data-testid={`${dataTestId}-container`}>

        {/* Top: image + info side by side */}
        <div className="booking-confirm-modal__top" data-testid={`${dataTestId}-header`}>
          <div className="booking-confirm-modal__image-wrapper" data-testid={`${dataTestId}-image`}>
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={destination}
                className="booking-confirm-modal__image"
              />
            ) : (
              <div className="booking-confirm-modal__image-placeholder" />
            )}
          </div>

          <div className="booking-confirm-modal__info">
            <h2 className="booking-confirm-modal__title">Booking confirmation</h2>
            <span
              className="booking-confirm-modal__destination"
              data-testid={`${dataTestId}-destination`}
            >
              {destination}
            </span>
            <div
              className="booking-confirm-modal__trip-info"
              data-testid={`${dataTestId}-trip-info`}
            >
              <span className="booking-confirm-modal__dates">{checkIn} | {checkOut}</span>
              <span className="booking-confirm-modal__guests">
                {guests} Guest{guests !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Success section */}
        <div
          className="booking-confirm-modal__success-section"
          data-testid={`${dataTestId}-success`}
        >
          <div
            className="booking-confirm-modal__checkmark-circle"
            data-testid={`${dataTestId}-checkmark`}
          >
            <CheckmarkIcon />
          </div>
          <h3 className="booking-confirm-modal__success-text">Booking Success!</h3>
          <p className="booking-confirm-modal__success-hint">
            Your booking is pending confirmation. We'll notify you once it's approved.
          </p>
        </div>

        {/* Actions */}
        <div
          className="booking-confirm-modal__actions"
          data-testid={`${dataTestId}-actions`}
        >
          {onGoToBookings && (
            <button
              type="button"
              className="booking-confirm-modal__go-bookings-btn"
              onClick={onGoToBookings}
              data-testid={`${dataTestId}-go-to-bookings`}
            >
              Go to My Bookings
            </button>
          )}
          <button
            type="button"
            className="booking-confirm-modal__close-btn"
            onClick={onClose}
            data-testid={`${dataTestId}-close-action`}
          >
            Close
          </button>
        </div>

      </div>
    </Modal>
  );
};

export default BookingConfirmModal;
