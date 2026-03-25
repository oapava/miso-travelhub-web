import { type InputHTMLAttributes, forwardRef } from 'react';
import './Input.scss';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  dataTestId?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = false,
      dataTestId,
      id,
      className = '',
      ...restProps
    },
    ref,
  ) => {
    const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`;

    return (
      <div
        className={`input-field ${fullWidth ? 'input-field--full-width' : ''} ${
          error ? 'input-field--error' : ''
        } ${className}`}
      >
        {label && (
          <label htmlFor={inputId} className="input-field__label">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className="input-field__input"
          aria-invalid={!!error}
          aria-describedby={
            error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
          }
          data-testid={dataTestId}
          {...restProps}
        />
        {error && (
          <span id={`${inputId}-error`} className="input-field__error" role="alert">
            {error}
          </span>
        )}
        {helperText && !error && (
          <span id={`${inputId}-helper`} className="input-field__helper">
            {helperText}
          </span>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;
