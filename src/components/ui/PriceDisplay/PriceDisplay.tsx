import { useTranslation } from 'react-i18next';
import './PriceDisplay.scss';

interface PriceDisplayProps {
  originalPrice?: number;
  finalPrice: number;
  currency?: string;
  period?: string;
  discountPercentage?: number;
  size?: 'small' | 'medium' | 'large';
  dataTestId?: string;
  className?: string;
}

const PriceDisplay: React.FC<PriceDisplayProps> = ({
  originalPrice,
  finalPrice,
  currency = '$',
  period,
  discountPercentage,
  size = 'medium',
  dataTestId,
  className = '',
}) => {
  const { t } = useTranslation();
  const hasDiscount = originalPrice && originalPrice > finalPrice;

  return (
    <div
      className={`price-display price-display--${size} ${className}`}
      data-testid={dataTestId}
    >
      {hasDiscount && (
        <span className="price-display__original" aria-label={t('common.from')}>
          {currency}{originalPrice.toLocaleString()}
        </span>
      )}
      {discountPercentage && (
        <span className="price-display__discount" aria-label={`${discountPercentage}% discount`}>
          {discountPercentage}%
        </span>
      )}
      <span className="price-display__final">
        {currency}{finalPrice.toLocaleString()}
      </span>
      {period && (
        <span className="price-display__period">{period}</span>
      )}
    </div>
  );
};

export default PriceDisplay;
