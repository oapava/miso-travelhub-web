import { render, screen, fireEvent } from '@testing-library/react';
import { CurrencyProvider, useCurrency, SUPPORTED_CURRENCIES } from '@/context/CurrencyContext';

// Helper component that reads from the context and exposes a way to change it
const TestConsumer: React.FC = () => {
  const { currency, setCurrency, supportedCurrencies } = useCurrency();
  return (
    <div>
      <span data-testid="current-currency">{currency}</span>
      <span data-testid="supported">{supportedCurrencies.join(',')}</span>
      {supportedCurrencies.map((c) => (
        <button key={c} data-testid={`set-${c}`} onClick={() => setCurrency(c)}>
          {c}
        </button>
      ))}
    </div>
  );
};

describe('CurrencyContext', () => {
  it('defaults to USD', () => {
    render(
      <CurrencyProvider>
        <TestConsumer />
      </CurrencyProvider>,
    );
    expect(screen.getByTestId('current-currency')).toHaveTextContent('USD');
  });

  it('exposes all supported currencies', () => {
    render(
      <CurrencyProvider>
        <TestConsumer />
      </CurrencyProvider>,
    );
    const supported = screen.getByTestId('supported').textContent ?? '';
    SUPPORTED_CURRENCIES.forEach((c) => {
      expect(supported).toContain(c);
    });
  });

  it('updates currency when setCurrency is called', () => {
    render(
      <CurrencyProvider>
        <TestConsumer />
      </CurrencyProvider>,
    );
    fireEvent.click(screen.getByTestId('set-COP'));
    expect(screen.getByTestId('current-currency')).toHaveTextContent('COP');

    fireEvent.click(screen.getByTestId('set-EUR'));
    expect(screen.getByTestId('current-currency')).toHaveTextContent('EUR');

    fireEvent.click(screen.getByTestId('set-GBP'));
    expect(screen.getByTestId('current-currency')).toHaveTextContent('GBP');

    fireEvent.click(screen.getByTestId('set-USD'));
    expect(screen.getByTestId('current-currency')).toHaveTextContent('USD');
  });

  it('useCurrency returns default values without a provider', () => {
    // Without a provider, createContext defaults are used (currency: "USD")
    const TestNoProvider: React.FC = () => {
      const { currency } = useCurrency();
      return <span data-testid="bare-currency">{currency}</span>;
    };
    render(<TestNoProvider />);
    expect(screen.getByTestId('bare-currency')).toHaveTextContent('USD');
  });
});
