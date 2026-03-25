import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Logo, Button } from '@/components/ui';
import { B2CRoutes } from '@/types';
import './Header.scss';

interface UserInfo {
  name: string;
  avatarUrl?: string;
}

interface HeaderProps {
  isLoggedIn?: boolean;
  user?: UserInfo;
  onLoginClick?: () => void;
  onSignUpClick?: () => void;
  onLogoutClick?: () => void;
  dataTestId?: string;
}

const Header: React.FC<HeaderProps> = ({
  isLoggedIn = false,
  user,
  onLoginClick,
  onSignUpClick,
  onLogoutClick,
  dataTestId,
}) => {
  const { t, i18n } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLanguageToggle = () => {
    const nextLanguage = i18n.language === 'es' ? 'en' : 'es';
    i18n.changeLanguage(nextLanguage);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((previousState) => !previousState);
  };

  return (
    <header className="header" data-testid={dataTestId}>
      <div className="header__container">
        <Link to={B2CRoutes.HOME} className="header__logo-link" aria-label="TravelHub Home">
          <Logo size="large" variant="icon" />
        </Link>

        <div className={`header__actions ${isMobileMenuOpen ? 'header__actions--open' : ''}`}>
          <button
            type="button"
            className="header__language-toggle"
            onClick={handleLanguageToggle}
            aria-label={t('accessibility.changeLanguage')}
            data-testid="header-language-toggle"
          >
            {i18n.language.toUpperCase()}
          </button>

          <span className="header__currency" aria-label="Currency">
            USD
          </span>

          {isLoggedIn ? (
            <div className="header__user">
              <div className="header__user-avatar">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} />
                ) : (
                  <span className="header__user-avatar-placeholder">
                    {user?.name?.charAt(0) || 'U'}
                  </span>
                )}
              </div>
              <div className="header__user-info">
                <span className="header__user-name">{user?.name}</span>
                <button
                  type="button"
                  className="header__logout-link"
                  onClick={onLogoutClick}
                  data-testid="header-logout"
                >
                  {t('navigation.login')} | Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="header__auth-buttons">
              <Button
                variant="primary"
                size="small"
                onClick={onLoginClick}
                dataTestId="header-login-button"
              >
                {t('navigation.login')}
              </Button>
              <Button
                variant="yellow"
                size="small"
                onClick={onSignUpClick}
                dataTestId="header-signup-button"
              >
                {t('navigation.signup')}
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
