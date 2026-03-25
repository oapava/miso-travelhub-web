
import { B2BHeader, B2BSidebar } from '@/components/layout';
import { StatCard, DataTable } from '@/components/shared';
import { Badge } from '@/components/ui';
import './DashboardPage.scss';

interface BookingRow {
  id: number;
  name: string;
  reservation: string;
  daysNights: string;
  guests: number;
  start: string;
  end: string;
}

const mockBookingsData: BookingRow[] = [
  {
    id: 1,
    name: 'Carlos Perea',
    reservation: 'Reservó: La Perla, Medellín',
    daysNights: '5/4',
    guests: 2,
    start: '26/03/26',
    end: '26/03/26',
  },
  {
    id: 2,
    name: 'Carlos Perea',
    reservation: 'Reservó: La Perla, Medellín',
    daysNights: '5/4',
    guests: 2,
    start: '26/03/26',
    end: '26/03/26',
  },
  {
    id: 3,
    name: 'Carlos Perea',
    reservation: 'Reservó: La Perla, Medellín',
    daysNights: '5/4',
    guests: 2,
    start: '26/03/26',
    end: '26/03/26',
  },
  {
    id: 4,
    name: 'Carlos Perea',
    reservation: 'Reservó: La Perla, Medellín',
    daysNights: '5/4',
    guests: 2,
    start: '26/03/26',
    end: '26/03/26',
  },
];

const DashboardPage: React.FC = () => {

  const handleLogout = () => {
    // Mock logout logic
  };

  return (
    <div className="dashboard-page" data-testid="dashboard-page">
      <B2BHeader breadcrumbText="Travelhub/Dashboard" dataTestId="dashboard-header" />

      <div className="dashboard-page__container">
        <B2BSidebar
          onLogout={handleLogout}
          dataTestId="dashboard-sidebar"
        />

        <main className="dashboard-page__main">
          <div className="dashboard-page__content">
            <h1 className="dashboard-page__title">
              Travelhub <strong>Dashboard</strong>
            </h1>

            <div className="dashboard-page__grid dashboard-page__grid--top">
              <div className="dashboard-page__grid-item">
                <StatCard
                  title="Today's Bookings"
                  mainValue="26"
                  subtitle="Today"
                  secondaryValue="16"
                  secondaryLabel="Yesterday"
                  badgeText="10% better than yesterday"
                  badgeVariant="success"
                  showChart={true}
                  dataTestId="dashboard-bookings-card"
                />
              </div>

              <div className="dashboard-page__grid-item">
                <div className="dashboard-page__table-wrapper">
                  <DataTable
                    title="Last Bookings"
                    columns={[
                      {
                        key: 'name',
                        header: 'Name',
                        render: (item: BookingRow) => (
                          <div className="dashboard-page__name-cell">
                            <span className="dashboard-page__name">{item.name}</span>
                            <span className="dashboard-page__reservation">{item.reservation}</span>
                          </div>
                        ),
                      },
                      { key: 'daysNights', header: 'Days/Nights' },
                      { key: 'guests', header: 'Guests' },
                      { key: 'start', header: 'Start' },
                      { key: 'end', header: 'End' },
                      {
                        key: 'id',
                        header: '',
                        render: () => <span className="dashboard-page__action-arrow">→</span>,
                      },
                    ]}
                    data={mockBookingsData}
                    dataTestId="dashboard-last-bookings"
                  />
                </div>
              </div>
            </div>

            <div className="dashboard-page__grid dashboard-page__grid--bottom">
              <div className="dashboard-page__grid-item">
                <StatCard
                  title="Incomes"
                  mainValue="$11,000"
                  subtitle="USD"
                  showChart={true}
                  dataTestId="dashboard-incomes-card"
                />
              </div>

              <div className="dashboard-page__grid-item">
                <div className="dashboard-page__occupation-card">
                  <h4 className="dashboard-page__occupation-title">Occupation Rate</h4>
                  <Badge label="70% Occupations Free" variant="warning" dataTestId="dashboard-occupation-badge" />
                  <div className="dashboard-page__occupation-value">
                    <span className="dashboard-page__occupation-number">1,146</span>
                    <span className="dashboard-page__occupation-label">Occupation Free</span>
                  </div>
                  <div className="dashboard-page__occupation-chart" aria-hidden="true">
                    <div className="dashboard-page__chart-placeholder">
                      {[40, 60, 35, 80, 55, 70, 90].map((height, index) => (
                        <div
                          key={index}
                          className="dashboard-page__chart-bar"
                          style={{ height: `${height}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
