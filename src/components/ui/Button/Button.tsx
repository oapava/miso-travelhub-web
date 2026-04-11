import { type ButtonHTMLAttributes } from 'react';
import './Button.scss';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'yellow' | 'dark';
type ButtonSize = 'icon' | 'small' | 'medium' | 'large';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  dataTestId?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  dataTestId,
  className = '',
  ...restProps
}) => {
  const buttonClasses = [
    'button',
    `button--${variant}`,
    `button--${size}`,
    fullWidth ? 'button--full-width' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      className={buttonClasses}
      data-testid={dataTestId}
      {...restProps}
    >
      {children}
    </button>
  );
};

export default Button;
