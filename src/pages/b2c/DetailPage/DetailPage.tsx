import React, { useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Header, Footer } from '@/components/layout';
import { Breadcrumb, Badge, StarRating, Button, AmenityTag, PriceDisplay, DateRangePicker } from '@/components/ui';
import { searchParamsStorage } from '@/services/search-params.storage';
import { useAuth } from '@/context/AuthContext';
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
  const { isAuthenticated } = useAuth();

  const lastSearch = searchParamsStorage.load();
  const [activeTab, setActiveTab] = useState<'overview' | 'amenities' | 'location'>('overview');
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

  // Sync sidebar fields whenever the SearchBar in the Header fires
  const handleSearch = (params: { checkIn?: string; checkOut?: string; rooms?: number; adults?: number }) => {
    if (params.checkIn !== undefined) setStartDate(params.checkIn);
    if (params.checkOut !== undefined) setEndDate(params.checkOut);
    if (params.rooms !== undefined) setRooms(String(params.rooms));
    if (params.adults !== undefined) setGuests(String(params.adults));
  };

  // Computed reactively from the selected dates
  const nights = calcNights(startDate, endDate);

  const hotelName = hotel?.hotelName ?? `Hotel ${hotelId}`;
  const hotelAddress = hotel?.location ?? '';
  const hotelDistance = hotel?.distance ?? '';
  const hotelAccess = hotel?.access ?? '';
  const hotelRating = hotel?.rating ?? 4;
  const hotelScore = hotel?.reviewScore ?? 8.0;
  const hotelReviewCount = hotel?.reviewCount ?? 0;
  const hotelReviewLabel = hotel?.reviewLabel ?? '';
  const hotelRoomType = hotel?.roomType ?? '';
  const hotelBedType = hotel?.bedType ?? '';
  const hotelRoomSize = hotel?.roomSize ?? '';
  const hotelAmenities = hotel?.amenities?.length ? hotel.amenities : FALLBACK_AMENITIES;
  const hotelPrice = hotel?.finalPrice ?? 1500;
  const hotelOriginalPrice = hotel?.originalPrice;
  const hotelDiscount = hotel?.discountPercentage;

  const locationLine = [hotelAddress, hotelDistance, hotelAccess].filter(Boolean).join(' · ');

  const starLabel: Record<number, string> = { 5: 'Luxury Hotel', 4: 'Superior Hotel', 3: 'Standard Hotel', 2: 'Economy Hotel', 1: 'Budget Hotel' };
  const hotelCategory = starLabel[hotelRating] ?? 'Hotel';
  const roomInfoLine = [hotelRoomType, hotelBedType, hotelRoomSize].filter(Boolean).join(' · ');
  const amenitiesSubtitle = [hotelCategory, roomInfoLine].filter(Boolean).join(' | ');

  const tabs = ['Overview', 'Amenities', 'Location'] as const;

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
              <button className="detail-page__icon-btn" data-testid="favorite-btn">
                ♡
              </button>
              <button className="detail-page__icon-btn" data-testid="share-btn">
                ⬈
              </button>
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
              onClick={() => setActiveTab(tab.toLowerCase() as 'overview' | 'amenities' | 'location')}
              data-testid={`tab-${tab.toLowerCase()}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="detail-page__content">
          {/* Gallery — full width */}
          <div className="detail-page__gallery" data-testid="detail-gallery">
            <div className="detail-page__main-image" />
            <div className="detail-page__thumbnails">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="detail-page__thumbnail" />
              ))}
            </div>
          </div>

          {/* Body: description + booking side by side */}
          <div className="detail-page__body">
            <div className="detail-page__main-content">
              {/* Description */}
              <section className="detail-page__section" data-testid="detail-description">
                <h2 className="detail-page__section-title">Description</h2>
                <p className="detail-page__description-text">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                </p>
              </section>

              {/* Amenities */}
              {(activeTab === 'overview' || activeTab === 'amenities') && (
                <section className="detail-page__section" data-testid="detail-amenities">
                  <div className="detail-page__amenities-header">
                    <h2 className="detail-page__section-title">Amenities</h2>
                    {amenitiesSubtitle && (
                      <p className="detail-page__amenities-subtitle">{amenitiesSubtitle}</p>
                    )}
                  </div>
                  <div className="detail-page__amenities-list">
                    {hotelAmenities.map((amenity) => (
                      <AmenityTag
                        key={amenity}
                        label={amenity}
                        dataTestId={`amenity-${amenity}`}
                      />
                    ))}
                  </div>
                  <Button variant="dark" size='small' dataTestId="detail-amenities-book-btn">
                    Show all amenities
                  </Button>
                </section>
              )}

              {/* Location */}
              {(activeTab === 'overview' || activeTab === 'location') && (
                <section className="detail-page__section" data-testid="detail-location">
                  <h2 className="detail-page__section-title">Location</h2>
                  <div className="detail-page__map-placeholder" data-testid="detail-map">
                    Map
                  </div>
                </section>
              )}
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

              {/* Booking action — right-aligned, only active when logged in */}
              <div className="detail-page__booking-actions">
                <Button
                  variant="primary"
                  disabled={!isAuthenticated}
                  title={!isAuthenticated ? 'Log in to book this room' : undefined}
                  dataTestId="detail-booking-btn"
                >
                  BOOKING
                </Button>
              </div>
            </div>
          </aside>
          </div>{/* end detail-page__body */}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DetailPage;
