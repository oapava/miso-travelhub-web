import { render, screen } from '@testing-library/react';
import StatCard from '@/components/shared/StatCard/StatCard';

describe('StatCard', () => {
  it('renders the title', () => {
    render(<StatCard title="Total Bookings" mainValue="1,234" />);
    expect(screen.getByText('Total Bookings')).toBeInTheDocument();
  });

  it('renders the main value', () => {
    render(<StatCard title="Revenue" mainValue="$45,600" />);
    expect(screen.getByText('$45,600')).toBeInTheDocument();
  });

  it('renders subtitle when provided', () => {
    render(<StatCard title="Bookings" mainValue="100" subtitle="This month" />);
    expect(screen.getByText('This month')).toBeInTheDocument();
  });

  it('does not render subtitle when not provided', () => {
    render(<StatCard title="Bookings" mainValue="100" />);
    expect(document.querySelector('.stat-card__subtitle')).not.toBeInTheDocument();
  });

  it('renders secondary value when provided', () => {
    render(<StatCard title="Bookings" mainValue="100" secondaryValue="+15%" />);
    expect(screen.getByText('+15%')).toBeInTheDocument();
  });

  it('renders secondary label when provided with secondaryValue', () => {
    render(
      <StatCard
        title="Bookings"
        mainValue="100"
        secondaryValue="+15%"
        secondaryLabel="vs last month"
      />,
    );
    expect(screen.getByText('vs last month')).toBeInTheDocument();
  });

  it('does not render secondary section when secondaryValue is not provided', () => {
    render(<StatCard title="Bookings" mainValue="100" />);
    expect(document.querySelector('.stat-card__secondary')).not.toBeInTheDocument();
  });

  it('renders badge text when provided', () => {
    render(<StatCard title="Bookings" mainValue="100" badgeText="▲ 12%" />);
    expect(screen.getByText('▲ 12%')).toBeInTheDocument();
  });

  it('does not render badge when badgeText is not provided', () => {
    render(<StatCard title="Bookings" mainValue="100" />);
    expect(document.querySelector('.stat-card__badge')).not.toBeInTheDocument();
  });

  it('applies success badge variant class by default', () => {
    render(<StatCard title="Bookings" mainValue="100" badgeText="Up" dataTestId="sc" />);
    const badge = document.querySelector('.stat-card__badge');
    expect(badge).toHaveClass('stat-card__badge--success');
  });

  it('applies warning badge variant class when specified', () => {
    render(
      <StatCard title="Bookings" mainValue="100" badgeText="Down" badgeVariant="warning" />,
    );
    const badge = document.querySelector('.stat-card__badge');
    expect(badge).toHaveClass('stat-card__badge--warning');
  });

  it('does not render chart by default', () => {
    render(<StatCard title="Bookings" mainValue="100" dataTestId="sc" />);
    expect(document.querySelector('.stat-card__chart')).not.toBeInTheDocument();
  });

  it('renders chart when showChart is true', () => {
    render(<StatCard title="Bookings" mainValue="100" showChart dataTestId="sc" />);
    expect(screen.getByTestId('sc-chart')).toBeInTheDocument();
  });

  it('sets data-testid attribute', () => {
    render(<StatCard title="Test" mainValue="0" dataTestId="stat-card-test" />);
    expect(screen.getByTestId('stat-card-test')).toBeInTheDocument();
  });

  it('merges custom className', () => {
    render(<StatCard title="Test" mainValue="0" className="extra-card" dataTestId="sc" />);
    expect(screen.getByTestId('sc')).toHaveClass('extra-card');
  });
});
