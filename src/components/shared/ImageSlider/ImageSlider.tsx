import { useState } from 'react';
import './ImageSlider.scss';

interface ImageSliderProps {
  images: string[];
  alt?: string;
  dataTestId?: string;
  onImageClick?: (index: number) => void;
}

const ImageSlider: React.FC<ImageSliderProps> = ({
  images,
  alt = 'Hotel image',
  dataTestId = 'image-slider',
  onImageClick,
}) => {
  const [current, setCurrent] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="image-slider image-slider--empty" data-testid={`${dataTestId}-empty`}>
        <span className="image-slider__placeholder-icon">🏨</span>
        <p className="image-slider__placeholder-text">No images available</p>
      </div>
    );
  }

  const total = images.length;

  const prev = () => setCurrent((c) => (c - 1 + total) % total);
  const next = () => setCurrent((c) => (c + 1) % total);

  return (
    <div className="image-slider" data-testid={dataTestId}>
      {/* Main image */}
      <div className="image-slider__track" data-testid={`${dataTestId}-track`}>
        <img
          src={images[current]}
          alt={`${alt} ${current + 1}`}
          className={`image-slider__image${onImageClick ? ' image-slider__image--clickable' : ''}`}
          data-testid={`${dataTestId}-image`}
          onClick={() => onImageClick?.(current)}
          style={onImageClick ? { cursor: 'zoom-in' } : undefined}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = '';
            e.currentTarget.classList.add('image-slider__image--broken');
          }}
        />

        {total > 1 && (
          <>
            <button
              type="button"
              className="image-slider__btn image-slider__btn--prev"
              onClick={prev}
              aria-label="Previous image"
              data-testid={`${dataTestId}-prev`}
            >
              ‹
            </button>
            <button
              type="button"
              className="image-slider__btn image-slider__btn--next"
              onClick={next}
              aria-label="Next image"
              data-testid={`${dataTestId}-next`}
            >
              ›
            </button>
          </>
        )}

        {/* Counter badge */}
        <span className="image-slider__counter" data-testid={`${dataTestId}-counter`}>
          {current + 1} / {total}
        </span>
      </div>

      {/* Dot indicators */}
      {total > 1 && (
        <div className="image-slider__dots" data-testid={`${dataTestId}-dots`}>
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`image-slider__dot ${i === current ? 'image-slider__dot--active' : ''}`}
              onClick={() => setCurrent(i)}
              aria-label={`Go to image ${i + 1}`}
              data-testid={`${dataTestId}-dot-${i}`}
            />
          ))}
        </div>
      )}

      {/* Thumbnail strip */}
      {total > 1 && (
        <div className="image-slider__thumbnails" data-testid={`${dataTestId}-thumbnails`}>
          {images.map((src, i) => (
            <button
              key={i}
              type="button"
              className={`image-slider__thumb-btn ${i === current ? 'image-slider__thumb-btn--active' : ''}`}
              onClick={() => setCurrent(i)}
              aria-label={`Thumbnail ${i + 1}`}
              data-testid={`${dataTestId}-thumb-${i}`}
            >
              <img
                src={src}
                alt={`${alt} thumbnail ${i + 1}`}
                className="image-slider__thumb-img"
                onError={(e) => {
                  e.currentTarget.classList.add('image-slider__image--broken');
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageSlider;
