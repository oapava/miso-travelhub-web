import React, { useEffect, useState } from 'react';
import { Header, AccountSidebar, Footer } from '@/components/layout';
import { Breadcrumb, Badge, AmenityTag, Button } from '@/components/ui';
import { bookingService, BookingResponse } from '@/services/booking.service';
import { useAuth } from '@/context/AuthContext';
import './BookingsPage.scss';

interface BookingGroup {
  key: string;
  displayDate: string;
  bookings: BookingResponse[];
}

const BookingsPage: React.FC = () => {
  const { user, accessToken } = useAuth();
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
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

  const groupBookingsByMonth = (list: BookingResponse[]): BookingGroup[] => {
    const groups: Record<string, { displayDate: string; bookings: BookingResponse[] }> = {};

    list.forEach((booking) => {
      const date = new Date(booking.fechaCheckIn);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const displayDate = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

      if (!groups[key]) {
        groups[key] = { displayDate, bookings: [] };
      }
      groups[key].bookings.push(booking);
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

  const formatPrice = (price: number): string => {
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
                              <div
                                className="booking-card__image"
                                role="img"
                                aria-label={`${booking.codigo} hotel photo`}
                              />
                            </div>

                            {/* ── Right: content ── */}
                            <div className="booking-card__content">
                              {/* Header row: code + nights/price */}
                              <div className="booking-card__header">
                                <div className="booking-card__title-row">
                                  <h3 className="booking-card__name">{booking.codigo}</h3>
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
                                    label={`${formatPrice(booking.total)} ${booking.moneda}`}
                                    variant="rating"
                                    size="small"
                                  />
                                </div>
                              </div>

                              {/* Dates row */}
                              <div className="booking-card__location">
                                <span className="booking-card__location-pin">
                                  <img src="/img/location_on.svg" alt="" />
                                  <span className="booking-card__location-name">
                                    {formatShortDate(booking.fechaCheckIn)}
                                  </span>
                                </span>
                                <span className="booking-card__distance">
                                  → {formatShortDate(booking.fechaCheckOut)}
                                </span>
                                <span className="booking-card__access">
                                  {booking.numHuespedes} adults
                                </span>
                              </div>

                              {/* Room detail row */}
                              <div className="booking-card__details">
                                Room: {booking.habitacionId}&nbsp;|&nbsp;
                                {booking.numHuespedes}{' '}
                                {booking.numHuespedes === 1 ? 'guest' : 'guests'}
                              </div>

                              {/* Amenity tags + price footer */}
                              <div className="booking-card__ammenities-price-box">
                                <div className="booking-card__amenities">
                                  <AmenityTag
                                    label={`Check-in: ${formatShortDate(booking.fechaCheckIn)}`}
                                  />
                                  <AmenityTag
                                    label={`Check-out: ${formatShortDate(booking.fechaCheckOut)}`}
                                  />
                                  <AmenityTag label={`${booking.numHuespedes} adults`} />
                                </div>

                                <div className="booking-card__footer">
                                  <div className="booking-card__pricing">
                                    <span className="booking-card__price-final">
                                      {booking.moneda} {formatPrice(booking.total)}
                                    </span>
                                    <span className="booking-card__stay-info">
                                      {nights} nights, {booking.numHuespedes} adults
                                    </span>
                                  </div>
                                  <Button variant="primary" size="small">
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
