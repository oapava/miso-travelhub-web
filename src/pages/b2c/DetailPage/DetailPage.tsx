import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Header, Footer } from '@/components/layout';
import { Breadcrumb, Badge, StarRating, Button, AmenityTag, PriceDisplay, DateRangePicker } from '@/components/ui';
import { searchParamsStorage } from '@/services/search-params.storage';
import { searchService } from '@/services/search.service';
import { bookingService, ReviewHotel, BookingResponse } from '@/services/booking.service';
import { useAuth } from '@/context/AuthContext';
import BookingModal from '@/components/shared/BookingModal/BookingModal';
import BookingConfirmModal from '@/components/shared/BookingConfirmModal/BookingConfirmModal';
import AddReviewModal from '@/components/shared/AddReviewModal/AddReviewModal';
import HotelGallery from './HotelGallery';
import HotelReviews from './HotelReviews';
import './DetailPage.scss';

interface HotelDetail {
  id: string;
  hotelName: string;
  location: string;
  distance?: string;
  access?: string;
  rating: number;
  reviewScore: number;
  reviewCount: number;
  reviewLabel: string;
  roomType: string;
  bedType: string;
  roomSize: string;
  amenities: string[];
  finalPrice: number;
  originalPrice?: number;
  discountPercentage?: number;
  nightsCount: number;
  guestsCount: number;
}

const FALLBACK_AMENITIES = [
  'Wifi', 'Air Conditioning', 'Parking', 'Swimming Pool',
  'Gym', 'Restaurant', 'Room Service', 'Laundry',
  'Concierge', 'Business Center', 'Pet Friendly', 'Bar',
];

function calcNights(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0;
  const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  const nights = Math.round(diff / (1000 * 60 * 60 * 24));
  return nights > 0 ? nights : 0;
}


