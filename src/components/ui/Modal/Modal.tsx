import { useEffect, useRef, useCallback } from 'react';
import './Modal.scss';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
  dataTestId?: string;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  size = 'medium',
  children,
  dataTestId,
  className = '',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      data-testid={dataTestId}
    >
      <div
        className={`modal modal--${size} ${className}`}
        ref={modalRef}
      >
        <button
          type="button"
          className="modal__close"
          onClick={onClose}
          aria-label="Close modal"
          data-testid={dataTestId ? `${dataTestId}-close` : undefined}
        >
          ✕
        </button>
        {title && <h2 className="modal__title">{title}</h2>}
        <div className="modal__content">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
