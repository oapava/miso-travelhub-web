import { Modal } from '@/components/ui';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui';
import { StarRating } from '@/components/ui';
import { PriceDisplay } from '@/components/ui';
import { HotelBooking } from '@/services/booking.service';
import { useCurrency } from '@/context/CurrencyContext';
import './BookingDetailModal.scss';

// ── Local helpers ─────────────────────────────────────────────────────────────

function formatDateDDMMYY(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const day   = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year  = String(d.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
}

function calcNights(checkIn: string, checkOut: string): number {
  const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)));
}

function formatPrice(amount: number, moneda: string): string {
  try {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: moneda,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${moneda} ${amount.toLocaleString()}`;
  }
}

function getStatusVariant(estado: string): 'success' | 'info' | 'warning' {
  const s = estado.toLowerCase();
  if (s === 'confirmado' || s === 'confirmada' || s === 'activo' || s === 'active') return 'success';
  if (s === 'cancelado' || s === 'cancelada' || s === 'pendiente') return 'warning';
  return 'info';
}

function normalizeEstado(estado: string): string {
  return estado.charAt(0).toUpperCase() + estado.slice(1).toLowerCase();
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface BookingDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  onCancel?: () => void;
  dataTestId?: string;
  /**
   * When provided the modal renders the full rich-detail view driven by real
   * booking data.  When absent it falls back to the legacy static layout so
   * that existing snapshot / unit tests remain green.
   */
  booking?: HotelBooking;
  // ── Legacy individual props (kept for backward compatibility) ──────────────
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

// ── Component ─────────────────────────────────────────────────────────────────

const BookingDetailModal: React.FC<BookingDetailModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  onCancel,
  dataTestId = 'booking-detail-modal',
  booking,
  // legacy defaults
  clientName   = 'Carlos Perea',
  reservedAt   = 'La Perla, Medellín',
  dateFrom     = '26/03/26',
  dateTo       = '26/03/26',
  status       = 'ACTIVE',
  statusVariant = 'success',
  originalPrice = 1800,
  finalPrice    = 1500,
  period        = '6 nights, 2 adults',
}) => {
  const handleConfirm = () => onConfirm?.();
  const handleCancel  = () => onCancel?.();
  const { currency: contextCurrency } = useCurrency();

  // ── Rich view (booking prop present) ───────────────────────────────────────
  if (booking) {
    const nights = calcNights(booking.fechaCheckIn, booking.fechaCheckOut);
    const roomLabel = booking.nombreHabitacion ?? booking.habitacionId ?? '—';
    // Fall back to the globally-selected currency when the API doesn't return moneda
    const moneda = booking.moneda || contextCurrency;
    // Prefer the human-readable full name; fall back to ID then email
    const guestDisplay = booking.nombreUser || booking.viajeroId || booking.emailHuesped || '—';
    // Only show the email row separately when it's a different value from guestDisplay
    const showEmailRow =
      !!(booking.emailHuesped) && booking.emailHuesped !== guestDisplay;

    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="medium"
        dataTestId={dataTestId}
        className="booking-detail-modal"
      >
        <div
          className="booking-detail-modal__container"
          data-testid={`${dataTestId}-container`}
        >
          {/* ── Header: title + code + status ── */}
          <div
            className="booking-detail-modal__header"
            data-testid={`${dataTestId}-header`}
          >
            <div className="booking-detail-modal__header-left">
              <h2
                className="booking-detail-modal__title"
                data-testid={`${dataTestId}-title`}
              >
                Booking Detail
              </h2>
              <p
                className="booking-detail-modal__booking-code"
                data-testid={`${dataTestId}-booking-code`}
              >
                Code:&nbsp;<strong>{booking.codigo || '—'}</strong>
              </p>
            </div>
            <Badge
              label={normalizeEstado(booking.estado)}
              variant={getStatusVariant(booking.estado)}
              size="small"
              dataTestId={`${dataTestId}-active-badge`}
              className="booking-detail-modal__status-badge"
            />
          </div>

          {/* ── Section 1: Guest information ── */}
          <section
            className="booking-detail-modal__section"
            data-testid={`${dataTestId}-guest-section`}
          >
            <h3 className="booking-detail-modal__section-title">
              Guest Information
            </h3>

            <div className="booking-detail-modal__info-grid">
              <div className="booking-detail-modal__info-row">
                <span className="booking-detail-modal__info-label">Guest</span>
                <span
                  className="booking-detail-modal__info-value"
                  data-testid={`${dataTestId}-client-name`}
                >
                  {guestDisplay}
                </span>
              </div>

              {showEmailRow && (
                <div className="booking-detail-modal__info-row">
                  <span className="booking-detail-modal__info-label">Email</span>
                  <span
                    className="booking-detail-modal__info-value"
                    data-testid={`${dataTestId}-guest-email`}
                  >
                    {booking.emailHuesped}
                  </span>
                </div>
              )}

              {booking.telefonoHuesped && (
                <div className="booking-detail-modal__info-row">
                  <span className="booking-detail-modal__info-label">Phone</span>
                  <span
                    className="booking-detail-modal__info-value"
                    data-testid={`${dataTestId}-guest-phone`}
                  >
                    {booking.telefonoHuesped}
                  </span>
                </div>
              )}

              {booking.horaEstimadaLlegada && (
                <div className="booking-detail-modal__info-row">
                  <span className="booking-detail-modal__info-label">
                    Est. Arrival
                  </span>
                  <span
                    className="booking-detail-modal__info-value"
                    data-testid={`${dataTestId}-arrival-time`}
                  >
                    {booking.horaEstimadaLlegada}
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* ── Section 2: Property ── */}
          <section
            className="booking-detail-modal__section"
            data-testid={`${dataTestId}-property-section`}
          >
            <h3 className="booking-detail-modal__section-title">Property</h3>

            <div className="booking-detail-modal__info-grid">
              {booking.nombreHotel && (
                <div className="booking-detail-modal__info-row">
                  <span className="booking-detail-modal__info-label">Hotel</span>
                  <span
                    className="booking-detail-modal__info-value"
                    data-testid={`${dataTestId}-hotel-name`}
                  >
                    {booking.nombreHotel}
                  </span>
                </div>
              )}

              {(booking.ciudad || booking.pais) && (
                <div className="booking-detail-modal__info-row">
                  <span className="booking-detail-modal__info-label">Location</span>
                  <span
                    className="booking-detail-modal__info-value"
                    data-testid={`${dataTestId}-location`}
                  >
                    {[booking.ciudad, booking.pais].filter(Boolean).join(', ')}
                  </span>
                </div>
              )}

              <div className="booking-detail-modal__info-row">
                <span className="booking-detail-modal__info-label">Room</span>
                <span
                  className="booking-detail-modal__info-value"
                  data-testid={`${dataTestId}-room`}
                >
                  {roomLabel}
                </span>
              </div>

              {booking.tipo_habitacion && (
                <div className="booking-detail-modal__info-row">
                  <span className="booking-detail-modal__info-label">Room Type</span>
                  <span
                    className="booking-detail-modal__info-value"
                    data-testid={`${dataTestId}-room-type`}
                  >
                    {booking.tipo_habitacion}
                  </span>
                </div>
              )}

              {booking.categoria && (
                <div className="booking-detail-modal__info-row">
                  <span className="booking-detail-modal__info-label">Category</span>
                  <span
                    className="booking-detail-modal__info-value"
                    data-testid={`${dataTestId}-category`}
                  >
                    {booking.categoria}
                  </span>
                </div>
              )}

              {booking.tamano_habitacion && (
                <div className="booking-detail-modal__info-row">
                  <span className="booking-detail-modal__info-label">Room Size</span>
                  <span
                    className="booking-detail-modal__info-value"
                    data-testid={`${dataTestId}-room-size`}
                  >
                    {booking.tamano_habitacion}
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* ── Section 3: Stay details ── */}
          <section
            className="booking-detail-modal__section"
            data-testid={`${dataTestId}-dates-section`}
          >
            <h3 className="booking-detail-modal__section-title">Stay Details</h3>

            <div className="booking-detail-modal__info-grid">
              <div className="booking-detail-modal__info-row">
                <span className="booking-detail-modal__info-label">Guests</span>
                <span
                  className="booking-detail-modal__info-value"
                  data-testid={`${dataTestId}-guests-count`}
                >
                  {booking.numHuespedes}{' '}
                  {booking.numHuespedes === 1 ? 'adult' : 'adults'}
                </span>
              </div>

              <div className="booking-detail-modal__info-row">
                <span className="booking-detail-modal__info-label">Check-in</span>
                <span
                  className="booking-detail-modal__info-value"
                  data-testid={`${dataTestId}-checkin`}
                >
                  {formatDateDDMMYY(booking.fechaCheckIn)}
                </span>
              </div>

              <div className="booking-detail-modal__info-row">
                <span className="booking-detail-modal__info-label">Check-out</span>
                <span
                  className="booking-detail-modal__info-value"
                  data-testid={`${dataTestId}-checkout`}
                >
                  {formatDateDDMMYY(booking.fechaCheckOut)}
                </span>
              </div>

              <div className="booking-detail-modal__info-row">
                <span className="booking-detail-modal__info-label">Nights</span>
                <span
                  className="booking-detail-modal__info-value"
                  data-testid={`${dataTestId}-nights`}
                >
                  {nights} {nights === 1 ? 'night' : 'nights'}
                </span>
              </div>
            </div>
          </section>

          {/* ── Section 4: Booking value ── */}
          <section
            className="booking-detail-modal__section"
            data-testid={`${dataTestId}-financial-section`}
          >
            <h3 className="booking-detail-modal__section-title">Booking Value</h3>

            <div className="booking-detail-modal__financial-grid">
              <div className="booking-detail-modal__financial-row">
                <span className="booking-detail-modal__info-label">Subtotal</span>
                <span
                  className="booking-detail-modal__info-value"
                  data-testid={`${dataTestId}-subtotal`}
                >
                  {formatPrice(booking.subtotal, moneda)}
                </span>
              </div>

              <div className="booking-detail-modal__financial-row booking-detail-modal__financial-row--taxes">
                <span className="booking-detail-modal__info-label">Taxes</span>
                <span
                  className="booking-detail-modal__info-value"
                  data-testid={`${dataTestId}-taxes`}
                >
                  {formatPrice(booking.impuestos, moneda)}
                </span>
              </div>

              <div
                className="booking-detail-modal__financial-divider"
                aria-hidden="true"
              />

              <div className="booking-detail-modal__financial-row booking-detail-modal__financial-row--total">
                <span className="booking-detail-modal__info-label">Total</span>
                <span
                  className="booking-detail-modal__info-value booking-detail-modal__total-value"
                  data-testid={`${dataTestId}-total`}
                >
                  {formatPrice(booking.total, moneda)}
                </span>
              </div>
            </div>
          </section>

          {/* ── Section 5: Special requests (optional) ── */}
          {booking.solicitudesEspeciales && (
            <section
              className="booking-detail-modal__section booking-detail-modal__section--last"
              data-testid={`${dataTestId}-special-requests-section`}
            >
              <h3 className="booking-detail-modal__section-title">
                Special Requests
              </h3>
              <p
                className="booking-detail-modal__special-requests-text"
                data-testid={`${dataTestId}-special-requests`}
              >
                {booking.solicitudesEspeciales}
              </p>
            </section>
          )}

          {/* ── Actions ── */}
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
      </Modal>
    );
  }

  // ── Legacy view (no booking prop — keeps all existing tests green) ──────────
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="medium"
      dataTestId={dataTestId}
      className="booking-detail-modal"
    >
      <div className="booking-detail-modal__container" data-testid={`${dataTestId}-container`}>

        {/* Header: client name + dates */}
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

        {/* Status badge */}
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

        {/* Hotel card */}
        <div
          className="booking-detail-modal__hotel-card"
          data-testid={`${dataTestId}-hotel-card`}
        >
          <div
            className="booking-detail-modal__hotel-image"
            data-testid={`${dataTestId}-hotel-image`}
          />

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
