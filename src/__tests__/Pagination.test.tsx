import { render, screen, fireEvent } from '@testing-library/react';
import Pagination from '@/components/ui/Pagination/Pagination';

describe('Pagination', () => {
  it('renders navigation element with aria-label', () => {
    render(<Pagination currentPage={1} totalPages={3} onPageChange={jest.fn()} />);
    expect(screen.getByRole('navigation', { name: 'Pagination navigation' })).toBeInTheDocument();
  });

  it('renders all page buttons when totalPages is 5 or fewer', () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={jest.fn()} />);
    expect(screen.getByRole('button', { name: 'Page 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Page 5' })).toBeInTheDocument();
  });

  it('marks the current page with aria-current="page"', () => {
    render(<Pagination currentPage={2} totalPages={5} onPageChange={jest.fn()} />);
    expect(screen.getByRole('button', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page');
  });

  it('other pages do not have aria-current attribute', () => {
    render(<Pagination currentPage={2} totalPages={5} onPageChange={jest.fn()} />);
    expect(screen.getByRole('button', { name: 'Page 1' })).not.toHaveAttribute('aria-current');
  });

  it('calls onPageChange with correct page number when page button is clicked', () => {
    const onPageChange = jest.fn();
    render(<Pagination currentPage={1} totalPages={5} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Page 3' }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('renders ellipsis when there are more than 5 pages and current page is near end', () => {
    render(<Pagination currentPage={1} totalPages={10} onPageChange={jest.fn()} />);
    const ellipsis = document.querySelectorAll('.pagination__ellipsis');
    expect(ellipsis.length).toBeGreaterThan(0);
  });

  it('always renders first and last page buttons for large page counts', () => {
    render(<Pagination currentPage={5} totalPages={10} onPageChange={jest.fn()} />);
    expect(screen.getByRole('button', { name: 'Page 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Page 10' })).toBeInTheDocument();
  });

  it('applies active class to current page button', () => {
    render(<Pagination currentPage={3} totalPages={5} onPageChange={jest.fn()} />);
    expect(screen.getByRole('button', { name: 'Page 3' })).toHaveClass('pagination__button--active');
  });

  it('does not apply active class to non-current page buttons', () => {
    render(<Pagination currentPage={3} totalPages={5} onPageChange={jest.fn()} />);
    expect(screen.getByRole('button', { name: 'Page 1' })).not.toHaveClass('pagination__button--active');
  });

  it('sets data-testid attribute', () => {
    render(<Pagination currentPage={1} totalPages={3} onPageChange={jest.fn()} dataTestId="pagination" />);
    expect(screen.getByTestId('pagination')).toBeInTheDocument();
  });

  it('renders single page without ellipsis', () => {
    render(<Pagination currentPage={1} totalPages={1} onPageChange={jest.fn()} />);
    expect(document.querySelectorAll('.pagination__ellipsis')).toHaveLength(0);
    expect(screen.getByRole('button', { name: 'Page 1' })).toBeInTheDocument();
  });
});
