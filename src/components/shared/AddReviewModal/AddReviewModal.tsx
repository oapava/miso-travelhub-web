import { useState } from 'react';
import { Modal, Button } from '@/components/ui';
import './AddReviewModal.scss';

interface AddReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (calificacion: number, comentario: string) => Promise<void>;
  dataTestId?: string;
}

const STARS = [1, 2, 3, 4, 5];

const AddReviewModal: React.FC<AddReviewModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  dataTestId = 'add-review-modal',
}) => {
  const [calificacion, setCalificacion] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comentario, setComentario] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleClose = () => {
    setCalificacion(0);
    setHovered(0);
    setComentario('');
    setError(null);
    setSuccess(false);
    onClose();
  };

  const handleSubmit = async () => {
    if (calificacion === 0) {
      setError('Please select a star rating.');
      return;
    }
    if (!comentario.trim()) {
      setError('Please write a comment.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await onSubmit(calificacion, comentario.trim());
      setSuccess(true);
      setTimeout(handleClose, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save review. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const displayStars = hovered || calificacion;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="small"
      dataTestId={dataTestId}
      className="add-review-modal"
    >
      <div className="add-review-modal__container" data-testid={`${dataTestId}-container`}>
        <h2 className="add-review-modal__title" data-testid={`${dataTestId}-title`}>
          Write a Review
        </h2>

        {success ? (
          <div className="add-review-modal__success" data-testid={`${dataTestId}-success`}>
            <span className="add-review-modal__success-icon">✓</span>
            <p>Review submitted successfully!</p>
          </div>
        ) : (
          <>
            {/* Star selector */}
            <div className="add-review-modal__stars" data-testid={`${dataTestId}-stars`}>
              <p className="add-review-modal__label">Rating</p>
              <div className="add-review-modal__star-row">
                {STARS.map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`add-review-modal__star ${star <= displayStars ? 'add-review-modal__star--active' : ''}`}
                    onClick={() => setCalificacion(star)}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
                    data-testid={`${dataTestId}-star-${star}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div className="add-review-modal__comment" data-testid={`${dataTestId}-comment-section`}>
              <label className="add-review-modal__label" htmlFor={`${dataTestId}-textarea`}>
                Comment
              </label>
              <textarea
                id={`${dataTestId}-textarea`}
                className="add-review-modal__textarea"
                placeholder="Share your experience..."
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                rows={4}
                maxLength={500}
                data-testid={`${dataTestId}-textarea`}
              />
              <span className="add-review-modal__char-count" data-testid={`${dataTestId}-char-count`}>
                {comentario.length}/500
              </span>
            </div>

            {error && (
              <p className="add-review-modal__error" data-testid={`${dataTestId}-error`}>
                {error}
              </p>
            )}

            <div className="add-review-modal__actions">
              <Button
                variant="outline"
                size="small"
                onClick={handleClose}
                dataTestId={`${dataTestId}-cancel`}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="small"
                onClick={handleSubmit}
                dataTestId={`${dataTestId}-submit`}
                disabled={isLoading}
              >
                {isLoading ? 'Submitting...' : 'Submit Review'}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default AddReviewModal;
