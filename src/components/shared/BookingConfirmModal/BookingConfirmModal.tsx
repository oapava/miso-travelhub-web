import { Modal } from '@/components/ui';
import './BookingConfirmModal.scss';

interface BookingConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  destination?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  rooms?: number;
  dataTestId?: string;
}

const BookingConfirmModal: React.FC<BookingConfirmModalProps> = ({
  isOpen,
  onClose,
  destination = 'Paris, Francia',
  checkIn = '19 Agu',
  checkOut = '3 Sep',
  guests = 2,
  rooms = 1,
  dataTestId = 'booking-confirm-modal',
}) => {

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
          <div className="booking-confirm-modal__image-content">📸</div>
        </div>

        <div className="booking-confirm-modal__header" data-testid={`${dataTestId}-header`}>
          <h2 className="booking-confirm-modal__title">Booking confirmation</h2>
        </div>

        <div className="booking-confirm-modal__details" data-testid={`${dataTestId}-details`}>
          <a href="#" className="booking-confirm-modal__destination" data-testid={`${dataTestId}-destination`}>
            {destination}
          </a>

          <div className="booking-confirm-modal__trip-info" data-testid={`${dataTestId}-trip-info`}>
            <span className="booking-confirm-modal__dates">{checkIn} | {checkOut}</span>
            <span className="booking-confirm-modal__guests">{guests} Guests, {rooms} Room</span>
          </div>
        </div>

        <div className="booking-confirm-modal__success-section" data-testid={`${dataTestId}-success`}>
          <div className="booking-confirm-modal__checkmark-circle" data-testid={`${dataTestId}-checkmark`}>
            <span className="booking-confirm-modal__checkmark">✓</span>
          </div>

          <h3 className="booking-confirm-modal__success-text">Booking Success!</h3>
        </div>
      </div>
    </Modal>
  );
};

export default BookingConfirmModal;
