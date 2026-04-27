import { render, screen, fireEvent } from '@testing-library/react';
import HotelGallery from '@/components/shared/HotelGallery/HotelGallery';

// Stub child components used by HotelGallery
jest.mock('@/components/shared/ImageSlider/ImageSlider', () => ({
  __esModule: true,
  default: ({
    dataTestId = 'image-slider',
    onImageClick,
    images,
  }: {
    dataTestId?: string;
    onImageClick?: (i: number) => void;
    images: string[];
  }) => (
    <div data-testid={dataTestId}>
      {images.map((_, i) => (
        <button
          key={i}
          data-testid={`${dataTestId}-item-${i}`}
          onClick={() => onImageClick?.(i)}
        >
          slide {i}
        </button>
      ))}
    </div>
  ),
}));

jest.mock('@/components/shared/ImageLightbox/ImageLightbox', () => ({
  __esModule: true,
  default: ({
    isOpen,
    onClose,
    onNavigate,
    currentIndex,
    dataTestId = 'image-lightbox',
    images,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onNavigate: (i: number) => void;
    currentIndex: number;
    dataTestId?: string;
    images: string[];
  }) =>
    isOpen ? (
      <div data-testid={dataTestId} data-index={currentIndex}>
        <button data-testid={`${dataTestId}-close`} onClick={onClose}>close</button>
        <button data-testid={`${dataTestId}-prev`} onClick={() => onNavigate(currentIndex - 1)}>prev</button>
        <button data-testid={`${dataTestId}-next`} onClick={() => onNavigate(currentIndex + 1)}>next</button>
        <span data-testid={`${dataTestId}-count`}>{images.length}</span>
      </div>
    ) : null,
}));

const IMAGES = ['img1.jpg', 'img2.jpg', 'img3.jpg', 'img4.jpg', 'img5.jpg', 'img6.jpg'];
const FEW   = ['main.jpg', 'second.jpg'];

