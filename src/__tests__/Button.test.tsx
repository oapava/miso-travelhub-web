import { render, screen, fireEvent } from '@testing-library/react';
import Button from '@/components/ui/Button/Button';

describe('Button', () => {
  it('renders children text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('applies primary variant class by default', () => {
    render(<Button dataTestId="btn">Label</Button>);
    const btn = screen.getByTestId('btn');
    expect(btn).toHaveClass('button--primary');
  });

  it('applies the given variant class', () => {
    render(<Button variant="secondary" dataTestId="btn">Label</Button>);
    expect(screen.getByTestId('btn')).toHaveClass('button--secondary');
  });

  it('applies outline variant class', () => {
    render(<Button variant="outline" dataTestId="btn">Label</Button>);
    expect(screen.getByTestId('btn')).toHaveClass('button--outline');
  });

  it('applies yellow variant class', () => {
    render(<Button variant="yellow" dataTestId="btn">Label</Button>);
    expect(screen.getByTestId('btn')).toHaveClass('button--yellow');
  });

  it('applies dark variant class', () => {
    render(<Button variant="dark" dataTestId="btn">Label</Button>);
    expect(screen.getByTestId('btn')).toHaveClass('button--dark');
  });

  it('applies medium size class by default', () => {
    render(<Button dataTestId="btn">Label</Button>);
    expect(screen.getByTestId('btn')).toHaveClass('button--medium');
  });

  it('applies the given size class', () => {
    render(<Button size="large" dataTestId="btn">Label</Button>);
    expect(screen.getByTestId('btn')).toHaveClass('button--large');
  });

  it('applies small size class', () => {
    render(<Button size="small" dataTestId="btn">Label</Button>);
    expect(screen.getByTestId('btn')).toHaveClass('button--small');
  });

  it('applies icon size class', () => {
    render(<Button size="icon" dataTestId="btn">Icon</Button>);
    expect(screen.getByTestId('btn')).toHaveClass('button--icon');
  });

  it('applies full-width class when fullWidth is true', () => {
    render(<Button fullWidth dataTestId="btn">Label</Button>);
    expect(screen.getByTestId('btn')).toHaveClass('button--full-width');
  });

  it('does not apply full-width class when fullWidth is false', () => {
    render(<Button fullWidth={false} dataTestId="btn">Label</Button>);
    expect(screen.getByTestId('btn')).not.toHaveClass('button--full-width');
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick} disabled>Click</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('renders as disabled when disabled prop is true', () => {
    render(<Button disabled>Label</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('sets data-testid attribute', () => {
    render(<Button dataTestId="my-button">Label</Button>);
    expect(screen.getByTestId('my-button')).toBeInTheDocument();
  });

  it('merges custom className', () => {
    render(<Button className="custom-class" dataTestId="btn">Label</Button>);
    expect(screen.getByTestId('btn')).toHaveClass('custom-class');
  });
});
