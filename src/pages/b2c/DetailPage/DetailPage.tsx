import React, { useState } from 'react';
import { Header, SearchBar, Footer } from '@/components/layout';
import { Breadcrumb, Badge, StarRating, Button, Input, AmenityTag, PriceDisplay } from '@/components/ui';
import './DetailPage.scss';

const DetailPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'amenities' | 'location'>('overview');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [rooms, setRooms] = useState('1');
  const [guests, setGuests] = useState('2');

  const amenitiesData = [
    'Wifi', 'Air Conditioning', 'Parking', 'Swimming Pool',
    'Gym', 'Restaurant', 'Room Service', 'Laundry',
    'Concierge', 'Business Center', 'Pet Friendly', 'Bar',
  ];

  const tabs = ['Overview', 'Amenities', 'Location'] as const;

  return (
    <div className="detail-page" data-testid="detail-page">
      <Header />
      <div className="detail-page__search-bar-wrapper">
        <SearchBar variant="compact" />
      </div>

      <div className="detail-page__container">
        <Breadcrumb
          items={[
            { label: 'Home', path: '/' },
            { label: 'results', path: '/results' },
            { label: 'Paris National Hotel' },
          ]}
        />

        <div className="detail-page__header-info">
          <div className="detail-page__title-section">
            <h1 className="detail-page__title">Paris National Hotel</h1>
            <div className="detail-page__rating-section">
              <StarRating rating={4} size="medium" dataTestId="detail-rating" />
              <Badge label="8.0" variant="success" dataTestId="detail-score-badge" />
              <button className="detail-page__icon-btn" data-testid="favorite-btn">
                ♡
              </button>
              <button className="detail-page__icon-btn" data-testid="share-btn">
                ⬈
              </button>
            </div>
          </div>

          <div className="detail-page__location-info">
            <p className="detail-page__location-text">
              Paris town, 1.8km From center, Metro access
            </p>
          </div>
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
          {/* Gallery */}
          <div className="detail-page__gallery" data-testid="detail-gallery">
            <div className="detail-page__main-image" />
            <div className="detail-page__thumbnails">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="detail-page__thumbnail" />
              ))}
            </div>
          </div>

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
                <h2 className="detail-page__section-title">Amenities</h2>
                <div className="detail-page__amenities-grid">
                  {amenitiesData.map((amenity) => (
                    <AmenityTag
                      key={amenity}
                      label={amenity}
                      dataTestId={`amenity-${amenity}`}
                    />
                  ))}
                </div>
                <button className="detail-page__show-more-btn">Show all amenities</button>
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
              <h3 className="detail-page__booking-title">Booking</h3>

              <div className="detail-page__form-group">
                <label className="detail-page__form-label">Start Date</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  dataTestId="detail-start-date"
                />
              </div>

              <div className="detail-page__form-group">
                <label className="detail-page__form-label">End Date</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  dataTestId="detail-end-date"
                />
              </div>

              <div className="detail-page__form-row">
                <div className="detail-page__form-group">
                  <label className="detail-page__form-label">Rooms</label>
                  <Input
                    type="number"
                    value={rooms}
                    onChange={(e) => setRooms(e.target.value)}
                    dataTestId="detail-rooms"
                  />
                </div>
                <div className="detail-page__form-group">
                  <label className="detail-page__form-label">Guests</label>
                  <Input
                    type="number"
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    dataTestId="detail-guests"
                  />
                </div>
              </div>

              <div className="detail-page__price-section">
                <PriceDisplay
                  originalPrice={1800}
                  finalPrice={1500}
                  discountPercentage={17}
                  dataTestId="detail-price"
                />
              </div>

              <Button
                variant="primary"
                fullWidth
                dataTestId="detail-booking-btn"
              >
                BOOKING
              </Button>
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DetailPage;
