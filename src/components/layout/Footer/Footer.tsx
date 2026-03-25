import { useTranslation } from 'react-i18next';
import './Footer.scss';

interface FooterProps {
  dataTestId?: string;
}

const Footer: React.FC<FooterProps> = ({ dataTestId }) => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer" data-testid={dataTestId}>
      <div className="footer__container">
        <div className="footer__content">
          <p className="footer__copyright">
            &copy; {currentYear} TravelHub. {t('footer.rights')}.
          </p>
          <nav className="footer__links" aria-label={t('accessibility.footerNavigation')}>
            <a href="#privacy" className="footer__link">{t('footer.privacy')}</a>
            <a href="#terms" className="footer__link">{t('footer.terms')}</a>
            <a href="#support" className="footer__link">{t('footer.support')}</a>
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
