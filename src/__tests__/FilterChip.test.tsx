import { render, screen, fireEvent } from '@testing-library/react';
import FilterChip from '@/components/ui/FilterChip/FilterChip';

describe('FilterChip', () => {
  it('renders the label text', () => {
    render(<FilterChip label="Pool" />);
    expect(screen.getByText('Pool')).toBeInTheDocument();
  });

  it('renders a button element', () => {
    render(<FilterChip label="WiFi" />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('has aria-pressed="false" when not active', () => {
    render(<FilterChip label="Gym" isActive={false} />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');
  });

  it('has aria-pressed="true" when active', () => {
    render(<FilterChip label="Gym" isActive={true} />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });

  it('applies active class when isActive is true', () => {
    render(<FilterChip label="Pool" isActive={true} dataTestId="chip" />);
    expect(screen.getByTestId('chip')).toHaveClass('filter-chip--active');
  });

  it('does not apply active class when isActive is false', () => {
    render(<FilterChip label="Pool" isActive={false} dataTestId="chip" />);
    expect(screen.getByTestId('chip')).not.toHaveClass('filter-chip--active');
  });

  it('renders icon when icon prop is provided', () => {
    render(<FilterChip label="Pool" icon="🏊" />);
    expect(screen.getByText('🏊')).toBeInTheDocument();
  });

  it('does not render icon element when icon is not provided', () => {
    const { container } = render(<FilterChip label="Pool" />);
    expect(container.querySelector('.filter-chip__icon')).not.toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = jest.fn();
    render(<FilterChip label="WiFi" onClick={onClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('sets data-testid attribute', () => {
    render(<FilterChip label="Gym" dataTestId="gym-chip" />);
    expect(screen.getByTestId('gym-chip')).toBeInTheDocument();
  });

  it('merges custom className', () => {
    render(<FilterChip label="Pool" className="custom-chip" dataTestId="chip" />);
    expect(screen.getByTestId('chip')).toHaveClass('custom-chip');
  });
});
