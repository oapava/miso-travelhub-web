import { useEffect } from 'react';
import './ImageLightbox.scss';

interface ImageLightboxProps {
  images: string[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
  alt?: string;
  dataTestId?: string;
}

const ImageLightbox: React.FC<ImageLightboxProps> = ({
  images,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
  alt = 'Hotel image',
  dataTestId = 'image-lightbox',
}) => {
  const total = images.length;

  const prev = () => onNavigate((currentIndex - 1 + total) % total);
  const next = () => onNavigate((currentIndex + 1) % total);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, currentIndex, total]);

  // Prevent body scroll while open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen || images.length === 0) return null;

  return (
    <div
      className="image-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="Image gallery"
      data-testid={dataTestId}
    >
      {/* Backdrop */}
      <div
        className="image-lightbox__backdrop"
        onClick={onClose}
        data-testid={`${dataTestId}-backdrop`}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="image-lightbox__content" data-testid={`${dataTestId}-content`}>
        {/* Close */}
        <button
          type="button"
          className="image-lightbox__close"
          onClick={onClose}
          aria-label="Close lightbox"
          data-testid={`${dataTestId}-close`}
        >
          ✕
        </button>

        {/* Counter */}
        <span className="image-lightbox__counter" data-testid={`${dataTestId}-counter`}>
          {currentIndex + 1} / {total}
        </span>

        {/* Image */}
        <img
          src={images[currentIndex]}
          alt={`${alt} ${currentIndex + 1}`}
          className="image-lightbox__img"
          data-testid={`${dataTestId}-image`}
        />

        {/* Prev / Next */}
        {total > 1 && (
          <>
            <button
              type="button"
              className="image-lightbox__btn image-lightbox__btn--prev"
              onClick={prev}
              aria-label="Previous image"
              data-testid={`${dataTestId}-prev`}
            >
              ‹
            </button>
            <button
              type="button"
              className="image-lightbox__btn image-lightbox__btn--next"
              onClick={next}
              aria-label="Next image"
              data-testid={`${dataTestId}-next`}
            >
              ›
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ImageLightbox;
