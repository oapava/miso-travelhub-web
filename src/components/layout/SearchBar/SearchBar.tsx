import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui';
import './SearchBar.scss';

interface SearchBarProps {
  variant?: 'expanded' | 'compact';
  onSearch?: (searchParams: SearchParams) => void;
  initialValues?: Partial<SearchParams>;
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
  initialValues,
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
    ...initialValues,
  });
  const [isGuestsOpen, setIsGuestsOpen] = useState(false);
  const guestsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (guestsRef.current && !guestsRef.current.contains(event.target as Node)) {
        setIsGuestsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (field: keyof SearchParams, value: string | number) => {
    setSearchData((previousData) => ({ ...previousData, [field]: value }));
  };

  const handleCounter = (field: 'rooms' | 'adults' | 'children', delta: number, min: number) => {
    setSearchData((prev) => ({ ...prev, [field]: Math.max(min, prev[field] as number + delta) }));
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

      <div className="search-bar__field search-bar__field--guests" ref={guestsRef}>
        <label className="search-bar__label">Rooms and Guests</label>
        <button
          type="button"
          className="search-bar__guests-summary"
          onClick={() => setIsGuestsOpen((prev) => !prev)}
          aria-expanded={isGuestsOpen}
          aria-haspopup="true"
          data-testid="search-bar-guests-toggle"
        >
          {searchData.rooms} Room, {searchData.adults} Adults, {searchData.children} Children
        </button>

        {isGuestsOpen && (
          <div className="search-bar__guests-dropdown" role="dialog" aria-label="Rooms and Guests">
            {([
              { label: 'Rooms', field: 'rooms', min: 1 },
              { label: 'Adults', field: 'adults', min: 1 },
              { label: 'Children', field: 'children', min: 0 },
            ] as { label: string; field: 'rooms' | 'adults' | 'children'; min: number }[]).map(({ label, field, min }) => (
              <div key={field} className="search-bar__guests-row">
                <span className="search-bar__guests-label">{label}</span>
                <div className="search-bar__guests-counter">
                  <button
                    type="button"
                    className="search-bar__guests-btn"
                    onClick={() => handleCounter(field, -1, min)}
                    aria-label={`Decrease ${label}`}
                    disabled={searchData[field] as number <= min}
                  >
                    −
                  </button>
                  <span className="search-bar__guests-value" data-testid={`search-bar-${field}`}>
                    {searchData[field]}
                  </span>
                  <button
                    type="button"
                    className="search-bar__guests-btn"
                    onClick={() => handleCounter(field, 1, min)}
                    aria-label={`Increase ${label}`}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Button
        variant="primary"
        size={variant === 'compact' ? 'icon' : 'small'}
        onClick={handleSearch}
        dataTestId="search-bar-submit"
        aria-label={t('common.search')}
        className="search-bar__submit"
      >
        <img src="/img/search-ico.png" alt="Search" className="search-bar__submit-icon" />
        {variant !== 'compact' && t('common.search').toUpperCase()}
      </Button>
    </div>
  );
};

export default SearchBar;
