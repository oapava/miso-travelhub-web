import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Header, Footer } from '@/components/layout';
import { Breadcrumb, Select, Pagination } from '@/components/ui';
import { HotelCard } from '@/components/shared/HotelCard';
import ResultsSidebar from '@/components/shared/ResultsSidebar/ResultsSidebar';
import { searchService, HabitacionDisponible } from '@/services/search.service';
import { searchParamsStorage, searchResultsStorage } from '@/services/search-params.storage';
import './ResultsPage.scss';

interface SearchParams {
  location: string;
  checkIn: string;
  checkOut: string;
  rooms: number;
  adults: number;
  children: number;
}

interface ResultsState {
  results: HabitacionDisponible[];
  searchParams: SearchParams;
}

function calcNights(checkIn: string, checkOut: string): number {
  const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  const nights = Math.round(diff / (1000 * 60 * 60 * 24));
  return nights > 0 ? nights : 1;
}

const CARD_DEFAULTS = [
  {
    distance: '1.2km from center', access: 'Metro access',
    rating: 4, reviewScore: 9.0, reviewCount: 128, reviewLabel: 'Excellent',
    roomType: 'Deluxe Room', bedType: 'King Bed', roomSize: '35m²',
    amenities: ['Wifi', 'Air Conditioning', 'Mini Bar', 'Room Service'],
  },
  {
    distance: '2.5km from center', access: 'Bus access',
    rating: 5, reviewScore: 9.6, reviewCount: 256, reviewLabel: 'Exceptional',
    roomType: 'Suite', bedType: 'Queen Bed', roomSize: '50m²',
    amenities: ['Wifi', 'Pool', 'Spa', 'Restaurant'],
  },
  {
    distance: '0.8km from center', access: 'Walk',
    rating: 4, reviewScore: 8.6, reviewCount: 95, reviewLabel: 'Very Good',
    roomType: 'Standard Room', bedType: 'Twin Bed', roomSize: '28m²',
    amenities: ['Wifi', 'Air Conditioning', 'Work Desk', 'Balcony'],
  },
  {
    distance: '3.1km from center', access: 'Taxi',
    rating: 3, reviewScore: 7.8, reviewCount: 60, reviewLabel: 'Good',
    roomType: 'Economy Room', bedType: 'Double Bed', roomSize: '22m²',
    amenities: ['Wifi', 'Hair Dryer', 'Private Bathroom'],
  },
];

function reviewLabel(score: number): string {
  if (score >= 9.5) return 'Exceptional';
  if (score >= 9.0) return 'Excellent';
  if (score >= 8.0) return 'Very Good';
  if (score >= 7.0) return 'Good';
  return 'Fair';
}

function mapApiToCard(hotel: HabitacionDisponible, searchParams: SearchParams, index: number) {
  // CARD_DEFAULTS has 4 entries; modulo guarantees a valid index — non-null assertion is safe
  const defaults = CARD_DEFAULTS[index % CARD_DEFAULTS.length]!;
  const score = hotel.puntuacion_resena ?? defaults.reviewScore;
  return {
    id: hotel.id,
    hotelName: hotel.nombre_hotel,
    location: hotel.direccion,
    finalPrice: hotel.precio,
    nightsCount: calcNights(searchParams.checkIn, searchParams.checkOut),
    guestsCount: hotel.capacidad_maxima ?? searchParams.adults,
    distance: hotel.distancia ?? defaults.distance,
    access: hotel.acceso ?? defaults.access,
    rating: hotel.estrellas ?? defaults.rating,
    reviewScore: score,
    reviewCount: hotel.cantidad_resenas ?? defaults.reviewCount,
    reviewLabel: reviewLabel(score),
    roomType: hotel.tipo_habitacion ?? defaults.roomType,
    bedType: hotel.tipo_cama?.join(', ') ?? defaults.bedType,
    roomSize: hotel.tamano_habitacion ?? defaults.roomSize,
    amenities: hotel.amenidades ?? defaults.amenities,
  };
}

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

const ITEMS_PER_PAGE = 5;

const ResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const routeState = (location.state as ResultsState | null) ?? {
    results: searchResultsStorage.load<HabitacionDisponible>() ?? [],
    searchParams: searchParamsStorage.load() ?? null,
  };
  const [selectedStars, setSelectedStars] = useState<number[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('top-reviewed');
  const [currentPage, setCurrentPage] = useState(1);

  const amenities = ['Wifi', 'Iron', 'Air conditioning', 'Full screen TV', 'Mini bar', 'Room service', 'Private bathroom', 'Hair dryer', 'Work desk', 'Balcony'];

  const searchWasPerformed = routeState.searchParams !== null;

  const allHotels = useMemo(
    () =>
      searchWasPerformed
        ? routeState.results.map((h, i) => mapApiToCard(h, routeState.searchParams!, i))
        : mockHotels,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [routeState.results, searchWasPerformed]
  );

  const allPrices = useMemo(() => allHotels.map((h) => h.finalPrice), [allHotels]);

  const absoluteMin = useMemo(() => (allPrices.length ? Math.floor(Math.min(...allPrices)) : 0), [allPrices]);
  const absoluteMax = useMemo(() => (allPrices.length ? Math.ceil(Math.max(...allPrices)) : 2000), [allPrices]);

  const [minPrice, setMinPrice] = useState<number>(absoluteMin);
  const [maxPrice, setMaxPrice] = useState<number>(absoluteMax);

  // Reset price range whenever the hotel list changes (new search)
  useEffect(() => {
    setMinPrice(absoluteMin);
    setMaxPrice(absoluteMax);
  }, [absoluteMin, absoluteMax]);

  const handlePriceRangeChange = (min: number, max: number) => {
    setMinPrice(min);
    setMaxPrice(max);
  };

  const handleClearFilters = () => {
    setMinPrice(absoluteMin);
    setMaxPrice(absoluteMax);
    setSelectedStars([]);
    setSelectedAmenities([]);
  };

  const totalPages = Math.max(1, Math.ceil(allHotels.length / ITEMS_PER_PAGE));

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const hotelsToShow = allHotels.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleSearch = async (params: {
    location?: string;
    checkIn?: string;
    checkOut?: string;
    rooms?: number;
    adults?: number;
    children?: number;
  }) => {
    // Build a fully-required SearchParams using safe defaults
    const fullParams: SearchParams = {
      location: params.location ?? '',
      checkIn: params.checkIn ?? '',
      checkOut: params.checkOut ?? '',
      rooms: params.rooms ?? 1,
      adults: params.adults ?? 1,
      children: params.children ?? 0,
    };
    try {
      const results = await searchService.searchRooms({
        ciudad: fullParams.location,
        checkin: fullParams.checkIn,
        checkout: fullParams.checkOut,
        group: fullParams.adults,
        rooms: fullParams.rooms,
      });
      searchParamsStorage.save(fullParams);
      searchResultsStorage.save(results);
      navigate('/results', { state: { results, searchParams: fullParams } });
    } catch (error) {
      console.error('[SearchService] Error al buscar habitaciones:', error);
    }
  };

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
      <Header searchInitialValues={routeState?.searchParams ?? undefined} onSearch={handleSearch} />

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
            absoluteMin={absoluteMin}
            absoluteMax={absoluteMax}
            prices={allPrices}
            selectedStars={selectedStars}
            selectedAmenities={selectedAmenities}
            amenities={amenities}
            onPriceRangeChange={handlePriceRangeChange}
            onStarToggle={handleStarToggle}
            onAmenityToggle={handleAmenityToggle}
            onClear={handleClearFilters}
          />

          <main className="results-page__main" data-testid="results-main">
            <div className="results-page__header">
              <h1 className="results-page__title">
                {searchWasPerformed
                  ? `${allHotels.length} places in ${routeState.searchParams!.location}`
                  : 'Explore 300+ places in Paris'}
              </h1>
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
              {allHotels.length === 0 && (
                <p className="results-page__empty">
                  No rooms found for your search. Try different dates or a different city.
                </p>
              )}
              {hotelsToShow.map((hotel) => (
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
                  originalPrice={'originalPrice' in hotel ? (hotel as { originalPrice?: number }).originalPrice : undefined}
                  discountPercentage={'discountPercentage' in hotel ? (hotel as { discountPercentage?: number }).discountPercentage : undefined}
                  nightsCount={hotel.nightsCount}
                  guestsCount={hotel.guestsCount}
                  variant="horizontal"
                  dataTestId={`hotel-card-${hotel.id}`}
                  onDetailClick={() => navigate(`/detail/${hotel.id}`, { state: { hotel } })}
                />
              ))}
            </div>

            <div className="results-page__pagination">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
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
