import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DetailPage from '@/pages/b2c/DetailPage/DetailPage';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en', changeLanguage: jest.fn() },
  }),
}));

jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/components/shared/LoginModal/LoginModal', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('@/components/shared/SignUpModal/SignUpModal', () => ({
  __esModule: true,
  default: () => null,
}));

import { useAuth } from '@/context/AuthContext';
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/results/hotel-1']}>
      <DetailPage />
    </MemoryRouter>,
  );

describe('DetailPage', () => {
  beforeEach(() => {
    sessionStorage.clear();
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      accessToken: null,
      login: jest.fn(),
      logout: jest.fn(),
    });
  });

  it('renders the detail page container', () => {
    renderPage();
    expect(screen.getByTestId('detail-page')).toBeInTheDocument();
  });

  it('renders the tabs', () => {
    renderPage();
    expect(screen.getByTestId('detail-tabs')).toBeInTheDocument();
    expect(screen.getByTestId('tab-overview')).toBeInTheDocument();
    expect(screen.getByTestId('tab-amenities')).toBeInTheDocument();
    expect(screen.getByTestId('tab-location')).toBeInTheDocument();
    expect(screen.getByTestId('tab-reviews')).toBeInTheDocument();
  });

  it('renders overview tab content by default', () => {
    renderPage();
    expect(screen.getByTestId('detail-description')).toBeInTheDocument();
    expect(screen.getByTestId('detail-amenities')).toBeInTheDocument();
    expect(screen.getByTestId('detail-location')).toBeInTheDocument();
  });

  it('renders the gallery section', () => {
    renderPage();
    expect(screen.getByTestId('detail-gallery')).toBeInTheDocument();
  });

  it('renders the booking sidebar', () => {
    renderPage();
    expect(screen.getByTestId('detail-sidebar')).toBeInTheDocument();
  });

  it('renders the star rating', () => {
    renderPage();
    expect(screen.getByTestId('detail-rating')).toBeInTheDocument();
  });

  it('renders the score badge', () => {
    renderPage();
    expect(screen.getByTestId('detail-score-badge')).toBeInTheDocument();
  });

  it('renders the favorite and share buttons', () => {
    renderPage();
    expect(screen.getByTestId('favorite-btn')).toBeInTheDocument();
    expect(screen.getByTestId('share-btn')).toBeInTheDocument();
  });

  it('renders the BOOKING button disabled when not authenticated', () => {
    renderPage();
    expect(screen.getByTestId('detail-booking-btn')).toBeDisabled();
  });

  it('renders the BOOKING button enabled when authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: null,
      accessToken: 'token',
      login: jest.fn(),
      logout: jest.fn(),
    });
    renderPage();
    expect(screen.getByTestId('detail-booking-btn')).not.toBeDisabled();
  });

  it('renders date inputs in the booking sidebar', () => {
    renderPage();
    expect(screen.getByTestId('detail-start-date')).toBeInTheDocument();
    expect(screen.getByTestId('detail-end-date')).toBeInTheDocument();
  });

  it('renders the price display', () => {
    renderPage();
    expect(screen.getByTestId('detail-price')).toBeInTheDocument();
  });

  it('marks the Amenities tab as active when clicked and keeps all sections visible', () => {
    renderPage();
    fireEvent.click(screen.getByTestId('tab-amenities'));
    expect(screen.getByTestId('tab-amenities')).toHaveClass('detail-page__tab--active');
    // All sections remain in the DOM — tabs are now anchor links, not show/hide toggles
    expect(screen.getByTestId('detail-amenities')).toBeInTheDocument();
    expect(screen.getByTestId('detail-location')).toBeInTheDocument();
  });

  it('marks the Location tab as active when clicked and keeps all sections visible', () => {
    renderPage();
    fireEvent.click(screen.getByTestId('tab-location'));
    expect(screen.getByTestId('tab-location')).toHaveClass('detail-page__tab--active');
    // All sections remain in the DOM — tabs are now anchor links, not show/hide toggles
    expect(screen.getByTestId('detail-location')).toBeInTheDocument();
    expect(screen.getByTestId('detail-amenities')).toBeInTheDocument();
  });

  it('renders fallback amenities when no hotel state is passed', () => {
    renderPage();
    expect(screen.getByText('Wifi')).toBeInTheDocument();
    expect(screen.getByText('Parking')).toBeInTheDocument();
  });

  it('renders description section', () => {
    renderPage();
    expect(screen.getByText('Description')).toBeInTheDocument();
  });
});
