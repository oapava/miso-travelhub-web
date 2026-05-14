import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Header, AccountSidebar, Footer } from '@/components/layout';
import { Breadcrumb, Badge, AmenityTag, Button } from '@/components/ui';
import BookingCancelModal from '@/components/shared/BookingCancelModal/BookingCancelModal';
import { bookingService, TravelerBooking } from '@/services/booking.service';
import { useAuth } from '@/context/AuthContext';
import { useCurrency } from '@/context/CurrencyContext';
import './BookingsPage.scss';

// ── Status label i18n map ────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, { en: string; es: string }> = {
  PENDIENTE:     { en: 'PENDING',    es: 'PENDIENTE'   },
  CONFIRMADA:    { en: 'CONFIRMED',  es: 'CONFIRMADA'  },
  CONFIRMADO:    { en: 'CONFIRMED',  es: 'CONFIRMADO'  },
  CANCELADA:     { en: 'CANCELLED',  es: 'CANCELADA'   },
  CANCELADO:     { en: 'CANCELLED',  es: 'CANCELADO'   },
  PAGADA:        { en: 'PAID',       es: 'PAGADA'      },
  PAGADO:        { en: 'PAID',       es: 'PAGADO'      },
  ACTIVE:        { en: 'ACTIVE',     es: 'ACTIVO'      },
  ACTIVO:        { en: 'ACTIVE',     es: 'ACTIVO'      },
  REEMBOLSANDO:  { en: 'REFUNDING',  es: 'REEMBOLSANDO'},
};

function getStatusLabel(estado: string, lang: string): string {
  const entry = STATUS_LABELS[estado.toUpperCase()];
  if (!entry) return estado;
  return lang.startsWith('es') ? entry.es : entry.en;
}

const PAYMENT_BASE_URL = 'https://miso-pasarela-pagos-evbwp.ondigitalocean.app/payment';

function buildPaymentUrl(booking: TravelerBooking): string {
  const returnUrl = encodeURIComponent(
    new URL('/account/bookings', window.location.href).href,
  );
  const currency  = booking.moneda ?? 'COP';
  return `${PAYMENT_BASE_URL}?invoiceId=${booking.id}&currency=${currency}&amount=${booking.total}&returnUrl=${returnUrl}`;
}

function isPending(estado: string)   { return estado.toUpperCase() === 'PENDIENTE'; }
function isApproved(estado: string)  {
  const s = estado.toUpperCase();
  return s === 'CONFIRMADA' || s === 'CONFIRMADO' || s === 'ACTIVE' || s === 'ACTIVO';
}
function isCancellable(estado: string): boolean {
  const s = estado.toUpperCase();
  // Already cancelled, paid, or being refunded → cannot cancel again
  return (
    s !== 'CANCELADA' &&
    s !== 'CANCELADO' &&
    s !== 'PAGADA' &&
    s !== 'PAGADO' &&
    s !== 'REEMBOLSANDO'
  );
}

interface BookingGroup {
  key: string;
  displayDate: string;
  bookings: TravelerBooking[];
}

