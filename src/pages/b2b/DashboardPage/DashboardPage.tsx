import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { B2BHeader, B2BSidebar } from '@/components/layout';
import { StatCard, DataTable } from '@/components/shared';
import { useAuth } from '@/context/AuthContext';
import { useCurrency } from '@/context/CurrencyContext';
import {
  bookingService,
  getHotelIdFromToken,
  HotelBooking,
} from '@/services/booking.service';
import './DashboardPage.scss';

// ── Local helpers ─────────────────────────────────────────────────────────────

function formatDateDDMMYY(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const day   = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year  = String(d.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
  } catch { return dateStr; }
}

function calcDaysNights(checkIn: string, checkOut: string): string {
  try {
    const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    const days = Math.round(diff / (1000 * 60 * 60 * 24));
    if (days <= 0) return '—';
    return `${days + 1}/${days}`;
  } catch { return '—'; }
}

function isToday(dateStr: string): boolean {
  const today = new Date();
  const d     = new Date(dateStr);
  return (
    d.getDate()     === today.getDate() &&
    d.getMonth()    === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
}

function formatMoney(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function buildMonthlyIncome(bookings: HotelBooking[]): { month: string; value: number }[] {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const m = d.getMonth();
    const y = d.getFullYear();
    const value = bookings
      .filter(b => {
        const bd = new Date(b.fechaCheckIn);
        const st = b.estado.toLowerCase();
        return bd.getMonth() === m && bd.getFullYear() === y
          && st !== 'cancelado' && st !== 'cancelada';
      })
      .reduce((sum, b) => sum + (b.total || 0), 0);
    return { month: MONTHS_SHORT[m] ?? '', value };
  });
}

function isCancelled(estado: string) {
  const s = estado.toLowerCase();
  return s === 'cancelado' || s === 'cancelada';
}

function isConfirmed(estado: string) {
  const s = estado.toLowerCase();
  return s === 'confirmado' || s === 'confirmada' || s === 'activo' || s === 'active';
}

