import React from 'react';
import { Button, StarRating, FilterChip } from '@/components/ui';
import PriceRangeSlider from '@/components/shared/PriceRangeSlider/PriceRangeSlider';
import './ResultsSidebar.scss';

interface ResultsSidebarProps {
  minPrice: number;
  maxPrice: number;
  absoluteMin: number;
  absoluteMax: number;
  prices: number[];
  selectedStars: number[];
  selectedAmenities: string[];
  amenities: string[];
  onPriceRangeChange: (min: number, max: number) => void;
  onStarToggle: (star: number) => void;
  onAmenityToggle: (amenity: string) => void;
  onClear?: () => void;
}

const ResultsSidebar: React.FC<ResultsSidebarProps> = ({
  minPrice,
  maxPrice,
  absoluteMin,
  absoluteMax,
  prices,
  selectedStars,
  selectedAmenities,
  amenities,
  onPriceRangeChange,
  onStarToggle,
  onAmenityToggle,
  onClear,
}) => {
  return (
    <aside className="results-page__sidebar" data-testid="results-sidebar">

      {/* Map Filter */
      <div className="results-page__filter-group results-page__filter-group--map">
        <img src="/img/map.png" alt="show on map" />
        <Button
          variant="primary"
          className="results-page__map-button"
          size='small'
          data-testid="filter-map-view"
          >
            Show on map
        </Button>
      </div>}

      {/* Price Filter */}
      <div className="results-page__filter-group">
        <div className='results-page__filter-header'>
          <h6 className='results-page__filter-header-title'>Filter by:</h6>
          <h6
            className='results-page__filter-header-title--clear'
            onClick={onClear}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onClear?.()}
          >
            Clear
          </h6>
        </div>
        <hr />
        <h3 className="results-page__filter-title">Price range</h3>
        <PriceRangeSlider
          min={absoluteMin}
          max={absoluteMax}
          minValue={minPrice}
          maxValue={maxPrice}
          prices={prices}
          onChange={onPriceRangeChange}
          dataTestId="filter-price-range"
        />
      </div>

      {/* Property Classification */}
      <div className="results-page__filter-group">
        <h3 className="results-page__filter-title">Property classification</h3>
        <div className="results-page__star-filters">
          {[5, 4, 3, 2, 1].map((star) => (
            <label key={star} className="results-page__checkbox-label">
              <input
                type="checkbox"
                checked={selectedStars.includes(star)}
                onChange={() => onStarToggle(star)}
                data-testid={`filter-star-${star}`}
              />
              <StarRating
                rating={star}
                maxStars={5}
                size="small"
                dataTestId={`filter-star-rating-${star}`}
              />
            </label>
          ))}
        </div>
      </div>

      {/* Amenities Filter */}
      <div className="results-page__filter-group">
        <h3 className="results-page__filter-title">Amenities</h3>
        <div className="results-page__amenity-chips">
          {amenities.map((amenity) => (
            <FilterChip
              key={amenity}
              label={amenity}
              isActive={selectedAmenities.includes(amenity)}
              onClick={() => onAmenityToggle(amenity)}
              dataTestId={`filter-amenity-${amenity}`}
            />
          ))}
        </div>
      </div>
    </aside>
  );
};

export default ResultsSidebar;
