import { render, screen, fireEvent } from '@testing-library/react';
import Toggle from '@/components/ui/Toggle/Toggle';

describe('Toggle', () => {
  it('renders a button with switch role', () => {
    render(<Toggle isActive={false} onToggle={jest.fn()} label="Enable notifications" />);
    expect(screen.getByRole('switch', { name: 'Enable notifications' })).toBeInTheDocument();
  });

  it('has aria-checked="true" when isActive is true', () => {
    render(<Toggle isActive={true} onToggle={jest.fn()} label="Enabled" />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
  });

  it('has aria-checked="false" when isActive is false', () => {
    render(<Toggle isActive={false} onToggle={jest.fn()} label="Disabled" />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
  });

  it('applies active class when isActive is true', () => {
    render(<Toggle isActive={true} onToggle={jest.fn()} label="Active" dataTestId="toggle" />);
    expect(screen.getByTestId('toggle')).toHaveClass('toggle--active');
  });

  it('does not apply active class when isActive is false', () => {
    render(<Toggle isActive={false} onToggle={jest.fn()} label="Inactive" dataTestId="toggle" />);
    expect(screen.getByTestId('toggle')).not.toHaveClass('toggle--active');
  });

  it('calls onToggle when clicked', () => {
    const onToggle = jest.fn();
    render(<Toggle isActive={false} onToggle={onToggle} label="Toggle me" />);
    fireEvent.click(screen.getByRole('switch'));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('sets data-testid attribute', () => {
    render(<Toggle isActive={false} onToggle={jest.fn()} label="Toggle" dataTestId="my-toggle" />);
    expect(screen.getByTestId('my-toggle')).toBeInTheDocument();
  });

  it('merges custom className', () => {
    render(
      <Toggle isActive={false} onToggle={jest.fn()} label="Toggle" className="extra" dataTestId="toggle" />,
    );
    expect(screen.getByTestId('toggle')).toHaveClass('extra');
  });

  it('sets aria-label to the label prop value', () => {
    render(<Toggle isActive={false} onToggle={jest.fn()} label="WhatsApp Notifications" />);
    expect(screen.getByRole('switch', { name: 'WhatsApp Notifications' })).toBeInTheDocument();
  });
});
