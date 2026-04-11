import { render, screen, fireEvent } from '@testing-library/react';
import Input from '@/components/ui/Input/Input';

describe('Input', () => {
  it('renders an input element', () => {
    render(<Input dataTestId="inp" />);
    expect(screen.getByTestId('inp')).toBeInTheDocument();
  });

  it('renders label when provided', () => {
    render(<Input label="Email address" />);
    expect(screen.getByLabelText('Email address')).toBeInTheDocument();
    expect(screen.getByText('Email address')).toBeInTheDocument();
  });

  it('does not render label when not provided', () => {
    render(<Input dataTestId="inp" />);
    expect(screen.queryByRole('label')).not.toBeInTheDocument();
  });

  it('renders error message in alert role', () => {
    render(<Input error="Field is required" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Field is required');
  });

  it('marks input as aria-invalid when error is provided', () => {
    render(<Input error="Bad value" dataTestId="inp" />);
    expect(screen.getByTestId('inp')).toHaveAttribute('aria-invalid', 'true');
  });

  it('does not mark input as aria-invalid when no error', () => {
    render(<Input dataTestId="inp" />);
    expect(screen.getByTestId('inp')).toHaveAttribute('aria-invalid', 'false');
  });

  it('renders helper text when provided and no error', () => {
    render(<Input helperText="Enter your email" dataTestId="inp" />);
    expect(screen.getByText('Enter your email')).toBeInTheDocument();
  });

  it('does not render helper text when error is also provided', () => {
    render(<Input error="Required" helperText="Helper hint" />);
    expect(screen.queryByText('Helper hint')).not.toBeInTheDocument();
    expect(screen.getByText('Required')).toBeInTheDocument();
  });

  it('applies full-width class when fullWidth is true', () => {
    const { container } = render(<Input fullWidth />);
    expect(container.firstChild).toHaveClass('input-field--full-width');
  });

  it('does not apply full-width class when fullWidth is false', () => {
    const { container } = render(<Input fullWidth={false} />);
    expect(container.firstChild).not.toHaveClass('input-field--full-width');
  });

  it('applies error class when error is provided', () => {
    const { container } = render(<Input error="Oops" />);
    expect(container.firstChild).toHaveClass('input-field--error');
  });

  it('calls onChange when value changes', () => {
    const handleChange = jest.fn();
    render(<Input onChange={handleChange} dataTestId="inp" />);
    fireEvent.change(screen.getByTestId('inp'), { target: { value: 'hello' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('accepts a placeholder prop', () => {
    render(<Input placeholder="Type here..." dataTestId="inp" />);
    expect(screen.getByPlaceholderText('Type here...')).toBeInTheDocument();
  });

  it('accepts type prop and renders accordingly', () => {
    render(<Input type="password" dataTestId="inp" />);
    expect(screen.getByTestId('inp')).toHaveAttribute('type', 'password');
  });

  it('renders as disabled when disabled prop is passed', () => {
    render(<Input disabled dataTestId="inp" />);
    expect(screen.getByTestId('inp')).toBeDisabled();
  });
});
