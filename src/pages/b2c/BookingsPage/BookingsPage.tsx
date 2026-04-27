import React, { useEffect, useState } from 'react';
import { Header, SearchBar, AccountSidebar, Footer } from '@/components/layout';
import { Breadcrumb, Badge } from '@/components/ui';
import { bookingService, BookingResponse } from '@/services/booking.service';
import { useAuth } from '@/context/AuthContext';
import './BookingsPage.scss';

interface BookingGroup {
  date: string;
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

  const groupBookingsByMonth = (bookings: BookingResponse[]): BookingGroup[] => {
    const groups: Record<string, BookingResponse[]> = {};

    bookings.forEach((booking) => {
      const date = new Date(booking.fechaCheckIn);
      const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });

      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push(booking);
    });

    return Object.entries(groups)
      .map(([date, bookings]) => ({ date, bookings }))
      .reverse();
  };

  const formatDate = (dateStr: string): string => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const getStatusBadgeVariant = (status: string): 'success' | 'info' | 'warning' | 'error' => {
    switch (status.toUpperCase()) {
      case 'CONFIRMADA':
        return 'success';
      case 'PENDIENTE':
        return 'warning';
      case 'CANCELADA':
        return 'error';
      default:
        return 'info';
    }
  };

  const bookingGroups = groupBookingsByMonth(bookings);

  return (
    <div className="bookings-page" data-testid="bookings-page">
      <Header />
      <div className="bookings-page__search-bar-wrapper">
        <SearchBar variant="compact" />
      </div>

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

            {loading && <div className="bookings-page__loading">Loading bookings...</div>}

            {error && <div className="bookings-page__error">Error: {error}</div>}

            {!loading && !error && bookings.length === 0 && (
              <div className="bookings-page__empty">
                <p>You have no bookings yet.</p>
              </div>
            )}

            {!loading && !error && bookings.length > 0 && (
              <div className="bookings-page__bookings-list">
                {bookingGroups.map((group, groupIndex) => (
                  <section
                    key={groupIndex}
                    className="bookings-page__booking-group"
                    data-testid={`booking-group-${groupIndex}`}
                  >
                    <div className="bookings-page__group-header">
                      <h2 className="bookings-page__group-date">{group.date}</h2>
                    </div>

                    <div className="bookings-page__group-bookings">
                      {group.bookings.map((booking) => (
                        <div
                          key={booking.id}
                          className="bookings-page__booking-item"
                          data-testid={`booking-item-${booking.id}`}
                        >
                          <div className="booking-card">
                            <div className="booking-card__header">
                              <div className="booking-card__info">
                                <h3 className="booking-card__code">Code: {booking.codigo}</h3>
                                <p className="booking-card__room">Habitación ID: {booking.habitacionId}</p>
                              </div>
                              <Badge
                                label={booking.estado}
                                variant={getStatusBadgeVariant(booking.estado)}
                                dataTestId={`booking-status-${booking.id}`}
                              />
                            </div>

                            <div className="booking-card__dates">
                              <div className="booking-card__date-group">
                                <span className="booking-card__label">Check-in</span>
                                <p>{formatDate(booking.fechaCheckIn)}</p>
                              </div>
                              <div className="booking-card__date-group">
                                <span className="booking-card__label">Check-out</span>
                                <p>{formatDate(booking.fechaCheckOut)}</p>
                              </div>
                              <div className="booking-card__date-group">
                                <span className="booking-card__label">Guests</span>
                                <p>{booking.numHuespedes}</p>
                              </div>
                            </div>

                            <div className="booking-card__price">
                              <div className="booking-card__price-row">
                                <span>Subtotal</span>
                                <span>{formatPrice(booking.subtotal)} {booking.moneda}</span>
                              </div>
                              <div className="booking-card__price-row">
                                <span>Taxes</span>
                                <span>{formatPrice(booking.impuestos)} {booking.moneda}</span>
                              </div>
                              <div className="booking-card__price-row booking-card__price-row--total">
                                <span>Total</span>
                                <span>{formatPrice(booking.total)} {booking.moneda}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
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
