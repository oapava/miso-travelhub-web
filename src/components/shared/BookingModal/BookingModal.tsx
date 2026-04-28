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
  imageUrl?: string;
  originalPrice?: number;
  finalPrice?: number;
  discountPercentage?: number;
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
  imageUrl,
  originalPrice = 1800,
  finalPrice = 1500,
  discountPercentage = 10,
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
      size="large"
      dataTestId={dataTestId}
      className="booking-modal"
    >
      <div className="booking-modal__container" data-testid={`${dataTestId}-container`}>

        {/* Top: image + info side by side */}
        <div className="booking-modal__top" data-testid={`${dataTestId}-header`}>
          <div className="booking-modal__image-wrapper" data-testid={`${dataTestId}-image`}>
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={destination}
                className="booking-modal__image"
              />
            ) : (
              <div className="booking-modal__image-placeholder" />
            )}
          </div>

          <div className="booking-modal__info">
            <h2 className="booking-modal__title">Booking confirmation</h2>
            <span
              className="booking-modal__destination"
              data-testid={`${dataTestId}-destination`}
            >
              {destination}
            </span>
            <div className="booking-modal__trip-info" data-testid={`${dataTestId}-trip-info`}>
              <span className="booking-modal__dates">{checkIn} | {checkOut}</span>
              <span className="booking-modal__guests">{guests} Guests, {rooms} Room</span>
            </div>
          </div>
        </div>

        {/* Separator */}
        <div className="booking-modal__separator" data-testid={`${dataTestId}-separator`} />

        {/* Payment method */}
        <h3 className="booking-modal__payment-title">Payment Method</h3>

        <div className="booking-modal__payment-row" data-testid={`${dataTestId}-payment`}>
          <div
            className="booking-modal__payment-chip"
            data-testid={`${dataTestId}-payment-chip`}
          >
            Credit / Debit card
          </div>

          <div data-testid={`${dataTestId}-pricing`}>
            <PriceDisplay
              originalPrice={originalPrice}
              finalPrice={finalPrice}
              discountPercentage={discountPercentage}
              size="large"
              dataTestId={`${dataTestId}-price`}
            />
          </div>
        </div>

        {/* Footer: continue button right-aligned */}
        <div className="booking-modal__footer">
          <Button
            variant="primary"
            onClick={handleContinue}
            className="booking-modal__continue-btn"
            dataTestId={`${dataTestId}-continue`}
          >
            CONTINUE
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default BookingModal;
