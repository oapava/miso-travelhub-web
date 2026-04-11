import { render, screen } from '@testing-library/react';
import Badge from '@/components/ui/Badge/Badge';

describe('Badge', () => {
  it('renders the label text', () => {
    render(<Badge label="Available" />);
    expect(screen.getByText('Available')).toBeInTheDocument();
  });

  it('has status role', () => {
    render(<Badge label="Active" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('applies primary variant class by default', () => {
    render(<Badge label="Tag" dataTestId="badge" />);
    expect(screen.getByTestId('badge')).toHaveClass('badge--primary');
  });

  it('applies success variant class', () => {
    render(<Badge label="OK" variant="success" dataTestId="badge" />);
    expect(screen.getByTestId('badge')).toHaveClass('badge--success');
  });

  it('applies warning variant class', () => {
    render(<Badge label="Warn" variant="warning" dataTestId="badge" />);
    expect(screen.getByTestId('badge')).toHaveClass('badge--warning');
  });

  it('applies info variant class', () => {
    render(<Badge label="Info" variant="info" dataTestId="badge" />);
    expect(screen.getByTestId('badge')).toHaveClass('badge--info');
  });

  it('applies discount variant class', () => {
    render(<Badge label="-20%" variant="discount" dataTestId="badge" />);
    expect(screen.getByTestId('badge')).toHaveClass('badge--discount');
  });

  it('applies rating variant class', () => {
    render(<Badge label="9.2" variant="rating" dataTestId="badge" />);
    expect(screen.getByTestId('badge')).toHaveClass('badge--rating');
  });

  it('applies small size class by default', () => {
    render(<Badge label="Small" dataTestId="badge" />);
    expect(screen.getByTestId('badge')).toHaveClass('badge--small');
  });

  it('applies medium size class', () => {
    render(<Badge label="Medium" size="medium" dataTestId="badge" />);
    expect(screen.getByTestId('badge')).toHaveClass('badge--medium');
  });

  it('sets data-testid attribute', () => {
    render(<Badge label="Test" dataTestId="my-badge" />);
    expect(screen.getByTestId('my-badge')).toBeInTheDocument();
  });

  it('merges custom className', () => {
    render(<Badge label="Custom" className="extra-class" dataTestId="badge" />);
    expect(screen.getByTestId('badge')).toHaveClass('extra-class');
  });
});
