import './FilterChip.scss';

interface FilterChipProps {
  label: string;
  isActive?: boolean;
  icon?: string;
  onClick?: () => void;
  dataTestId?: string;
  className?: string;
}

const FilterChip: React.FC<FilterChipProps> = ({
  label,
  isActive = false,
  icon,
  onClick,
  dataTestId,
  className = '',
}) => {
  return (
    <button
      type="button"
      className={`filter-chip ${isActive ? 'filter-chip--active' : ''} ${className}`}
      onClick={onClick}
      aria-pressed={isActive}
      data-testid={dataTestId}
    >
      {icon && <span className="filter-chip__icon" aria-hidden="true">{icon}</span>}
      <span className="filter-chip__label">{label}</span>
    </button>
  );
};

export default FilterChip;
