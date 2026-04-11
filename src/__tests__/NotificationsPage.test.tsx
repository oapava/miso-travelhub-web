import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NotificationsPage from '@/pages/b2c/NotificationsPage/NotificationsPage';

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
    <MemoryRouter initialEntries={['/account/notifications']}>
      <NotificationsPage />
    </MemoryRouter>,
  );

describe('NotificationsPage', () => {
  it('renders the notifications page container', () => {
    renderPage();
    expect(screen.getByTestId('notifications-page')).toBeInTheDocument();
  });

  it('renders the configuration title', () => {
    renderPage();
    expect(screen.getByText('Configuration')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Configuration' })).toBeInTheDocument();
  });

  it('renders the notifications list', () => {
    renderPage();
    expect(screen.getByTestId('notifications-list')).toBeInTheDocument();
  });

  it('renders WhatsApp notification setting', () => {
    renderPage();
    expect(screen.getByTestId('notification-setting-whatsapp')).toBeInTheDocument();
    expect(screen.getByText('Whatsapp Notifications')).toBeInTheDocument();
  });

  it('renders Email notification setting', () => {
    renderPage();
    expect(screen.getByTestId('notification-setting-email')).toBeInTheDocument();
    expect(screen.getByText('Email Notifications')).toBeInTheDocument();
  });

  it('renders SMS notification setting', () => {
    renderPage();
    expect(screen.getByTestId('notification-setting-sms')).toBeInTheDocument();
    expect(screen.getByText('SMS Notifications')).toBeInTheDocument();
  });

  it('renders WhatsApp toggle as active by default', () => {
    renderPage();
    const toggle = screen.getByTestId('toggle-whatsapp');
    expect(toggle).toHaveAttribute('aria-checked', 'true');
  });

  it('renders Email toggle as inactive by default', () => {
    renderPage();
    const toggle = screen.getByTestId('toggle-email');
    expect(toggle).toHaveAttribute('aria-checked', 'false');
  });

  it('renders SMS toggle as active by default', () => {
    renderPage();
    const toggle = screen.getByTestId('toggle-sms');
    expect(toggle).toHaveAttribute('aria-checked', 'true');
  });

  it('toggles WhatsApp notification off when clicked', () => {
    renderPage();
    const toggle = screen.getByTestId('toggle-whatsapp');
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-checked', 'false');
  });

  it('toggles Email notification on when clicked', () => {
    renderPage();
    const toggle = screen.getByTestId('toggle-email');
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-checked', 'true');
  });

  it('toggles SMS notification off and back on', () => {
    renderPage();
    const toggle = screen.getByTestId('toggle-sms');
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-checked', 'false');
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-checked', 'true');
  });

  it('renders description for each notification setting', () => {
    renderPage();
    expect(
      screen.getByText('Receive booking confirmations and updates via WhatsApp'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Receive booking confirmations and updates via email'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Receive booking confirmations and updates via SMS'),
    ).toBeInTheDocument();
  });

  it('renders the account sidebar', () => {
    renderPage();
    expect(screen.getByTestId('notifications-sidebar')).toBeInTheDocument();
  });
});
