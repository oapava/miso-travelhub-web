import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BookingsPage from '@/pages/b2c/BookingsPage/BookingsPage';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en', changeLanguage: jest.fn() },
  }),
}));

jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: false,
    user: null,
    accessToken: null,
    login: jest.fn(),
    logout: jest.fn(),
  }),
}));

jest.mock('@/components/shared/LoginModal/LoginModal', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('@/components/shared/SignUpModal/SignUpModal', () => ({
  __esModule: true,
  default: () => null,
}));

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/account/bookings']}>
      <BookingsPage />
    </MemoryRouter>,
  );

describe('BookingsPage', () => {
  it('renders the bookings page container', () => {
    renderPage();
    expect(screen.getByTestId('bookings-page')).toBeInTheDocument();
  });

  it('renders the Booking History title', () => {
    renderPage();
    expect(screen.getByText('Booking History')).toBeInTheDocument();
  });

  it('renders the account sidebar', () => {
    renderPage();
    expect(screen.getByTestId('bookings-sidebar')).toBeInTheDocument();
  });

  it('renders booking groups', () => {
    renderPage();
    expect(screen.getByTestId('booking-group-0')).toBeInTheDocument();
    expect(screen.getByTestId('booking-group-1')).toBeInTheDocument();
  });

  it('renders group dates', () => {
    renderPage();
    expect(screen.getByText('Aug. 2025')).toBeInTheDocument();
    expect(screen.getByText('Sep. 2024')).toBeInTheDocument();
  });

  it('renders hotel cards for each booking', () => {
    renderPage();
    expect(screen.getByTestId('booking-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('booking-card-2')).toBeInTheDocument();
  });

  it('renders status badges for each booking', () => {
    renderPage();
    expect(screen.getByTestId('booking-status-1')).toBeInTheDocument();
    expect(screen.getByTestId('booking-status-2')).toBeInTheDocument();
  });

  it('renders Active status badge for first booking', () => {
    renderPage();
    expect(screen.getByTestId('booking-status-1')).toHaveTextContent('Active');
  });

  it('renders Completed status badge for second booking', () => {
    renderPage();
    expect(screen.getByTestId('booking-status-2')).toHaveTextContent('Completed');
  });

  it('renders hotel names', () => {
    renderPage();
    expect(screen.getByText('Luxury Paris Hotel')).toBeInTheDocument();
    expect(screen.getByText('Boutique Parisian Villa')).toBeInTheDocument();
  });
});