const DetailPage: React.FC = () => {
  const { hotelId } = useParams<{ hotelId: string }>();
  const location = useLocation();
  const hotel = (location.state as { hotel?: HotelDetail } | null)?.hotel ?? null;
  const { isAuthenticated, accessToken } = useAuth();

  const lastSearch = searchParamsStorage.load();

  // ── Tab anchors ───────────────────────────────────────────────────────────
  const TABS = [
    { label: 'Overview',  anchor: 'section-overview'  },
    { label: 'Amenities', anchor: 'section-amenities' },
    { label: 'Location',  anchor: 'section-location'  },
    { label: 'Reviews',   anchor: 'section-reviews'   },
  ] as const;

  type TabAnchor = typeof TABS[number]['anchor'];

  const [activeTab, setActiveTab] = useState<TabAnchor>('section-overview');

  // Update active tab as the user scrolls (IntersectionObserver)
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    TABS.forEach(({ anchor }) => {
      const el = document.getElementById(anchor);
      if (!el) return;

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) setActiveTab(anchor);
        },
        { rootMargin: '-80px 0px -65% 0px', threshold: 0 },
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [startDate, setStartDate] = useState(lastSearch?.checkIn ?? '');
  const [endDate, setEndDate] = useState(lastSearch?.checkOut ?? '');

  // Earliest selectable check-in is tomorrow
  const tomorrow = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();
  const [rooms, setRooms] = useState(String(lastSearch?.rooms ?? 1));
  const [guests, setGuests] = useState(String(lastSearch?.adults ?? 2));

  // Room detail state
  const [roomDetailAmenities, setRoomDetailAmenities] = useState<string[] | null>(null);
  const [roomDetailPrice, setRoomDetailPrice] = useState<number | null>(null);
  const [roomDetailImages, setRoomDetailImages] = useState<string[]>([]);
  const [, setIsPriceLoading] = useState(false);
  const [priceError, setPriceError] = useState<string | null>(null);

  // Reviews state
  const [reviews, setReviews] = useState<ReviewHotel[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);

  // Booking modal state
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [bookingResult, setBookingResult] = useState<BookingResponse | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Add review modal state
  const [isAddReviewOpen, setIsAddReviewOpen] = useState(false);

  // ── Load reviews once on mount ────────────────────────────────────────────
  useEffect(() => {
    if (!hotelId) return;
    setIsLoadingReviews(true);
    setReviewsError(null);
    bookingService
      .getHotelReviews(hotelId)
      .then((data) => setReviews(data))
      .catch(() => {
        setReviews([]);
        setReviewsError('Could not load reviews. Please try again later.');
      })
      .finally(() => setIsLoadingReviews(false));
  }, [hotelId]);

  // ── Refresh room detail (price + amenities) when dates change ─────────────
  const fetchRoomDetail = useCallback(() => {
    if (!hotelId || !startDate || !endDate) return;
    setIsPriceLoading(true);
    setPriceError(null);
    searchService
      .getDetailRoom(hotelId, startDate, endDate)
      .then((detail) => {
        if (detail.amenidades?.length) setRoomDetailAmenities(detail.amenidades);
        if (detail.precio) setRoomDetailPrice(detail.precio);
        if (detail.imagenes?.length) setRoomDetailImages(detail.imagenes);
      })
      .catch(() => {
        setPriceError('Could not refresh price. Showing last known price.');
      })
      .finally(() => setIsPriceLoading(false));
  }, [hotelId, startDate, endDate]);

  useEffect(() => {
    fetchRoomDetail();
  }, [fetchRoomDetail]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleTabClick = (anchor: TabAnchor) => {
    setActiveTab(anchor);
    const el = document.getElementById(anchor);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSearch = (params: { checkIn?: string; checkOut?: string; rooms?: number; adults?: number }) => {
    if (params.checkIn !== undefined) setStartDate(params.checkIn);
    if (params.checkOut !== undefined) setEndDate(params.checkOut);
    if (params.rooms !== undefined) setRooms(String(params.rooms));
    if (params.adults !== undefined) setGuests(String(params.adults));
  };

  const handleBookingContinue = async () => {
    if (!hotelId || !accessToken) return;
    setBookingError(null);
    try {
      const result = await bookingService.bookRoom(
        {
          habitacionId: hotelId,
          checkin: startDate,
          checkout: endDate,
          numHuespedes: parseInt(guests, 10),
        },
        accessToken,
      );
      setBookingResult(result);
      setIsConfirmModalOpen(true);
    } catch (err) {
      setBookingError(err instanceof Error ? err.message : 'Booking failed. Please try again.');
    }
  };

  const handleReviewSubmit = async (calificacion: number, comentario: string) => {
    if (!hotelId || !accessToken) return;
    await bookingService.postReview(
      { habitacionId: hotelId, calificacion, comentario },
      accessToken,
    );
    // Refresh reviews after successful post
    const fresh = await bookingService.getHotelReviews(hotelId);
    setReviews(fresh);
  };

  // ── Derived values ────────────────────────────────────────────────────────
  const nights = calcNights(startDate, endDate);

  const hotelName      = hotel?.hotelName    ?? `Hotel ${hotelId}`;
  const hotelAddress   = hotel?.location     ?? '';
  const hotelDistance  = hotel?.distance     ?? '';
  const hotelAccess    = hotel?.access       ?? '';
  const hotelRating    = hotel?.rating       ?? 4;
  const hotelScore     = hotel?.reviewScore  ?? 8.0;
  const hotelReviewCount = hotel?.reviewCount ?? 0;
  const hotelReviewLabel = hotel?.reviewLabel ?? '';
  const hotelRoomType  = hotel?.roomType     ?? '';
  const hotelBedType   = hotel?.bedType      ?? '';
  const hotelRoomSize  = hotel?.roomSize     ?? '';
  const hotelAmenities = roomDetailAmenities ?? (hotel?.amenities?.length ? hotel.amenities : FALLBACK_AMENITIES);
  const hotelPrice     = roomDetailPrice     ?? hotel?.finalPrice ?? 1500;
  const hotelOriginalPrice = hotel?.originalPrice;
  const hotelDiscount      = hotel?.discountPercentage;

  const locationLine = [hotelAddress, hotelDistance, hotelAccess].filter(Boolean).join(' · ');

  const starLabel: Record<number, string> = {
    5: 'Luxury Hotel', 4: 'Superior Hotel', 3: 'Standard Hotel',
    2: 'Economy Hotel', 1: 'Budget Hotel',
  };
  const hotelCategory    = starLabel[hotelRating] ?? 'Hotel';
  const roomInfoLine     = [hotelRoomType, hotelBedType, hotelRoomSize].filter(Boolean).join(' · ');
  const amenitiesSubtitle = [hotelCategory, roomInfoLine].filter(Boolean).join(' | ');

  return (
    <div className="detail-page" data-testid="detail-page">
      <Header searchInitialValues={lastSearch ?? undefined} onSearch={handleSearch} />

      <div className="detail-page__container">
        <Breadcrumb
          items={[
            { label: 'Home', path: '/' },
            { label: 'Results', path: '/results' },
            { label: hotelName },
          ]}
        />

        {/* Hotel header */}
        <div className="detail-page__header-info">
          <div className="detail-page__title-section">
            <h1 className="detail-page__title">{hotelName}</h1>
            <div className="detail-page__rating-section">
              <StarRating rating={hotelRating} size="medium" dataTestId="detail-rating" />
              <Badge label={String(hotelScore.toFixed(1))} variant="success" dataTestId="detail-score-badge" />
              {hotelReviewCount > 0 && (
                <span className="detail-page__review-count" data-testid="detail-review-count">
                  {hotelReviewLabel} · {hotelReviewCount} reviews
                </span>
              )}
              <button className="detail-page__icon-btn" data-testid="favorite-btn">♡</button>
              <button className="detail-page__icon-btn" data-testid="share-btn">⬈</button>
            </div>
          </div>

          {locationLine && (
            <div className="detail-page__location-info">
              <p className="detail-page__location-text">{locationLine}</p>
            </div>
          )}
        </div>

        {/* Tabs — each scrolls to its corresponding section anchor */}
        <div className="detail-page__tabs" data-testid="detail-tabs">
          {TABS.map(({ label, anchor }) => (
            <button
              key={anchor}
              className={`detail-page__tab${activeTab === anchor ? ' detail-page__tab--active' : ''}`}
              onClick={() => handleTabClick(anchor)}
              data-testid={`tab-${label.toLowerCase()}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="detail-page__content">
          {/* Gallery — full width */}
          <div className="detail-page__gallery" data-testid="detail-gallery">
            <HotelGallery
              images={roomDetailImages}
              dataTestId="detail-hotel-gallery"
            />
          </div>

          {/* Body */}
          <div className="detail-page__body">
            <div className="detail-page__main-content">
              {/* ── Overview ── */}
              <section
                id="section-overview"
                className="detail-page__section"
                data-testid="detail-description"
              >
                <h2 className="detail-page__section-title">Description</h2>
                <p className="detail-page__description-text">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
                  incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
                  exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                  irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
                  pariatur.
                </p>
              </section>

              {/* ── Amenities ── */}
              <section
                id="section-amenities"
                className="detail-page__section"
                data-testid="detail-amenities"
              >
                <div className="detail-page__amenities-header">
                  <h2 className="detail-page__section-title">Amenities</h2>
                  {amenitiesSubtitle && (
                    <p className="detail-page__amenities-subtitle">{amenitiesSubtitle}</p>
                  )}
                </div>
                <div className="detail-page__amenities-list">
                  {hotelAmenities.map((amenity) => (
                    <AmenityTag key={amenity} label={amenity} />
                  ))}
                </div>
              </section>

              {/* ── Location ── */}
              <section
                id="section-location"
                className="detail-page__section"
                data-testid="detail-location"
              >
                <h2 className="detail-page__section-title">Location</h2>
                <div className="detail-page__map-placeholder" data-testid="detail-map">
                  Map
                </div>
              </section>

              {/* ── Reviews ── */}
              <div className="detail-page__reviews-header">
                <button
                  className="detail-page__icon-btn"
                  data-testid="add-review-btn"
                  disabled={!isAuthenticated}
                  onClick={() => setIsAddReviewOpen(true)}
                >
                  + Add Review
                </button>
              </div>
              <HotelReviews
                id="section-reviews"
                dataTestId="detail-reviews"
                reviews={reviews.map(r => ({
                  id: r.id,
                  author: `Traveler ${r.viajeroId.substring(0, 8)}`,
                  date: r.fecha,
                  rating: r.calificacion,
                  text: r.comentario,
                  verified: r.verificada,
                }))}
                isLoading={isLoadingReviews}
                error={reviewsError}
                onReviewAdded={() => {
                  if (hotelId) {
                    bookingService.getHotelReviews(hotelId).then(setReviews).catch(() => {
                      setReviews([]);
                    });
                  }
                }}
              />
            </div>

          {/* Booking Sidebar */}
          <aside className="detail-page__sidebar" data-testid="detail-sidebar">
            <div className="detail-page__booking-card">
              {/* Date range picker — replaces the two native date inputs */}
              <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                minDate={tomorrow}
                onChange={(start, end) => {
                  setStartDate(start);
                  setEndDate(end);
                }}
                startLabel="Start"
                endLabel="End"
                startTestId="detail-start-date"
                endTestId="detail-end-date"
                className="detail-page__date-picker"
              />

              {/* Rooms & guests + price on the same row */}
              <div className="detail-page__rooms-guests" data-testid="detail-rooms-guests">
                <div className="detail-page__rooms-guests-header">
                  <span className="detail-page__form-label">Rooms and guests</span>
                  <PriceDisplay
                    originalPrice={hotelOriginalPrice}
                    finalPrice={hotelPrice}
                    discountPercentage={hotelDiscount}
                    size="small"
                    dataTestId="detail-price"
                  />
                </div>
                {priceError && (
                  <p className="detail-page__price-error" data-testid="detail-price-error">
                    {priceError}
                  </p>
                )}
                <p className="detail-page__rooms-guests-text">
                  {rooms} room{Number(rooms) !== 1 ? 's' : ''}
                </p>
                <p className="detail-page__rooms-guests-text">
                  {nights > 0
                    ? `${nights} night${nights !== 1 ? 's' : ''}, `
                    : ''}
                  {guests} adult{Number(guests) !== 1 ? 's' : ''}
                </p>
              </div>

              {bookingError && (
                <p className="detail-page__booking-error" data-testid="detail-booking-error">
                  {bookingError}
                </p>
              )}

              {/* Booking action — right-aligned, only active when logged in */}
              <div className="detail-page__booking-actions">
                <Button
                  variant="primary"
                  disabled={!isAuthenticated}
                  title={!isAuthenticated ? 'Log in to book this room' : undefined}
                  onClick={() => setIsBookingModalOpen(true)}
                  dataTestId="detail-booking-btn"
                >
                  BOOKING
                </Button>
              </div>
            </div>
          </aside>
          </div>
        </div>
      </div>

      {/* Modals */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onContinue={handleBookingContinue}
        destination={hotelName}
        checkIn={startDate}
        checkOut={endDate}
        guests={parseInt(guests, 10)}
        rooms={parseInt(rooms, 10)}
        imageUrl={roomDetailImages[0]}
        originalPrice={hotelOriginalPrice}
        finalPrice={hotelPrice}
        discountPercentage={hotelDiscount}
        dataTestId="detail-booking-modal"
      />

      <BookingConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        destination={hotelName}
        bookingResult={bookingResult ?? undefined}
        imageUrl={roomDetailImages[0]}
        dataTestId="detail-confirm-modal"
      />

      <AddReviewModal
        isOpen={isAddReviewOpen}
        onClose={() => setIsAddReviewOpen(false)}
        onSubmit={handleReviewSubmit}
        dataTestId="detail-add-review-modal"
      />

      <Footer />
    </div>
  );
};

export default DetailPage;
