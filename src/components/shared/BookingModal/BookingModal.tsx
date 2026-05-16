import { Button } from '@/components/ui';
import { PriceDisplay } from '@/components/ui';
import { Modal } from '@/components/ui';
import type { PriceBreakdown } from '@/services/search.service';
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
  /** Full price breakdown from the API — when provided, shown instead of legacy PriceDisplay. */
  priceBreakdown?: PriceBreakdown;
  /** Legacy fallback props (used when priceBreakdown is not available). */
  originalPrice?: number;
  finalPrice?: number;
  discountPercentage?: number;
  dataTestId?: string;
}

/** Formats a monetary amount using the ISO currency code (e.g. "$ 4.591.304 COP"). */
function formatPrice(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString('es-CO')}`;
  }
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
  priceBreakdown,
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

          {/* Price section — full breakdown when available, legacy PriceDisplay otherwise */}
          <div data-testid={`${dataTestId}-price`}>
            {priceBreakdown ? (
              <div className="booking-modal__breakdown" data-testid={`${dataTestId}-breakdown`}>
                <div className="booking-modal__breakdown__row">
                  <span>Subtotal</span>
                  <span>{formatPrice(priceBreakdown.subtotal_sin_descuento, priceBreakdown.moneda)}</span>
                </div>

                {priceBreakdown.descuento > 0 && (
                  <>
                    <div className="booking-modal__breakdown__row booking-modal__breakdown__row--discount">
                      <span>Discount ({Math.round(priceBreakdown.descuento * 100)}%)</span>
                      <span>
                        −{formatPrice(
                          priceBreakdown.subtotal_sin_descuento - priceBreakdown.subtotal_con_descuento,
                          priceBreakdown.moneda,
                        )}
                      </span>
                    </div>
                    <div className="booking-modal__breakdown__row booking-modal__breakdown__row--subtotal">
                      <span>Discounted subtotal</span>
                      <span>{formatPrice(priceBreakdown.subtotal_con_descuento, priceBreakdown.moneda)}</span>
                    </div>
                  </>
                )}

                <div className="booking-modal__breakdown__row booking-modal__breakdown__row--taxes">
                  <span>Taxes</span>
                  <span>
                    {formatPrice(
                      priceBreakdown.total - priceBreakdown.subtotal_con_descuento,
                      priceBreakdown.moneda,
                    )}
                  </span>
                </div>

                <div className="booking-modal__breakdown__divider" aria-hidden="true" />

                <div className="booking-modal__breakdown__row booking-modal__breakdown__row--total">
                  <span>Total</span>
                  <span>{formatPrice(priceBreakdown.total, priceBreakdown.moneda)}</span>
                </div>

                <p className="booking-modal__breakdown__currency">
                  Currency: {priceBreakdown.moneda}
                </p>
              </div>
            ) : (
              <PriceDisplay
                originalPrice={originalPrice}
                finalPrice={finalPrice}
                discountPercentage={discountPercentage}
                size="large"
                dataTestId={`${dataTestId}-price-display`}
              />
            )}
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
