import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AccountSidebar from '@/components/layout/AccountSidebar/AccountSidebar';

const renderSidebar = (onLogout = jest.fn()) =>
  render(
    <MemoryRouter initialEntries={['/account']}>
      <AccountSidebar
        userName="John Doe"
        userEmail="john@example.com"
        onLogout={onLogout}
        dataTestId="sidebar"
      />
    </MemoryRouter>,
  );

describe('AccountSidebar', () => {
  it('renders the sidebar', () => {
    renderSidebar();
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
  });

  it('renders the "Your Account" title', () => {
    renderSidebar();
    expect(screen.getByText('Your Account')).toBeInTheDocument();
  });

  it('renders the user name', () => {
    renderSidebar();
    expect(screen.getByText(/John Doe/)).toBeInTheDocument();
  });

  it('renders the user email', () => {
    renderSidebar();
    expect(screen.getByText(/john@example.com/)).toBeInTheDocument();
  });

  it('renders My information menu item', () => {
    renderSidebar();
    expect(screen.getByTestId('account-sidebar-my-information')).toBeInTheDocument();
  });

  it('renders Bookings menu item', () => {
    renderSidebar();
    expect(screen.getByTestId('account-sidebar-bookings')).toBeInTheDocument();
  });

  it('renders Notifications menu item', () => {
    renderSidebar();
    expect(screen.getByTestId('account-sidebar-notifications')).toBeInTheDocument();
  });

  it('renders Security menu item', () => {
    renderSidebar();
    expect(screen.getByTestId('account-sidebar-security')).toBeInTheDocument();
  });

  it('renders logout button', () => {
    renderSidebar();
    expect(screen.getByTestId('account-sidebar-logout')).toBeInTheDocument();
  });

  it('calls onLogout when logout button is clicked', () => {
    const onLogout = jest.fn();
    renderSidebar(onLogout);
    fireEvent.click(screen.getByTestId('account-sidebar-logout'));
    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  it('renders navigation landmark', () => {
    renderSidebar();
    expect(screen.getByRole('navigation', { name: 'Account navigation' })).toBeInTheDocument();
  });

  it('renders Bookings link pointing to /account/bookings', () => {
    renderSidebar();
    const bookingsLink = screen.getByTestId('account-sidebar-bookings');
    expect(bookingsLink).toHaveAttribute('href', '/account/bookings');
  });

  it('renders Notifications link pointing to /account/notifications', () => {
    renderSidebar();
    const link = screen.getByTestId('account-sidebar-notifications');
    expect(link).toHaveAttribute('href', '/account/notifications');
  });
});
