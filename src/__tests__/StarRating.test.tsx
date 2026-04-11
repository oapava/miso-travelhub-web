import { render, screen } from '@testing-library/react';
import StarRating from '@/components/ui/StarRating/StarRating';

describe('StarRating', () => {
  it('renders with correct aria-label for whole number rating', () => {
    render(<StarRating rating={4} />);
    expect(screen.getByRole('img', { name: '4 out of 5 stars' })).toBeInTheDocument();
  });

  it('renders with custom maxStars in aria-label', () => {
    render(<StarRating rating={3} maxStars={10} />);
    expect(screen.getByRole('img', { name: '3 out of 10 stars' })).toBeInTheDocument();
  });

  it('renders 5 stars by default', () => {
    const { container } = render(<StarRating rating={3} />);
    const stars = container.querySelectorAll('.star-rating__star');
    expect(stars).toHaveLength(5);
  });

  it('renders correct number of filled stars for rating 3', () => {
    const { container } = render(<StarRating rating={3} />);
    const filled = container.querySelectorAll('.star-rating__star--filled');
    expect(filled).toHaveLength(3);
  });

  it('renders correct number of empty stars for rating 3 out of 5', () => {
    const { container } = render(<StarRating rating={3} />);
    const empty = container.querySelectorAll('.star-rating__star--empty');
    expect(empty).toHaveLength(2);
  });

  it('renders a half star for fractional rating like 3.5', () => {
    const { container } = render(<StarRating rating={3.5} />);
    const half = container.querySelectorAll('.star-rating__star--half');
    expect(half).toHaveLength(1);
  });

  it('does not show numeric value by default', () => {
    render(<StarRating rating={4.5} dataTestId="sr" />);
    expect(screen.queryByText('4.5')).not.toBeInTheDocument();
  });

  it('shows numeric value when showValue is true', () => {
    render(<StarRating rating={4.5} showValue />);
    expect(screen.getByText('4.5')).toBeInTheDocument();
  });

  it('applies medium size class by default', () => {
    render(<StarRating rating={3} dataTestId="sr" />);
    expect(screen.getByTestId('sr')).toHaveClass('star-rating--medium');
  });

  it('applies small size class when size is small', () => {
    render(<StarRating rating={3} size="small" dataTestId="sr" />);
    expect(screen.getByTestId('sr')).toHaveClass('star-rating--small');
  });

  it('applies large size class when size is large', () => {
    render(<StarRating rating={5} size="large" dataTestId="sr" />);
    expect(screen.getByTestId('sr')).toHaveClass('star-rating--large');
  });

  it('sets data-testid attribute', () => {
    render(<StarRating rating={4} dataTestId="star-rating-test" />);
    expect(screen.getByTestId('star-rating-test')).toBeInTheDocument();
  });

  it('renders all filled stars for maximum rating', () => {
    const { container } = render(<StarRating rating={5} />);
    const filled = container.querySelectorAll('.star-rating__star--filled');
    expect(filled).toHaveLength(5);
  });

  it('renders all empty stars for zero rating', () => {
    const { container } = render(<StarRating rating={0} />);
    const empty = container.querySelectorAll('.star-rating__star--empty');
    expect(empty).toHaveLength(5);
  });
});
