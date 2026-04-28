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

interface SearchValues {
  location?: string;
  checkIn?: string;
  checkOut?: string;
  rooms?: number;
  adults?: number;
  children?: number;
}

interface HeaderProps {
  dataTestId?: string;
  searchInitialValues?: SearchValues;
  onSearch?: (params: SearchValues) => void;
}


const Header: React.FC<HeaderProps> = ({ dataTestId, searchInitialValues, onSearch }) => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { isAuthenticated, user, logout, login } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);

  // Show compact search bar on all internal pages — only hide on Home and B2B
  const showSearchBar = location.pathname !== B2CRoutes.HOME && !location.pathname.startsWith('/business');

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
    <header className={`header ${isMobileMenuOpen ? 'header--menu-open' : ''}`} data-testid={dataTestId}>
      <div className="header__container">
        <Link to={B2CRoutes.HOME} className="header__logo-link" aria-label="TravelHub Home">
          <Logo size="medium" variant="full" />
        </Link>

        {showSearchBar && <SearchBar variant="compact" initialValues={searchInitialValues} onSearch={onSearch} />}

        <button
          type="button"
          className={`header__mobile-toggle ${isMobileMenuOpen ? 'header__mobile-toggle--open' : ''}`}
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMobileMenuOpen}
        >
          <span className="header__hamburger" />
        </button>

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
              <div className="header__user-avatar" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" className="header__user-avatar-icon">
                  <circle cx="12" cy="8" r="4" fill="currentColor" />
                  <path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
                </svg>
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
