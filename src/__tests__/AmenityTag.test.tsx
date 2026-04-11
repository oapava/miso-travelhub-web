import { render, screen } from '@testing-library/react';
import AmenityTag from '@/components/ui/AmenityTag/AmenityTag';

describe('AmenityTag', () => {
  it('renders the label text', () => {
    render(<AmenityTag label="Free WiFi" />);
    expect(screen.getByText('Free WiFi')).toBeInTheDocument();
  });

  it('renders an icon image', () => {
    render(<AmenityTag label="Pool" />);
    const icon = document.querySelector('.amenity-tag__icon img');
    expect(icon).toBeInTheDocument();
  });

  it('sets data-testid attribute', () => {
    render(<AmenityTag label="Gym" dataTestId="amenity-gym" />);
    expect(screen.getByTestId('amenity-gym')).toBeInTheDocument();
  });

  it('merges custom className', () => {
    render(<AmenityTag label="Parking" className="extra-tag" dataTestId="tag" />);
    expect(screen.getByTestId('tag')).toHaveClass('extra-tag');
  });

  it('always has the base amenity-tag class', () => {
    render(<AmenityTag label="Breakfast" dataTestId="tag" />);
    expect(screen.getByTestId('tag')).toHaveClass('amenity-tag');
  });
});
