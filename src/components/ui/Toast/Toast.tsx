import React, { useEffect, useRef } from 'react';
import './Toast.scss';

export type ToastVariant = 'error' | 'success' | 'warning' | 'info';

export interface ToastProps {
  message: string;
  variant?: ToastVariant;
  /** Auto-dismiss delay in ms. Pass 0 to disable auto-dismiss. Default: 5000 */
  duration?: number;
  onClose: () => void;
  dataTestId?: string;
}

const ICONS: Record<ToastVariant, string> = {
  error:   '✕',
  success: '✓',
  warning: '⚠',
  info:    'ℹ',
};

const Toast: React.FC<ToastProps> = ({
  message,
  variant = 'info',
  duration = 5000,
  onClose,
  dataTestId = 'toast',
}) => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (duration > 0) {
      timerRef.current = setTimeout(onClose, duration);
    }
    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
    };
  }, [duration, onClose]);

  return (
    <div
      className={`toast toast--${variant}`}
      role="alert"
      aria-live="assertive"
      data-testid={dataTestId}
    >
      <span className="toast__icon" aria-hidden="true">
        {ICONS[variant]}
      </span>
      <span className="toast__message" data-testid={`${dataTestId}-message`}>
        {message}
      </span>
      <button
        className="toast__close"
        onClick={onClose}
        aria-label="Close notification"
        data-testid={`${dataTestId}-close`}
      >
        ✕
      </button>
    </div>
  );
};

export default Toast;
