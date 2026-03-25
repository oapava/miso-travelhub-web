import './StatCard.scss';

interface StatCardProps {
  title: string;
  mainValue: string;
  subtitle?: string;
  secondaryValue?: string;
  secondaryLabel?: string;
  badgeText?: string;
  badgeVariant?: 'success' | 'warning' | 'info';
  showChart?: boolean;
  dataTestId?: string;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  mainValue,
  subtitle,
  secondaryValue,
  secondaryLabel,
  badgeText,
  badgeVariant = 'success',
  showChart = false,
  dataTestId,
  className = '',
}) => {
  return (
    <div className={`stat-card ${className}`} data-testid={dataTestId}>
      <h4 className="stat-card__title">{title}</h4>

      <div className="stat-card__body">
        <div className="stat-card__values">
          <span className="stat-card__main-value">{mainValue}</span>
          {subtitle && <span className="stat-card__subtitle">{subtitle}</span>}

          {secondaryValue && (
            <div className="stat-card__secondary">
              <span className="stat-card__secondary-value">{secondaryValue}</span>
              {secondaryLabel && (
                <span className="stat-card__secondary-label">{secondaryLabel}</span>
              )}
            </div>
          )}

          {badgeText && (
            <span className={`stat-card__badge stat-card__badge--${badgeVariant}`}>
              {badgeText}
            </span>
          )}
        </div>

        {showChart && (
          <div className="stat-card__chart" aria-hidden="true" data-testid={dataTestId ? `${dataTestId}-chart` : undefined}>
            <div className="stat-card__chart-placeholder">
              {/* Placeholder bar chart */}
              {[40, 60, 35, 80, 55, 70, 90].map((height, index) => (
                <div
                  key={index}
                  className="stat-card__chart-bar"
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
