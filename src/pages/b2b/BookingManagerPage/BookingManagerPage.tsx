import { useState, useEffect } from 'react';
import { B2BHeader, B2BSidebar } from '@/components/layout';
import { DataTable } from '@/components/shared';
import BookingDetailModal from '@/components/shared/BookingDetailModal/BookingDetailModal';
import BookingConfirmActionModal from '@/components/shared/BookingConfirmActionModal/BookingConfirmActionModal';
import BookingCancelModal from '@/components/shared/BookingCancelModal/BookingCancelModal';
import { Input, Select, Pagination, Button } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import {
  bookingService,
  getHotelIdFromToken,
  HotelBooking,
} from '@/services/booking.service';
import './BookingManagerPage.scss';

const ITEMS_PER_PAGE = 10;

function formatDateDDMMYY(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = String(d.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
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
  if (lower === 'confirmado' || lower === 'confirmada' || lower === 'activo' || lower === 'active') return 'active';
  if (lower === 'pendiente') return 'pending';
  if (lower === 'cancelado' || lower === 'cancelada') return 'cancelled';
  return lower;
}

const BookingManagerPage: React.FC = () => {
  const { accessToken, logout } = useAuth();

  const [bookings, setBookings] = useState<HotelBooking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Pagination & filters
  const [currentPage, setCurrentPage] = useState(1);
  const [clientFilter, setClientFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');

  // Modal state
  const [selectedBooking, setSelectedBooking] = useState<HotelBooking | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);

  // Action state (confirm / cancel API calls)
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // ── Load bookings on mount ───────────────────────────────────────────────
  useEffect(() => {
    if (!accessToken) return;

    setIsLoading(true);
    setLoadError(null);

    const hotelId = getHotelIdFromToken(accessToken);

    // Use hotel-specific endpoint when hotel_id is present in the JWT,
    // otherwise fall back to the traveler endpoint (development / tokens
    // without a hotel_id claim).
    const request = hotelId
      ? bookingService.getHotelBookings(hotelId, accessToken)
      : bookingService.getMyBookings(accessToken);

    request
      .then((data) => setBookings(data as HotelBooking[]))
      .catch((err: unknown) => {
        setLoadError(err instanceof Error ? err.message : 'Could not load bookings.');
      })
      .finally(() => setIsLoading(false));
  }, [accessToken]);

  // ── Client-side filtering ────────────────────────────────────────────────
  const filtered = bookings.filter((b) => {
    if (clientFilter) {
      const haystack = `${b.nombreUser ?? ''} ${b.viajeroId ?? ''} ${b.codigo ?? ''}`.toLowerCase();
      if (!haystack.includes(clientFilter.toLowerCase())) return false;
    }
    if (stateFilter && (b.estado ?? '').toLowerCase() !== stateFilter.toLowerCase()) return false;
    if (startDateFilter && (b.fechaCheckIn ?? '').slice(0, 10) < startDateFilter) return false;
    if (endDateFilter && (b.fechaCheckOut ?? '').slice(0, 10) > endDateFilter) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  // ── Modal helpers ────────────────────────────────────────────────────────
  const openDetail = (booking: HotelBooking) => {
    setSelectedBooking(booking);
    setActionError(null);
    setIsDetailOpen(true);
  };

  const openCancel = (booking: HotelBooking) => {
    setSelectedBooking(booking);
    setActionError(null);
    setIsDetailOpen(false);
    setIsCancelOpen(true);
  };

  const closeAll = () => {
    setIsDetailOpen(false);
    setIsConfirmOpen(false);
    setIsCancelOpen(false);
  };

  // ── API actions ───────────────────────────────────────────────────────────

  /** PATCH the booking to CONFIRMADA, then show the success receipt modal. */
  const handleConfirmBooking = async (booking: HotelBooking) => {
    if (!accessToken) return;
    setIsActionLoading(true);
    setActionError(null);
    try {
      await bookingService.updateBooking(booking.id, 'CONFIRMADA', accessToken);
      // Optimistic update — reflect new state in the table immediately
      setBookings((prev) =>
        prev.map((b) => (b.id === booking.id ? { ...b, estado: 'CONFIRMADO' } : b)),
      );
      setSelectedBooking({ ...booking, estado: 'CONFIRMADO' });
      setIsDetailOpen(false);
      setIsCancelOpen(false);
      setIsConfirmOpen(true);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not confirm booking.');
    } finally {
      setIsActionLoading(false);
    }
  };

  /** PATCH the booking to CANCELADA, then close all modals. */
  const handleCancelBooking = async () => {
    if (!accessToken || !selectedBooking) return;
    setIsActionLoading(true);
    setActionError(null);
    try {
      await bookingService.updateBooking(selectedBooking.id, 'CANCELADA', accessToken);
      setBookings((prev) =>
        prev.map((b) => (b.id === selectedBooking.id ? { ...b, estado: 'CANCELADO' } : b)),
      );
      closeAll();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not cancel booking.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const detailClientName = selectedBooking
    ? (selectedBooking.nombreUser ?? selectedBooking.viajeroId ?? selectedBooking.codigo ?? '—')
    : undefined;

  const detailHotelName = selectedBooking
    ? (selectedBooking.nombreHabitacion ?? selectedBooking.habitacionId ?? '—')
    : undefined;

  return (
    <div className="booking-manager-page" data-testid="booking-manager-page">
      <B2BHeader breadcrumbText="Travelhub/Booking Manager" dataTestId="booking-manager-header" />

      <div className="booking-manager-page__container">
        <B2BSidebar onLogout={logout} dataTestId="booking-manager-sidebar" />

        <main className="booking-manager-page__main">
          <div className="booking-manager-page__content">

            {/* ── Page header: title + filters ── */}
            <div className="booking-manager-page__page-header">
              <h1 className="booking-manager-page__title">
                <strong>Booking Manager</strong>
              </h1>

              <div className="booking-manager-page__filters">
                <Input
                  label=""
                  placeholder="Client"
                  value={clientFilter}
                  onChange={(e) => { setClientFilter(e.target.value); setCurrentPage(1); }}
                  dataTestId="booking-manager-client-filter"
                />

                <Select
                  label=""
                  options={[
                    { value: '', label: 'State' },
                    { value: 'PENDIENTE', label: 'Pending' },
                    { value: 'CONFIRMADO', label: 'Confirmed' },
                    { value: 'CANCELADO', label: 'Cancelled' },
                  ]}
                  value={stateFilter}
                  onChange={(e) => { setStateFilter(e.target.value); setCurrentPage(1); }}
                  dataTestId="booking-manager-state-filter"
                />

                <Input
                  label=""
                  type="date"
                  value={startDateFilter}
                  onChange={(e) => { setStartDateFilter(e.target.value); setCurrentPage(1); }}
                  dataTestId="booking-manager-start-date"
                />

                <Input
                  label=""
                  type="date"
                  value={endDateFilter}
                  onChange={(e) => { setEndDateFilter(e.target.value); setCurrentPage(1); }}
                  dataTestId="booking-manager-end-date"
                />
              </div>
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

            {actionError && (
              <p className="booking-manager-page__error" data-testid="booking-manager-action-error">
                {actionError}
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
                    // Client
                    {
                      key: 'viajeroId',
                      header: 'Client',
                      render: (item: HotelBooking) => {
                        const clientId = item.nombreUser ?? item.viajeroId ?? item.codigo ?? '—';
                        const initial  = clientId.charAt(0).toUpperCase();
                        const label    = clientId.length > 8
                          ? `${clientId.slice(0, 8)}…`
                          : clientId;
                        return (
                          <div className="booking-manager-page__client-cell">
                            <div className="booking-manager-page__client-avatar">
                              {initial}
                            </div>
                            <div className="booking-manager-page__client-info">
                              <span
                                className="booking-manager-page__client-name"
                                data-testid={`booking-client-${item.id}`}
                              >
                                {label}
                              </span>
                              <span className="booking-manager-page__client-reservation">
                                {item.codigo ?? '—'}
                              </span>
                            </div>
                          </div>
                        );
                      },
                    },
                    // Days/Nights
                    {
                      key: 'daysNights',
                      header: 'Days/Nights',
                      render: (item: HotelBooking) => (
                        <span data-testid={`booking-daysnights-${item.id}`}>
                          {calcDaysNights(item.fechaCheckIn, item.fechaCheckOut)}
                        </span>
                      ),
                    },
                    // Guests
                    {
                      key: 'numHuespedes',
                      header: 'Guests',
                      render: (item: HotelBooking) => (
                        <span data-testid={`booking-guests-${item.id}`}>
                          {item.numHuespedes}
                        </span>
                      ),
                    },
                    // Start date
                    {
                      key: 'fechaCheckIn',
                      header: 'Start',
                      render: (item: HotelBooking) => (
                        <span
                          className="booking-manager-page__date"
                          data-testid={`booking-start-${item.id}`}
                        >
                          {formatDateDDMMYY(item.fechaCheckIn)}
                        </span>
                      ),
                    },
                    // End date
                    {
                      key: 'fechaCheckOut',
                      header: 'End',
                      render: (item: HotelBooking) => (
                        <span
                          className="booking-manager-page__date"
                          data-testid={`booking-end-${item.id}`}
                        >
                          {formatDateDDMMYY(item.fechaCheckOut)}
                        </span>
                      ),
                    },
                    // State
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
                    // Confirm action
                    {
                      key: 'confirm',
                      header: 'Confirm',
                      render: (item: HotelBooking) => (
                        <Button
                          variant="primary"
                          size="small"
                          onClick={() => void handleConfirmBooking(item)}
                          disabled={isActionLoading}
                          dataTestId={`booking-confirm-btn-${item.id}`}
                        >
                          CONFIRM
                        </Button>
                      ),
                    },
                    // Cancel action
                    {
                      key: 'cancel',
                      header: 'Cancel',
                      render: (item: HotelBooking) => (
                        <Button
                          variant="primary"
                          size="small"
                          className="booking-manager-page__cancel-btn"
                          onClick={() => openCancel(item)}
                          dataTestId={`booking-cancel-btn-${item.id}`}
                        >
                          CANCEL
                        </Button>
                      ),
                    },
                    // Detail
                    {
                      key: 'detail',
                      header: 'Detail',
                      render: (item: HotelBooking) => (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openDetail(item)}
                          dataTestId={`booking-detail-btn-${item.id}`}
                        >
                          →
                        </Button>
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

      {/* ── Modals ── */}
      <BookingDetailModal
        isOpen={isDetailOpen}
        onClose={closeAll}
        onConfirm={() => selectedBooking && void handleConfirmBooking(selectedBooking)}
        onCancel={() => selectedBooking && openCancel(selectedBooking)}
        booking={selectedBooking ?? undefined}
        dataTestId="booking-detail-modal"
      />

      <BookingConfirmActionModal
        isOpen={isConfirmOpen}
        onClose={closeAll}
        clientName={detailClientName}
        hotelName={detailHotelName}
        dataTestId="booking-confirm-action-modal"
      />

      <BookingCancelModal
        isOpen={isCancelOpen}
        onClose={closeAll}
        onConfirm={() => void handleCancelBooking()}
        clientName={detailClientName}
        hotelName={detailHotelName}
        dataTestId="booking-cancel-modal"
      />
    </div>
  );
};

export default BookingManagerPage;
