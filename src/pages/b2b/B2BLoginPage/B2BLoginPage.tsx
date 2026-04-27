import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo, Button, Input } from '@/components/ui';
import './B2BLoginPage.scss';

const B2BLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login logic
    if (email && password) {
      navigate('/business');
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
              className='b2b-login-page__right-button'
              variant="primary"
              size="small"
              type="submit"
              dataTestId="b2b-login-submit"
            >
              LOGIN
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
