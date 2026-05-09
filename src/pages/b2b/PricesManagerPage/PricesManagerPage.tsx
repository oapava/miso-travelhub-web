import { useState } from 'react';
import { B2BHeader, B2BSidebar } from '@/components/layout';
import { useAuth } from '@/context/AuthContext';
import { DataTable } from '@/components/shared';
import { Input, Pagination } from '@/components/ui';
import './PricesManagerPage.scss';

interface PlacePriceRow {
  id: number;
  place: string;
  priceNight: string;
  discount: string;
  dateDiscount: string;
  payoutStatus: string;
}

const mockPlacePricesData: PlacePriceRow[] = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  place: 'La Perla, Medellín. Colombia',
  priceNight: '$56',
  discount: '10%',
  dateDiscount: '23/05/2026 - 23/06/2026',
  payoutStatus: 'Active',
}));

const PricesManagerPage: React.FC = () => {
  const { logout } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [prices, setPrices] = useState<Record<number, string>>(
    Object.fromEntries(mockPlacePricesData.map(row => [row.id, row.priceNight]))
  );
  const [discounts, setDiscounts] = useState<Record<number, string>>(
    Object.fromEntries(mockPlacePricesData.map(row => [row.id, row.discount]))
  );

  const handlePriceChange = (id: number, value: string) => {
    setPrices(prev => ({ ...prev, [id]: value }));
  };

  const handleDiscountChange = (id: number, value: string) => {
    setDiscounts(prev => ({ ...prev, [id]: value }));
  };

  return (
    <div className="prices-manager-page" data-testid="prices-manager-page">
      <B2BHeader breadcrumbText="Travelhub/Prices Manager" dataTestId="prices-manager-header" />

      <div className="prices-manager-page__container">
        <B2BSidebar
          onLogout={logout}
          dataTestId="prices-manager-sidebar"
        />

        <main className="prices-manager-page__main">
          <div className="prices-manager-page__content">
            <h1 className="prices-manager-page__title">
              <strong>Prices Manager</strong>
            </h1>

            <h3 className="prices-manager-page__subtitle">Booking places table</h3>

            <div className="prices-manager-page__table-wrapper">
              <DataTable
                columns={[
                  { key: 'place', header: 'Place' },
                  {
                    key: 'priceNight',
                    header: 'Price(Night)',
                    render: (item: PlacePriceRow) => (
                      <Input
                        type="text"
                        value={prices[item.id] || item.priceNight}
                        onChange={(e) => handlePriceChange(item.id, e.target.value)}
                        dataTestId={`prices-manager-price-input-${item.id}`}
                        className="prices-manager-page__input-inline"
                      />
                    ),
                  },
                  {
                    key: 'discount',
                    header: 'Discount',
                    render: (item: PlacePriceRow) => (
                      <Input
                        type="text"
                        value={discounts[item.id] || item.discount}
                        onChange={(e) => handleDiscountChange(item.id, e.target.value)}
                        dataTestId={`prices-manager-discount-input-${item.id}`}
                        className="prices-manager-page__input-inline"
                      />
                    ),
                  },
                  { key: 'dateDiscount', header: 'Date Discount' },
                  { key: 'payoutStatus', header: 'Payout Status' },
                  {
                    key: 'config',
                    header: 'Config',
                    render: () => (
                      <span className="prices-manager-page__action-arrow">→</span>
                    ),
                  },
                ]}
                data={mockPlacePricesData}
                dataTestId="prices-manager-table"
              />
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={5}
              onPageChange={setCurrentPage}
              dataTestId="prices-manager-pagination"
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default PricesManagerPage;
