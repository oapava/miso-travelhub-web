import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HotelCard from '@/components/shared/HotelCard/HotelCard';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en', changeLanguage: jest.fn() },
  }),
}));

const defaultProps = {
  hotelName: 'Grand Hotel',
  location: 'Paris',
  distance: '2 km from center',
  access: '5 min walk to metro',
  rating: 4,
  reviewScore: 8.5,
  reviewCount: 320,
  reviewLabel: 'Excellent',
  roomType: 'Double Room',
  bedType: 'King Bed',
  roomSize: '32 m²',
  amenities: ['Free WiFi', 'Pool', 'Gym', 'Parking'],
  finalPrice: 150,
  nightsCount: 3,
  guestsCount: 2,
};

const renderCard = (overrides = {}) =>
  render(
    <MemoryRouter>
      <HotelCard {...defaultProps} {...overrides} />
    </MemoryRouter>,
  );

describe('HotelCard', () => {
  it('renders the hotel name', () => {
    renderCard();
    expect(screen.getAllByText('Grand Hotel').length).toBeGreaterThan(0);
  });

  it('renders the location', () => {
    renderCard();
    expect(screen.getByText('Paris')).toBeInTheDocument();
  });

  it('renders the distance', () => {
    renderCard();
    expect(screen.getByText('2 km from center')).toBeInTheDocument();
  });

  it('renders the access info', () => {
    renderCard();
    expect(screen.getByText('5 min walk to metro')).toBeInTheDocument();
  });

  it('renders the review label and count', () => {
    renderCard();
    expect(screen.getByText('Excellent')).toBeInTheDocument();
    expect(screen.getByText('320 reviews')).toBeInTheDocument();
  });

  it('renders the room info', () => {
    renderCard();
    expect(screen.getByText('Double Room | King Bed - 32 m²')).toBeInTheDocument();
  });

  it('renders the night and guest count', () => {
    renderCard();
    expect(screen.getByText('3 nights, 2 adults')).toBeInTheDocument();
  });

  it('renders amenity tags', () => {
    renderCard();
    expect(screen.getByText('Free WiFi')).toBeInTheDocument();
    expect(screen.getByText('Pool')).toBeInTheDocument();
    expect(screen.getByText('Gym')).toBeInTheDocument();
  });

  it('renders badge when badgeText is provided', () => {
    renderCard({ badgeText: 'Best Value' });
    expect(screen.getByText('Best Value')).toBeInTheDocument();
  });

  it('does not render badge when badgeText is not provided', () => {
    renderCard();
    expect(document.querySelector('.hotel-card__badge')).not.toBeInTheDocument();
  });

  it('renders final price', () => {
    renderCard({ finalPrice: 200 });
    expect(screen.getByText('$200')).toBeInTheDocument();
  });

  it('renders original price when provided and higher than final', () => {
    renderCard({ originalPrice: 250, finalPrice: 150 });
    expect(screen.getByText('$250')).toBeInTheDocument();
  });

  it('renders discount percentage when provided', () => {
    renderCard({ discountPercentage: 15 });
    expect(screen.getByText('15%')).toBeInTheDocument();
  });

  it('calls onDetailClick when the see details button is clicked', () => {
    const onDetailClick = jest.fn();
    renderCard({ onDetailClick, dataTestId: 'hotel' });
    fireEvent.click(screen.getByTestId('hotel-detail'));
    expect(onDetailClick).toHaveBeenCalledTimes(1);
  });

  it('applies horizontal variant class by default', () => {
    renderCard({ dataTestId: 'hotel' });
    expect(screen.getByTestId('hotel')).toHaveClass('hotel-card--horizontal');
  });

  it('applies vertical variant class when variant is vertical', () => {
    renderCard({ variant: 'vertical', dataTestId: 'hotel' });
    expect(screen.getByTestId('hotel')).toHaveClass('hotel-card--vertical');
  });

  it('limits amenities display to 4 items', () => {
    renderCard({
      amenities: ['WiFi', 'Pool', 'Gym', 'Parking', 'Spa', 'Bar'],
    });
    const amenityTags = document.querySelectorAll('.amenity-tag');
    expect(amenityTags.length).toBeLessThanOrEqual(4);
  });

  it('sets data-testid attribute', () => {
    renderCard({ dataTestId: 'hotel-card-1' });
    expect(screen.getByTestId('hotel-card-1')).toBeInTheDocument();
  });
});
