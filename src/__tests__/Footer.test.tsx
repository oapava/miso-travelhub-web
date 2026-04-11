import { render, screen } from '@testing-library/react';
import Footer from '@/components/layout/Footer/Footer';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en', changeLanguage: jest.fn() },
  }),
}));

describe('Footer', () => {
  it('renders a footer element', () => {
    render(<Footer />);
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('renders the current year in the copyright', () => {
    render(<Footer />);
    const currentYear = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(currentYear))).toBeInTheDocument();
  });

  it('renders TravelHub brand name in copyright', () => {
    render(<Footer />);
    expect(screen.getByText(/TravelHub/)).toBeInTheDocument();
  });

  it('renders footer navigation', () => {
    render(<Footer />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('renders privacy link', () => {
    render(<Footer />);
    expect(screen.getByRole('link', { name: /footer\.privacy/i })).toBeInTheDocument();
  });

  it('renders terms link', () => {
    render(<Footer />);
    expect(screen.getByRole('link', { name: /footer\.terms/i })).toBeInTheDocument();
  });

  it('renders support link', () => {
    render(<Footer />);
    expect(screen.getByRole('link', { name: /footer\.support/i })).toBeInTheDocument();
  });

  it('sets data-testid attribute', () => {
    render(<Footer dataTestId="app-footer" />);
    expect(screen.getByTestId('app-footer')).toBeInTheDocument();
  });
});
