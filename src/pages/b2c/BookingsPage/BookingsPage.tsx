import React, { useEffect, useState } from 'react';
import { Header, AccountSidebar, Footer } from '@/components/layout';
import { Breadcrumb, Badge, AmenityTag, Button } from '@/components/ui';
import { bookingService, TravelerBooking } from '@/services/booking.service';
import { useAuth } from '@/context/AuthContext';
import './BookingsPage.scss';

interface BookingGroup {
  key: string;
  displayDate: string;
  bookings: TravelerBooking[];
}

const BookingsPage: React.FC = () => {
  const { user, accessToken } = useAuth();
  const [bookings, setBookings] = useState<TravelerBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBookings = async () => {
      if (!accessToken) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await bookingService.getMyBookings(accessToken);
        setBookings(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load bookings');
        console.error('Error loading bookings:', err);
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, [accessToken]);

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
      case 'ACTIVE':
        return 'success';
      case 'CANCELADA':
      case 'PENDIENTE':
        return 'warning';
      default:
        return 'info';
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
                                label={booking.estado}
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
                                  <Button variant="primary" size="small" dataTestId={`booking-detail-btn-${booking.id}`}>
                                    DETAIL
                                  </Button>
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
    </div>
  );
};

export default BookingsPage;
