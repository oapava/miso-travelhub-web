import { Button } from '@/components/ui';
import { PriceDisplay } from '@/components/ui';
import { Modal } from '@/components/ui';
import './BookingModal.scss';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue?: () => void;
  destination?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  rooms?: number;
  dataTestId?: string;
}

const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  onContinue,
  destination = 'Paris, Francia',
  checkIn = '19 Agu',
  checkOut = '3 Sep',
  guests = 2,
  rooms = 1,
  dataTestId = 'booking-modal',
}) => {

  const handleContinue = () => {
    onContinue?.();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="medium"
      dataTestId={dataTestId}
      className="booking-modal"
    >
      <div className="booking-modal__container" data-testid={`${dataTestId}-container`}>
        <button
          type="button"
          className="booking-modal__close"
          onClick={onClose}
          aria-label="Close booking modal"
          data-testid={`${dataTestId}-close`}
        >
          ✕
        </button>

        <div className="booking-modal__image-placeholder" data-testid={`${dataTestId}-image`}>
          <div className="booking-modal__image-content">📸</div>
        </div>

        <div className="booking-modal__header" data-testid={`${dataTestId}-header`}>
          <h2 className="booking-modal__title">Booking confirmation</h2>
        </div>

        <div className="booking-modal__details" data-testid={`${dataTestId}-details`}>
          <a href="#" className="booking-modal__destination" data-testid={`${dataTestId}-destination`}>
            {destination}
          </a>

          <div className="booking-modal__trip-info" data-testid={`${dataTestId}-trip-info`}>
            <span className="booking-modal__dates">{checkIn} | {checkOut}</span>
            <span className="booking-modal__guests">{guests} Guests, {rooms} Room</span>
          </div>
        </div>

        <div className="booking-modal__separator" data-testid={`${dataTestId}-separator`}></div>

        <div className="booking-modal__payment-section" data-testid={`${dataTestId}-payment`}>
          <h3 className="booking-modal__payment-title">Payment Method</h3>
          <div className="booking-modal__payment-chip" data-testid={`${dataTestId}-payment-chip`}>
            Credit / Debit card
          </div>
        </div>

        <div className="booking-modal__pricing" data-testid={`${dataTestId}-pricing`}>
          <PriceDisplay
            originalPrice={1800}
            finalPrice={1500}
            discountPercentage={55}
            size="large"
            dataTestId={`${dataTestId}-price`}
          />
        </div>

        <Button
          variant="primary"
          size="medium"
          fullWidth
          onClick={handleContinue}
          className="booking-modal__continue-btn"
          dataTestId={`${dataTestId}-continue`}
        >
          CONTINUE
        </Button>
      </div>
    </Modal>
  );
};

export default BookingModal;
