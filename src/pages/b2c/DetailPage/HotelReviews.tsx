import { useState } from 'react';
import { Modal, Button } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import './HotelReviews.scss';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Review {
  id: string;
  author: string;
  date: string;   // "YYYY-MM-DD"
  rating: number; // 1-5
  text: string;
}

// ─── Mock data (replace with API call when endpoint is ready) ─────────────────

const MOCK_REVIEWS: Review[] = [
  {
    id: '1',
    author: 'María García',
    date: '2025-03-20',
    rating: 5,
    text: 'Fantastic experience! The room was spotless, the staff were incredibly welcoming and the location is perfect. Will definitely return on my next trip to the city.',
  },
  {
    id: '2',
    author: 'James Williams',
    date: '2025-03-12',
    rating: 4,
    text: 'Great hotel overall. The amenities are excellent and breakfast was delicious. Only minor issue was the Wi-Fi speed in the room, but it did not affect our stay much.',
  },
  {
    id: '3',
    author: 'Sofía Martínez',
    date: '2025-02-28',
    rating: 5,
    text: 'One of the best stays I have had. The pool area is beautiful, the gym is well-equipped, and the bed was incredibly comfortable. Highly recommend.',
  },
  {
    id: '4',
    author: 'Carlos Rodríguez',
    date: '2025-02-14',
    rating: 3,
    text: 'Decent hotel with good facilities, but the check-in process was slow and the room we received did not match the photos online exactly. The restaurant food was excellent though.',
  },
  {
    id: '5',
    author: 'Anna Schmidt',
    date: '2025-01-30',
    rating: 4,
    text: 'Very comfortable and modern rooms. The concierge helped us plan amazing day trips. Breakfast variety could be improved but overall a wonderful stay.',
  },
  {
    id: '6',
    author: 'Luis Pérez',
    date: '2025-01-15',
    rating: 5,
    text: 'Absolutely loved it! From the moment we arrived, the service was impeccable. The views from our room were breathtaking and the spa is a must-visit.',
  },
  {
    id: '7',
    author: 'Emily Chen',
    date: '2024-12-28',
    rating: 4,
    text: 'Lovely hotel in a great location. The rooms are spacious and well-decorated. Housekeeping was thorough and the hotel bar makes excellent cocktails.',
  },
];

const PREVIEW_COUNT = 3;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const parts = iso.split('-');
  const y = parseInt(parts[0] ?? '0', 10);
  const m = parseInt(parts[1] ?? '1', 10);
  const d = parseInt(parts[2] ?? '1', 10);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface StarInputProps {
  value: number;
  onChange: (rating: number) => void;
}

function StarInput({ value, onChange }: StarInputProps) {
  const [hover, setHover] = useState(0);
  const active = hover || value;

  return (
    <div className="hotel-reviews__star-input" role="group" aria-label="Select your rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`hotel-reviews__star-btn${active >= star ? ' hotel-reviews__star-btn--active' : ''}`}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
          aria-pressed={value === star}
        >
          ★
        </button>
      ))}
    </div>
  );
}

interface ReviewCardProps {
  review: Review;
}

