import { Modal } from '@/components/ui';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui';
import { StarRating } from '@/components/ui';
import { PriceDisplay } from '@/components/ui';
import './BookingDetailModal.scss';

interface BookingDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  onCancel?: () => void;
  dataTestId?: string;
  // Optional dynamic props — static defaults keep existing tests green
  clientName?: string;
  reservedAt?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  statusVariant?: 'success' | 'info' | 'warning';
  originalPrice?: number;
  finalPrice?: number;
  period?: string;
}

const BookingDetailModal: React.FC<BookingDetailModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  onCancel,
  dataTestId = 'booking-detail-modal',
  clientName = 'Carlos Perea',
  reservedAt = 'La Perla, Medellín',
  dateFrom = '26/03/26',
  dateTo = '26/03/26',
  status = 'ACTIVE',
  statusVariant = 'success',
  originalPrice = 1800,
  finalPrice = 1500,
  period = '6 nights, 2 adults',
}) => {
  const handleConfirm = () => onConfirm?.();
  const handleCancel = () => onCancel?.();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="medium"
      dataTestId={dataTestId}
      className="booking-detail-modal"
    >
      <div className="booking-detail-modal__container" data-testid={`${dataTestId}-container`}>

        {/* ── Header: client name + dates ── */}
        <div className="booking-detail-modal__header" data-testid={`${dataTestId}-header`}>
          <div className="booking-detail-modal__header-left">
            <h2
              className="booking-detail-modal__client-name"
              data-testid={`${dataTestId}-client-name`}
            >
              {clientName}
            </h2>
            <p
              className="booking-detail-modal__subtitle"
              data-testid={`${dataTestId}-subtitle`}
            >
              Reserved: {reservedAt}
            </p>
          </div>
          <div
            className="booking-detail-modal__header-right"
            data-testid={`${dataTestId}-header-right`}
          >
            <div className="booking-detail-modal__dates" data-testid={`${dataTestId}-dates`}>
              <span className="booking-detail-modal__date">{dateFrom}</span>
              <span className="booking-detail-modal__date-separator"> </span>
              <span className="booking-detail-modal__date">{dateTo}</span>
            </div>
            <p className="booking-detail-modal__date-label">Date Reserve</p>
          </div>
        </div>

        {/* ── Status badge ── */}
        <div
          className="booking-detail-modal__badge-section"
          data-testid={`${dataTestId}-badge-section`}
        >
          <Badge
            label={status}
            variant={statusVariant}
            size="small"
            dataTestId={`${dataTestId}-active-badge`}
            className="booking-detail-modal__status-badge"
          />
        </div>

        {/* ── Hotel card: horizontal ── */}
        <div
          className="booking-detail-modal__hotel-card"
          data-testid={`${dataTestId}-hotel-card`}
        >
          {/* Left: image */}
          <div
            className="booking-detail-modal__hotel-image"
            data-testid={`${dataTestId}-hotel-image`}
          />

          {/* Right: all content */}
          <div
            className="booking-detail-modal__hotel-content"
            data-testid={`${dataTestId}-hotel-content`}
          >
            <div
              className="booking-detail-modal__hotel-header"
              data-testid={`${dataTestId}-hotel-header`}
            >
              <h3
                className="booking-detail-modal__hotel-title"
                data-testid={`${dataTestId}-hotel-title`}
              >
                La Perla
              </h3>
              <div className="booking-detail-modal__review-row">
                <div
                  className="booking-detail-modal__rating-section"
                  data-testid={`${dataTestId}-rating-section`}
                >
                  <StarRating rating={4} size="small" dataTestId={`${dataTestId}-star-rating`} />
                </div>
                <div className="booking-detail-modal__review-meta">
                  <span className="booking-detail-modal__excellent-label">Excellent</span>
                  <span className="booking-detail-modal__reviews-count">120 reviews</span>
                  <Badge
                    label="8.0"
                    variant="rating"
                    size="small"
                    dataTestId={`${dataTestId}-rating-badge`}
                  />
                </div>
              </div>
            </div>

            <div
              className="booking-detail-modal__location"
              data-testid={`${dataTestId}-location`}
            >
              <span className="booking-detail-modal__location-pin">
                <img src="/img/location_on.svg" alt="" />
              </span>
              <span className="booking-detail-modal__location-text">Medellín, Colombia</span>
            </div>

            <p
              className="booking-detail-modal__distance"
              data-testid={`${dataTestId}-distance`}
            >
              1.8 km From center
            </p>

            <p
              className="booking-detail-modal__room-type"
              data-testid={`${dataTestId}-room-type`}
            >
              Luxury Hotel | Sea view room &nbsp; King Bed - 40 m2
            </p>

            <p
              className="booking-detail-modal__amenity"
              data-testid={`${dataTestId}-amenity`}
            >
              Metro access
            </p>

            {/* Price */}
            <div
              className="booking-detail-modal__price-section"
              data-testid={`${dataTestId}-price-section`}
            >
              <PriceDisplay
                originalPrice={originalPrice}
                finalPrice={finalPrice}
                period={period}
                dataTestId={`${dataTestId}-price-display`}
              />
            </div>

            {/* Actions: CONFIRM + CANCEL side-by-side */}
            <div
              className="booking-detail-modal__actions"
              data-testid={`${dataTestId}-actions`}
            >
              <Button
                variant="primary"
                size="small"
                onClick={handleConfirm}
                dataTestId={`${dataTestId}-confirm-btn`}
              >
                CONFIRM
              </Button>
              <Button
                variant="primary"
                size="small"
                className="booking-detail-modal__cancel-btn"
                onClick={handleCancel}
                dataTestId={`${dataTestId}-cancel-btn`}
              >
                CANCEL
              </Button>
            </div>
          </div>
        </div>

      </div>
    </Modal>
  );
};

export default BookingDetailModal;
