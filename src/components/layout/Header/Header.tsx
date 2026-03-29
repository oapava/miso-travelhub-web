import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Logo, Button } from '@/components/ui';
import { B2CRoutes } from '@/types';
import { useAuth } from '@/context/AuthContext';
import type { TokenResponse, UserResponse } from '@/services/auth.service';
import './Header.scss';
import { SearchBar } from '../SearchBar';
import LoginModal from '../../shared/LoginModal/LoginModal';
import SignUpModal from '../../shared/SignUpModal/SignUpModal';

interface HeaderProps {
  dataTestId?: string;
}

const Header: React.FC<HeaderProps> = ({ dataTestId }) => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { isAuthenticated, user, logout, login } = useAuth();
  const isMobileMenuOpen = false;
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);

  const showSearchBar = location.pathname !== B2CRoutes.HOME;

  const handleLanguageToggle = () => {
    const nextLanguage = i18n.language === 'es' ? 'en' : 'es';
    i18n.changeLanguage(nextLanguage);
  };

  const handleLoginSuccess = (token: TokenResponse, userResponse: UserResponse) => {
    login(token, userResponse);
    setIsLoginModalOpen(false);
  };

  const handleSignUpSuccess = (token: TokenResponse, userResponse: UserResponse) => {
    login(token, userResponse);
    setIsSignUpModalOpen(false);
  };

  return (
    <header className="header" data-testid={dataTestId}>
      <div className="header__container">
        <Link to={B2CRoutes.HOME} className="header__logo-link" aria-label="TravelHub Home">
          <Logo size="large" variant="icon" />
        </Link>

        {showSearchBar && <SearchBar variant="compact" />}

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

          {isAuthenticated ? (
            <div className="header__user">
              <div className="header__user-avatar">
                <span className="header__user-avatar-placeholder">
                  {user?.nombre?.charAt(0) || user?.username?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="header__user-info">
                <span className="header__user-name">{user?.nombre}</span>
                <div className="header__user-links">
                  <Link to="/account" className="header__account-link" data-testid="header-account">
                    Account
                  </Link>
                  <span className="header__user-divider">|</span>
                  <button
                    type="button"
                    className="header__logout-link"
                    onClick={logout}
                    data-testid="header-logout"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="header__auth-buttons">
              <Button
                variant="primary"
                size="small"
                onClick={() => setIsLoginModalOpen(true)}
                dataTestId="header-login-button"
              >
                {t('navigation.login')}
              </Button>
              <Button
                variant="yellow"
                size="small"
                onClick={() => setIsSignUpModalOpen(true)}
                dataTestId="header-signup-button"
              >
                {t('navigation.signup')}
              </Button>
            </div>
          )}
        </div>
      </div>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
      <SignUpModal
        isOpen={isSignUpModalOpen}
        onClose={() => setIsSignUpModalOpen(false)}
        onSignUpSuccess={handleSignUpSuccess}
      />
    </header>
  );
};

export default Header;
