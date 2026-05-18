import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import B2BSidebar from '@/components/layout/B2BSidebar/B2BSidebar';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en', changeLanguage: jest.fn() },
  }),
}));

const renderSidebar = (onLogout = jest.fn()) =>
  render(
    <MemoryRouter initialEntries={['/business']}>
      <B2BSidebar
        userEmail="admin@travelhub.com"
        userRole="Admin"
        onLogout={onLogout}
        dataTestId="b2b-sidebar"
      />
    </MemoryRouter>,
  );

describe('B2BSidebar', () => {
  it('renders the sidebar', () => {
    renderSidebar();
    expect(screen.getByTestId('b2b-sidebar')).toBeInTheDocument();
  });

  it('renders the Menu title', () => {
    renderSidebar();
    expect(screen.getByText('b2b.sidebar.menu')).toBeInTheDocument();
  });

  it('renders business navigation landmark', () => {
    renderSidebar();
    expect(screen.getByRole('navigation', { name: 'b2b.sidebar.businessNavigation' })).toBeInTheDocument();
  });

  it('renders Dashboard menu item', () => {
    renderSidebar();
    expect(screen.getByTestId('b2b-sidebar-dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('b2b-sidebar-dashboard')).toHaveTextContent('b2b.sidebar.dashboard');
  });

  it('renders Booking Manager menu item', () => {
    renderSidebar();
    expect(screen.getByTestId('b2b-sidebar-booking-manager')).toBeInTheDocument();
  });

  it('renders Financial Reports menu item', () => {
    renderSidebar();
    expect(screen.getByTestId('b2b-sidebar-financial-reports')).toBeInTheDocument();
  });

  it('renders Prices Manager menu item', () => {
    renderSidebar();
    expect(screen.getByTestId('b2b-sidebar-prices-manager')).toBeInTheDocument();
  });

  it('renders the user email', () => {
    renderSidebar();
    expect(screen.getByText('admin@travelhub.com')).toBeInTheDocument();
  });

  it('renders the user role', () => {
    renderSidebar();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('renders user avatar with first letter of email', () => {
    renderSidebar();
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('renders default user email when not provided', () => {
    render(
      <MemoryRouter>
        <B2BSidebar />
      </MemoryRouter>,
    );
    expect(screen.getByText('admin@travelhub.com')).toBeInTheDocument();
  });

  it('renders logout button', () => {
    renderSidebar();
    expect(screen.getByTestId('b2b-sidebar-logout')).toBeInTheDocument();
  });

  it('calls onLogout when logout button is clicked', () => {
    const onLogout = jest.fn();
    renderSidebar(onLogout);
    fireEvent.click(screen.getByTestId('b2b-sidebar-logout'));
    expect(onLogout).toHaveBeenCalledTimes(1);
  });
});
