import { useState } from 'react';
import { B2BHeader, B2BSidebar } from '@/components/layout';
import { DataTable } from '@/components/shared';
import { Button, Input, Select, Pagination } from '@/components/ui';
import './BookingManagerPage.scss';

interface BookingRow {
  id: number;
  clientName: string;
  reservation: string;
  daysNights: string;
  guests: number;
  start: string;
  end: string;
  state: 'Active' | 'Pending' | 'Cancelled';
}

const mockBookingsData: BookingRow[] = Array.from({ length: 6 }, (_, i) => ({
  id: i + 1,
  clientName: 'Carlos Perea',
  reservation: 'Reserved: La Perla, Medellín',
  daysNights: '5/4',
  guests: 2,
  start: '26/03/26',
  end: '26/03/26',
  state: 'Active' as const,
}));

const BookingManagerPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [clientFilter, setClientFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');

  const handleLogout = () => {
    // Mock logout logic
  };

  return (
    <div className="booking-manager-page" data-testid="booking-manager-page">
      <B2BHeader breadcrumbText="Travelhub/Booking Manager" dataTestId="booking-manager-header" />

      <div className="booking-manager-page__container">
        <B2BSidebar
          onLogout={handleLogout}
          dataTestId="booking-manager-sidebar"
        />

        <main className="booking-manager-page__main">
          <div className="booking-manager-page__content">
            <h1 className="booking-manager-page__title">
              <strong>Booking Manager</strong>
            </h1>

            <div className="booking-manager-page__filters">
              <Select
                label="Client"
                options={[
                  { value: '', label: 'All Clients' },
                  { value: 'carlos', label: 'Carlos Perea' },
                  { value: 'juan', label: 'Juan García' },
                ]}
                value={clientFilter}
                onChange={(e) => setClientFilter(e.target.value)}
                dataTestId="booking-manager-client-filter"
              />

              <Select
                label="State"
                options={[
                  { value: '', label: 'All States' },
                  { value: 'active', label: 'Active' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'cancelled', label: 'Cancelled' },
                ]}
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                dataTestId="booking-manager-state-filter"
              />

              <Input
                label="Start Date"
                type="date"
                value={startDateFilter}
                onChange={(e) => setStartDateFilter(e.target.value)}
                dataTestId="booking-manager-start-date"
              />

              <Input
                label="End Date"
                type="date"
                value={endDateFilter}
                onChange={(e) => setEndDateFilter(e.target.value)}
                dataTestId="booking-manager-end-date"
              />
            </div>

            <h3 className="booking-manager-page__subtitle">Last Bookings</h3>

            <div className="booking-manager-page__table-wrapper">
              <DataTable
                columns={[
                  {
                    key: 'clientName',
                    header: 'Client',
                    render: (item: BookingRow) => (
                      <div className="booking-manager-page__client-cell">
                        <div className="booking-manager-page__client-avatar">
                          {item.clientName.charAt(0)}
                        </div>
                        <div className="booking-manager-page__client-info">
                          <span className="booking-manager-page__client-name">{item.clientName}</span>
                          <span className="booking-manager-page__client-reservation">{item.reservation}</span>
                        </div>
                      </div>
                    ),
                  },
                  { key: 'daysNights', header: 'Days/Nights' },
                  { key: 'guests', header: 'Guests' },
                  {
                    key: 'start',
                    header: 'Start',
                    render: (item: BookingRow) => (
                      <span className="booking-manager-page__date">{item.start}</span>
                    ),
                  },
                  {
                    key: 'end',
                    header: 'End',
                    render: (item: BookingRow) => (
                      <span className="booking-manager-page__date">{item.end}</span>
                    ),
                  },
                  {
                    key: 'state',
                    header: 'State',
                    render: (item: BookingRow) => (
                      <span className={`booking-manager-page__state booking-manager-page__state--${item.state.toLowerCase()}`}>
                        {item.state}
                      </span>
                    ),
                  },
                  {
                    key: 'confirm',
                    header: 'Confirm',
                    render: () => (
                      <Button
                        variant="primary"
                        size="small"
                        dataTestId="booking-manager-confirm-btn"
                      >
                        CONFIRM
                      </Button>
                    ),
                  },
                  {
                    key: 'cancel',
                    header: 'Cancel',
                    render: () => (
                      <Button
                        variant="outline"
                        size="small"
                        dataTestId="booking-manager-cancel-btn"
                      >
                        CANCEL
                      </Button>
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
                data={mockBookingsData}
                dataTestId="booking-manager-table"
              />
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={5}
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
