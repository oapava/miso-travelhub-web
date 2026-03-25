import './Badge.scss';

type BadgeVariant = 'primary' | 'success' | 'warning' | 'info' | 'discount' | 'rating';
type BadgeSize = 'small' | 'medium';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dataTestId?: string;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  size = 'small',
  dataTestId,
  className = '',
}) => {
  const badgeClasses = [
    'badge',
    `badge--${variant}`,
    `badge--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span
      className={badgeClasses}
      data-testid={dataTestId}
      role="status"
    >
      {label}
    </span>
  );
};

export default Badge;
