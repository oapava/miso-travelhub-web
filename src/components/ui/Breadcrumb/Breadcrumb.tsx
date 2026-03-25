import { Link } from 'react-router-dom';
import './Breadcrumb.scss';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  dataTestId?: string;
  className?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  dataTestId,
  className = '',
}) => {
  return (
    <nav
      className={`breadcrumb ${className}`}
      aria-label="Breadcrumb"
      data-testid={dataTestId}
    >
      <ol className="breadcrumb__list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li
              key={`breadcrumb-${index}`}
              className="breadcrumb__item"
            >
              {!isLast && item.path ? (
                <>
                  <Link
                    to={item.path}
                    className="breadcrumb__link"
                  >
                    {item.label}
                  </Link>
                  <span className="breadcrumb__separator" aria-hidden="true">
                    /
                  </span>
                </>
              ) : (
                <span
                  className="breadcrumb__current"
                  aria-current="page"
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
