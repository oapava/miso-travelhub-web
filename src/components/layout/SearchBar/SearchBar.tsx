import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui';
import './SearchBar.scss';

interface SearchBarProps {
  variant?: 'expanded' | 'compact';
  onSearch?: (searchParams: SearchParams) => void;
  dataTestId?: string;
  className?: string;
}

interface SearchParams {
  location: string;
  checkIn: string;
  checkOut: string;
  rooms: number;
  adults: number;
  children: number;
}

const SearchBar: React.FC<SearchBarProps> = ({
  variant = 'expanded',
  onSearch,
  dataTestId,
  className = '',
}) => {
  const { t } = useTranslation();
  const [selectedPlace, setSelectedPlace] = useState<'hotels' | 'apartments' | 'suites'>('hotels');
  const [searchData, setSearchData] = useState<SearchParams>({
    location: '',
    checkIn: '',
    checkOut: '',
    rooms: 1,
    adults: 1,
    children: 0,
  });

  const handleInputChange = (field: keyof SearchParams, value: string | number) => {
    setSearchData((previousData) => ({ ...previousData, [field]: value }));
  };

  const handleSearch = () => {
    onSearch?.(searchData);
  };

  const selectPlace = (place: 'hotels' | 'apartments' | 'suites') => {
    setSelectedPlace(place);
  };

  return (
    <div
      className={`search-bar search-bar--${variant} ${className}`}
      role="search"
      aria-label={t('common.search')}
      data-testid={dataTestId}
    >

      <div className='search-bar__places_box'>
        <div className='search-bar__places_box__bar'>
          <div
            onClick={() => selectPlace('hotels')}
            className={`search-bar__places_box__item ${selectedPlace === 'hotels' ? 'search-bar__places_box__item--active' : ''}`}
          >
            Hotels
          </div>
          <div
            onClick={() => selectPlace('apartments')}
            className={`search-bar__places_box__item ${selectedPlace === 'apartments' ? 'search-bar__places_box__item--active' : ''}`}
          >
            Apartments
          </div>
          <div
            onClick={() => selectPlace('suites')}
            className={`search-bar__places_box__item ${selectedPlace === 'suites' ? 'search-bar__places_box__item--active' : ''}`}
          >
            Suites
          </div>
        </div>
        
      </div>

      <div className="search-bar__field">

        <label htmlFor="search-location" className="search-bar__label">
          Location
        </label>
        <input
          id="search-location"
          type="text"
          className="search-bar__input"
          placeholder={t('common.searchPlaceholder')}
          value={searchData.location}
          onChange={(event) => handleInputChange('location', event.target.value)}
          data-testid="search-bar-location"
        />
      </div>

      <div className="search-bar__divider" aria-hidden="true" />

      <div className="search-bar__field">
        <label htmlFor="search-checkin" className="search-bar__label">
          Check In
        </label>
        <input
          id="search-checkin"
          type="date"
          className="search-bar__input"
          placeholder="Add date"
          value={searchData.checkIn}
          onChange={(event) => handleInputChange('checkIn', event.target.value)}
          data-testid="search-bar-checkin"
        />
      </div>

      <div className="search-bar__divider" aria-hidden="true" />

      <div className="search-bar__field">
        <label htmlFor="search-checkout" className="search-bar__label">
          Check Out
        </label>
        <input
          id="search-checkout"
          type="date"
          className="search-bar__input"
          placeholder="Add date"
          value={searchData.checkOut}
          onChange={(event) => handleInputChange('checkOut', event.target.value)}
          data-testid="search-bar-checkout"
        />
      </div>

      <div className="search-bar__divider" aria-hidden="true" />

      <div className="search-bar__field search-bar__field--guests">
        <label htmlFor="search-rooms" className="search-bar__label">
          Rooms and Guests
        </label>
        <span className="search-bar__guests-summary">
          {searchData.rooms} Room, {searchData.adults} Adults, {searchData.children} Children
        </span>
      </div>

      <Button
        variant="primary"
        size="small"//{variant === 'compact' ? 'small' : 'medium'}
        onClick={handleSearch}
        dataTestId="search-bar-submit"
        aria-label={t('common.search')}
        className="search-bar__submit"
      >
        <img src="/img/search-ico.png" alt="Search" className="search-bar__submit-icon" />
        {t('common.search').toUpperCase()}
      </Button>
    </div>
  );
};

export default SearchBar;
