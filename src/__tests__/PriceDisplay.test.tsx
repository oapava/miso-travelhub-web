import { render, screen } from '@testing-library/react';
import PriceDisplay from '@/components/ui/PriceDisplay/PriceDisplay';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en', changeLanguage: jest.fn() },
  }),
}));

describe('PriceDisplay', () => {
  it('renders the final price', () => {
    render(<PriceDisplay finalPrice={100} />);
    expect(screen.getByText('$100')).toBeInTheDocument();
  });

  it('renders original price with strikethrough when it is higher than final price', () => {
    render(<PriceDisplay originalPrice={200} finalPrice={150} />);
    expect(screen.getByText('$200')).toBeInTheDocument();
  });

  it('does not render original price when it equals final price', () => {
    render(<PriceDisplay originalPrice={100} finalPrice={100} dataTestId="pd" />);
    const originals = document.querySelectorAll('.price-display__original');
    expect(originals).toHaveLength(0);
  });

  it('does not render original price when not provided', () => {
    render(<PriceDisplay finalPrice={100} />);
    expect(document.querySelector('.price-display__original')).not.toBeInTheDocument();
  });

  it('renders discount percentage when provided', () => {
    render(<PriceDisplay finalPrice={80} discountPercentage={20} />);
    expect(screen.getByText('20%')).toBeInTheDocument();
  });

  it('does not render discount percentage when not provided', () => {
    render(<PriceDisplay finalPrice={100} />);
    expect(document.querySelector('.price-display__discount')).not.toBeInTheDocument();
  });

  it('renders period when provided', () => {
    render(<PriceDisplay finalPrice={100} period="per night" />);
    expect(screen.getByText('per night')).toBeInTheDocument();
  });

  it('does not render period when not provided', () => {
    render(<PriceDisplay finalPrice={100} />);
    expect(document.querySelector('.price-display__period')).not.toBeInTheDocument();
  });

  it('uses custom currency symbol', () => {
    render(<PriceDisplay finalPrice={100} currency="€" />);
    expect(screen.getByText('€100')).toBeInTheDocument();
  });

  it('applies medium size class by default', () => {
    render(<PriceDisplay finalPrice={100} dataTestId="pd" />);
    expect(screen.getByTestId('pd')).toHaveClass('price-display--medium');
  });

  it('applies small size class when size is small', () => {
    render(<PriceDisplay finalPrice={100} size="small" dataTestId="pd" />);
    expect(screen.getByTestId('pd')).toHaveClass('price-display--small');
  });

  it('applies large size class when size is large', () => {
    render(<PriceDisplay finalPrice={100} size="large" dataTestId="pd" />);
    expect(screen.getByTestId('pd')).toHaveClass('price-display--large');
  });

  it('sets data-testid attribute', () => {
    render(<PriceDisplay finalPrice={100} dataTestId="price-display-test" />);
    expect(screen.getByTestId('price-display-test')).toBeInTheDocument();
  });
});
