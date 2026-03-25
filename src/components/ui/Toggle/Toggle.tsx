import './Toggle.scss';

interface ToggleProps {
  isActive: boolean;
  onToggle: () => void;
  label: string;
  dataTestId?: string;
  className?: string;
}

const Toggle: React.FC<ToggleProps> = ({
  isActive,
  onToggle,
  label,
  dataTestId,
  className = '',
}) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isActive}
      aria-label={label}
      className={`toggle ${isActive ? 'toggle--active' : ''} ${className}`}
      onClick={onToggle}
      data-testid={dataTestId}
    >
      <span className="toggle__track">
        <span className="toggle__thumb" />
      </span>
    </button>
  );
};

export default Toggle;
