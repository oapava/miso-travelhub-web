import './StarRating.scss';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: 'small' | 'medium' | 'large';
  showValue?: boolean;
  dataTestId?: string;
  className?: string;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxStars = 5,
  size = 'medium',
  showValue = false,
  dataTestId,
  className = '',
}) => {
  const renderStars = () => {
    return Array.from({ length: maxStars }, (_, index) => {
      const starIndex = index + 1;
      const isFilled = starIndex <= Math.floor(rating);
      const isHalf = !isFilled && starIndex <= Math.ceil(rating) && rating % 1 !== 0;

      return (
        <span
          key={starIndex}
          className={`star-rating__star ${
            isFilled
              ? 'star-rating__star--filled'
              : isHalf
                ? 'star-rating__star--half'
                : 'star-rating__star--empty'
          }`}
          aria-hidden="true"
        >
          ★
        </span>
      );
    });
  };

  return (
    <div
      className={`star-rating star-rating--${size} ${className}`}
      role="img"
      aria-label={`${rating} out of ${maxStars} stars`}
      data-testid={dataTestId}
    >
      <div className="star-rating__stars">{renderStars()}</div>
      {showValue && (
        <span className="star-rating__value">{rating.toFixed(1)}</span>
      )}
    </div>
  );
};

export default StarRating;
