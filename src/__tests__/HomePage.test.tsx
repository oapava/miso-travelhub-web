import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomePage from '@/pages/b2c/HomePage/HomePage';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en', changeLanguage: jest.fn() },
  }),
}));

jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: false, user: null, accessToken: null, login: jest.fn(), logout: jest.fn() }),
}));

jest.mock('@/context/CurrencyContext', () => ({
  useCurrency: () => ({ currency: 'USD', setCurrency: jest.fn(), supportedCurrencies: ['USD', 'COP', 'EUR', 'GBP'] }),
}));

jest.mock('@/components/shared/LoginModal/LoginModal', () => ({ __esModule: true, default: () => null }));
jest.mock('@/components/shared/SignUpModal/SignUpModal', () => ({ __esModule: true, default: () => null }));

describe('HomePage', () => {
  it('renders hero section and search bar', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(screen.getByTestId('home-page')).toBeInTheDocument();
    expect(screen.getByText(/Your Journey Starts Here/i)).toBeInTheDocument();
    expect(screen.getByRole('search')).toBeInTheDocument();
  });

  it('shows top hotels list', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(screen.getByTestId('home-page-top-hotels')).toBeInTheDocument();
    expect(screen.getAllByTestId(/hotel-card-/i).length).toBeGreaterThan(0);
  });
});
