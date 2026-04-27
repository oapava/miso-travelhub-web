import { useState } from 'react';
import ImageSlider from '@/components/shared/ImageSlider/ImageSlider';
import ImageLightbox from '@/components/shared/ImageLightbox/ImageLightbox';
import './HotelGallery.scss';

interface HotelGalleryProps {
  images: string[];
  alt?: string;
  dataTestId?: string;
}

const SECONDARY_COUNT = 4;

const HotelGallery: React.FC<HotelGalleryProps> = ({
  images,
  alt = 'Hotel image',
  dataTestId = 'hotel-gallery',
}) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  // Empty state
  if (!images || images.length === 0) {
    return (
      <div className="hotel-gallery hotel-gallery--empty" data-testid={`${dataTestId}-empty`}>
        <span className="hotel-gallery__placeholder-icon">🏨</span>
        <p className="hotel-gallery__placeholder-text">No images available</p>
      </div>
    );
  }

  const mainImage = images[0];

  // Fill up to 4 secondary slots; empty slots show a placeholder shade
  const secondaryImages: (string | null)[] = Array.from(
    { length: SECONDARY_COUNT },
    (_, i) => images[i + 1] ?? null,
  );

  // Number of real images beyond the 5 shown in the grid
  const extraCount = Math.max(0, images.length - (1 + SECONDARY_COUNT));

  return (
    <div className="hotel-gallery" data-testid={dataTestId}>

      {/* ── Desktop grid (hidden on mobile) ─────────────────────────────── */}
      <div className="hotel-gallery__grid" data-testid={`${dataTestId}-grid`}>

        {/* Main image — 50 % left */}
        <button
          type="button"
          className="hotel-gallery__main"
          onClick={() => openLightbox(0)}
          aria-label={`View ${alt} — main photo`}
          data-testid={`${dataTestId}-main`}
        >
          <img
            src={mainImage}
            alt={`${alt} 1`}
            className="hotel-gallery__img"
            data-testid={`${dataTestId}-main-img`}
            onError={(e) => e.currentTarget.classList.add('hotel-gallery__img--broken')}
          />
        </button>

        {/* 2 × 2 secondary grid — 50 % right */}
        <div className="hotel-gallery__secondary" data-testid={`${dataTestId}-secondary`}>
          {secondaryImages.map((src, i) => {
            const isLast = i === SECONDARY_COUNT - 1 && extraCount > 0;
            return (
              <button
                key={i}
                type="button"
                className={`hotel-gallery__thumb${!src ? ' hotel-gallery__thumb--empty' : ''}`}
                onClick={() => src ? openLightbox(i + 1) : undefined}
                aria-label={src ? `View ${alt} — photo ${i + 2}` : undefined}
                data-testid={`${dataTestId}-thumb-${i}`}
                disabled={!src}
              >
                {src ? (
                  <>
                    <img
                      src={src}
                      alt={`${alt} ${i + 2}`}
                      className="hotel-gallery__img"
                      onError={(e) => e.currentTarget.classList.add('hotel-gallery__img--broken')}
                    />
                    {isLast && (
                      <div className="hotel-gallery__view-all" aria-hidden="true">
                        +{extraCount} more
                      </div>
                    )}
                  </>
                ) : (
                  <div className="hotel-gallery__shade" aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Mobile slider (hidden on desktop) ───────────────────────────── */}
      <div className="hotel-gallery__mobile" data-testid={`${dataTestId}-mobile`}>
        <ImageSlider
          images={images}
          alt={alt}
          dataTestId={`${dataTestId}-slider`}
          onImageClick={openLightbox}
        />
      </div>

      {/* ── Lightbox ─────────────────────────────────────────────────────── */}
      <ImageLightbox
        images={images}
        currentIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNavigate={setLightboxIndex}
        alt={alt}
        dataTestId={`${dataTestId}-lightbox`}
      />
    </div>
  );
};

export default HotelGallery;
