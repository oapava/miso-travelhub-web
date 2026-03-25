import React from 'react';
import { Input } from '@/components/ui';
import './ResultsSidebar.scss';

interface ResultsSidebarProps {
  minPrice: string;
  maxPrice: string;
  selectedStars: number[];
  selectedAmenities: string[];
  amenities: string[];
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
  onStarToggle: (star: number) => void;
  onAmenityToggle: (amenity: string) => void;
}

const ResultsSidebar: React.FC<ResultsSidebarProps> = ({
  minPrice,
  maxPrice,
  selectedStars,
  selectedAmenities,
  amenities,
  onMinPriceChange,
  onMaxPriceChange,
  onStarToggle,
  onAmenityToggle,
}) => {
  return (
    <aside className="results-page__sidebar" data-testid="results-sidebar">
      {/* Price Filter */}
      <div className="results-page__filter-group">
        <h3 className="results-page__filter-title">Price range</h3>
        <div className="results-page__price-inputs">
          <Input
            type="number"
            placeholder="Min $0"
            value={minPrice}
            onChange={(e) => onMinPriceChange(e.target.value)}
            dataTestId="filter-min-price"
          />
          <Input
            type="number"
            placeholder="Max $2000"
            value={maxPrice}
            onChange={(e) => onMaxPriceChange(e.target.value)}
            dataTestId="filter-max-price"
          />
        </div>
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
              <span className="results-page__checkbox-text">{star} Star</span>
            </label>
          ))}
        </div>
      </div>

      {/* Amenities Filter */}
      <div className="results-page__filter-group">
        <h3 className="results-page__filter-title">Amenities</h3>
        <div className="results-page__amenity-filters">
          {amenities.map((amenity) => (
            <label key={amenity} className="results-page__checkbox-label">
              <input
                type="checkbox"
                checked={selectedAmenities.includes(amenity)}
                onChange={() => onAmenityToggle(amenity)}
                data-testid={`filter-amenity-${amenity}`}
              />
              <span className="results-page__checkbox-text">{amenity}</span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default ResultsSidebar;
