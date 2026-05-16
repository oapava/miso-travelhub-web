import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ResultsPage from '@/pages/b2c/ResultsPage/ResultsPage';

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

describe('ResultsPage', () => {
  it('renders sidebar and sort controls', () => {
    render(
      <MemoryRouter initialEntries={["/results"]}>
        <ResultsPage />
      </MemoryRouter>
    );

    expect(screen.getByTestId('results-sidebar')).toBeInTheDocument();
    expect(screen.getByText(/Price range/i)).toBeInTheDocument();
    expect(screen.getByText(/Property classification/i)).toBeInTheDocument();
    expect(screen.getByText(/Sorted by:/i)).toBeInTheDocument();
  });

  it('renders hotel list and pagination', () => {
    render(
      <MemoryRouter initialEntries={["/results"]}>
        <ResultsPage />
      </MemoryRouter>
    );

    expect(screen.getAllByTestId(/hotel-card-/i).length).toBeGreaterThan(0);
    expect(screen.getByTestId('results-pagination')).toBeInTheDocument();
  });
});
