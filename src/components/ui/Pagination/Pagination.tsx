import './Pagination.scss';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  dataTestId?: string;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  dataTestId,
  className = '',
}) => {
  const getVisiblePages = (): (number | string)[] => {
    const pages: (number | string)[] = [];

    if (totalPages <= 5) {
      for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
        pages.push(pageNumber);
      }
      return pages;
    }

    pages.push(1);

    if (currentPage > 3) {
      pages.push('...');
    }

    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);

    for (let pageNumber = startPage; pageNumber <= endPage; pageNumber++) {
      pages.push(pageNumber);
    }

    if (currentPage < totalPages - 2) {
      pages.push('...');
    }

    pages.push(totalPages);

    return pages;
  };

  return (
    <nav
      className={`pagination ${className}`}
      aria-label="Pagination navigation"
      data-testid={dataTestId}
    >
      <ul className="pagination__list">
        {getVisiblePages().map((page, index) => (
          <li key={`page-${index}`} className="pagination__item">
            {typeof page === 'number' ? (
              <button
                type="button"
                className={`pagination__button ${
                  page === currentPage ? 'pagination__button--active' : ''
                }`}
                onClick={() => onPageChange(page)}
                aria-current={page === currentPage ? 'page' : undefined}
                aria-label={`Page ${page}`}
              >
                {page}
              </button>
            ) : (
              <span className="pagination__ellipsis" aria-hidden="true">
                {page}
              </span>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Pagination;
