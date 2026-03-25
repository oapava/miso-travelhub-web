import { type SelectHTMLAttributes, forwardRef } from 'react';
import './Select.scss';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'placeholder'> {
  placeholder?: string;
  label?: string;
  options: SelectOption[];
  error?: string;
  fullWidth?: boolean;
  dataTestId?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      options,
      error,
      fullWidth = false,
      dataTestId,
      id,
      className = '',
      placeholder,
      ...restProps
    },
    ref,
  ) => {
    const selectId = id || `select-${label?.toLowerCase().replace(/\s+/g, '-')}`;

    return (
      <div
        className={`select-field ${fullWidth ? 'select-field--full-width' : ''} ${
          error ? 'select-field--error' : ''
        } ${className}`}
      >
        {label && (
          <label htmlFor={selectId} className="select-field__label">
            {label}
          </label>
        )}
        <div className="select-field__wrapper">
          <select
            ref={ref}
            id={selectId}
            className="select-field__select"
            aria-invalid={!!error}
            data-testid={dataTestId}
            {...restProps}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <span className="select-field__arrow" aria-hidden="true">
            ▾
          </span>
        </div>
        {error && (
          <span className="select-field__error" role="alert">
            {error}
          </span>
        )}
      </div>
    );
  },
);

Select.displayName = 'Select';

export default Select;
