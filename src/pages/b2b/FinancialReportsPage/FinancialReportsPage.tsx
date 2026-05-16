import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { B2BHeader, B2BSidebar } from '@/components/layout';
import { useAuth } from '@/context/AuthContext';
import { useCurrency } from '@/context/CurrencyContext';
import { DataTable } from '@/components/shared';
import { Badge, Pagination } from '@/components/ui';
import {
  bookingService,
  getHotelIdFromToken,
  HotelBooking,
} from '@/services/booking.service';
import './FinancialReportsPage.scss';

// ── Constants ─────────────────────────────────────────────────────────────────

export const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
export const MONTHS_FULL  = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

const ROWS_PER_PAGE   = 10;
const CHART_MONTHS    = 6;
const COMMISSION_RATE = 0.1;

// ── Helpers ───────────────────────────────────────────────────────────────────

export function formatMoney(amount: number, moneda?: string): string {
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
  return moneda ? `${moneda} ${formatted}` : `$${formatted}`;
}

export function isCancelled(estado: string): boolean {
  const s = estado.toLowerCase();
  return s === 'cancelado' || s === 'cancelada';
}

export function isConfirmed(estado: string): boolean {
  const s = estado.toLowerCase();
  return (
    s === 'confirmado' || s === 'confirmada' ||
    s === 'activo'     || s === 'active'     ||
    s === 'pagado'     || s === 'pagada'
  );
}

export function isPaidStatus(estado: string): boolean {
  const s = estado.toLowerCase();
  return s === 'pagado' || s === 'pagada';
}

export function isInMonth(dateStr: string, month: number, year: number): boolean {
  const d = new Date(dateStr);
  return d.getMonth() === month && d.getFullYear() === year;
}

function isInDateRange(dateStr: string, start: string, end: string): boolean {
  if (!start && !end) return true;
  const d = new Date(dateStr).getTime();
  if (start && d < new Date(start).getTime()) return false;
  if (end   && d > new Date(end + 'T23:59:59').getTime()) return false;
  return true;
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ReportRow {
  id: string;
  fecha: string;
  bookingNumber: string;
  guest: string;
  amount: number;
  subtotal: number;
  taxes: number;
  status: string;
  paymentMethod: string;
  moneda: string;
}

interface RoomRow {
  id: string;
  place: string;
  reservations: number;
  sales: number;
  commissions: number;
  payoutStatus: 'Paid' | 'Pending';
}

// ── Data builders ─────────────────────────────────────────────────────────────

export function buildReportRows(
  bookings: HotelBooking[],
  month: number,
  year: number,
): ReportRow[] {
  return bookings
    .filter(b => isConfirmed(b.estado) && isInMonth(b.fechaCheckIn, month, year))
    .sort((a, b) => new Date(a.fechaCheckIn).getTime() - new Date(b.fechaCheckIn).getTime())
    .map(b => ({
      id:            b.id,
      fecha:         b.fechaCheckIn.split('T')[0],
      bookingNumber: b.codigo,
      guest:         b.nombreUser || `Guest ${b.viajeroId.substring(0, 8)}`,
      amount:        b.total,
      subtotal:      b.subtotal,
      taxes:         b.impuestos,
      status:        b.estado,
      paymentMethod: b.metodoPago ?? '—',
      moneda:        b.moneda,
    }));
}

function buildRoomRows(
  bookings: HotelBooking[],
  start: string,
  end: string,
): RoomRow[] {
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
    const sales   = rows.reduce((s, b) => s + (b.total || 0), 0);
    const anyPaid = rows.some(b => isPaidStatus(b.estado));
    return {
      id:            key,
      place:         key,
      reservations:  rows.length,
      sales,
      commissions:   Math.round(sales * COMMISSION_RATE),
      payoutStatus:  anyPaid ? 'Paid' : 'Pending',
    };
  });
}

function buildMonthlyIncome(
  bookings: HotelBooking[],
): { month: string; value: number }[] {
  const now = new Date();
  return Array.from({ length: CHART_MONTHS }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (CHART_MONTHS - 1 - i), 1);
    const m = d.getMonth();
    const y = d.getFullYear();
    const value = bookings
      .filter(b => {
        const bd = new Date(b.fechaCheckIn);
        return bd.getMonth() === m && bd.getFullYear() === y && !isCancelled(b.estado);
      })
      .reduce((sum, b) => sum + (b.total || 0), 0);
    return { month: MONTHS_SHORT[m] ?? '', value };
  });
}

