import { render, screen } from '@testing-library/react';
import Logo from '@/components/ui/Logo/Logo';

describe('Logo', () => {
  it('renders the logo image', () => {
    render(<Logo />);
    expect(screen.getByAltText('TravelHub logo')).toBeInTheDocument();
  });

  it('has aria-label "TravelHub"', () => {
    render(<Logo dataTestId="logo" />);
    expect(screen.getByTestId('logo')).toHaveAttribute('aria-label', 'TravelHub');
  });

  it('renders "Travel" and "Hub" text in full variant', () => {
    render(<Logo variant="full" />);
    expect(screen.getByText('Travel')).toBeInTheDocument();
    expect(screen.getByText('Hub')).toBeInTheDocument();
  });

  it('does not render text in icon variant', () => {
    render(<Logo variant="icon" />);
    expect(screen.queryByText('Travel')).not.toBeInTheDocument();
    expect(screen.queryByText('Hub')).not.toBeInTheDocument();
  });

  it('applies full variant class by default', () => {
    render(<Logo dataTestId="logo" />);
    expect(screen.getByTestId('logo')).toHaveClass('logo--full');
  });

  it('applies icon variant class when variant is icon', () => {
    render(<Logo variant="icon" dataTestId="logo" />);
    expect(screen.getByTestId('logo')).toHaveClass('logo--icon');
  });

  it('applies medium size class by default', () => {
    render(<Logo dataTestId="logo" />);
    expect(screen.getByTestId('logo')).toHaveClass('logo--medium');
  });

  it('applies small size class when size is small', () => {
    render(<Logo size="small" dataTestId="logo" />);
    expect(screen.getByTestId('logo')).toHaveClass('logo--small');
  });

  it('applies large size class when size is large', () => {
    render(<Logo size="large" dataTestId="logo" />);
    expect(screen.getByTestId('logo')).toHaveClass('logo--large');
  });

  it('sets data-testid attribute', () => {
    render(<Logo dataTestId="my-logo" />);
    expect(screen.getByTestId('my-logo')).toBeInTheDocument();
  });

  it('merges custom className', () => {
    render(<Logo className="brand-logo" dataTestId="logo" />);
    expect(screen.getByTestId('logo')).toHaveClass('brand-logo');
  });
});
