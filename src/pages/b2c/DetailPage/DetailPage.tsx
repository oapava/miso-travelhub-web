import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Header, Footer } from '@/components/layout';
import { Breadcrumb, Badge, StarRating, Button, Input, AmenityTag, PriceDisplay } from '@/components/ui';
import { searchParamsStorage } from '@/services/search-params.storage';
import { searchService } from '@/services/search.service';
import { bookingService, ReviewHotel, BookingResponse } from '@/services/booking.service';
import { useAuth } from '@/context/AuthContext';
import BookingModal from '@/components/shared/BookingModal/BookingModal';
import BookingConfirmModal from '@/components/shared/BookingConfirmModal/BookingConfirmModal';
import AddReviewModal from '@/components/shared/AddReviewModal/AddReviewModal';
import HotelGallery from '@/components/shared/HotelGallery/HotelGallery';
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

function formatReviewDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString();
  } catch {
    return dateStr;
  }
}

const DetailPage: React.FC = () => {
  const { hotelId } = useParams<{ hotelId: string }>();
  const location = useLocation();
  const hotel = (location.state as { hotel?: HotelDetail } | null)?.hotel ?? null;
  const { isAuthenticated, accessToken } = useAuth();

  const lastSearch = searchParamsStorage.load();
  const [activeTab, setActiveTab] = useState<'overview' | 'amenities' | 'location' | 'reviews'>('overview');

  // Section refs for smooth scroll
  const sectionRefs = {
    overview:  useRef<HTMLElement>(null),
    amenities: useRef<HTMLElement>(null),
    location:  useRef<HTMLElement>(null),
    reviews:   useRef<HTMLElement>(null),
  };
  const [startDate, setStartDate] = useState(lastSearch?.checkIn ?? '');
  const [endDate, setEndDate] = useState(lastSearch?.checkOut ?? '');
  const [rooms, setRooms] = useState(String(lastSearch?.rooms ?? 1));
  const [guests, setGuests] = useState(String(lastSearch?.adults ?? 2));

  // Room detail state
  const [roomDetailAmenities, setRoomDetailAmenities] = useState<string[] | null>(null);
  const [roomDetailPrice, setRoomDetailPrice] = useState<number | null>(null);
  const [roomDetailImages, setRoomDetailImages] = useState<string[]>([]);
  const [isPriceLoading, setIsPriceLoading] = useState(false);
  const [priceError, setPriceError] = useState<string | null>(null);

  // Reviews state
  const [reviews, setReviews] = useState<ReviewHotel[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);

  // Booking modal state
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [, setBookingResult] = useState<BookingResponse | null>(null);
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
  const handleTabClick = (tab: typeof activeTab) => {
    setActiveTab(tab);
    const ref = sectionRefs[tab];
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

  const tabs = ['Overview', 'Amenities', 'Location', 'Reviews'] as const;

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

        {/* Tabs */}
        <div className="detail-page__tabs" data-testid="detail-tabs">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`detail-page__tab ${activeTab === tab.toLowerCase() ? 'detail-page__tab--active' : ''}`}
              onClick={() => handleTabClick(tab.toLowerCase() as typeof activeTab)}
              data-testid={`tab-${tab.toLowerCase()}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="detail-page__content">
          {/* Gallery */}
          <div className="detail-page__gallery" data-testid="detail-gallery">
            <HotelGallery
              images={roomDetailImages}
              alt={hotelName}
              dataTestId="detail-hotel-gallery"
            />
          </div>

          {/* Body */}
          <div className="detail-page__body">
            <div className="detail-page__main-content">

              {/* Description — always visible */}
              <section
                ref={sectionRefs.overview}
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

              {/* Amenities — always visible */}
              <section
                ref={sectionRefs.amenities}
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
                    <AmenityTag key={amenity} label={amenity} dataTestId={`amenity-${amenity}`} />
                  ))}
                </div>
                <Button variant="dark" size="small" dataTestId="detail-amenities-book-btn">
                  Show all amenities
                </Button>
              </section>

              {/* Location — always visible */}
              <section
                ref={sectionRefs.location}
                className="detail-page__section"
                data-testid="detail-location"
              >
                <h2 className="detail-page__section-title">Location</h2>
                <div className="detail-page__map-placeholder" data-testid="detail-map">Map</div>
              </section>

              {/* Reviews — always visible */}
              <section
                ref={sectionRefs.reviews}
                className="detail-page__section"
                data-testid="detail-reviews"
              >
                <div className="detail-page__reviews-header">
                  <h2 className="detail-page__section-title">Reviews</h2>
                  <Button
                    variant="outline"
                    size="small"
                    disabled={!isAuthenticated}
                    title={!isAuthenticated ? 'Log in to write a review' : undefined}
                    onClick={() => setIsAddReviewOpen(true)}
                    dataTestId="add-review-btn"
                  >
                    + Add Review
                  </Button>
                </div>

                {reviewsError && (
                  <p className="detail-page__reviews-error" data-testid="reviews-error">
                    {reviewsError}
                  </p>
                )}

                {isLoadingReviews ? (
                  <p className="detail-page__reviews-loading" data-testid="reviews-loading">
                    Loading reviews...
                  </p>
                ) : reviews.length === 0 && !reviewsError ? (
                  <p className="detail-page__reviews-empty" data-testid="reviews-empty">
                    No reviews yet. Be the first to share your experience!
                  </p>
                ) : (
                  <div className="detail-page__reviews-list" data-testid="reviews-list">
                    {reviews.map((review) => (
                      <div
                        key={review.id}
                        className="detail-page__review-card"
                        data-testid={`review-card-${review.id}`}
                      >
                        <div className="detail-page__review-header">
                          <StarRating
                            rating={review.calificacion}
                            size="small"
                            dataTestId={`review-rating-${review.id}`}
                          />
                          {review.verificada && (
                            <Badge
                              label="Verified"
                              variant="success"
                              dataTestId={`review-verified-${review.id}`}
                            />
                          )}
                          <span
                            className="detail-page__review-date"
                            data-testid={`review-date-${review.id}`}
                          >
                            {formatReviewDate(review.fecha)}
                          </span>
                        </div>
                        <p
                          className="detail-page__review-comment"
                          data-testid={`review-comment-${review.id}`}
                        >
                          {review.comentario}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            {/* Booking Sidebar */}
            <aside className="detail-page__sidebar" data-testid="detail-sidebar">
              <div className="detail-page__booking-card">
                {/* Dates */}
                <div className="detail-page__date-row">
                  <div className="detail-page__form-group">
                    <label className="detail-page__form-label">Start</label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      dataTestId="detail-start-date"
                    />
                  </div>
                  <div className="detail-page__form-group">
                    <label className="detail-page__form-label">End</label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      dataTestId="detail-end-date"
                    />
                  </div>
                </div>

                {/* Rooms & guests + price */}
                <div className="detail-page__rooms-guests" data-testid="detail-rooms-guests">
                  <div className="detail-page__rooms-guests-header">
                    <span className="detail-page__form-label">Rooms and guests</span>
                    <div className="detail-page__price-wrapper">
                      {isPriceLoading && (
                        <span className="detail-page__price-loading" data-testid="price-loading">
                          Updating…
                        </span>
                      )}
                      <PriceDisplay
                        originalPrice={hotelOriginalPrice}
                        finalPrice={hotelPrice}
                        discountPercentage={hotelDiscount}
                        size="small"
                        dataTestId="detail-price"
                      />
                    </div>
                  </div>
                  <p className="detail-page__rooms-guests-text">
                    {rooms} room{Number(rooms) !== 1 ? 's' : ''}
                  </p>
                  <p className="detail-page__rooms-guests-text">
                    {nights > 0 ? `${nights} night${nights !== 1 ? 's' : ''}, ` : ''}
                    {guests} adult{Number(guests) !== 1 ? 's' : ''}
                  </p>
                </div>

                {priceError && (
                  <p className="detail-page__price-error" data-testid="detail-price-error">
                    {priceError}
                  </p>
                )}

                {bookingError && (
                  <p className="detail-page__booking-error" data-testid="detail-booking-error">
                    {bookingError}
                  </p>
                )}

                {/* Booking button */}
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
        dataTestId="detail-booking-modal"
      />

      <BookingConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        destination={hotelName}
        checkIn={startDate}
        checkOut={endDate}
        guests={parseInt(guests, 10)}
        rooms={parseInt(rooms, 10)}
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