const BookingsPage: React.FC = () => {
  const { user, accessToken } = useAuth();
  const { i18n } = useTranslation();
  const { currency } = useCurrency();
  const [bookings, setBookings] = useState<TravelerBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Cancel modal state ───────────────────────────────────────────────────────
  const [cancelTarget, setCancelTarget] = useState<TravelerBooking | null>(null);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isCancelLoading, setIsCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const loadBookings = useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await bookingService.getMyBookings(accessToken, { moneda: currency });
      setBookings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bookings');
      console.error('Error loading bookings:', err);
    } finally {
      setLoading(false);
    }
  }, [accessToken, currency]);

  // Initial load
  useEffect(() => { void loadBookings(); }, [loadBookings]);

  // Refresh when user returns to this tab after completing payment
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') void loadBookings();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [loadBookings]);

  const groupBookingsByMonth = (list: TravelerBooking[]): BookingGroup[] => {
    const groups: Record<string, { displayDate: string; bookings: TravelerBooking[] }> = {};

    list.forEach((booking) => {
      const date = new Date(booking.fechaCheckIn);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const displayDate = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

      if (!groups[key]) {
        groups[key] = { displayDate, bookings: [] };
      }
      groups[key]!.bookings.push(booking);
    });

    return Object.entries(groups)
      .map(([key, value]) => ({ key, ...value }))
      .sort((a, b) => b.key.localeCompare(a.key));
  };

  const calculateNights = (checkIn: string, checkOut: string): number => {
    const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)));
  };

  const formatShortDate = (dateStr: string): string => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const formatPrice = (price: number, moneda?: string): string => {
    if (moneda) {
      try {
        return new Intl.NumberFormat('es-CO', {
          style: 'currency',
          currency: moneda,
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(price);
      } catch {
        // fall through to plain number
      }
    }
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusBadgeVariant = (status: string): 'success' | 'info' | 'warning' => {
    switch (status.toUpperCase()) {
      case 'CONFIRMADA':
      case 'CONFIRMADO':
      case 'PAGADA':
      case 'PAGADO':
      case 'ACTIVE':
      case 'ACTIVO':
        return 'success';
      case 'CANCELADA':
      case 'CANCELADO':
      case 'PENDIENTE':
        return 'warning';
      case 'REEMBOLSANDO':
        return 'info';
      default:
        return 'info';
    }
  };

  // ── Cancel handlers ──────────────────────────────────────────────────────────
  const openCancelModal = (booking: TravelerBooking) => {
    setCancelTarget(booking);
    setCancelError(null);
    setIsCancelOpen(true);
  };

  const handleCancelBooking = async () => {
    if (!accessToken || !cancelTarget) return;

    // Guard: travellers cannot cancel on the same day as check-in
    const today = new Date();
    const todayStr = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, '0'),
      String(today.getDate()).padStart(2, '0'),
    ].join('-');
    if (cancelTarget.fechaCheckIn.slice(0, 10) === todayStr) {
      setCancelError('Bookings cannot be cancelled on the check-in day.');
      setIsCancelOpen(false);
      return;
    }

    setIsCancelLoading(true);
    setCancelError(null);
    try {
      await bookingService.updateBooking(cancelTarget.id, 'CANCELADA', accessToken);
      setBookings((prev) =>
        prev.map((b) => (b.id === cancelTarget.id ? { ...b, estado: 'CANCELADA' } : b)),
      );
      setIsCancelOpen(false);
      setCancelTarget(null);
    } catch (err) {
      setCancelError(err instanceof Error ? err.message : 'Could not cancel booking.');
    } finally {
      setIsCancelLoading(false);
    }
  };

  const bookingGroups = groupBookingsByMonth(bookings);

  return (
    <div className="bookings-page" data-testid="bookings-page">
      <Header />

      <div className="bookings-page__container">
        <Breadcrumb
          items={[
            { label: 'Home', path: '/' },
            { label: 'Account', path: '/account' },
            { label: 'Bookings' },
          ]}
        />

        <div className="bookings-page__content">
          <AccountSidebar
            userName={user?.nombre || 'User'}
            userEmail={user?.email || ''}
            dataTestId="bookings-sidebar"
          />

          <main className="bookings-page__main" data-testid="bookings-main">
            <h1 className="bookings-page__title">Booking History</h1>

            {loading && (
              <div className="bookings-page__loading">Loading bookings...</div>
            )}

            {error && (
              <div className="bookings-page__error">Error: {error}</div>
            )}

            {!loading && !error && bookings.length === 0 && (
              <div className="bookings-page__empty">
                <p>You have no bookings yet.</p>
              </div>
            )}

            {!loading && !error && bookings.length > 0 && (
              <div className="bookings-page__bookings-list">
                {bookingGroups.map((group, groupIndex) => (
                  <section
                    key={group.key}
                    className="bookings-page__booking-group"
                    data-testid={`booking-group-${groupIndex}`}
                  >
                    <div className="bookings-page__group-header">
                      <h2 className="bookings-page__group-date">{group.displayDate}</h2>
                    </div>

                    <div className="bookings-page__group-bookings">
                      {group.bookings.map((booking) => {
                        const nights = calculateNights(
                          booking.fechaCheckIn,
                          booking.fechaCheckOut,
                        );
                        const heroImage = booking.imagenes?.[0];
                        const locationLine = [booking.ciudad, booking.pais]
                          .filter(Boolean)
                          .join(', ');
                        const taxes = booking.total - booking.subtotal;

                        return (
                          <article
                            key={booking.id}
                            className="booking-card"
                            data-testid={`booking-item-${booking.id}`}
                          >
                            {/* ── Left: image with status badge ── */}
                            <div className="booking-card__image-container">
                              <Badge
                                label={getStatusLabel(booking.estado, i18n.language)}
                                variant={getStatusBadgeVariant(booking.estado)}
                                size="small"
                                className="booking-card__badge"
                                dataTestId={`booking-status-${booking.id}`}
                              />
                              {heroImage ? (
                                <img
                                  src={heroImage}
                                  alt={booking.nombreHotel}
                                  className="booking-card__image booking-card__image--photo"
                                />
                              ) : (
                                <div
                                  className="booking-card__image"
                                  role="img"
                                  aria-label={`${booking.nombreHotel} hotel photo`}
                                />
                              )}
                            </div>

                            {/* ── Right: content ── */}
                            <div className="booking-card__content">
                              {/* Pending notice — lives in content so tooltip is never clipped */}
                              {isPending(booking.estado) && (
                                <div
                                  className="booking-card__pending-notice"
                                  data-testid={`booking-pending-info-${booking.id}`}
                                  role="note"
                                >
                                  <span className="booking-card__info-icon" aria-hidden="true">ℹ</span>
                                  <span>
                                    Once your booking is approved you will need to complete the payment to confirm your stay.
                                  </span>
                                </div>
                              )}

                              {/* Header row: hotel name + nights / guests */}
                              <div className="booking-card__header">
                                <div className="booking-card__title-row">
                                  <h3 className="booking-card__name">{booking.nombreHotel}</h3>
                                  {booking.estrellas && (
                                    <span className="booking-card__stars" aria-label={`${booking.estrellas} stars`}>
                                      {'★'.repeat(booking.estrellas)}
                                    </span>
                                  )}
                                </div>
                                <div className="booking-card__review">
                                  <div className="booking-card__review-label-box">
                                    <span className="booking-card__review-label">
                                      {nights} {nights === 1 ? 'night' : 'nights'}
                                    </span>
                                    <span className="booking-card__review-count">
                                      {booking.numHuespedes}{' '}
                                      {booking.numHuespedes === 1 ? 'guest' : 'guests'}
                                    </span>
                                  </div>
                                  <Badge
                                    label={formatPrice(booking.total, booking.moneda)}
                                    variant="rating"
                                    size="small"
                                    dataTestId={`booking-total-${booking.id}`}
                                  />
                                </div>
                              </div>

                              {/* Location row */}
                              <div className="booking-card__location">
                                {locationLine && (
                                  <span className="booking-card__location-pin">
                                    <img src="/img/location_on.svg" alt="" aria-hidden="true" />
                                    <span className="booking-card__location-name">
                                      {locationLine}
                                    </span>
                                  </span>
                                )}
                                {booking.distancia && (
                                  <span className="booking-card__distance">
                                    · {booking.distancia}
                                  </span>
                                )}
                                {booking.acceso && (
                                  <span className="booking-card__access">{booking.acceso}</span>
                                )}
                              </div>

                              {/* Dates row */}
                              <div className="booking-card__details">
                                {formatShortDate(booking.fechaCheckIn)} →{' '}
                                {formatShortDate(booking.fechaCheckOut)}
                                {booking.tipo_habitacion && (
                                  <> · {booking.tipo_habitacion}</>
                                )}
                                {booking.tipo_cama && booking.tipo_cama.length > 0 && (
                                  <> · {booking.tipo_cama.join(', ')}</>
                                )}
                              </div>

                              {/* Amenities + price footer */}
                              <div className="booking-card__ammenities-price-box">
                                <div className="booking-card__amenities">
                                  <AmenityTag
                                    label={`Check-in: ${formatShortDate(booking.fechaCheckIn)}`}
                                  />
                                  <AmenityTag
                                    label={`Check-out: ${formatShortDate(booking.fechaCheckOut)}`}
                                  />
                                  <AmenityTag label={`${booking.numHuespedes} ${booking.numHuespedes === 1 ? 'adult' : 'adults'}`} />
                                  {booking.amenidades?.slice(0, 2).map((am) => (
                                    <AmenityTag key={am} label={am} />
                                  ))}
                                </div>

                                <div className="booking-card__footer">
                                  <div className="booking-card__pricing">
                                    {/* Price breakdown */}
                                    <div className="booking-card__price-breakdown" data-testid={`booking-price-breakdown-${booking.id}`}>
                                      <div className="booking-card__price-row">
                                        <span>Subtotal</span>
                                        <span>{formatPrice(booking.subtotal, booking.moneda)}</span>
                                      </div>
                                      {taxes > 0 && (
                                        <div className="booking-card__price-row booking-card__price-row--taxes">
                                          <span>Taxes</span>
                                          <span>{formatPrice(taxes, booking.moneda)}</span>
                                        </div>
                                      )}
                                      <div className="booking-card__price-row booking-card__price-row--total">
                                        <span>Total</span>
                                        <span className="booking-card__price-final">
                                          {formatPrice(booking.total, booking.moneda)}
                                        </span>
                                      </div>
                                    </div>
                                    <span className="booking-card__stay-info">
                                      {nights} nights · {booking.numHuespedes} adults
                                    </span>
                                  </div>
                                  <div className="booking-card__actions">
                                    <Button variant="primary" size="small" dataTestId={`booking-detail-btn-${booking.id}`}>
                                      DETAIL
                                    </Button>
                                    {isApproved(booking.estado) && (
                                      <a
                                        href={buildPaymentUrl(booking)}
                                        className="button button--primary button--small"
                                        data-testid={`booking-pay-btn-${booking.id}`}
                                        aria-label={`Pay for booking at ${booking.nombreHotel}`}
                                      >
                                        PAY NOW
                                      </a>
                                    )}
                                    {isCancellable(booking.estado) && (
                                      <Button
                                        variant="outline"
                                        size="small"
                                        className="booking-card__cancel-btn"
                                        onClick={() => openCancelModal(booking)}
                                        dataTestId={`booking-cancel-btn-${booking.id}`}
                                      >
                                        CANCEL
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      <Footer />

      {cancelError && (
        <div className="bookings-page__cancel-error" role="alert">
          {cancelError}
        </div>
      )}

      <BookingCancelModal
        isOpen={isCancelOpen}
        onClose={() => { setIsCancelOpen(false); setCancelTarget(null); }}
        onConfirm={() => { void handleCancelBooking(); }}
        clientName={user?.nombre ?? user?.email ?? undefined}
        hotelName={cancelTarget?.nombreHotel ?? undefined}
        dataTestId="bookings-cancel-modal"
        isLoading={isCancelLoading}
      />
    </div>
  );
};

export default BookingsPage;
