import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';

// jsdom does not implement scrollIntoView — stub it so tab-click tests don't throw
window.HTMLElement.prototype.scrollIntoView = jest.fn();
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import DetailPage from '@/pages/b2c/DetailPage/DetailPage';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en', changeLanguage: jest.fn() },
  }),
}));

jest.mock('@/context/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('@/components/shared/LoginModal/LoginModal', () => ({ __esModule: true, default: () => null }));
jest.mock('@/components/shared/SignUpModal/SignUpModal', () => ({ __esModule: true, default: () => null }));

jest.mock('@/services/search.service', () => ({
  searchService: { searchRooms: jest.fn(), getDetailRoom: jest.fn() },
}));

jest.mock('@/services/booking.service', () => ({
  bookingService: { getHotelReviews: jest.fn(), bookRoom: jest.fn(), postReview: jest.fn() },
}));

// AddReviewModal is tested independently; stub it to keep DetailPage tests focused
jest.mock('@/components/shared/HotelGallery/HotelGallery', () => ({
  __esModule: true,
  default: ({ dataTestId = 'hotel-gallery' }: { dataTestId?: string }) => (
    <div data-testid={dataTestId} />
  ),
}));

jest.mock('@/components/shared/AddReviewModal/AddReviewModal', () => ({
  __esModule: true,
  default: ({ isOpen, onClose, dataTestId = 'add-review-modal' }: {
    isOpen: boolean; onClose: () => void; onSubmit: () => void; dataTestId?: string;
  }) =>
    isOpen ? (
      <div data-testid={dataTestId}>
        <button data-testid={`${dataTestId}-close`} onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

import { useAuth } from '@/context/AuthContext';
import { searchService } from '@/services/search.service';
import { bookingService } from '@/services/booking.service';

const mockUseAuth    = useAuth as jest.MockedFunction<typeof useAuth>;
const mockGetDetail  = searchService.getDetailRoom as jest.Mock;
const mockGetReviews = bookingService.getHotelReviews as jest.Mock;
const mockBookRoom   = bookingService.bookRoom as jest.Mock;
const mockPostReview = bookingService.postReview as jest.Mock;

const LAST_SEARCH_KEY = 'travelhub_last_search';
const mockLastSearch = {
  location: 'Paris', checkIn: '2026-09-01', checkOut: '2026-09-12',
  rooms: 1, adults: 2, children: 0,
};

const mockReviews = [
  { id: 'r1', viajeroId: 'u1', calificacion: 4, comentario: 'Great hotel', fecha: '2024-04-01T00:00:00', verificada: true },
  { id: 'r2', viajeroId: 'u1', calificacion: 3, comentario: 'Good stay',   fecha: '2024-04-02T00:00:00', verificada: false },
];

const mockRoomDetail = {
  id: 'room-1', nombre_hotel: 'Hotel Test', precio: 200.0, moneda: 'EUR',
  direccion: 'Calle 123', capacidad_maxima: 2, estrellas: 5,
  amenidades: ['AC', 'WiFi'], imagenes: ['img1.jpg'],
};

const mockBookingResult = {
  id: 'booking-id', codigo: 'CODE123', viajeroId: 'u1', habitacionId: 'hotel-1',
  fechaCheckIn: '2026-09-01T00:00:00', fechaCheckOut: '2026-09-12T00:00:00',
  numHuespedes: 2, estado: 'PENDIENTE', subtotal: 810, impuestos: 162, total: 972, moneda: 'EUR',
};

const unauthUser = {
  isAuthenticated: false, user: null, accessToken: null,
  login: jest.fn(), logout: jest.fn(),
};
const authUser = {
  isAuthenticated: true, user: null, accessToken: 'my-token',
  login: jest.fn(), logout: jest.fn(),
};

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/detail/hotel-1']}>
      <Routes>
        <Route path="/detail/:hotelId" element={<DetailPage />} />
      </Routes>
    </MemoryRouter>,
  );

describe('DetailPage', () => {
  beforeEach(() => {
    sessionStorage.clear();
    jest.resetAllMocks();
    mockUseAuth.mockReturnValue(unauthUser);
    mockGetDetail.mockResolvedValue(mockRoomDetail);
    mockGetReviews.mockResolvedValue([]);
    mockBookRoom.mockResolvedValue(mockBookingResult);
    mockPostReview.mockResolvedValue({});
  });

  // ── Structural rendering ─────────────────────────────────────────────────
  it('renders the detail page container', () => {
    renderPage();
    expect(screen.getByTestId('detail-page')).toBeInTheDocument();
  });

  it('renders all four tabs including Reviews', () => {
    renderPage();
    ['tab-overview', 'tab-amenities', 'tab-location', 'tab-reviews'].forEach((t) =>
      expect(screen.getByTestId(t)).toBeInTheDocument(),
    );
  });

  it('renders gallery and booking sidebar', () => {
    renderPage();
    expect(screen.getByTestId('detail-gallery')).toBeInTheDocument();
    expect(screen.getByTestId('detail-sidebar')).toBeInTheDocument();
  });

  it('renders description section always', () => {
    renderPage();
    expect(screen.getByTestId('detail-description')).toBeInTheDocument();
  });

  it('renders star rating and score badge', () => {
    renderPage();
    expect(screen.getByTestId('detail-rating')).toBeInTheDocument();
    expect(screen.getByTestId('detail-score-badge')).toBeInTheDocument();
  });

  it('renders favorite and share buttons', () => {
    renderPage();
    expect(screen.getByTestId('favorite-btn')).toBeInTheDocument();
    expect(screen.getByTestId('share-btn')).toBeInTheDocument();
  });

  // ── Booking button auth gate ─────────────────────────────────────────────
  it('BOOKING button is disabled when not authenticated', () => {
    renderPage();
    expect(screen.getByTestId('detail-booking-btn')).toBeDisabled();
  });

  it('BOOKING button is enabled when authenticated', () => {
    mockUseAuth.mockReturnValue(authUser);
    renderPage();
    expect(screen.getByTestId('detail-booking-btn')).not.toBeDisabled();
  });

  // ── Tabs navigation (all sections always rendered; tabs scroll to anchors) ──
  it('all sections are rendered simultaneously', () => {
    renderPage();
    expect(screen.getByTestId('detail-amenities')).toBeInTheDocument();
    expect(screen.getByTestId('detail-location')).toBeInTheDocument();
    expect(screen.getByTestId('detail-reviews')).toBeInTheDocument();
  });

  it('clicking amenities tab marks it active', () => {
    renderPage();
    fireEvent.click(screen.getByTestId('tab-amenities'));
    expect(screen.getByTestId('tab-amenities').className).toContain('--active');
  });

  it('clicking location tab marks it active and amenities is still in the DOM', () => {
    renderPage();
    fireEvent.click(screen.getByTestId('tab-location'));
    expect(screen.getByTestId('tab-location').className).toContain('--active');
    expect(screen.getByTestId('detail-amenities')).toBeInTheDocument();
  });

  it('clicking reviews tab marks it active and location is still in the DOM', () => {
    renderPage();
    fireEvent.click(screen.getByTestId('tab-reviews'));
    expect(screen.getByTestId('tab-reviews').className).toContain('--active');
    expect(screen.getByTestId('detail-location')).toBeInTheDocument();
  });

  it('tab click calls scrollIntoView for smooth navigation', () => {
    renderPage();
    fireEvent.click(screen.getByTestId('tab-amenities'));
    expect(window.HTMLElement.prototype.scrollIntoView).toHaveBeenCalledWith(
      expect.objectContaining({ behavior: 'smooth' }),
    );
  });

  // ── Reviews section ──────────────────────────────────────────────────────
  it('shows reviews section on initial render', () => {
    renderPage();
    expect(screen.getByTestId('detail-reviews')).toBeInTheDocument();
  });

  it('calls getHotelReviews on mount', async () => {
    renderPage();
    await waitFor(() => expect(mockGetReviews).toHaveBeenCalled());
  });

  it('renders review list when reviews load', async () => {
    mockGetReviews.mockResolvedValueOnce(mockReviews);
    renderPage();
    await waitFor(() => expect(screen.getByTestId('reviews-list')).toBeInTheDocument());
  });

  it('renders review comments', async () => {
    mockGetReviews.mockResolvedValueOnce(mockReviews);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Great hotel')).toBeInTheDocument();
      expect(screen.getByText('Good stay')).toBeInTheDocument();
    });
  });

  it('shows verified badge on verified reviews', async () => {
    mockGetReviews.mockResolvedValueOnce(mockReviews);
    renderPage();
    await waitFor(() =>
      expect(screen.getByTestId('review-verified-r1')).toBeInTheDocument(),
    );
  });

  it('shows empty state when no reviews', async () => {
    mockGetReviews.mockResolvedValueOnce([]);
    renderPage();
    await waitFor(() => expect(screen.getByTestId('reviews-empty')).toBeInTheDocument());
  });

  it('shows error fallback when reviews fetch fails', async () => {
    mockGetReviews.mockRejectedValueOnce(new Error('Network error'));
    renderPage();
    await waitFor(() => expect(screen.getByTestId('reviews-error')).toBeInTheDocument());
  });

  // ── Add Review button ────────────────────────────────────────────────────
  it('Add Review button is disabled when not authenticated', () => {
    renderPage();
    expect(screen.getByTestId('add-review-btn')).toBeDisabled();
  });

  it('Add Review button is enabled when authenticated', () => {
    mockUseAuth.mockReturnValue(authUser);
    renderPage();
    expect(screen.getByTestId('add-review-btn')).not.toBeDisabled();
  });

  it('opens AddReviewModal when Add Review button is clicked', () => {
    mockUseAuth.mockReturnValue(authUser);
    renderPage();
    fireEvent.click(screen.getByTestId('add-review-btn'));
    expect(screen.getByTestId('detail-add-review-modal')).toBeInTheDocument();
  });

  it('closes AddReviewModal when its close button is clicked', () => {
    mockUseAuth.mockReturnValue(authUser);
    renderPage();
    fireEvent.click(screen.getByTestId('add-review-btn'));
    fireEvent.click(screen.getByTestId('detail-add-review-modal-close'));
    expect(screen.queryByTestId('detail-add-review-modal')).not.toBeInTheDocument();
  });

  // ── Room detail & price refresh on date change ───────────────────────────
  it('calls getDetailRoom with dates from sessionStorage on mount', async () => {
    sessionStorage.setItem(LAST_SEARCH_KEY, JSON.stringify(mockLastSearch));
    renderPage();
    await waitFor(() =>
      expect(mockGetDetail).toHaveBeenCalledWith('hotel-1', '2026-09-01', '2026-09-12'),
    );
  });

  it('updates amenities when room detail loads', async () => {
    sessionStorage.setItem(LAST_SEARCH_KEY, JSON.stringify(mockLastSearch));
    mockGetDetail.mockResolvedValueOnce(mockRoomDetail);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('AC')).toBeInTheDocument();
      expect(screen.getByText('WiFi')).toBeInTheDocument();
    });
  });

  it('uses fallback amenities when room detail fetch fails', async () => {
    mockGetDetail.mockRejectedValueOnce(new Error('not found'));
    renderPage();
    await waitFor(() => expect(screen.getByText('Wifi')).toBeInTheDocument());
  });

  it('shows price-error fallback when room detail fails', async () => {
    sessionStorage.setItem(LAST_SEARCH_KEY, JSON.stringify(mockLastSearch));
    mockGetDetail.mockRejectedValueOnce(new Error('fail'));
    renderPage();
    await waitFor(() =>
      expect(screen.getByTestId('detail-price-error')).toBeInTheDocument(),
    );
  });

  it('refetches price when start date changes', async () => {
    sessionStorage.setItem(LAST_SEARCH_KEY, JSON.stringify(mockLastSearch));
    renderPage();
    await waitFor(() => expect(mockGetDetail).toHaveBeenCalledTimes(1));

    fireEvent.change(screen.getByTestId('detail-start-date'), {
      target: { value: '2026-10-01' },
    });
    await waitFor(() => expect(mockGetDetail).toHaveBeenCalledTimes(2));
    expect(mockGetDetail).toHaveBeenLastCalledWith('hotel-1', '2026-10-01', '2026-09-12');
  });

  it('refetches price when end date changes', async () => {
    sessionStorage.setItem(LAST_SEARCH_KEY, JSON.stringify(mockLastSearch));
    renderPage();
    await waitFor(() => expect(mockGetDetail).toHaveBeenCalledTimes(1));

    fireEvent.change(screen.getByTestId('detail-end-date'), {
      target: { value: '2026-10-15' },
    });
    await waitFor(() => expect(mockGetDetail).toHaveBeenCalledTimes(2));
    expect(mockGetDetail).toHaveBeenLastCalledWith('hotel-1', '2026-09-01', '2026-10-15');
  });

  it('renders price display', () => {
    renderPage();
    expect(screen.getByTestId('detail-price')).toBeInTheDocument();
  });

  it('shows price-loading indicator while fetching price', async () => {
    sessionStorage.setItem(LAST_SEARCH_KEY, JSON.stringify(mockLastSearch));
    let resolve!: (v: typeof mockRoomDetail) => void;
    mockGetDetail.mockReturnValueOnce(new Promise((res) => { resolve = res; }));
    renderPage();
    expect(screen.getByTestId('price-loading')).toBeInTheDocument();
    await act(async () => resolve(mockRoomDetail));
    await waitFor(() =>
      expect(screen.queryByTestId('price-loading')).not.toBeInTheDocument(),
    );
  });

  // ── Booking modal flow ───────────────────────────────────────────────────
  it('opens booking modal when BOOKING is clicked', () => {
    mockUseAuth.mockReturnValue(authUser);
    renderPage();
    fireEvent.click(screen.getByTestId('detail-booking-btn'));
    expect(screen.getByTestId('detail-booking-modal')).toBeInTheDocument();
  });

  it('closes booking modal on close button', () => {
    mockUseAuth.mockReturnValue(authUser);
    renderPage();
    fireEvent.click(screen.getByTestId('detail-booking-btn'));
    fireEvent.click(screen.getByLabelText('Close booking modal'));
    expect(screen.queryByTestId('detail-booking-modal')).not.toBeInTheDocument();
  });

  it('calls bookRoom and shows confirm modal on CONTINUE', async () => {
    mockUseAuth.mockReturnValue(authUser);
    renderPage();
    fireEvent.click(screen.getByTestId('detail-booking-btn'));
    fireEvent.click(screen.getByTestId('detail-booking-modal-continue'));
    await waitFor(() =>
      expect(mockBookRoom).toHaveBeenCalledWith(
        expect.objectContaining({ habitacionId: 'hotel-1' }),
        'my-token',
      ),
    );
    await waitFor(() =>
      expect(screen.getByTestId('detail-confirm-modal')).toBeInTheDocument(),
    );
  });

  it('shows booking error when bookRoom fails', async () => {
    mockUseAuth.mockReturnValue(authUser);
    mockBookRoom.mockRejectedValueOnce(new Error('Room not available'));
    renderPage();
    fireEvent.click(screen.getByTestId('detail-booking-btn'));
    fireEvent.click(screen.getByTestId('detail-booking-modal-continue'));
    await waitFor(() =>
      expect(screen.getByTestId('detail-booking-error')).toHaveTextContent('Room not available'),
    );
  });

  it('closes confirm modal when its close button is clicked', async () => {
    mockUseAuth.mockReturnValue(authUser);
    renderPage();
    fireEvent.click(screen.getByTestId('detail-booking-btn'));
    fireEvent.click(screen.getByTestId('detail-booking-modal-continue'));
    await waitFor(() =>
      expect(screen.getByTestId('detail-confirm-modal')).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByTestId('detail-confirm-modal-close'));
    expect(screen.queryByTestId('detail-confirm-modal')).not.toBeInTheDocument();
  });
});
