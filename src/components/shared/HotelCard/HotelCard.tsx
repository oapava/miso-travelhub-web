import { useTranslation } from 'react-i18next';
import { StarRating, Badge, AmenityTag, PriceDisplay, Button } from '@/components/ui';
import './HotelCard.scss';

interface HotelCardProps {
  hotelName: string;
  location: string;
  distance: string;
  access: string;
  rating: number;
  reviewScore: number;
  reviewCount: number;
  reviewLabel: string;
  roomType: string;
  bedType: string;
  roomSize: string;
  amenities: string[];
  originalPrice?: number;
  finalPrice: number;
  nightsCount: number;
  guestsCount: number;
  discountPercentage?: number;
  imageUrl?: string;
  badgeText?: string;
  badgeVariant?: 'primary' | 'success' | 'warning';
  isFavorite?: boolean;
  variant?: 'horizontal' | 'vertical';
  onDetailClick?: () => void;
  onFavoriteToggle?: () => void;
  dataTestId?: string;
  className?: string;
}

const HotelCard: React.FC<HotelCardProps> = ({
  hotelName,
  location,
  distance,
  access,
  rating,
  reviewScore,
  reviewCount,
  reviewLabel,
  roomType,
  bedType,
  roomSize,
  amenities,
  originalPrice,
  finalPrice,
  nightsCount,
  guestsCount,
  discountPercentage,
  imageUrl = '/img/bg-hotel.png',
  badgeText,
  badgeVariant = 'primary',
  isFavorite: _isFavorite = false,
  variant = 'horizontal',
  onDetailClick,
  onFavoriteToggle: _onFavoriteToggle,
  dataTestId,
  className = '',
}) => {
  const { t } = useTranslation();

  return (
    <article
      className={`hotel-card hotel-card--${variant} ${className}`}
      data-testid={dataTestId}
    >
      <div className="hotel-card__image-container">
        {badgeText && (
          <Badge
            label={badgeText}
            variant={badgeVariant}
            size="small"
            className="hotel-card__badge"
          />
        )}
        {/* <button
          type="button"
          className={`hotel-card__favorite ${isFavorite ? 'hotel-card__favorite--active' : ''}`}
          onClick={onFavoriteToggle}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          aria-pressed={isFavorite}
          data-testid={dataTestId ? `${dataTestId}-favorite` : undefined}
        >
          ♥
        </button> */}
        <div
          className="hotel-card__image"
          role="img"
          aria-label={`${hotelName} photo`}
          style={
            imageUrl
              ? { backgroundImage: `url(${imageUrl})` }
              : { backgroundColor: '#c4d4e0' }
          }
        />
      </div>

      <div className="hotel-card__content">
        <div className="hotel-card__header">
          <div className="hotel-card__title-row">
            <h3 className="hotel-card__name">{hotelName}</h3>
            <StarRating rating={rating} size="small" />
          </div>

          <div className="hotel-card__review">
            <div className='hotel-card__review-label-box'>
              <span className="hotel-card__review-label">{reviewLabel}</span>
              <span className="hotel-card__review-count">{reviewCount} reviews</span>
            </div>
            <Badge label={reviewScore.toFixed(1)} variant="rating" size="small" />
          </div>
        </div>

        <div className="hotel-card__location">
          <span className="hotel-card__location-pin" aria-hidden="true">
            <img src="/img/location_on.svg" alt="" /> <span className="hotel-card__location-name">{location}</span>
          </span>
          <span className="hotel-card__distance">{distance}</span>
          <span className="hotel-card__access">{access}</span>
        </div>

        <div className="hotel-card__details">
          <span className="hotel-card__room-info">
            {roomType} | {bedType} - {roomSize}
          </span>
        </div>

        <div className="hotel-card__ammenities-price-box">
          <div className="hotel-card__amenities">
            {amenities.slice(0, 4).map((amenity) => (
              <AmenityTag key={amenity} label={amenity} />
            ))}
          </div>

          <div className="hotel-card__footer">
            {variant === 'vertical' && (
              <h3 className="hotel-card__name">{hotelName}</h3>
            )}
            <div className="hotel-card__pricing">
              <PriceDisplay
                originalPrice={originalPrice}
                finalPrice={finalPrice}
                discountPercentage={discountPercentage}
                size="medium"
              />
              <span className="hotel-card__stay-info">
                {nightsCount} nights, {guestsCount} adults
              </span>
            </div>

            <Button
              className="hotel-card__detail-button"
              variant="primary"
              size="small"
              onClick={onDetailClick}
              dataTestId={dataTestId ? `${dataTestId}-detail` : undefined}
            >
              {t('common.seeDetails').toUpperCase()}
            </Button>
          </div>
        </div>

        
      </div>
    </article>
  );
};

export default HotelCard;
