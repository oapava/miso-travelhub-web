import './Logo.scss';

interface LogoProps {
  variant?: 'full' | 'icon';
  size?: 'small' | 'medium' | 'large';
  dataTestId?: string;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({
  variant = 'full',
  size = 'medium',
  dataTestId,
  className = '',
}) => {
  return (
    <div
      className={`logo logo--${variant} logo--${size} ${className}`}
      data-testid={dataTestId}
      aria-label="TravelHub"
    >
      <img
        className="logo__icon"
        src="/img/logo.png"
        alt="TravelHub logo"
        aria-hidden={variant === 'icon' ? true : false}
      />
      {variant === 'full' && (
        <span className="logo__text">
          <span className="logo__text-travel">Travel</span>
          <span className="logo__text-hub">Hub</span>
        </span>
      )}
    </div>
  );
};

export default Logo;
