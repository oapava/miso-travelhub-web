import { render, screen, fireEvent } from '@testing-library/react';
import B2BHeader from '@/components/layout/B2BHeader/B2BHeader';

const mockChangeLanguage = jest.fn();

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      language: 'en',
      changeLanguage: mockChangeLanguage,
    },
  }),
}));

describe('B2BHeader', () => {
  beforeEach(() => {
    mockChangeLanguage.mockClear();
  });

  it('renders the header element', () => {
    render(<B2BHeader dataTestId="b2b-header" />);
    expect(screen.getByTestId('b2b-header')).toBeInTheDocument();
  });

  it('renders the TravelHub logo', () => {
    render(<B2BHeader />);
    expect(screen.getByAltText('TravelHub logo')).toBeInTheDocument();
  });

  it('renders default breadcrumb text', () => {
    render(<B2BHeader />);
    expect(screen.getByText('Travelhub/Dashboard')).toBeInTheDocument();
  });

  it('renders custom breadcrumb text', () => {
    render(<B2BHeader breadcrumbText="Travelhub/Bookings" />);
    expect(screen.getByText('Travelhub/Bookings')).toBeInTheDocument();
  });

  it('renders the language toggle button', () => {
    render(<B2BHeader />);
    expect(screen.getByTestId('b2b-header-language')).toBeInTheDocument();
  });

  it('renders the currency label', () => {
    render(<B2BHeader />);
    expect(screen.getByText('USD')).toBeInTheDocument();
  });

  it('renders the notifications button', () => {
    render(<B2BHeader />);
    expect(screen.getByTestId('b2b-header-notifications')).toBeInTheDocument();
  });

  it('renders the current date', () => {
    const date = 'Jan 1, 2025';
    render(<B2BHeader currentDate={date} />);
    expect(screen.getByText(date)).toBeInTheDocument();
  });

  it('calls changeLanguage when language toggle is clicked', () => {
    render(<B2BHeader />);
    fireEvent.click(screen.getByTestId('b2b-header-language'));
    expect(mockChangeLanguage).toHaveBeenCalledWith('es');
  });

  it('shows language code in language toggle button', () => {
    render(<B2BHeader />);
    expect(screen.getByTestId('b2b-header-language')).toHaveTextContent('EN');
  });
});
