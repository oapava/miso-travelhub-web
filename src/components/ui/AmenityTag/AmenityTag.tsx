import './AmenityTag.scss';

interface AmenityTagProps {
  label: string;
  dataTestId?: string;
  className?: string;
}

const AmenityTag: React.FC<AmenityTagProps> = ({
  label,
  dataTestId,
  className = '',
}) => {
  return (
    <span
      className={`amenity-tag ${className}`}
      data-testid={dataTestId}
    >
      <span className="amenity-tag__icon" aria-hidden="true"><img src="/img/check.png" alt="" /></span>
      <span className="amenity-tag__label">{label}</span>
    </span>
  );
};

export default AmenityTag;
