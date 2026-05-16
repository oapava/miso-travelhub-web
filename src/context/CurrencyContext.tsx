import { createContext, useContext, useState } from 'react';

// ─── Supported currencies ─────────────────────────────────────────────────────

export const SUPPORTED_CURRENCIES = ['USD', 'COP', 'EUR', 'GBP'] as const;
export type SupportedCurrency = typeof SUPPORTED_CURRENCIES[number];

// ─── Context ──────────────────────────────────────────────────────────────────

interface CurrencyContextValue {
  currency: SupportedCurrency;
  setCurrency: (currency: SupportedCurrency) => void;
  supportedCurrencies: readonly SupportedCurrency[];
}

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: 'USD',
  setCurrency: () => {},
  supportedCurrencies: SUPPORTED_CURRENCIES,
});

// ─── Provider ─────────────────────────────────────────────────────────────────

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrency] = useState<SupportedCurrency>('USD');

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, supportedCurrencies: SUPPORTED_CURRENCIES }}>
      {children}
    </CurrencyContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useCurrency = () => useContext(CurrencyContext);
