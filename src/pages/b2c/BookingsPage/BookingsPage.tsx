import React from 'react';
import { Header, SearchBar, AccountSidebar, Footer } from '@/components/layout';
import { Breadcrumb, Badge } from '@/components/ui';
import { HotelCard } from '@/components/shared/HotelCard';
import './BookingsPage.scss';

const BookingsPage: React.FC = () => {

  const bookingGroups = [
    {
      date: 'Aug. 2025',
      bookings: [
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
          nightsCount: 3,
          guestsCount: 2,
          status: 'Active',
        },
      ],
    },
    {
      date: 'Sep. 2024',
      bookings: [
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
          nightsCount: 5,
          guestsCount: 2,
          status: 'Completed',
        },
      ],
    },
  ];

  return (
    <div className="bookings-page" data-testid="bookings-page">
      <Header />
      <div className="bookings-page__search-bar-wrapper">
        <SearchBar variant="compact" />
      </div>

      <div className="bookings-page__container">
        <Breadcrumb
          items={[
            { label: 'Home', path: '/' },
            { label: 'Account', path: '/account' },
            { label: 'Bookings' },
          ]}
        />

        <div className="bookings-page__content">
          <AccountSidebar
            userName="John Doe"
            userEmail="johndoe@example.com"
            dataTestId="bookings-sidebar"
          />

          <main className="bookings-page__main" data-testid="bookings-main">
            <h1 className="bookings-page__title">Booking History</h1>

            <div className="bookings-page__bookings-list">
              {bookingGroups.map((group, groupIndex) => (
                <section
                  key={groupIndex}
                  className="bookings-page__booking-group"
                  data-testid={`booking-group-${groupIndex}`}
                >
                  <div className="bookings-page__group-header">
                    <h2 className="bookings-page__group-date">{group.date}</h2>
                  </div>

                  <div className="bookings-page__group-bookings">
                    {group.bookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="bookings-page__booking-item"
                        data-testid={`booking-item-${booking.id}`}
                      >
                        <HotelCard
                          hotelName={booking.hotelName}
                          location={booking.location}
                          distance={booking.distance}
                          access={booking.access}
                          rating={booking.rating}
                          reviewScore={booking.reviewScore}
                          reviewCount={booking.reviewCount}
                          reviewLabel={booking.reviewLabel}
                          roomType={booking.roomType}
                          bedType={booking.bedType}
                          roomSize={booking.roomSize}
                          amenities={booking.amenities}
                          finalPrice={booking.finalPrice}
                          originalPrice={booking.originalPrice}
                          nightsCount={booking.nightsCount}
                          guestsCount={booking.guestsCount}
                          variant="horizontal"
                          dataTestId={`booking-card-${booking.id}`}
                        />
                        <Badge
                          label={booking.status}
                          variant={booking.status === 'Active' ? 'success' : 'info'}
                          dataTestId={`booking-status-${booking.id}`}
                        />
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BookingsPage;
