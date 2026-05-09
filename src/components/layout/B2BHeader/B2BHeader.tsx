import { useTranslation } from 'react-i18next';
import { Logo } from '@/components/ui';
import { useCurrency, type SupportedCurrency } from '@/context/CurrencyContext';
import './B2BHeader.scss';

interface B2BHeaderProps {
  breadcrumbText?: string;
  currentDate?: string;
  dataTestId?: string;
}

const B2BHeader: React.FC<B2BHeaderProps> = ({
  breadcrumbText = 'Travelhub/Dashboard',
  currentDate,
  dataTestId,
}) => {
  const { i18n } = useTranslation();
  const { currency, setCurrency, supportedCurrencies } = useCurrency();
  const displayDate =
    currentDate ||
    new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  const handleLanguageToggle = () => {
    const nextLanguage = i18n.language === 'es' ? 'en' : 'es';
    i18n.changeLanguage(nextLanguage);
  };

  return (
    <header className="b2b-header" data-testid={dataTestId}>
      <div className="b2b-header__container">
        <div className="b2b-header__left">
          <Logo size="medium" />
          <span className="b2b-header__breadcrumb">{breadcrumbText}</span>
        </div>

        <div className="b2b-header__right">
          <button
            type="button"
            className="b2b-header__lang-toggle"
            onClick={handleLanguageToggle}
            aria-label="Change language"
            data-testid="b2b-header-language"
          >
            {i18n.language.toUpperCase()}
          </button>
          <select
            className="b2b-header__currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value as SupportedCurrency)}
            aria-label="Select currency"
            data-testid="b2b-header-currency-select"
          >
            {supportedCurrencies.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <button
            type="button"
            className="b2b-header__notification"
            aria-label="Notifications"
            data-testid="b2b-header-notifications"
          >
            🔔
          </button>
          <span className="b2b-header__date">{displayDate}</span>
        </div>
      </div>
    </header>
  );
};

export default B2BHeader;
