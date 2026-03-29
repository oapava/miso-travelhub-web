import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { B2CRoutes, B2BRoutes } from '@/types';
import ProtectedRoute from './ProtectedRoute';

// B2C Pages
import { HomePage } from '@/pages/b2c/HomePage';
import { ResultsPage } from '@/pages/b2c/ResultsPage';
import { DetailPage } from '@/pages/b2c/DetailPage';
import { AccountPage } from '@/pages/b2c/AccountPage';
import { BookingsPage } from '@/pages/b2c/BookingsPage';
import { NotificationsPage } from '@/pages/b2c/NotificationsPage';

// B2B Pages
import { B2BLoginPage } from '@/pages/b2b/B2BLoginPage';
import { DashboardPage } from '@/pages/b2b/DashboardPage';
import { BookingManagerPage } from '@/pages/b2b/BookingManagerPage';
import { FinancialReportsPage } from '@/pages/b2b/FinancialReportsPage';
import { PricesManagerPage } from '@/pages/b2b/PricesManagerPage';

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* B2C Routes */}
        <Route path={B2CRoutes.HOME} element={<HomePage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/detail/:hotelId" element={<DetailPage />} />
        <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
        <Route path="/account/bookings" element={<ProtectedRoute><BookingsPage /></ProtectedRoute>} />
        <Route path="/account/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />

        {/* B2B Routes */}
        <Route path="/business/login" element={<B2BLoginPage />} />
        <Route path={B2BRoutes.DASHBOARD} element={<DashboardPage />} />
        <Route path="/business/booking-manager" element={<BookingManagerPage />} />
        <Route path="/business/financial-reports" element={<FinancialReportsPage />} />
        <Route path="/business/prices-manager" element={<PricesManagerPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
