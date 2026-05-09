import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Header, Footer } from '@/components/layout';
import { Breadcrumb, Badge, StarRating, Button, AmenityTag, PriceDisplay, DateRangePicker, Toast } from '@/components/ui';
import { searchParamsStorage } from '@/services/search-params.storage';
import { searchService, PriceBreakdown } from '@/services/search.service';
import { useCurrency } from '@/context/CurrencyContext';
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
  // Desglose de precio propagado desde ResultsPage
  subtotal_sin_descuento?: number;
  subtotal_con_descuento?: number;
  total?: number;
  descuento?: number;
  moneda?: string;
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

/** Formatea un monto con el código de moneda ISO, p. ej. "$4.591.304 COP". */
function formatPrice(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString('es-CO')}`;
  }
}


const DetailPage: React.FC = () => {
  const { hotelId } = useParams<{ hotelId: string }>();
  const location = useLocation();
  const hotel = (location.state as { hotel?: HotelDetail } | null)?.hotel ?? null;
  const { isAuthenticated, accessToken } = useAuth();
  const { currency } = useCurrency();

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

  // Desglose de precio — se inicializa desde el estado de navegación y se
  // actualiza cuando cambian las fechas vía getDetailRoom.
  const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdown | null>(() => {
    if (
      hotel?.subtotal_sin_descuento !== undefined &&
      hotel?.subtotal_con_descuento !== undefined &&
      hotel?.total !== undefined
    ) {
      return {
        descuento:              hotel.descuento              ?? 0,
        subtotal_sin_descuento: hotel.subtotal_sin_descuento,
        subtotal_con_descuento: hotel.subtotal_con_descuento,
        total:                  hotel.total,
        moneda:                 hotel.moneda                 ?? 'USD',
      };
    }
    return null;
  });

  // Reviews state
  const [reviews, setReviews] = useState<ReviewHotel[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);

  // Booking modal state
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [bookingResult, setBookingResult] = useState<BookingResponse | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [showBookingToast, setShowBookingToast] = useState(false);

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

  // ── Refresh room detail (precio + amenidades + desglose) when dates change ──
  const fetchRoomDetail = useCallback(() => {
    if (!hotelId || !startDate || !endDate) return;
    setIsPriceLoading(true);
    setPriceError(null);
    searchService
      .getDetailRoom(hotelId, startDate, endDate, currency)
      .then((detail) => {
        if (detail.amenidades?.length) setRoomDetailAmenities(detail.amenidades);
        if (detail.imagenes?.length)   setRoomDetailImages(detail.imagenes);

        // Precio efectivo para PriceDisplay (compatibilidad con código existente)
        const effectivePrice = detail.subtotal_con_descuento ?? detail.precio;
        if (effectivePrice) setRoomDetailPrice(effectivePrice);

        // Desglose completo — actualiza el estado con los datos más recientes
        setPriceBreakdown({
          descuento:              detail.descuento              ?? 0,
          subtotal_sin_descuento: detail.subtotal_sin_descuento ?? effectivePrice ?? 0,
          subtotal_con_descuento: detail.subtotal_con_descuento ?? effectivePrice ?? 0,
          total:                  detail.total                  ?? effectivePrice ?? 0,
          moneda:                 detail.moneda                 ?? 'USD',
        });
      })
      .catch(() => {
        setPriceError('Could not refresh price. Showing last known price.');
      })
      .finally(() => setIsPriceLoading(false));
  }, [hotelId, startDate, endDate, currency]);

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
      const msg = err instanceof Error ? err.message : 'Booking failed. Please try again.';
      setBookingError(msg);
      setShowBookingToast(true);
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
              <button className="detail-page__icon-btn" data-testid="favorite-btn" aria-label="Agregar a favoritos" aria-pressed={false}>♡</button>
              <button className="detail-page__icon-btn" data-testid="share-btn" aria-label="Compartir este hotel">⬈</button>
            </div>
          </div>

          {locationLine && (
            <div className="detail-page__location-info">
              <p className="detail-page__location-text">{locationLine}</p>
            </div>
          )}
        </div>

        {/* Navegación interna — cada botón desplaza hasta la sección correspondiente.
            Se usa aria-current="location" (no role="tab") porque el contenido
            siempre está visible; no se oculta/muestra (no es un widget tab real). */}
        <nav className="detail-page__tabs" data-testid="detail-tabs" aria-label="Secciones del hotel">
          {TABS.map(({ label, anchor }) => (
            <button
              key={anchor}
              aria-current={activeTab === anchor ? 'location' : undefined}
              className={`detail-page__tab${activeTab === anchor ? ' detail-page__tab--active' : ''}`}
              onClick={() => handleTabClick(anchor)}
              data-testid={`tab-${label.toLowerCase()}`}
            >
              {label}
            </button>
          ))}
        </nav>

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

              {/* Rooms & guests */}
              <div className="detail-page__rooms-guests" data-testid="detail-rooms-guests">
                <span className="detail-page__form-label">Rooms and guests</span>
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

              {/* Desglose de precio */}
              {priceBreakdown ? (
                <div className="detail-page__price-breakdown" data-testid="detail-price-breakdown">
                  <h3 className="detail-page__price-breakdown__title">Price breakdown</h3>

                  <div className="detail-page__price-breakdown__row">
                    <span>Subtotal</span>
                    <span>{formatPrice(priceBreakdown.subtotal_sin_descuento, priceBreakdown.moneda)}</span>
                  </div>

                  {priceBreakdown.descuento > 0 && (
                    <>
                      <div className="detail-page__price-breakdown__row detail-page__price-breakdown__row--discount">
                        <span>Discount ({Math.round(priceBreakdown.descuento * 100)}%)</span>
                        <span>
                          −{formatPrice(
                            priceBreakdown.subtotal_sin_descuento - priceBreakdown.subtotal_con_descuento,
                            priceBreakdown.moneda,
                          )}
                        </span>
                      </div>
                      <div className="detail-page__price-breakdown__row detail-page__price-breakdown__row--subtotal">
                        <span>Discounted subtotal</span>
                        <span>{formatPrice(priceBreakdown.subtotal_con_descuento, priceBreakdown.moneda)}</span>
                      </div>
                    </>
                  )}

                  <div className="detail-page__price-breakdown__row detail-page__price-breakdown__row--taxes">
                    <span>Taxes</span>
                    <span>
                      {formatPrice(
                        priceBreakdown.total - priceBreakdown.subtotal_con_descuento,
                        priceBreakdown.moneda,
                      )}
                    </span>
                  </div>

                  <div className="detail-page__price-breakdown__divider" aria-hidden="true" />

                  <div className="detail-page__price-breakdown__row detail-page__price-breakdown__row--total">
                    <span>Total</span>
                    <span>{formatPrice(priceBreakdown.total, priceBreakdown.moneda)}</span>
                  </div>

                  <p className="detail-page__price-breakdown__currency">
                    Currency: {priceBreakdown.moneda}
                  </p>
                </div>
              ) : (
                /* Fallback: si el API aún no respondió mostramos el precio simple */
                <div className="detail-page__price-breakdown" data-testid="detail-price-breakdown">
                  <PriceDisplay
                    originalPrice={hotelOriginalPrice}
                    finalPrice={hotelPrice}
                    discountPercentage={hotelDiscount}
                    size="small"
                    dataTestId="detail-price"
                  />
                </div>
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
        priceBreakdown={priceBreakdown ?? undefined}
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

      {showBookingToast && bookingError && (
        <Toast
          message={bookingError}
          variant="error"
          onClose={() => { setShowBookingToast(false); setBookingError(null); }}
          dataTestId="detail-booking-error"
        />
      )}

      <Footer />
    </div>
  );
};

export default DetailPage;
