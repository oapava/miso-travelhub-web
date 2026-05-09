import { useState, useEffect } from 'react';
import { B2BHeader, B2BSidebar } from '@/components/layout';
import { useAuth } from '@/context/AuthContext';
import { DataTable, StatCard } from '@/components/shared';
import { Badge, Input, Pagination } from '@/components/ui';
import {
  bookingService,
  getHotelIdFromToken,
  HotelBooking,
} from '@/services/booking.service';
import './FinancialReportsPage.scss';

// ── Local helpers ─────────────────────────────────────────────────────────────

const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const ROWS_PER_PAGE = 5;

function formatMoney(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

function isCancelled(estado: string) {
  const s = estado.toLowerCase();
  return s === 'cancelado' || s === 'cancelada';
}

function isConfirmed(estado: string) {
  const s = estado.toLowerCase();
  return s === 'confirmado' || s === 'confirmada' || s === 'activo' || s === 'active';
}

function isInDateRange(dateStr: string, start: string, end: string): boolean {
  if (!start && !end) return true;
  const d = new Date(dateStr).getTime();
  if (start && d < new Date(start).getTime()) return false;
  if (end && d > new Date(end + 'T23:59:59').getTime()) return false;
  return true;
}

interface RoomRow {
  id: string;
  place: string;
  reservations: number;
  sales: number;
  commissions: number;
  payoutStatus: 'Paid' | 'Pending';
}

function buildRoomRows(bookings: HotelBooking[], start: string, end: string): RoomRow[] {
  const filtered = bookings.filter(
    b => !isCancelled(b.estado) && isInDateRange(b.fechaCheckIn, start, end),
  );
  const map = new Map<string, HotelBooking[]>();
  for (const b of filtered) {
    const key = b.nombreHabitacion || b.habitacionId || '—';
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(b);
  }
  return Array.from(map.entries()).map(([key, rows]) => {
    const sales = rows.reduce((s, b) => s + (b.total || 0), 0);
    const allConfirmed = rows.every(b => isConfirmed(b.estado));
    return {
      id: key,
      place: key,
      reservations: rows.length,
      sales,
      commissions: Math.round(sales * 0.1),
      payoutStatus: allConfirmed ? 'Paid' : 'Pending',
    };
  });
}

function buildMonthlyIncome(
  bookings: HotelBooking[],
  start: string,
  end: string,
): { month: string; value: number }[] {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const m = d.getMonth();
    const y = d.getFullYear();
    const value = bookings
      .filter(b => {
        const bd = new Date(b.fechaCheckIn);
        return (
          bd.getMonth() === m &&
          bd.getFullYear() === y &&
          !isCancelled(b.estado) &&
          isInDateRange(b.fechaCheckIn, start, end)
        );
      })
      .reduce((sum, b) => sum + (b.total || 0), 0);
    return { month: MONTHS_SHORT[m] ?? '', value };
  });
}

