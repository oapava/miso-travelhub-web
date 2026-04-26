import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo, Button, Input } from '@/components/ui';
import { authService } from '@/services/auth.service';
import { useAuth } from '@/context/AuthContext';
import './B2BLoginPage.scss';

const B2BLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login: contextLogin } = useAuth();

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
      if (user.rol === 'traveler') {
        throw new Error('Access denied. This portal is for hotel administrators only.');
      }
      contextLogin(token, user);
      navigate('/business');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="b2b-login-page" data-testid="b2b-login-page">
      <div className="b2b-login-page__left">
        <div className="b2b-login-page__container">
          <div className="b2b-login-page__logo-wrapper">
            <Logo size="medium" dataTestId="b2b-login-logo" />
          </div>

          <h1 className="b2b-login-page__heading">
            Hello, <strong>Welcome Back!</strong>
          </h1>

          <p className="b2b-login-page__subtitle">
            We are happy to see you <strong>again</strong>, let's start!
          </p>

          <form className="b2b-login-page__form" onSubmit={handleLogin}>
            <Input
              label="Email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              dataTestId="b2b-login-email"
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
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
                Forgot your password?
              </a>
              <span className="b2b-login-page__separator">|</span>
              <a href="#" className="b2b-login-page__link">
                Don't have an account? <strong>Sign up for free</strong>
              </a>
            </div>

            <Button
              variant="primary"
              size="medium"
              fullWidth
              type="submit"
              disabled={isLoading}
              dataTestId="b2b-login-submit"
            >
              {isLoading ? 'LOGGING IN...' : 'LOGIN'}
            </Button>
          </form>
        </div>
      </div>

      <div className="b2b-login-page__right" data-testid="b2b-login-image-placeholder" aria-hidden="true" />
    </div>
  );
};

export default B2BLoginPage;
