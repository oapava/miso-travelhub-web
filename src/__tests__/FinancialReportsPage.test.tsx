import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import FinancialReportsPage from '@/pages/b2b/FinancialReportsPage/FinancialReportsPage';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en', changeLanguage: jest.fn() },
  }),
}));

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/business/financial-reports']}>
      <FinancialReportsPage />
    </MemoryRouter>,
  );

describe('FinancialReportsPage', () => {
  it('renders the page container', () => {
    renderPage();
    expect(screen.getByTestId('financial-reports-page')).toBeInTheDocument();
  });

  it('renders the B2B header', () => {
    renderPage();
    expect(screen.getByTestId('financial-reports-header')).toBeInTheDocument();
  });

  it('renders the B2B sidebar', () => {
    renderPage();
    expect(screen.getByTestId('financial-reports-sidebar')).toBeInTheDocument();
  });

  it('renders the Financial Reports title', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /Financial Reports/i })).toBeInTheDocument();
  });

  it('renders date range inputs', () => {
    renderPage();
    expect(screen.getByTestId('financial-reports-start-date')).toBeInTheDocument();
    expect(screen.getByTestId('financial-reports-end-date')).toBeInTheDocument();
  });

  it('updates start date when input changes', () => {
    renderPage();
    const startInput = screen.getByTestId(
      'financial-reports-start-date',
    ) as HTMLInputElement;
    fireEvent.change(startInput, { target: { value: '2024-01-01' } });
    expect(startInput.value).toBe('2024-01-01');
  });

  it('renders the bookings data table', () => {
    renderPage();
    expect(screen.getByTestId('financial-reports-table')).toBeInTheDocument();
  });

  it('renders the pagination component', () => {
    renderPage();
    expect(screen.getByTestId('financial-reports-pagination')).toBeInTheDocument();
  });

  it('renders the Total Income stat card', () => {
    renderPage();
    expect(screen.getByTestId('financial-reports-total-income')).toBeInTheDocument();
    expect(screen.getByText('Total Income')).toBeInTheDocument();
  });

  it('renders the Income Graphic section', () => {
    renderPage();
    expect(screen.getByText('Income Graphic')).toBeInTheDocument();
  });

  it('renders the Total Occupation section', () => {
    renderPage();
    expect(screen.getByText('Total Occupation')).toBeInTheDocument();
  });

  it('renders the Booking places table subtitle', () => {
    renderPage();
    expect(screen.getByText('Booking places table')).toBeInTheDocument();
  });

  it('updates end date when input changes', () => {
    renderPage();
    const endInput = screen.getByTestId('financial-reports-end-date') as HTMLInputElement;
    fireEvent.change(endInput, { target: { value: '2026-12-31' } });
    expect(endInput.value).toBe('2026-12-31');
  });

  it('logout button is clickable without throwing', () => {
    renderPage();
    expect(() => fireEvent.click(screen.getByTestId('b2b-sidebar-logout'))).not.toThrow();
  });
});
