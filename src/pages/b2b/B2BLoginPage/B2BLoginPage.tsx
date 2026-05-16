import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Logo, Button, Input } from '@/components/ui';
import { authService } from '@/services/auth.service';
import { useAuth } from '@/context/AuthContext';
import './B2BLoginPage.scss';

const B2BLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login: contextLogin } = useAuth();
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setError(null);

    try {
      const token = await authService.login(email, password);
      const user = await authService.getCurrentUser(token.access_token);
      if (user.rol === 'viajero' || user.rol === 'traveler') {
        throw new Error(t('b2b.login.accessDenied'));
      }
      contextLogin(token, user);
      navigate('/business');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('b2b.login.loginFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="b2b-login-page" data-testid="b2b-login-page">
      <div className="b2b-login-page__left">
        <div className="b2b-login-page__container">
          <div className="b2b-login-page__logo-wrapper b2b-login-page__logo-wrapper--left">
            <Logo size="large" variant='icon' dataTestId="b2b-login-logo" />
          </div>

          <h1 className="b2b-login-page__heading">
            {t('b2b.login.heading')}
          </h1>

          <p className="b2b-login-page__subtitle">
            {t('b2b.login.subtitle')}
          </p>

          <form className="b2b-login-page__form" onSubmit={handleLogin}>
            <Input
              label={t('b2b.login.emailLabel')}
              type="email"
              placeholder={t('b2b.login.emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              dataTestId="b2b-login-email"
            />

            <Input
              label={t('b2b.login.passwordLabel')}
              type="password"
              placeholder={t('b2b.login.passwordPlaceholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              dataTestId="b2b-login-password"
            />

            {error && (
              <p className="b2b-login-page__error" data-testid="b2b-login-error">
                {error}
              </p>
            )}

            <div className="b2b-login-page__links-row">
              <a href="#" className="b2b-login-page__link b2b-login-page__link--bold">
                {t('b2b.login.forgotPassword')}
              </a>
              <span className="b2b-login-page__separator">|</span>
              <a href="#" className="b2b-login-page__link">
                {t('b2b.login.noAccount')} <strong>{t('b2b.login.signUp')}</strong>
              </a>
            </div>

            <Button
              className='b2b-login-page__right-button'
              variant="primary"
              size="small"
              type="submit"
              disabled={isLoading}
              dataTestId="b2b-login-submit"
            >
              {isLoading ? t('b2b.login.loggingIn') : t('b2b.login.loginBtn')}
            </Button>
          </form>
        </div>
      </div>

      <div className="b2b-login-page__right" data-testid="b2b-login-image-placeholder" aria-hidden="true">
        
      </div>
    </div>
  );
};

export default B2BLoginPage;
