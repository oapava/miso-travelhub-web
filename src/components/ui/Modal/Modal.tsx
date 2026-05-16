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

/** Selector for all natively focusable elements. */
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

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
  /** Stores the element that was focused before the modal opened. */
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // ── Focus trap + initial focus + focus restoration ──────────────────────────
  useEffect(() => {
    if (isOpen) {
      // Save the currently focused element so we can restore it on close.
      previousFocusRef.current = document.activeElement as HTMLElement;

      // Move focus to the first focusable element inside the modal.
      const firstFocusable = modalRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      firstFocusable?.focus();
    } else {
      // Restore focus to the element that triggered the modal.
      previousFocusRef.current?.focus();
    }
  }, [isOpen]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      // Tab / Shift+Tab focus trap — keep focus inside the modal.
      if (event.key === 'Tab') {
        const focusableEls = modalRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
        if (!focusableEls || focusableEls.length === 0) return;

        const first = focusableEls[0];
        const last  = focusableEls[focusableEls.length - 1];
        if (!first || !last) return;

        if (event.shiftKey) {
          // Shift+Tab: wrap from first → last
          if (document.activeElement === first) {
            last.focus();
            event.preventDefault();
          }
        } else {
          // Tab: wrap from last → first
          if (document.activeElement === last) {
            first.focus();
            event.preventDefault();
          }
        }
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
      // Always provide an accessible name for the dialog.
      aria-label={title ?? 'Dialog'}
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
