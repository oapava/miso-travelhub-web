import { render, screen, fireEvent } from '@testing-library/react';
import ImageSlider from '@/components/shared/ImageSlider/ImageSlider';

const IMAGES = ['img1.jpg', 'img2.jpg', 'img3.jpg'];

describe('ImageSlider', () => {
  // ── Empty / missing images ──────────────────────────────────────────────
  it('renders empty state when no images array is provided', () => {
    render(<ImageSlider images={[]} />);
    expect(screen.getByTestId('image-slider-empty')).toBeInTheDocument();
  });

  it('shows placeholder text in empty state', () => {
    render(<ImageSlider images={[]} />);
    expect(screen.getByText('No images available')).toBeInTheDocument();
  });

  it('does not render the track when images is empty', () => {
    render(<ImageSlider images={[]} />);
    expect(screen.queryByTestId('image-slider-track')).not.toBeInTheDocument();
  });

  // ── Single image ────────────────────────────────────────────────────────
  it('renders track and image with a single image', () => {
    render(<ImageSlider images={['solo.jpg']} />);
    expect(screen.getByTestId('image-slider-track')).toBeInTheDocument();
    expect(screen.getByTestId('image-slider-image')).toBeInTheDocument();
  });

  it('sets the correct src on the main image', () => {
    render(<ImageSlider images={['solo.jpg']} />);
    expect(screen.getByTestId('image-slider-image')).toHaveAttribute('src', 'solo.jpg');
  });

  it('does not render prev/next buttons for a single image', () => {
    render(<ImageSlider images={['solo.jpg']} />);
    expect(screen.queryByTestId('image-slider-prev')).not.toBeInTheDocument();
    expect(screen.queryByTestId('image-slider-next')).not.toBeInTheDocument();
  });

  it('does not render dots for a single image', () => {
    render(<ImageSlider images={['solo.jpg']} />);
    expect(screen.queryByTestId('image-slider-dots')).not.toBeInTheDocument();
  });

  it('does not render thumbnails for a single image', () => {
    render(<ImageSlider images={['solo.jpg']} />);
    expect(screen.queryByTestId('image-slider-thumbnails')).not.toBeInTheDocument();
  });

  it('renders counter badge for a single image showing 1 / 1', () => {
    render(<ImageSlider images={['solo.jpg']} />);
    expect(screen.getByTestId('image-slider-counter')).toHaveTextContent('1 / 1');
  });

  // ── Multiple images ─────────────────────────────────────────────────────
  it('renders prev and next buttons when there are multiple images', () => {
    render(<ImageSlider images={IMAGES} />);
    expect(screen.getByTestId('image-slider-prev')).toBeInTheDocument();
    expect(screen.getByTestId('image-slider-next')).toBeInTheDocument();
  });

  it('renders dots equal to the number of images', () => {
    render(<ImageSlider images={IMAGES} />);
    IMAGES.forEach((_, i) => {
      expect(screen.getByTestId(`image-slider-dot-${i}`)).toBeInTheDocument();
    });
  });

  it('renders thumbnails equal to the number of images', () => {
    render(<ImageSlider images={IMAGES} />);
    IMAGES.forEach((_, i) => {
      expect(screen.getByTestId(`image-slider-thumb-${i}`)).toBeInTheDocument();
    });
  });

  it('first dot has active class on initial render', () => {
    render(<ImageSlider images={IMAGES} />);
    const firstDot = screen.getByTestId('image-slider-dot-0');
    expect(firstDot.className).toContain('--active');
  });

  it('first thumbnail has active class on initial render', () => {
    render(<ImageSlider images={IMAGES} />);
    const firstThumb = screen.getByTestId('image-slider-thumb-0');
    expect(firstThumb.className).toContain('--active');
  });

  it('counter shows 1 / N on initial render', () => {
    render(<ImageSlider images={IMAGES} />);
    expect(screen.getByTestId('image-slider-counter')).toHaveTextContent(
      `1 / ${IMAGES.length}`,
    );
  });

  // ── Navigation: next button ─────────────────────────────────────────────
  it('clicking next advances to the second image', () => {
    render(<ImageSlider images={IMAGES} />);
    fireEvent.click(screen.getByTestId('image-slider-next'));
    expect(screen.getByTestId('image-slider-image')).toHaveAttribute('src', IMAGES[1]);
  });

  it('counter updates after clicking next', () => {
    render(<ImageSlider images={IMAGES} />);
    fireEvent.click(screen.getByTestId('image-slider-next'));
    expect(screen.getByTestId('image-slider-counter')).toHaveTextContent('2 / 3');
  });

  it('second dot becomes active after clicking next once', () => {
    render(<ImageSlider images={IMAGES} />);
    fireEvent.click(screen.getByTestId('image-slider-next'));
    expect(screen.getByTestId('image-slider-dot-1').className).toContain('--active');
    expect(screen.getByTestId('image-slider-dot-0').className).not.toContain('--active');
  });

  it('wraps from last image to first on next click', () => {
    render(<ImageSlider images={IMAGES} />);
    // Go to last image
    fireEvent.click(screen.getByTestId('image-slider-next'));
    fireEvent.click(screen.getByTestId('image-slider-next'));
    // Now wrap around
    fireEvent.click(screen.getByTestId('image-slider-next'));
    expect(screen.getByTestId('image-slider-image')).toHaveAttribute('src', IMAGES[0]);
    expect(screen.getByTestId('image-slider-counter')).toHaveTextContent('1 / 3');
  });

  // ── Navigation: prev button ─────────────────────────────────────────────
  it('clicking prev from the first image wraps to the last', () => {
    render(<ImageSlider images={IMAGES} />);
    fireEvent.click(screen.getByTestId('image-slider-prev'));
    expect(screen.getByTestId('image-slider-image')).toHaveAttribute('src', IMAGES[2]);
    expect(screen.getByTestId('image-slider-counter')).toHaveTextContent('3 / 3');
  });

  it('clicking prev from the second image goes to the first', () => {
    render(<ImageSlider images={IMAGES} />);
    fireEvent.click(screen.getByTestId('image-slider-next'));
    fireEvent.click(screen.getByTestId('image-slider-prev'));
    expect(screen.getByTestId('image-slider-image')).toHaveAttribute('src', IMAGES[0]);
  });

  // ── Dot navigation ──────────────────────────────────────────────────────
  it('clicking a dot jumps to that image', () => {
    render(<ImageSlider images={IMAGES} />);
    fireEvent.click(screen.getByTestId('image-slider-dot-2'));
    expect(screen.getByTestId('image-slider-image')).toHaveAttribute('src', IMAGES[2]);
  });

  it('clicking a dot updates the counter', () => {
    render(<ImageSlider images={IMAGES} />);
    fireEvent.click(screen.getByTestId('image-slider-dot-2'));
    expect(screen.getByTestId('image-slider-counter')).toHaveTextContent('3 / 3');
  });

  it('clicking a dot marks it as active', () => {
    render(<ImageSlider images={IMAGES} />);
    fireEvent.click(screen.getByTestId('image-slider-dot-1'));
    expect(screen.getByTestId('image-slider-dot-1').className).toContain('--active');
  });

  // ── Thumbnail navigation ────────────────────────────────────────────────
  it('clicking a thumbnail jumps to that image', () => {
    render(<ImageSlider images={IMAGES} />);
    fireEvent.click(screen.getByTestId('image-slider-thumb-2'));
    expect(screen.getByTestId('image-slider-image')).toHaveAttribute('src', IMAGES[2]);
  });

  it('clicking a thumbnail marks it as active', () => {
    render(<ImageSlider images={IMAGES} />);
    fireEvent.click(screen.getByTestId('image-slider-thumb-1'));
    expect(screen.getByTestId('image-slider-thumb-1').className).toContain('--active');
    expect(screen.getByTestId('image-slider-thumb-0').className).not.toContain('--active');
  });

  // ── Custom props ────────────────────────────────────────────────────────
  it('uses custom dataTestId prefix', () => {
    render(<ImageSlider images={IMAGES} dataTestId="gallery" />);
    expect(screen.getByTestId('gallery')).toBeInTheDocument();
    expect(screen.getByTestId('gallery-track')).toBeInTheDocument();
  });

  it('uses custom alt text for the main image', () => {
    render(<ImageSlider images={['a.jpg']} alt="Room view" />);
    const img = screen.getByTestId('image-slider-image');
    expect(img).toHaveAttribute('alt', 'Room view 1');
  });

  it('renders the top-level container with the default test id', () => {
    render(<ImageSlider images={IMAGES} />);
    expect(screen.getByTestId('image-slider')).toBeInTheDocument();
  });

  // ── Image error handling ────────────────────────────────────────────────
  it('adds broken class to main image when image fails to load', () => {
    render(<ImageSlider images={['bad-url.jpg']} />);
    const img = screen.getByTestId('image-slider-image');
    fireEvent.error(img);
    expect(img.className).toContain('image-slider__image--broken');
  });

  it('adds broken class to thumbnail image when thumbnail fails to load', () => {
    render(<ImageSlider images={IMAGES} />);
    // The thumbnail img is inside the thumb button
    const thumbBtns = screen.getAllByRole('button', { name: /Thumbnail/i });
    const thumbImg = thumbBtns[0].querySelector('img')!;
    fireEvent.error(thumbImg);
    expect(thumbImg.className).toContain('image-slider__image--broken');
  });
});
