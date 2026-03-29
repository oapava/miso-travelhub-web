import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Header, SearchBar, Footer } from '@/components/layout';
import { Breadcrumb, Select, Pagination } from '@/components/ui';
import { HotelCard } from '@/components/shared/HotelCard';
import ResultsSidebar from '@/components/shared/ResultsSidebar/ResultsSidebar';
import './ResultsPage.scss';

const ResultsPage: React.FC = () => {
  const location = useLocation();
  const showHomeSearchBar = location.pathname === '/';
  const [minPrice, setMinPrice] = useState('0');
  const [maxPrice, setMaxPrice] = useState('2000');
  const [selectedStars, setSelectedStars] = useState<number[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('top-reviewed');
  const [currentPage, setCurrentPage] = useState(1);

  const amenities = ['Wifi', 'Iron', 'Air conditioning', 'Full screen TV', 'Mini bar', 'Room service', 'Private bathroom', 'Hair dryer', 'Work desk', 'Balcony'];

  const mockHotels = [
    {
      id: '1',
      hotelName: 'Luxe Paris Hotel',
      location: 'Paris, France',
      distance: '1.8km from center',
      access: 'Metro access',
      rating: 4,
      reviewScore: 9.0,
      reviewCount: 128,
      reviewLabel: 'Excellent',
      roomType: 'Deluxe Room',
      bedType: 'King Bed',
      roomSize: '35m²',
      amenities: ['Wifi', 'Air Conditioning', 'Mini Bar', 'Room Service'],
      finalPrice: 1800,
      originalPrice: 2000,
      discountPercentage: 10,
      nightsCount: 3,
      guestsCount: 2,
    },
    {
      id: '2',
      hotelName: 'Boutique Parisian Villa',
      location: 'Paris, France',
      distance: '2.5km from center',
      access: 'Bus access',
      rating: 5,
      reviewScore: 9.6,
      reviewCount: 256,
      reviewLabel: 'Exceptional',
      roomType: 'Suite',
      bedType: 'Queen Bed',
      roomSize: '50m²',
      amenities: ['Wifi', 'Pool', 'Spa', 'Restaurant'],
      finalPrice: 1500,
      originalPrice: 1800,
      discountPercentage: 17,
      nightsCount: 3,
      guestsCount: 2,
    },
    {
      id: '3',
      hotelName: 'Modern Paris Apartment',
      location: 'Paris, France',
      distance: '3.0km from center',
      access: 'Walk',
      rating: 4,
      reviewScore: 8.6,
      reviewCount: 95,
      reviewLabel: 'Very Good',
      roomType: 'Standard Room',
      bedType: 'Twin Bed',
      roomSize: '28m²',
      amenities: ['Wifi', 'Air Conditioning', 'Work Desk', 'Balcony'],
      finalPrice: 1200,
      originalPrice: 1400,
      discountPercentage: 14,
      nightsCount: 3,
      guestsCount: 2,
    },
  ];

  const handleStarToggle = (star: number) => {
    setSelectedStars((prev) =>
      prev.includes(star) ? prev.filter((s) => s !== star) : [...prev, star]
    );
  };

  const handleAmenityToggle = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  return (
    <div className="results-page" data-testid="results-page">
      <Header />
      {showHomeSearchBar && <div className="results-page__search-bar-wrapper">
         <SearchBar variant="compact" />
      </div>}

      <div className="results-page__container">
        <Breadcrumb
          items={[
            { label: 'Home', path: '/' },
            { label: 'results', path: '#' },
          ]}
        />

        <div className="results-page__content">
          <ResultsSidebar
            minPrice={minPrice}
            maxPrice={maxPrice}
            selectedStars={selectedStars}
            selectedAmenities={selectedAmenities}
            amenities={amenities}
            onMinPriceChange={setMinPrice}
            onMaxPriceChange={setMaxPrice}
            onStarToggle={handleStarToggle}
            onAmenityToggle={handleAmenityToggle}
          />

          <main className="results-page__main" data-testid="results-main">
            <div className="results-page__header">
              <h1 className="results-page__title">Explore 300+ places in Paris</h1>
              <div className="results-page__sort">
                <label className="results-page__sort-label">Sorted by:</label>
                <Select
                  options={[
                    { value: 'top-reviewed', label: 'Top reviewed' },
                    { value: 'price-low', label: 'Price: Low to High' },
                    { value: 'price-high', label: 'Price: High to Low' },
                    { value: 'rating', label: 'Highest Rated' },
                  ]}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  dataTestId="results-sort"
                />
              </div>
            </div>

            <div className="results-page__hotels-list">
              {mockHotels.map((hotel) => (
                <HotelCard
                  key={hotel.id}
                  hotelName={hotel.hotelName}
                  location={hotel.location}
                  distance={hotel.distance}
                  access={hotel.access}
                  rating={hotel.rating}
                  reviewScore={hotel.reviewScore}
                  reviewCount={hotel.reviewCount}
                  reviewLabel={hotel.reviewLabel}
                  roomType={hotel.roomType}
                  bedType={hotel.bedType}
                  roomSize={hotel.roomSize}
                  amenities={hotel.amenities}
                  finalPrice={hotel.finalPrice}
                  originalPrice={hotel.originalPrice}
                  discountPercentage={hotel.discountPercentage}
                  nightsCount={hotel.nightsCount}
                  guestsCount={hotel.guestsCount}
                  variant="horizontal"
                  dataTestId={`hotel-card-${hotel.id}`}
                />
              ))}
            </div>

            <div className="results-page__pagination">
              <Pagination
                currentPage={currentPage}
                totalPages={10}
                onPageChange={setCurrentPage}
                dataTestId="results-pagination"
              />
            </div>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ResultsPage;
