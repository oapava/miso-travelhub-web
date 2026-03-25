import { useState } from 'react';
import { B2BHeader, B2BSidebar } from '@/components/layout';
import { DataTable, StatCard } from '@/components/shared';
import { Badge, Input, Pagination } from '@/components/ui';
import './FinancialReportsPage.scss';

interface BookingPlaceRow {
  id: number;
  place: string;
  reservations: number;
  sales: string;
  commissions: string;
  payoutStatus: 'Paid' | 'Pending';
}

const mockBookingPlacesData: BookingPlaceRow[] = Array.from({ length: 6 }, (_, i) => ({
  id: i + 1,
  place: 'La Perla, Medellín. Colombia',
  reservations: 32,
  sales: '$23,000',
  commissions: '$3,200',
  payoutStatus: i === 5 ? 'Pending' : 'Paid',
}));

const FinancialReportsPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleLogout = () => {
    // Mock logout logic
  };

  return (
    <div className="financial-reports-page" data-testid="financial-reports-page">
      <B2BHeader breadcrumbText="Travelhub/Financial Reports" dataTestId="financial-reports-header" />

      <div className="financial-reports-page__container">
        <B2BSidebar
          onLogout={handleLogout}
          dataTestId="financial-reports-sidebar"
        />

        <main className="financial-reports-page__main">
          <div className="financial-reports-page__content">
            <div className="financial-reports-page__header">
              <h1 className="financial-reports-page__title">
                <strong>Financial Reports</strong>
              </h1>

              <div className="financial-reports-page__date-filters">
                <Input
                  label="Start Date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  dataTestId="financial-reports-start-date"
                />

                <Input
                  label="End Date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  dataTestId="financial-reports-end-date"
                />
              </div>
            </div>

            <div className="financial-reports-page__summary">
              <StatCard
                title="Total Income"
                mainValue="$123,000"
                showChart={true}
                dataTestId="financial-reports-total-income"
              />

              <div className="financial-reports-page__income-graphic">
                <h4 className="financial-reports-page__income-title">Income Graphic</h4>
                <div className="financial-reports-page__chart-placeholder" aria-hidden="true">
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month) => (
                    <div
                      key={month}
                      className="financial-reports-page__chart-column"
                      style={{ height: '75%' }}
                    >
                      <span className="financial-reports-page__chart-label">{month}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="financial-reports-page__occupation-summary">
                <h4 className="financial-reports-page__occupation-title">Total Occupation</h4>
                <div className="financial-reports-page__occupation-content">
                  <span className="financial-reports-page__occupation-percent">70%</span>
                  <div className="financial-reports-page__occupation-bar">
                    <div
                      className="financial-reports-page__occupation-fill"
                      style={{ width: '70%' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <h3 className="financial-reports-page__subtitle">Booking places table</h3>

            <div className="financial-reports-page__table-wrapper">
              <DataTable
                columns={[
                  { key: 'place', header: 'Place' },
                  { key: 'reservations', header: 'Total reservations' },
                  { key: 'sales', header: 'Sales' },
                  { key: 'commissions', header: 'Commissions' },
                  {
                    key: 'payoutStatus',
                    header: 'Payout Status',
                    render: (item: BookingPlaceRow) => (
                      <Badge
                        label={item.payoutStatus}
                        variant={item.payoutStatus === 'Paid' ? 'success' : 'warning'}
                        dataTestId="financial-reports-payout-badge"
                      />
                    ),
                  },
                ]}
                data={mockBookingPlacesData}
                dataTestId="financial-reports-table"
              />
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={5}
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