export function exportToCSV(
  rows: ReportRow[],
  totals: { gross: number; taxes: number; net: number },
  month: number,
  year: number,
): void {
  const monthLabel = MONTHS_FULL[month] ?? String(month + 1);
  const headers    = [
    'Date', 'Booking #', 'Guest', 'Amount', 'Subtotal', 'Taxes', 'Status', 'Payment Method',
  ];
  const dataLines = rows.map(r =>
    [
      r.fecha,
      `"${r.bookingNumber}"`,
      `"${r.guest}"`,
      r.amount.toFixed(2),
      r.subtotal.toFixed(2),
      r.taxes.toFixed(2),
      r.status,
      r.paymentMethod,
    ].join(','),
  );
  const summaryLines = [
    '',
    `"Period:","${monthLabel} ${year}"`,
    `"Gross Income:",,,,${totals.gross.toFixed(2)},,,`,
    `"Taxes:",,,,${totals.taxes.toFixed(2)},,,`,
    `"Net Income:",,,,${totals.net.toFixed(2)},,,`,
  ];
  const csv  = [headers.join(','), ...dataLines, ...summaryLines].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href     = url;
  link.download = `financial-report-${year}-${String(month + 1).padStart(2, '0')}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ── Component ─────────────────────────────────────────────────────────────────

const FinancialReportsPage: React.FC = () => {
  const { logout, accessToken, user } = useAuth();
  const { currency }  = useCurrency();
  const { t }         = useTranslation();

  const now          = new Date();
  const currentYear  = now.getFullYear();
  const years        = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1];

  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear,  setSelectedYear]  = useState(currentYear);
  const [bookings,      setBookings]      = useState<HotelBooking[]>([]);
  const [isLoading,     setIsLoading]     = useState(true);
  const [loadError,     setLoadError]     = useState<string | null>(null);
  const [reportPage,    setReportPage]    = useState(1);
  const [roomPage,      setRoomPage]      = useState(1);

  // Date range derived from month+year (used by room aggregation + chart)
  const monthStart = useMemo(() => {
    return `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-01`;
  }, [selectedMonth, selectedYear]);

  const monthEnd = useMemo(() => {
    const lastDay = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    return `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  }, [selectedMonth, selectedYear]);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!accessToken) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setLoadError(null);

    const hotelId = getHotelIdFromToken(accessToken);
    const request = hotelId
      ? bookingService.getHotelBookings(hotelId, accessToken, currency)
      : bookingService.getMyBookings(accessToken, { moneda: currency });

    request
      .then(data => setBookings(data as HotelBooking[]))
      .catch(err =>
        setLoadError(err instanceof Error ? err.message : t('b2b.financial.couldNotLoad')),
      )
      .finally(() => setIsLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, currency]);

  // ── Derived data ───────────────────────────────────────────────────────────

  // Monthly transactions (confirmed + paid only) — primary report
  const reportRows = useMemo(
    () => buildReportRows(bookings, selectedMonth, selectedYear),
    [bookings, selectedMonth, selectedYear],
  );

  const grossIncome  = reportRows.reduce((s, r) => s + r.amount,  0);
  const totalTaxes   = reportRows.reduce((s, r) => s + r.taxes,   0);
  const netIncome    = grossIncome - totalTaxes;

  const reportTotalPages = Math.max(1, Math.ceil(reportRows.length / ROWS_PER_PAGE));
  const pagedReportRows  = reportRows.slice(
    (reportPage - 1) * ROWS_PER_PAGE,
    reportPage * ROWS_PER_PAGE,
  );

  // Room aggregation table (secondary)
  const roomRows       = buildRoomRows(bookings, monthStart, monthEnd);
  const roomTotalPages = Math.max(1, Math.ceil(roomRows.length / ROWS_PER_PAGE));
  const pagedRoomRows  = roomRows.slice(
    (roomPage - 1) * ROWS_PER_PAGE,
    roomPage * ROWS_PER_PAGE,
  );

  // Occupation (secondary)
  const filteredBookings  = bookings.filter(b => isInDateRange(b.fechaCheckIn, monthStart, monthEnd));
  const confirmedFiltered = filteredBookings.filter(b => isConfirmed(b.estado));
  const occupationPct     = filteredBookings.length > 0
    ? Math.round((confirmedFiltered.length / filteredBookings.length) * 100)
    : 0;

  // 6-month income chart (secondary)
  const monthlyData = buildMonthlyIncome(bookings);
  const maxIncome   = Math.max(...monthlyData.map(d => d.value), 1);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(Number(e.target.value));
    setReportPage(1);
    setRoomPage(1);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(Number(e.target.value));
    setReportPage(1);
    setRoomPage(1);
  };

  const handleDownload = () =>
    exportToCSV(
      reportRows,
      { gross: grossIncome, taxes: totalTaxes, net: netIncome },
      selectedMonth,
      selectedYear,
    );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="financial-reports-page" data-testid="financial-reports-page">
      <B2BHeader breadcrumbText="Travelhub/Financial Reports" dataTestId="financial-reports-header" />

      <div className="financial-reports-page__container">
        <B2BSidebar
          onLogout={logout}
          userEmail={user?.email}
          userRole={user?.rol}
          dataTestId="financial-reports-sidebar"
        />

        <main className="financial-reports-page__main" tabIndex={0}>
          <div className="financial-reports-page__content">

            {/* ── Page header ── */}
            <div className="financial-reports-page__header">
              <h1 className="financial-reports-page__title">
                <strong>{t('b2b.financial.title')}</strong>
              </h1>

              <div className="financial-reports-page__controls">
                {/* Month + Year selectors */}
                <div
                  className="financial-reports-page__month-year-filters"
                  data-testid="financial-reports-month-year-filters"
                >
                  <label className="financial-reports-page__select-label">
                    <span>{t('b2b.financial.monthly.selectMonth')}</span>
                    <select
                      className="financial-reports-page__select"
                      value={selectedMonth}
                      onChange={handleMonthChange}
                      data-testid="financial-reports-month-select"
                    >
                      {MONTHS_FULL.map((m, i) => (
                        <option key={i} value={i}>{m}</option>
                      ))}
                    </select>
                  </label>

                  <label className="financial-reports-page__select-label">
                    <span>{t('b2b.financial.monthly.selectYear')}</span>
                    <select
                      className="financial-reports-page__select"
                      value={selectedYear}
                      onChange={handleYearChange}
                      data-testid="financial-reports-year-select"
                    >
                      {years.map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <button
                  className="financial-reports-page__download-btn"
                  onClick={handleDownload}
                  data-testid="financial-reports-download-btn"
                  disabled={isLoading || reportRows.length === 0}
                  type="button"
                >
                  {t('b2b.financial.downloadCsv')}
                </button>
              </div>
            </div>

            {loadError && (
              <p
                className="financial-reports-page__error"
                data-testid="financial-reports-error"
              >
                {loadError}
              </p>
            )}

            {/* ── Totals row (gross / taxes / net) ── */}
            <div
              className="financial-reports-page__totals"
              data-testid="financial-reports-totals"
            >
              <div
                className="financial-reports-page__total-card"
                data-testid="financial-reports-gross"
              >
                <span className="financial-reports-page__total-label">
                  {t('b2b.financial.monthly.grossIncome')}
                </span>
                <span
                  className="financial-reports-page__total-value"
                  data-testid="financial-reports-gross-value"
                >
                  {isLoading ? '…' : formatMoney(grossIncome)}
                </span>
                <span className="financial-reports-page__total-sub">
                  {reportRows.length} {reportRows.length === 1 ? 'booking' : 'bookings'}
                </span>
              </div>

              <div
                className="financial-reports-page__total-card"
                data-testid="financial-reports-taxes"
              >
                <span className="financial-reports-page__total-label">
                  {t('b2b.financial.monthly.taxes')}
                </span>
                <span
                  className="financial-reports-page__total-value"
                  data-testid="financial-reports-taxes-value"
                >
                  {isLoading ? '…' : formatMoney(totalTaxes)}
                </span>
              </div>

              <div
                className="financial-reports-page__total-card financial-reports-page__total-card--net"
                data-testid="financial-reports-net"
              >
                <span className="financial-reports-page__total-label">
                  {t('b2b.financial.monthly.netIncome')}
                </span>
                <span
                  className="financial-reports-page__total-value financial-reports-page__total-value--net"
                  data-testid="financial-reports-net-value"
                >
                  {isLoading ? '…' : formatMoney(netIncome)}
                </span>
              </div>
            </div>

            {/* ── Monthly transactions table ── */}
            <h3
              className="financial-reports-page__subtitle"
              data-testid="financial-reports-report-title"
            >
              {`${MONTHS_FULL[selectedMonth]} ${selectedYear}`}
              {' — '}
              {t('b2b.financial.monthly.reportTitle')}
            </h3>

            <div className="financial-reports-page__table-wrapper">
              <DataTable
                columns={[
                  { key: 'fecha',         header: t('b2b.financial.monthly.colDate') },
                  { key: 'bookingNumber', header: t('b2b.financial.monthly.colBookingNumber') },
                  { key: 'guest',         header: t('b2b.financial.monthly.colGuest') },
                  {
                    key: 'amount',
                    header: t('b2b.financial.monthly.colAmount'),
                    render: (item: ReportRow) => formatMoney(item.amount, item.moneda),
                  },
                  {
                    key: 'status',
                    header: t('b2b.financial.monthly.colStatus'),
                    render: (item: ReportRow) => (
                      <Badge
                        label={item.status}
                        variant={isPaidStatus(item.status) ? 'success' : 'primary'}
                        dataTestId={`financial-reports-status-${item.id}`}
                      />
                    ),
                  },
                  { key: 'paymentMethod', header: t('b2b.financial.monthly.colPaymentMethod') },
                ]}
                data={pagedReportRows}
                emptyMessage={
                  isLoading
                    ? t('b2b.financial.loadingData')
                    : t('b2b.financial.monthly.noReportData')
                }
                dataTestId="financial-reports-report-table"
              />
            </div>

            <Pagination
              currentPage={reportPage}
              totalPages={reportTotalPages}
              onPageChange={setReportPage}
              dataTestId="financial-reports-report-pagination"
            />

            {/* ── Secondary: income chart + occupation ── */}
            <div className="financial-reports-page__summary">

              <div
                className="financial-reports-page__income-graphic"
                data-testid="financial-reports-income-chart"
              >
                <h4 className="financial-reports-page__income-title">
                  {t('b2b.financial.incomeGraphic')}
                </h4>
                <div
                  className="financial-reports-page__bar-chart"
                  aria-label={t('b2b.dashboard.monthlyIncomeChart')}
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

              <div className="financial-reports-page__occupation-summary">
                <h4 className="financial-reports-page__occupation-title">
                  {t('b2b.financial.totalOccupation')}
                </h4>
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

            {/* ── Secondary: room aggregation table ── */}
            <h3 className="financial-reports-page__subtitle">
              {t('b2b.financial.bookingPlacesTable')}
            </h3>

            <div className="financial-reports-page__table-wrapper">
              <DataTable
                columns={[
                  { key: 'place',        header: t('b2b.financial.colPlace') },
                  { key: 'reservations', header: t('b2b.financial.colTotalReservations') },
                  {
                    key: 'sales',
                    header: t('b2b.financial.colSales'),
                    render: (item: RoomRow) => `$${formatMoney(item.sales)}`,
                  },
                  {
                    key: 'commissions',
                    header: t('b2b.financial.colCommissions'),
                    render: (item: RoomRow) => `$${formatMoney(item.commissions)}`,
                  },
                  {
                    key: 'payoutStatus',
                    header: t('b2b.financial.colPayoutStatus'),
                    render: (item: RoomRow) => (
                      <Badge
                        label={item.payoutStatus}
                        variant={item.payoutStatus === 'Paid' ? 'success' : 'warning'}
                        dataTestId="financial-reports-payout-badge"
                      />
                    ),
                  },
                ]}
                data={pagedRoomRows}
                emptyMessage={isLoading ? t('b2b.financial.loadingData') : t('b2b.financial.noData')}
                dataTestId="financial-reports-table"
              />
            </div>

            <Pagination
              currentPage={roomPage}
              totalPages={roomTotalPages}
              onPageChange={setRoomPage}
              dataTestId="financial-reports-pagination"
            />

          </div>
        </main>
      </div>
    </div>
  );
};

export default FinancialReportsPage;