/** Counts for occupation: confirmed/active bookings + paid/completed ones. */
function isOccupied(estado: string) {
  const s = estado.toLowerCase();
  return (
    s === 'confirmado' || s === 'confirmada' ||
    s === 'activo'     || s === 'active'     ||
    s === 'pagado'     || s === 'pagada'
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

const DashboardPage: React.FC = () => {
  const { logout, accessToken, user } = useAuth();
  const { currency } = useCurrency();
  const { t } = useTranslation();
  const [bookings, setBookings]   = useState<HotelBooking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // ── Fetch ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!accessToken) return;
    setIsLoading(true);
    setLoadError(null);

    const hotelId = getHotelIdFromToken(accessToken);
    const request = hotelId
      ? bookingService.getHotelBookings(hotelId, accessToken, currency)
      : bookingService.getMyBookings(accessToken, { moneda: currency });

    request
      .then(data => setBookings(data as HotelBooking[]))
      .catch(err => setLoadError(err instanceof Error ? err.message : 'Could not load data.'))
      .finally(() => setIsLoading(false));
  }, [accessToken, currency]);

  // ── Derived metrics ──────────────────────────────────────────────────────────
  const todayCount     = bookings.filter(b => isToday(b.fechaCheckIn)).length;
  const confirmedCount = bookings.filter(b => isConfirmed(b.estado)).length;
  const pendingCount   = bookings.filter(b => b.estado.toLowerCase() === 'pendiente').length;
  const cancelledCount = bookings.filter(b => isCancelled(b.estado)).length;
  const totalIncome    = bookings
    .filter(b => !isCancelled(b.estado))
    .reduce((sum, b) => sum + (b.total || 0), 0);
  const occupiedCount  = bookings.filter(b => isOccupied(b.estado)).length;
  const occupationPct  = bookings.length > 0
    ? Math.round((occupiedCount / bookings.length) * 100)
    : 0;

  // Last 5 bookings sorted by check-in descending
  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.fechaCheckIn).getTime() - new Date(a.fechaCheckIn).getTime())
    .slice(0, 5);

  // Monthly income for chart
  const monthlyData = buildMonthlyIncome(bookings);
  const maxIncome   = Math.max(...monthlyData.map(d => d.value), 1);

  // Status breakdown bars
  const statusBars = [
    { label: t('b2b.dashboard.statusConfirmed'), count: confirmedCount, color: '#4caf50' },
    { label: t('b2b.dashboard.statusPending'),   count: pendingCount,   color: '#ff9800' },
    { label: t('b2b.dashboard.statusCancelled'), count: cancelledCount, color: '#f44336' },
  ];
  const maxStatus = Math.max(...statusBars.map(s => s.count), 1);

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="dashboard-page" data-testid="dashboard-page">
      <B2BHeader breadcrumbText="Travelhub/Dashboard" dataTestId="dashboard-header" />

      <div className="dashboard-page__container">
        <B2BSidebar
          onLogout={logout}
          userEmail={user?.email}
          userRole={user?.rol}
          dataTestId="dashboard-sidebar"
        />

        <main className="dashboard-page__main" tabIndex={0}>
          <div className="dashboard-page__content">

            <h1 className="dashboard-page__title">
              Travelhub <strong>Dashboard</strong>
            </h1>

            {loadError && (
              <p className="dashboard-page__error" data-testid="dashboard-error">
                {loadError}
              </p>
            )}

            {/* ── KPI row ── */}
            <div className="dashboard-page__kpi-row">
              <StatCard
                title={t('b2b.dashboard.todaysBookings')}
                mainValue={isLoading ? '…' : String(todayCount)}
                subtitle={`${bookings.length} total`}
                showChart
                dataTestId="dashboard-bookings-card"
              />
              <StatCard
                title={t('b2b.dashboard.confirmed')}
                mainValue={isLoading ? '…' : String(confirmedCount)}
                dataTestId="dashboard-confirmed-card"
              />
              <StatCard
                title={t('b2b.dashboard.pending')}
                mainValue={isLoading ? '…' : String(pendingCount)}
                dataTestId="dashboard-pending-card"
              />
              <StatCard
                title={t('b2b.dashboard.incomes')}
                mainValue={isLoading ? '…' : `$${formatMoney(totalIncome)}`}
                subtitle="USD"
                showChart
                dataTestId="dashboard-incomes-card"
              />
            </div>

            {/* ── Mid row: Last Bookings + Occupation Rate ── */}
            <div className="dashboard-page__mid-row">

              {/* Last Bookings table */}
              <div className="dashboard-page__table-wrapper">
                <DataTable
                  title={t('b2b.dashboard.lastBookings')}
                  columns={[
                    {
                      key: 'viajeroId',
                      header: t('b2b.dashboard.colName'),
                      render: (item: HotelBooking) => (
                        <div className="dashboard-page__name-cell">
                          <span className="dashboard-page__name">
                            {item.nombreUser || item.viajeroId || item.emailHuesped || item.codigo || '—'}
                          </span>
                          <span className="dashboard-page__reservation">
                            {item.nombreHabitacion || item.habitacionId}
                          </span>
                        </div>
                      ),
                    },
                    {
                      key: 'daysNights',
                      header: t('b2b.dashboard.colDaysNights'),
                      render: (item: HotelBooking) =>
                        calcDaysNights(item.fechaCheckIn, item.fechaCheckOut),
                    },
                    { key: 'numHuespedes', header: t('b2b.dashboard.colGuests') },
                    {
                      key: 'fechaCheckIn',
                      header: t('b2b.dashboard.colStart'),
                      render: (item: HotelBooking) => formatDateDDMMYY(item.fechaCheckIn),
                    },
                    {
                      key: 'fechaCheckOut',
                      header: t('b2b.dashboard.colEnd'),
                      render: (item: HotelBooking) => formatDateDDMMYY(item.fechaCheckOut),
                    },
                    {
                      key: 'arrow',
                      header: '',
                      render: () => (
                        <span className="dashboard-page__action-arrow">→</span>
                      ),
                    },
                  ]}
                  data={recentBookings}
                  emptyMessage={isLoading ? t('b2b.dashboard.loadingBookings') : t('b2b.dashboard.noBookings')}
                  dataTestId="dashboard-last-bookings"
                />
              </div>

              {/* Occupation Rate */}
              <div className="dashboard-page__occupation-card">
                <h3 className="dashboard-page__section-title">{t('b2b.dashboard.occupationRate')}</h3>

                <div className="dashboard-page__occ-pct-row">
                  <span
                    className="dashboard-page__occ-pct"
                    data-testid="dashboard-occupation-pct"
                  >
                    {occupationPct}%
                  </span>
                  <span
                    className="dashboard-page__occ-badge"
                    data-testid="dashboard-occupation-badge"
                  >
                    {occupationPct}% {t('b2b.dashboard.occupationsFree')}
                  </span>
                </div>

                <div className="dashboard-page__occ-track">
                  <div
                    className="dashboard-page__occ-fill"
                    style={{ width: `${occupationPct}%` }}
                  />
                </div>

                {/* Status breakdown */}
                <div className="dashboard-page__status-chart">
                  {statusBars.map(({ label, count, color }) => (
                    <div key={label} className="dashboard-page__status-row">
                      <span className="dashboard-page__status-label">{label}</span>
                      <div className="dashboard-page__status-track">
                        <div
                          className="dashboard-page__status-fill"
                          style={{
                            width: `${Math.max(4, (count / maxStatus) * 100)}%`,
                            backgroundColor: color,
                          }}
                        />
                      </div>
                      <span className="dashboard-page__status-count">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Income chart: last 6 months ── */}
            <div className="dashboard-page__chart-card" data-testid="dashboard-income-chart">
              <h3 className="dashboard-page__section-title">
                {t('b2b.dashboard.incomeSixMonths')}
              </h3>
              <div
                className="dashboard-page__bar-chart"
                aria-label={t('b2b.dashboard.monthlyIncomeChart')}
              >
                {monthlyData.map(({ month, value }) => (
                  <div key={month} className="dashboard-page__bar-col">
                    {value > 0 && (
                      <span className="dashboard-page__bar-value">
                        ${formatMoney(value)}
                      </span>
                    )}
                    <div className="dashboard-page__bar-spacer">
                      <div
                        className="dashboard-page__bar"
                        style={{ height: `${Math.max(4, (value / maxIncome) * 100)}%` }}
                      />
                    </div>
                    <span className="dashboard-page__bar-label">{month}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
