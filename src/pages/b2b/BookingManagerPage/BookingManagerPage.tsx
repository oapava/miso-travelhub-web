import { useState, useEffect } from 'react';
import { B2BHeader, B2BSidebar } from '@/components/layout';
import { DataTable } from '@/components/shared';
import { Button, Input, Select, Pagination } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { bookingService, getHotelIdFromToken, HotelBooking } from '@/services/booking.service';
import './BookingManagerPage.scss';

const ITEMS_PER_PAGE = 10;

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString();
  } catch {
    return dateStr;
  }
}

function calcDaysNights(checkIn: string, checkOut: string): string {
  try {
    const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    const days = Math.round(diff / (1000 * 60 * 60 * 24));
    if (days <= 0) return '—';
    return `${days + 1}/${days}`;
  } catch {
    return '—';
  }
}

function normalizeEstado(estado: string): string {
  return estado.charAt(0).toUpperCase() + estado.slice(1).toLowerCase();
}

function estadoCssModifier(estado: string): string {
  const lower = estado.toLowerCase();
  if (lower === 'confirmado' || lower === 'activo') return 'active';
  if (lower === 'pendiente') return 'pending';
  if (lower === 'cancelado') return 'cancelled';
  return lower;
}

const BookingManagerPage: React.FC = () => {
  const { accessToken, logout } = useAuth();

  const [bookings, setBookings] = useState<HotelBooking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [stateFilter, setStateFilter] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');

  // ── Load bookings on mount ───────────────────────────────────────────────
  useEffect(() => {
    if (!accessToken) return;
    const hotelId = getHotelIdFromToken(accessToken);
    if (!hotelId) return;

    setIsLoading(true);
    setLoadError(null);
    bookingService
      .getHotelBookings(hotelId, accessToken)
      .then((data) => setBookings(data))
      .catch((err: unknown) => {
        setLoadError(err instanceof Error ? err.message : 'Could not load bookings.');
      })
      .finally(() => setIsLoading(false));
  }, [accessToken]);

  // ── Client-side filtering ────────────────────────────────────────────────
  const filtered = bookings.filter((b) => {
    if (stateFilter && b.estado.toLowerCase() !== stateFilter.toLowerCase()) return false;
    if (startDateFilter && b.fechaCheckIn.slice(0, 10) < startDateFilter) return false;
    if (endDateFilter && b.fechaCheckOut.slice(0, 10) > endDateFilter) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleStateFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStateFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDateFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDateFilter(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="booking-manager-page" data-testid="booking-manager-page">
      <B2BHeader breadcrumbText="Travelhub/Booking Manager" dataTestId="booking-manager-header" />

      <div className="booking-manager-page__container">
        <B2BSidebar
          onLogout={logout}
          dataTestId="booking-manager-sidebar"
        />

        <main className="booking-manager-page__main">
          <div className="booking-manager-page__content">
            <h1 className="booking-manager-page__title">
              <strong>Booking Manager</strong>
            </h1>

            <div className="booking-manager-page__filters">
              <Select
                label="State"
                options={[
                  { value: '', label: 'All States' },
                  { value: 'PENDIENTE', label: 'Pending' },
                  { value: 'CONFIRMADO', label: 'Confirmed' },
                  { value: 'CANCELADO', label: 'Cancelled' },
                ]}
                value={stateFilter}
                onChange={handleStateFilterChange}
                dataTestId="booking-manager-state-filter"
              />

              <Input
                label="Start Date"
                type="date"
                value={startDateFilter}
                onChange={handleStartDateChange}
                dataTestId="booking-manager-start-date"
              />

              <Input
                label="End Date"
                type="date"
                value={endDateFilter}
                onChange={handleEndDateChange}
                dataTestId="booking-manager-end-date"
              />
            </div>

            <h3 className="booking-manager-page__subtitle">Last Bookings</h3>

            {isLoading && (
              <p className="booking-manager-page__loading" data-testid="booking-manager-loading">
                Loading bookings…
              </p>
            )}

            {loadError && (
              <p className="booking-manager-page__error" data-testid="booking-manager-error">
                {loadError}
              </p>
            )}

            {!isLoading && !loadError && filtered.length === 0 && (
              <p className="booking-manager-page__empty" data-testid="booking-manager-empty">
                No bookings found.
              </p>
            )}

            {!isLoading && !loadError && filtered.length > 0 && (
              <div className="booking-manager-page__table-wrapper">
                <DataTable
                  columns={[
                    {
                      key: 'viajeroId',
                      header: 'Client',
                      render: (item: HotelBooking) => (
                        <div className="booking-manager-page__client-cell">
                          <div className="booking-manager-page__client-avatar">
                            {item.viajeroId.charAt(0).toUpperCase()}
                          </div>
                          <div className="booking-manager-page__client-info">
                            <span
                              className="booking-manager-page__client-name"
                              data-testid={`booking-client-${item.id}`}
                            >
                              {item.viajeroId.slice(0, 8)}…
                            </span>
                            <span className="booking-manager-page__client-reservation">
                              {item.codigo}
                            </span>
                          </div>
                        </div>
                      ),
                    },
                    {
                      key: 'daysNights',
                      header: 'Days/Nights',
                      render: (item: HotelBooking) => (
                        <span data-testid={`booking-daysnights-${item.id}`}>
                          {calcDaysNights(item.fechaCheckIn, item.fechaCheckOut)}
                        </span>
                      ),
                    },
                    {
                      key: 'numHuespedes',
                      header: 'Guests',
                      render: (item: HotelBooking) => (
                        <span data-testid={`booking-guests-${item.id}`}>
                          {item.numHuespedes}
                        </span>
                      ),
                    },
                    {
                      key: 'fechaCheckIn',
                      header: 'Start',
                      render: (item: HotelBooking) => (
                        <span
                          className="booking-manager-page__date"
                          data-testid={`booking-start-${item.id}`}
                        >
                          {formatDate(item.fechaCheckIn)}
                        </span>
                      ),
                    },
                    {
                      key: 'fechaCheckOut',
                      header: 'End',
                      render: (item: HotelBooking) => (
                        <span
                          className="booking-manager-page__date"
                          data-testid={`booking-end-${item.id}`}
                        >
                          {formatDate(item.fechaCheckOut)}
                        </span>
                      ),
                    },
                    {
                      key: 'estado',
                      header: 'State',
                      render: (item: HotelBooking) => (
                        <span
                          className={`booking-manager-page__state booking-manager-page__state--${estadoCssModifier(item.estado)}`}
                          data-testid={`booking-state-${item.id}`}
                        >
                          {normalizeEstado(item.estado)}
                        </span>
                      ),
                    },
                    {
                      key: 'total',
                      header: 'Total',
                      render: (item: HotelBooking) => (
                        <span data-testid={`booking-total-${item.id}`}>
                          {item.moneda} {item.total.toFixed(2)}
                        </span>
                      ),
                    },
                    {
                      key: 'detail',
                      header: 'Detail',
                      render: () => (
                        <span className="booking-manager-page__action-arrow">→</span>
                      ),
                    },
                  ]}
                  data={paginated}
                  dataTestId="booking-manager-table"
                />
              </div>
            )}

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              dataTestId="booking-manager-pagination"
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default BookingManagerPage;
