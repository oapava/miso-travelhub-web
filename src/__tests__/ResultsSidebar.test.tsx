import { render, screen, fireEvent } from '@testing-library/react';
import ResultsSidebar from '@/components/shared/ResultsSidebar/ResultsSidebar';

const defaultProps = {
  minPrice: 50,
  maxPrice: 500,
  absoluteMin: 0,
  absoluteMax: 1000,
  prices: [50, 100, 200, 300, 500],
  selectedStars: [],
  selectedAmenities: [],
  amenities: ['WiFi', 'Pool', 'Gym', 'Parking'],
  onPriceRangeChange: jest.fn(),
  onStarToggle: jest.fn(),
  onAmenityToggle: jest.fn(),
  onClear: jest.fn(),
};

describe('ResultsSidebar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the sidebar', () => {
    render(<ResultsSidebar {...defaultProps} />);
    expect(screen.getByTestId('results-sidebar')).toBeInTheDocument();
  });

  it('renders Price range filter title', () => {
    render(<ResultsSidebar {...defaultProps} />);
    expect(screen.getByText('Price range')).toBeInTheDocument();
  });

  it('renders Property classification filter title', () => {
    render(<ResultsSidebar {...defaultProps} />);
    expect(screen.getByText('Property classification')).toBeInTheDocument();
  });

  it('renders Amenities filter title', () => {
    render(<ResultsSidebar {...defaultProps} />);
    expect(screen.getByText('Amenities')).toBeInTheDocument();
  });

  it('renders all star rating checkboxes', () => {
    render(<ResultsSidebar {...defaultProps} />);
    [1, 2, 3, 4, 5].forEach((star) => {
      expect(screen.getByTestId(`filter-star-${star}`)).toBeInTheDocument();
    });
  });

  it('calls onStarToggle when a star checkbox is clicked', () => {
    const onStarToggle = jest.fn();
    render(<ResultsSidebar {...defaultProps} onStarToggle={onStarToggle} />);
    fireEvent.click(screen.getByTestId('filter-star-4'));
    expect(onStarToggle).toHaveBeenCalledWith(4);
  });

  it('renders amenity filter chips', () => {
    render(<ResultsSidebar {...defaultProps} />);
    expect(screen.getByTestId('filter-amenity-WiFi')).toBeInTheDocument();
    expect(screen.getByTestId('filter-amenity-Pool')).toBeInTheDocument();
  });

  it('calls onAmenityToggle when an amenity chip is clicked', () => {
    const onAmenityToggle = jest.fn();
    render(<ResultsSidebar {...defaultProps} onAmenityToggle={onAmenityToggle} />);
    fireEvent.click(screen.getByTestId('filter-amenity-Gym'));
    expect(onAmenityToggle).toHaveBeenCalledWith('Gym');
  });

  it('calls onClear when the Clear button is clicked', () => {
    const onClear = jest.fn();
    render(<ResultsSidebar {...defaultProps} onClear={onClear} />);
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it('calls onClear when Enter key is pressed on Clear button', () => {
    const onClear = jest.fn();
    render(<ResultsSidebar {...defaultProps} onClear={onClear} />);
    fireEvent.keyDown(screen.getByRole('button', { name: 'Clear' }), { key: 'Enter' });
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it('does not call onClear on other key presses', () => {
    const onClear = jest.fn();
    render(<ResultsSidebar {...defaultProps} onClear={onClear} />);
    fireEvent.keyDown(screen.getByRole('button', { name: 'Clear' }), { key: 'Space' });
    expect(onClear).not.toHaveBeenCalled();
  });

  it('marks selected stars as checked', () => {
    render(<ResultsSidebar {...defaultProps} selectedStars={[4, 5]} />);
    expect(screen.getByTestId('filter-star-4')).toBeChecked();
    expect(screen.getByTestId('filter-star-5')).toBeChecked();
    expect(screen.getByTestId('filter-star-3')).not.toBeChecked();
  });

  it('marks selected amenities as active', () => {
    render(<ResultsSidebar {...defaultProps} selectedAmenities={['WiFi']} />);
    expect(screen.getByTestId('filter-amenity-WiFi')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('filter-amenity-Pool')).toHaveAttribute('aria-pressed', 'false');
  });

  it('renders Show on map button', () => {
    render(<ResultsSidebar {...defaultProps} />);
    expect(screen.getByText('Show on map')).toBeInTheDocument();
  });

  it('renders the price range slider', () => {
    render(<ResultsSidebar {...defaultProps} />);
    expect(screen.getByTestId('filter-price-range')).toBeInTheDocument();
  });
});
