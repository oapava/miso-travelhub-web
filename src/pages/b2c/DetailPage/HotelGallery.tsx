import { useState, useEffect, useCallback } from 'react';
import './HotelGallery.scss';

export const MOCK_IMAGES = [
  '/img/bg-hotel.png',
  '/img/hero-bg.png',
  '/img/login-bg-b2b.png',
  '/img/bg-hotel.png',
  '/img/hero-bg.png',
];

interface HotelGalleryProps {
  images?: string[];
  dataTestId?: string;
}

const HotelGallery: React.FC<HotelGalleryProps> = ({
  images = MOCK_IMAGES,
  dataTestId = 'hotel-gallery',
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const prevImage = useCallback(() => {
    setLightboxIndex((prev) =>
      prev === null ? null : (prev - 1 + images.length) % images.length,
    );
  }, [images.length]);

  const nextImage = useCallback(() => {
    setLightboxIndex((prev) =>
      prev === null ? null : (prev + 1) % images.length,
    );
  }, [images.length]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightboxIndex, prevImage, nextImage]);

  // Índices de los thumbnails: todos excepto el activo (máx 4)
  const thumbnailIndices = images
    .map((_, i) => i)
    .filter((i) => i !== activeIndex)
    .slice(0, 4);

  return (
    <div className="hotel-gallery" data-testid={dataTestId}>
      {/* Grid: imagen grande + 4 thumbnails */}
      <div className="hotel-gallery__grid">
        {/* Imagen principal */}
        <button
          className="hotel-gallery__main"
          onClick={() => openLightbox(activeIndex)}
          aria-label={`Ver imagen ${activeIndex + 1} en grande`}
          data-testid="gallery-main-image"
        >
          <img
            key={activeIndex}
            src={images[activeIndex]}
            alt={`Vista del hotel ${activeIndex + 1}`}
            className="hotel-gallery__img hotel-gallery__img--fade"
          />
        </button>

        {/* 4 thumbnails en grid 2×2 */}
        <div className="hotel-gallery__thumbnails">
          {thumbnailIndices.map((imgIndex) => (
            <button
              key={imgIndex}
              className="hotel-gallery__thumbnail"
              onClick={() => openLightbox(imgIndex)}
              aria-label={`Ver imagen ${imgIndex + 1} en grande`}
              data-testid={`gallery-thumbnail-${imgIndex}`}
            >
              <img
                src={images[imgIndex]}
                alt={`Vista del hotel ${imgIndex + 1}`}
                className="hotel-gallery__img"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Bullets de navegación */}
      <div className="hotel-gallery__bullets" role="tablist" aria-label="Navegación de imágenes">
        {images.map((_, i) => (
          <button
            key={i}
            role="tab"
            className={`hotel-gallery__bullet${i === activeIndex ? ' hotel-gallery__bullet--active' : ''}`}
            onClick={() => setActiveIndex(i)}
            aria-label={`Imagen ${i + 1}`}
            aria-selected={i === activeIndex}
            data-testid={`gallery-bullet-${i}`}
          />
        ))}
      </div>

      {/* Lightbox modal */}
      {lightboxIndex !== null && (
        <div
          className="hotel-gallery__lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Imagen ampliada"
          onClick={closeLightbox}
          data-testid="gallery-lightbox"
        >
          {/* Botón cerrar */}
          <button
            className="hotel-gallery__lightbox-close"
            onClick={closeLightbox}
            aria-label="Cerrar imagen"
            data-testid="gallery-lightbox-close"
          >
            ✕
          </button>

          {/* Flecha anterior */}
          <button
            className="hotel-gallery__lightbox-arrow hotel-gallery__lightbox-arrow--prev"
            onClick={(e) => { e.stopPropagation(); prevImage(); }}
            aria-label="Imagen anterior"
            data-testid="gallery-lightbox-prev"
          >
            ‹
          </button>

          {/* Imagen grande */}
          <div
            className="hotel-gallery__lightbox-content"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[lightboxIndex]}
              alt={`Vista del hotel ${lightboxIndex + 1}`}
              className="hotel-gallery__lightbox-img"
              data-testid="gallery-lightbox-img"
            />
            {/* Counter */}
            <p className="hotel-gallery__lightbox-counter">
              {lightboxIndex + 1} / {images.length}
            </p>
          </div>

          {/* Flecha siguiente */}
          <button
            className="hotel-gallery__lightbox-arrow hotel-gallery__lightbox-arrow--next"
            onClick={(e) => { e.stopPropagation(); nextImage(); }}
            aria-label="Imagen siguiente"
            data-testid="gallery-lightbox-next"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
};

export default HotelGallery;
