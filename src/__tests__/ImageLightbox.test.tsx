import { render, screen, fireEvent, act } from '@testing-library/react';
import ImageLightbox from '@/components/shared/ImageLightbox/ImageLightbox';

const IMAGES = ['img1.jpg', 'img2.jpg', 'img3.jpg'];

const defaultProps = {
  images: IMAGES,
  currentIndex: 0,
  isOpen: true,
  onClose: jest.fn(),
  onNavigate: jest.fn(),
};

describe('ImageLightbox', () => {
  beforeEach(() => jest.resetAllMocks());

  // ── Visibility ─────────────────────────────────────────────────────────────
  it('renders when isOpen is true', () => {
    render(<ImageLightbox {...defaultProps} />);
    expect(screen.getByTestId('image-lightbox')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(<ImageLightbox {...defaultProps} isOpen={false} />);
    expect(screen.queryByTestId('image-lightbox')).not.toBeInTheDocument();
  });

  it('does not render when images array is empty', () => {
    render(<ImageLightbox {...defaultProps} images={[]} />);
    expect(screen.queryByTestId('image-lightbox')).not.toBeInTheDocument();
  });

  // ── Content ─────────────────────────────────────────────────────────────────
  it('renders the backdrop', () => {
    render(<ImageLightbox {...defaultProps} />);
    expect(screen.getByTestId('image-lightbox-backdrop')).toBeInTheDocument();
  });

  it('renders the close button', () => {
    render(<ImageLightbox {...defaultProps} />);
    expect(screen.getByTestId('image-lightbox-close')).toBeInTheDocument();
  });

  it('renders the current image', () => {
    render(<ImageLightbox {...defaultProps} />);
    expect(screen.getByTestId('image-lightbox-image')).toHaveAttribute('src', IMAGES[0]);
  });

  it('shows the correct counter text', () => {
    render(<ImageLightbox {...defaultProps} currentIndex={1} />);
    expect(screen.getByTestId('image-lightbox-counter')).toHaveTextContent('2 / 3');
  });

  it('renders prev and next buttons when there are multiple images', () => {
    render(<ImageLightbox {...defaultProps} />);
    expect(screen.getByTestId('image-lightbox-prev')).toBeInTheDocument();
    expect(screen.getByTestId('image-lightbox-next')).toBeInTheDocument();
  });

  it('does not render prev/next when there is only one image', () => {
    render(<ImageLightbox {...defaultProps} images={['solo.jpg']} />);
    expect(screen.queryByTestId('image-lightbox-prev')).not.toBeInTheDocument();
    expect(screen.queryByTestId('image-lightbox-next')).not.toBeInTheDocument();
  });

  // ── Close ───────────────────────────────────────────────────────────────────
  it('calls onClose when close button is clicked', () => {
    const onClose = jest.fn();
    render(<ImageLightbox {...defaultProps} onClose={onClose} />);
    fireEvent.click(screen.getByTestId('image-lightbox-close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when backdrop is clicked', () => {
    const onClose = jest.fn();
    render(<ImageLightbox {...defaultProps} onClose={onClose} />);
    fireEvent.click(screen.getByTestId('image-lightbox-backdrop'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape key is pressed', () => {
    const onClose = jest.fn();
    render(<ImageLightbox {...defaultProps} onClose={onClose} />);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // ── Navigation ──────────────────────────────────────────────────────────────
  it('calls onNavigate with next index when next button is clicked', () => {
    const onNavigate = jest.fn();
    render(<ImageLightbox {...defaultProps} currentIndex={0} onNavigate={onNavigate} />);
    fireEvent.click(screen.getByTestId('image-lightbox-next'));
    expect(onNavigate).toHaveBeenCalledWith(1);
  });

  it('calls onNavigate with prev index when prev button is clicked', () => {
    const onNavigate = jest.fn();
    render(<ImageLightbox {...defaultProps} currentIndex={1} onNavigate={onNavigate} />);
    fireEvent.click(screen.getByTestId('image-lightbox-prev'));
    expect(onNavigate).toHaveBeenCalledWith(0);
  });

  it('wraps to last image when prev is clicked from first', () => {
    const onNavigate = jest.fn();
    render(<ImageLightbox {...defaultProps} currentIndex={0} onNavigate={onNavigate} />);
    fireEvent.click(screen.getByTestId('image-lightbox-prev'));
    expect(onNavigate).toHaveBeenCalledWith(IMAGES.length - 1);
  });

  it('wraps to first image when next is clicked from last', () => {
    const onNavigate = jest.fn();
    render(
      <ImageLightbox {...defaultProps} currentIndex={IMAGES.length - 1} onNavigate={onNavigate} />,
    );
    fireEvent.click(screen.getByTestId('image-lightbox-next'));
    expect(onNavigate).toHaveBeenCalledWith(0);
  });

  it('calls onNavigate(prev) when ArrowLeft key is pressed', () => {
    const onNavigate = jest.fn();
    render(<ImageLightbox {...defaultProps} currentIndex={1} onNavigate={onNavigate} />);
    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(onNavigate).toHaveBeenCalledWith(0);
  });

  it('calls onNavigate(next) when ArrowRight key is pressed', () => {
    const onNavigate = jest.fn();
    render(<ImageLightbox {...defaultProps} currentIndex={0} onNavigate={onNavigate} />);
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(onNavigate).toHaveBeenCalledWith(1);
  });

  // ── Body scroll lock ────────────────────────────────────────────────────────
  it('sets body overflow to hidden when open', () => {
    render(<ImageLightbox {...defaultProps} />);
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('restores body overflow when closed', () => {
    const { rerender } = render(<ImageLightbox {...defaultProps} />);
    rerender(<ImageLightbox {...defaultProps} isOpen={false} />);
    expect(document.body.style.overflow).toBe('');
  });

  it('restores body overflow on unmount', () => {
    const { unmount } = render(<ImageLightbox {...defaultProps} />);
    unmount();
    expect(document.body.style.overflow).toBe('');
  });

  // ── Keyboard listener cleanup ───────────────────────────────────────────────
  it('does not call onClose after unmount when Escape is pressed', () => {
    const onClose = jest.fn();
    const { unmount } = render(<ImageLightbox {...defaultProps} onClose={onClose} />);
    unmount();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
  });

  // ── Custom props ────────────────────────────────────────────────────────────
  it('uses custom dataTestId prefix', () => {
    render(<ImageLightbox {...defaultProps} dataTestId="my-lightbox" />);
    expect(screen.getByTestId('my-lightbox')).toBeInTheDocument();
    expect(screen.getByTestId('my-lightbox-close')).toBeInTheDocument();
  });

  it('uses custom alt text', () => {
    render(<ImageLightbox {...defaultProps} alt="Suite view" />);
    const img = screen.getByTestId('image-lightbox-image');
    expect(img).toHaveAttribute('alt', 'Suite view 1');
  });

  // ── Accessibility ───────────────────────────────────────────────────────────
  it('has dialog role and aria-modal', () => {
    render(<ImageLightbox {...defaultProps} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('close button has accessible label', () => {
    render(<ImageLightbox {...defaultProps} />);
    expect(screen.getByLabelText('Close lightbox')).toBeInTheDocument();
  });

  it('does not fire keyboard handler when closed', () => {
    const onClose = jest.fn();
    render(<ImageLightbox {...defaultProps} isOpen={false} onClose={onClose} />);
    act(() => { fireEvent.keyDown(window, { key: 'Escape' }); });
    expect(onClose).not.toHaveBeenCalled();
  });
});