function ReviewCard({ review }: ReviewCardProps) {
  const initial = review.author.charAt(0).toUpperCase();

  return (
    <article className="hotel-reviews__card" data-testid={`review-card-${review.id}`}>
      <div className="hotel-reviews__card-header">
        <div className="hotel-reviews__avatar" aria-hidden="true">
          {initial}
        </div>
        <div className="hotel-reviews__card-meta">
          <span className="hotel-reviews__author">{review.author}</span>
          <span className="hotel-reviews__date">{formatDate(review.date)}</span>
        </div>
        <div className="hotel-reviews__stars" aria-label={`Rating: ${review.rating} out of 5`}>
          {Array.from({ length: 5 }, (_, i) => (
            <span
              key={i}
              className={`hotel-reviews__star${i < review.rating ? ' hotel-reviews__star--filled' : ''}`}
              aria-hidden="true"
            >
              ★
            </span>
          ))}
        </div>
      </div>
      <p className="hotel-reviews__text">{review.text}</p>
    </article>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface HotelReviewsProps {
  id?: string;
  dataTestId?: string;
}

const HotelReviews: React.FC<HotelReviewsProps> = ({ id, dataTestId }) => {
  const { isAuthenticated, user } = useAuth();

  const [reviews, setReviews] = useState<Review[]>(MOCK_REVIEWS);
  const [showAllModal, setShowAllModal] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newText, setNewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const previewReviews = reviews.slice(0, PREVIEW_COUNT);
  const hasMore = reviews.length > PREVIEW_COUNT;

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '0.0';

  const canSubmit = newRating > 0 && newText.trim().length > 10;

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);

    // Simulate API latency — replace with real call when endpoint is ready
    await new Promise<void>((resolve) => setTimeout(resolve, 500));

    const newReview: Review = {
      id: String(Date.now()),
      author: user?.nombre ?? 'Guest',
      date: new Date().toISOString().substring(0, 10),
      rating: newRating,
      text: newText.trim(),
    };

    setReviews((prev) => [newReview, ...prev]);
    setNewRating(0);
    setNewText('');
    setSuccess(true);
    setSubmitting(false);

    // Auto-hide success message after 4 s
    setTimeout(() => setSuccess(false), 4000);
  };

  return (
    <section className="hotel-reviews" id={id} data-testid={dataTestId}>

      {/* ── Section header ── */}
      <div className="hotel-reviews__header">
        <h2 className="hotel-reviews__title">Reviews</h2>
        <div className="hotel-reviews__summary">
          <span className="hotel-reviews__avg">{avgRating}</span>
          <span className="hotel-reviews__total">
            ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
          </span>
        </div>
      </div>

      {/* ── Preview: first 3 reviews ── */}
      <div className="hotel-reviews__list" data-testid="reviews-preview-list">
        {previewReviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>

      {/* ── "See all" button — only shown when there are more than 3 ── */}
      {hasMore && (
        <div className="hotel-reviews__see-more">
          <Button
            variant="dark"
            size="small"
            onClick={() => setShowAllModal(true)}
            dataTestId="reviews-see-all-btn"
          >
            See all {reviews.length} reviews
          </Button>
        </div>
      )}

      {/* ── Write a review ── */}
      <div className="hotel-reviews__write" data-testid="reviews-write-section">
        <h3 className="hotel-reviews__write-title">Write a review</h3>

        {isAuthenticated ? (
          <div className="hotel-reviews__form" data-testid="review-form">
            {/* Star rating selector */}
            <StarInput value={newRating} onChange={setNewRating} />

            {/* Review textarea */}
            <textarea
              className="hotel-reviews__textarea"
              placeholder="Share your experience with other travellers…"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              rows={4}
              disabled={submitting}
              data-testid="review-textarea"
              aria-label="Review text"
            />

            {/* Success feedback */}
            {success && (
              <p className="hotel-reviews__success" role="status" data-testid="review-success">
                ✓ Your review has been posted. Thank you!
              </p>
            )}

            {/* Submit */}
            <div className="hotel-reviews__form-actions">
              <Button
                variant="primary"
                size="small"
                onClick={handleSubmit}
                disabled={!canSubmit || submitting}
                dataTestId="review-submit-btn"
              >
                {submitting ? 'Posting…' : 'Post review'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="hotel-reviews__login-prompt" data-testid="review-login-prompt">
            <span className="hotel-reviews__login-icon" aria-hidden="true">🔒</span>
            <p className="hotel-reviews__login-text">
              You must be logged in to write a review.
              Use the <strong>Sign in</strong> button at the top of the page.
            </p>
          </div>
        )}
      </div>

      {/* ── Modal: all reviews ── */}
      <Modal
        isOpen={showAllModal}
        onClose={() => setShowAllModal(false)}
        title={`All reviews (${reviews.length})`}
        size="large"
        dataTestId="reviews-modal"
      >
        <div className="hotel-reviews__modal-list">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      </Modal>
    </section>
  );
};

export default HotelReviews;
