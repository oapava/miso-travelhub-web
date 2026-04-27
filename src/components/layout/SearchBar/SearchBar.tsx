import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, DateRangePicker } from '@/components/ui';
import { searchService } from '@/services/search.service';
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

/** Returns tomorrow's date as "YYYY-MM-DD" in local time */
function getTomorrow(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const SearchBar: React.FC<SearchBarProps> = ({
  variant = 'expanded',
  onSearch,
  initialValues,
  dataTestId,
  className = '',
}) => {
  const { t } = useTranslation();
  const tomorrow = getTomorrow();

  const [selectedPlace, setSelectedPlace] = useState<'hotels' | 'apartments' | 'suites'>('hotels');
  const [searchData, setSearchData] = useState<SearchParams>({
    location: initialValues?.location ?? '',
    checkIn:  initialValues?.checkIn  ?? '',
    checkOut: initialValues?.checkOut ?? '',
    rooms:    initialValues?.rooms    ?? 1,
    adults:   initialValues?.adults   ?? 1,
    children: initialValues?.children ?? 0,
  });
  const [isGuestsOpen, setIsGuestsOpen] = useState(false);
  const [cities, setCities] = useState<string[]>([]);
  const guestsRef = useRef<HTMLDivElement>(null);

  // ── Fetch available cities on mount ──
  useEffect(() => {
    searchService
      .searchCities()
      .then(setCities)
      .catch(() => setCities([]));
  }, []);

  // ── Close guests dropdown on outside click ──
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
    setSearchData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCounter = (field: 'rooms' | 'adults' | 'children', delta: number, min: number) => {
    setSearchData((prev) => ({ ...prev, [field]: Math.max(min, (prev[field] as number) + delta) }));
  };

  const handleDateChange = (start: string, end: string) => {
    setSearchData((prev) => ({ ...prev, checkIn: start, checkOut: end }));
  };

  const handleSearch = () => {
    onSearch?.(searchData);
  };

  // Search button active only when all required fields are filled
  const isFormComplete = Boolean(searchData.location && searchData.checkIn && searchData.checkOut);

  return (
    <div
      className={`search-bar search-bar--${variant} ${className}`}
      role="search"
      aria-label={t('common.search')}
      data-testid={dataTestId}
    >
      {/* ── Place selector (Hotels / Apartments / Suites) ── */}
      <div className="search-bar__places_box">
        <div className="search-bar__places_box__bar">
          {(['hotels', 'apartments', 'suites'] as const).map((place) => (
            <div
              key={place}
              onClick={() => setSelectedPlace(place)}
              className={`search-bar__places_box__item ${selectedPlace === place ? 'search-bar__places_box__item--active' : ''}`}
            >
              {place.charAt(0).toUpperCase() + place.slice(1)}
            </div>
          ))}
        </div>
      </div>

      {/* ── Location — select from API cities ── */}
      <div className="search-bar__field">
        <label htmlFor="search-location" className="search-bar__label">
          Location
        </label>
        <select
          id="search-location"
          className="search-bar__input search-bar__select"
          value={searchData.location}
          onChange={(e) => handleInputChange('location', e.target.value)}
          data-testid="search-bar-location"
        >
          <option value="" disabled>
            {cities.length === 0 ? 'Loading cities…' : t('common.searchPlaceholder')}
          </option>
          {cities.map((city) => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
      </div>

      <div className="search-bar__divider" aria-hidden="true" />

      {/* ── Date range picker (replaces separate check-in / check-out inputs) ── */}
      <DateRangePicker
        startDate={searchData.checkIn}
        endDate={searchData.checkOut}
        minDate={tomorrow}
        onChange={handleDateChange}
        startLabel="Check In"
        endLabel="Check Out"
        startTestId="search-bar-checkin"
        endTestId="search-bar-checkout"
        className="search-bar__date-range"
      />

      <div className="search-bar__divider" aria-hidden="true" />

      {/* ── Rooms & Guests ── */}
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
              { label: 'Rooms',    field: 'rooms',    min: 1 },
              { label: 'Adults',   field: 'adults',   min: 1 },
              { label: 'Children', field: 'children', min: 0 },
            ] as { label: string; field: 'rooms' | 'adults' | 'children'; min: number }[]).map(
              ({ label, field, min }) => (
                <div key={field} className="search-bar__guests-row">
                  <span className="search-bar__guests-label">{label}</span>
                  <div className="search-bar__guests-counter">
                    <button
                      type="button"
                      className="search-bar__guests-btn"
                      onClick={() => handleCounter(field, -1, min)}
                      aria-label={`Decrease ${label}`}
                      disabled={(searchData[field] as number) <= min}
                    >−</button>
                    <span className="search-bar__guests-value" data-testid={`search-bar-${field}`}>
                      {searchData[field]}
                    </span>
                    <button
                      type="button"
                      className="search-bar__guests-btn"
                      onClick={() => handleCounter(field, 1, min)}
                      aria-label={`Increase ${label}`}
                    >+</button>
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </div>

      {/* ── Search button — disabled until form is complete ── */}
      <Button
        variant="primary"
        size={variant === 'compact' ? 'icon' : 'small'}
        onClick={handleSearch}
        disabled={!isFormComplete}
        dataTestId="search-bar-submit"
        aria-label={t('common.search')}
        className="search-bar__submit"
        title={!isFormComplete ? 'Please fill in all fields before searching' : undefined}
      >
        <img src="/img/search-ico.png" alt="Search" className="search-bar__submit-icon" />
        {variant !== 'compact' && t('common.search').toUpperCase()}
      </Button>
    </div>
  );
};

export default SearchBar;
