import React, { useState } from 'react';
import { Header, SearchBar, Footer } from '@/components/layout';
import { FilterChip } from '@/components/ui';
import { HotelCard } from '@/components/shared/HotelCard';
import './HomePage.scss';

const HomePage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('hotel');

  const categories = ['Hotel', 'Villa', 'Apartment', 'Resort', 'Hostel'];

  const mockHotels = [
    {
      id: '1',
      hotelName: 'Luxury Paris Hotel',
      location: 'Paris, France',
      distance: '1.8km from center',
      access: 'Metro access',
      rating: 4,
      reviewScore: 9.2,
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
      imageUrl: '/img/bg-hotel.png',
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
      imageUrl: '/img/bg-hotel.png',
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
      imageUrl: '/img/bg-hotel.png',
    },
  ];

  const securityTags = ['Free cancellation', 'Best price', 'Verified', 'Instant confirm', 'Secure'];

  return (
    <div className="home-page" data-testid="home-page">
      <Header />

      {/* Hero Section */}
      <section className="home-page__hero" data-testid="home-page-hero">
        <div className="home-page__hero-background" />
        <div className="home-page__hero-overlay" />
        <div className="home-page__hero-content">
          <h1 className="home-page__hero-title">Your Trip Starts Here</h1>
          <p className="home-page__hero-subtitle">
            Find unique across hotels, villas and more.
          </p>
        </div>

        {/* SearchBar overlapping hero */}
        <div className="home-page__search-bar-container">
          <SearchBar variant="expanded" />
        </div>
      </section>

      

      {/* Top Hotels Section */}
      <section className="home-page__top-hotels" data-testid="home-page-top-hotels">
        <div className="home-page__section-container">
          <div className="home-page__top-hotels-header">
            <h2 className="home-page__section-title">Top Hotels</h2>
            <div className="home-page__security-tags">
              {securityTags.map((tag, index) => (
                <FilterChip
                  key={index}
                  label={tag}
                  isActive={false}
                  dataTestId={`security-tag-${index}`}
                />
              ))}
            </div>
          </div>

          <div className="home-page__hotels-grid">
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
                variant="vertical"
                dataTestId={`hotel-card-${hotel.id}`}
              />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