describe('HotelGallery', () => {
  // ── Empty state ─────────────────────────────────────────────────────────────
  it('renders empty state when images is empty', () => {
    render(<HotelGallery images={[]} />);
    expect(screen.getByTestId('hotel-gallery-empty')).toBeInTheDocument();
  });

  it('shows placeholder text in empty state', () => {
    render(<HotelGallery images={[]} />);
    expect(screen.getByText('No images available')).toBeInTheDocument();
  });

  it('does not render the grid when images is empty', () => {
    render(<HotelGallery images={[]} />);
    expect(screen.queryByTestId('hotel-gallery-grid')).not.toBeInTheDocument();
  });

  // ── Structural rendering ────────────────────────────────────────────────────
  it('renders the root container', () => {
    render(<HotelGallery images={IMAGES} />);
    expect(screen.getByTestId('hotel-gallery')).toBeInTheDocument();
  });

  it('renders the desktop grid', () => {
    render(<HotelGallery images={IMAGES} />);
    expect(screen.getByTestId('hotel-gallery-grid')).toBeInTheDocument();
  });

  it('renders the main image button', () => {
    render(<HotelGallery images={IMAGES} />);
    expect(screen.getByTestId('hotel-gallery-main')).toBeInTheDocument();
  });

  it('renders the main image with correct src', () => {
    render(<HotelGallery images={IMAGES} />);
    expect(screen.getByTestId('hotel-gallery-main-img')).toHaveAttribute('src', IMAGES[0]);
  });

  it('renders 4 secondary thumbnail buttons', () => {
    render(<HotelGallery images={IMAGES} />);
    [0, 1, 2, 3].forEach((i) =>
      expect(screen.getByTestId(`hotel-gallery-thumb-${i}`)).toBeInTheDocument(),
    );
  });

  it('renders the secondary grid wrapper', () => {
    render(<HotelGallery images={IMAGES} />);
    expect(screen.getByTestId('hotel-gallery-secondary')).toBeInTheDocument();
  });

  it('renders the mobile slider wrapper', () => {
    render(<HotelGallery images={IMAGES} />);
    expect(screen.getByTestId('hotel-gallery-mobile')).toBeInTheDocument();
  });

  it('passes images to the mobile ImageSlider', () => {
    render(<HotelGallery images={IMAGES} />);
    expect(screen.getByTestId('hotel-gallery-slider')).toBeInTheDocument();
  });

  // ── Secondary thumbs with fewer than 5 images ───────────────────────────────
  it('disables thumb buttons that have no backing image', () => {
    render(<HotelGallery images={FEW} />);
    // Only img[1] fills thumb-0; thumbs 1-3 should be disabled (no src)
    expect(screen.getByTestId('hotel-gallery-thumb-1')).toBeDisabled();
    expect(screen.getByTestId('hotel-gallery-thumb-2')).toBeDisabled();
    expect(screen.getByTestId('hotel-gallery-thumb-3')).toBeDisabled();
  });

  it('shows "view all" overlay when there are more than 5 images', () => {
    render(<HotelGallery images={IMAGES} />);   // 6 images → 1 extra
    expect(screen.getByText('+1 more')).toBeInTheDocument();
  });

  it('does not show "view all" overlay when images fit in the grid', () => {
    render(<HotelGallery images={IMAGES.slice(0, 5)} />);  // exactly 5
    expect(screen.queryByText(/more/)).not.toBeInTheDocument();
  });

  // ── Opening the lightbox ────────────────────────────────────────────────────
  it('lightbox is closed initially', () => {
    render(<HotelGallery images={IMAGES} />);
    expect(screen.queryByTestId('hotel-gallery-lightbox')).not.toBeInTheDocument();
  });

  it('opens lightbox when main image is clicked', () => {
    render(<HotelGallery images={IMAGES} />);
    fireEvent.click(screen.getByTestId('hotel-gallery-main'));
    expect(screen.getByTestId('hotel-gallery-lightbox')).toBeInTheDocument();
  });

  it('opens lightbox at index 0 when main image is clicked', () => {
    render(<HotelGallery images={IMAGES} />);
    fireEvent.click(screen.getByTestId('hotel-gallery-main'));
    expect(screen.getByTestId('hotel-gallery-lightbox')).toHaveAttribute('data-index', '0');
  });

  it('opens lightbox at index 1 when second thumb is clicked', () => {
    render(<HotelGallery images={IMAGES} />);
    fireEvent.click(screen.getByTestId('hotel-gallery-thumb-0'));   // thumb-0 → images[1]
    expect(screen.getByTestId('hotel-gallery-lightbox')).toHaveAttribute('data-index', '1');
  });

  it('opens lightbox at index 3 when fourth thumb is clicked', () => {
    render(<HotelGallery images={IMAGES} />);
    fireEvent.click(screen.getByTestId('hotel-gallery-thumb-2'));   // thumb-2 → images[3]
    expect(screen.getByTestId('hotel-gallery-lightbox')).toHaveAttribute('data-index', '3');
  });

  it('opens lightbox from mobile slider when slide is clicked', () => {
    render(<HotelGallery images={IMAGES} />);
    fireEvent.click(screen.getByTestId('hotel-gallery-slider-item-2'));
    expect(screen.getByTestId('hotel-gallery-lightbox')).toHaveAttribute('data-index', '2');
  });

  // ── Closing the lightbox ────────────────────────────────────────────────────
  it('closes lightbox when close button is pressed', () => {
    render(<HotelGallery images={IMAGES} />);
    fireEvent.click(screen.getByTestId('hotel-gallery-main'));
    fireEvent.click(screen.getByTestId('hotel-gallery-lightbox-close'));
    expect(screen.queryByTestId('hotel-gallery-lightbox')).not.toBeInTheDocument();
  });

  // ── Navigating inside the lightbox ─────────────────────────────────────────
  it('updates lightbox index when next is clicked', () => {
    render(<HotelGallery images={IMAGES} />);
    fireEvent.click(screen.getByTestId('hotel-gallery-main'));
    fireEvent.click(screen.getByTestId('hotel-gallery-lightbox-next'));
    expect(screen.getByTestId('hotel-gallery-lightbox')).toHaveAttribute('data-index', '1');
  });

  it('updates lightbox index when prev is clicked', () => {
    render(<HotelGallery images={IMAGES} />);
    fireEvent.click(screen.getByTestId('hotel-gallery-thumb-2'));  // opens at index 3
    fireEvent.click(screen.getByTestId('hotel-gallery-lightbox-prev'));
    expect(screen.getByTestId('hotel-gallery-lightbox')).toHaveAttribute('data-index', '2');
  });

  // ── Custom props ────────────────────────────────────────────────────────────
  it('uses custom dataTestId prefix', () => {
    render(<HotelGallery images={IMAGES} dataTestId="my-gallery" />);
    expect(screen.getByTestId('my-gallery')).toBeInTheDocument();
    expect(screen.getByTestId('my-gallery-grid')).toBeInTheDocument();
  });

  it('passes all images to the lightbox', () => {
    render(<HotelGallery images={IMAGES} />);
    fireEvent.click(screen.getByTestId('hotel-gallery-main'));
    expect(screen.getByTestId('hotel-gallery-lightbox-count')).toHaveTextContent(
      String(IMAGES.length),
    );
  });
});