function exportToCSV(
  rows: RoomRow[],
  totalIncome: number,
  startDate: string,
  endDate: string,
) {
  const headers = ['Place', 'Total Reservations', 'Sales (USD)', 'Commissions (USD)', 'Payout Status'];
  const dataLines = rows.map(r =>
    [
      `"${r.place}"`,
      r.reservations,
      r.sales.toFixed(2),
      r.commissions.toFixed(2),
      r.payoutStatus,
    ].join(','),
  );
  const periodLine = startDate
    ? `"Period:","${startDate} - ${endDate || 'present'}"`
    : '"Period:","All time"';
  const totalLine = `"Total Income:",,,,"$${totalIncome.toFixed(2)}"`;

  const csv = [headers.join(','), ...dataLines, '', periodLine, totalLine].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href  = url;
  const suffix = startDate ? `${startDate}_${endDate || 'present'}` : 'all';
  link.download = `financial-report-${suffix}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ── Component ─────────────────────────────────────────────────────────────────

const FinancialReportsPage: React.FC = () => {
  const { logout, accessToken } = useAuth();
  const [bookings, setBookings]     = useState<HotelBooking[]>([]);
  const [isLoading, setIsLoading]   = useState(false);
  const [loadError, setLoadError]   = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate]   = useState('');
  const [endDate, setEndDate]       = useState('');

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!accessToken) return;
    setIsLoading(true);
    setLoadError(null);

    const hotelId = getHotelIdFromToken(accessToken);
    const request = hotelId
      ? bookingService.getHotelBookings(hotelId, accessToken)
      : bookingService.getMyBookings(accessToken);

    request
      .then(data => setBookings(data as HotelBooking[]))
      .catch(err => setLoadError(err instanceof Error ? err.message : 'Could not load data.'))
      .finally(() => setIsLoading(false));
  }, [accessToken]);

  // ── Derived metrics ────────────────────────────────────────────────────────
  const filteredBookings     = bookings.filter(b => isInDateRange(b.fechaCheckIn, startDate, endDate));
  const nonCancelledFiltered = filteredBookings.filter(b => !isCancelled(b.estado));
  const confirmedFiltered    = filteredBookings.filter(b => isConfirmed(b.estado));
  const totalIncome          = nonCancelledFiltered.reduce((s, b) => s + (b.total || 0), 0);
  const occupationPct        = filteredBookings.length > 0
    ? Math.round((confirmedFiltered.length / filteredBookings.length) * 100)
    : 0;

  const roomRows   = buildRoomRows(bookings, startDate, endDate);
  const totalPages = Math.max(1, Math.ceil(roomRows.length / ROWS_PER_PAGE));
  const pagedRows  = roomRows.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE);

  const monthlyData = buildMonthlyIncome(bookings, startDate, endDate);
  const maxIncome   = Math.max(...monthlyData.map(d => d.value), 1);

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value);
    setCurrentPage(1);
  };
  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
    setCurrentPage(1);
  };

  const handleDownload = () => exportToCSV(roomRows, totalIncome, startDate, endDate);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="financial-reports-page" data-testid="financial-reports-page">
      <B2BHeader breadcrumbText="Travelhub/Financial Reports" dataTestId="financial-reports-header" />

      <div className="financial-reports-page__container">
        <B2BSidebar onLogout={logout} dataTestId="financial-reports-sidebar" />

        <main className="financial-reports-page__main" tabIndex={0}>
          <div className="financial-reports-page__content">

            {/* ── Page header ── */}
            <div className="financial-reports-page__header">
              <h1 className="financial-reports-page__title">
                <strong>Financial Reports</strong>
              </h1>

              <div className="financial-reports-page__controls">
                <div className="financial-reports-page__date-filters">
                  <Input
                    label="Start Date"
                    type="date"
                    value={startDate}
                    onChange={handleStartDateChange}
                    dataTestId="financial-reports-start-date"
                  />
                  <Input
                    label="End Date"
                    type="date"
                    value={endDate}
                    onChange={handleEndDateChange}
                    dataTestId="financial-reports-end-date"
                  />
                </div>

                <button
                  className="financial-reports-page__download-btn"
                  onClick={handleDownload}
                  data-testid="financial-reports-download-btn"
                  disabled={isLoading}
                  type="button"
                >
                  ↓ Download CSV
                </button>
              </div>
            </div>

            {loadError && (
              <p className="financial-reports-page__error" data-testid="financial-reports-error">
                {loadError}
              </p>
            )}

            {/* ── Summary row ── */}
            <div className="financial-reports-page__summary">

              <StatCard
                title="Total Income"
                mainValue={isLoading ? '…' : `$${formatMoney(totalIncome)}`}
                subtitle={`${nonCancelledFiltered.length} bookings`}
                showChart
                dataTestId="financial-reports-total-income"
              />

              {/* Income graphic */}
              <div
                className="financial-reports-page__income-graphic"
                data-testid="financial-reports-income-chart"
              >
                <h4 className="financial-reports-page__income-title">Income Graphic</h4>
                <div
                  className="financial-reports-page__bar-chart"
                  aria-label="Monthly income bar chart"
                >
                  {monthlyData.map(({ month, value }) => (
                    <div key={month} className="financial-reports-page__bar-col">
                      {value > 0 && (
                        <span className="financial-reports-page__bar-value">
                          ${formatMoney(value)}
                        </span>
                      )}
                      <div className="financial-reports-page__bar-spacer">
                        <div
                          className="financial-reports-page__bar"
                          style={{ height: `${Math.max(4, (value / maxIncome) * 100)}%` }}
                        />
                      </div>
                      <span className="financial-reports-page__bar-label">{month}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Occupation */}
              <div className="financial-reports-page__occupation-summary">
                <h4 className="financial-reports-page__occupation-title">Total Occupation</h4>
                <div className="financial-reports-page__occupation-content">
                  <span
                    className="financial-reports-page__occupation-percent"
                    data-testid="financial-reports-occupation-pct"
                  >
                    {occupationPct}%
                  </span>
                  <div className="financial-reports-page__occupation-bar">
                    <div
                      className="financial-reports-page__occupation-fill"
                      style={{ width: `${occupationPct}%` }}
                    />
                  </div>
                  <span className="financial-reports-page__occupation-label">
                    {confirmedFiltered.length} confirmed / {filteredBookings.length} total
                  </span>
                </div>
              </div>

            </div>

            {/* ── Booking places table ── */}
            <h3 className="financial-reports-page__subtitle">Booking places table</h3>

            <div className="financial-reports-page__table-wrapper">
              <DataTable
                columns={[
                  { key: 'place', header: 'Place' },
                  { key: 'reservations', header: 'Total reservations' },
                  {
                    key: 'sales',
                    header: 'Sales',
                    render: (item: RoomRow) => `$${formatMoney(item.sales)}`,
                  },
                  {
                    key: 'commissions',
                    header: 'Commissions',
                    render: (item: RoomRow) => `$${formatMoney(item.commissions)}`,
                  },
                  {
                    key: 'payoutStatus',
                    header: 'Payout Status',
                    render: (item: RoomRow) => (
                      <Badge
                        label={item.payoutStatus}
                        variant={item.payoutStatus === 'Paid' ? 'success' : 'warning'}
                        dataTestId="financial-reports-payout-badge"
                      />
                    ),
                  },
                ]}
                data={pagedRows}
                emptyMessage={isLoading ? 'Loading data…' : 'No financial data for the selected period.'}
                dataTestId="financial-reports-table"
              />
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              dataTestId="financial-reports-pagination"
            />

          </div>
        </main>
      </div>
    </div>
  );
};

export default FinancialReportsPage;
