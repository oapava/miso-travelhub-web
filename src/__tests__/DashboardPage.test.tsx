import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DashboardPage from '@/pages/b2b/DashboardPage/DashboardPage';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en', changeLanguage: jest.fn() },
  }),
}));

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/business']}>
      <DashboardPage />
    </MemoryRouter>,
  );

describe('DashboardPage', () => {
  it('renders the dashboard page container', () => {
    renderPage();
    expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
  });

  it('renders the B2B header', () => {
    renderPage();
    expect(screen.getByTestId('dashboard-header')).toBeInTheDocument();
  });

  it('renders the B2B sidebar', () => {
    renderPage();
    expect(screen.getByTestId('dashboard-sidebar')).toBeInTheDocument();
  });

  it('renders the dashboard title', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /Travelhub/i })).toBeInTheDocument();
  });

  it('renders the Today\'s Bookings stat card', () => {
    renderPage();
    expect(screen.getByTestId('dashboard-bookings-card')).toBeInTheDocument();
    expect(screen.getByText("Today's Bookings")).toBeInTheDocument();
  });

  it('renders the Incomes stat card', () => {
    renderPage();
    expect(screen.getByTestId('dashboard-incomes-card')).toBeInTheDocument();
    expect(screen.getByText('Incomes')).toBeInTheDocument();
  });

  it('renders the Last Bookings data table', () => {
    renderPage();
    expect(screen.getByTestId('dashboard-last-bookings')).toBeInTheDocument();
    expect(screen.getByText('Last Bookings')).toBeInTheDocument();
  });

  it('renders the Occupation Rate section', () => {
    renderPage();
    expect(screen.getByText('Occupation Rate')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-occupation-badge')).toBeInTheDocument();
  });

  it('renders occupation badge with correct text', () => {
    renderPage();
    expect(screen.getByTestId('dashboard-occupation-badge')).toHaveTextContent(
      '70% Occupations Free',
    );
  });

  it('renders the bookings table with data rows', () => {
    renderPage();
    const rows = screen.getAllByTestId(/dashboard-last-bookings-row-/);
    expect(rows.length).toBe(4);
  });

  it('renders table header columns', () => {
    renderPage();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Days/Nights')).toBeInTheDocument();
    expect(screen.getByText('Guests')).toBeInTheDocument();
    expect(screen.getByText('Start')).toBeInTheDocument();
    expect(screen.getByText('End')).toBeInTheDocument();
  });

  it('logout button is present and clickable without throwing', () => {
    renderPage();
    const logoutBtn = screen.getByTestId('b2b-sidebar-logout');
    expect(() => fireEvent.click(logoutBtn)).not.toThrow();
  });
});
