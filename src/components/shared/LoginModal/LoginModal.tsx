import { useState } from 'react';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import { Modal } from '@/components/ui';
import { authService } from '@/services/auth.service';
import type { TokenResponse, UserResponse } from '@/services/auth.service';
import './LoginModal.scss';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: (token: TokenResponse, user: UserResponse) => void;
  dataTestId?: string;
}

const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  dataTestId = 'login-modal',
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email || !password) return;

    setIsLoading(true);
    setError(null);

    try {
      const token = await authService.login(email, password);
      const user = await authService.getCurrentUser(token.access_token);
      onLoginSuccess?.(token, user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="medium"
      dataTestId={dataTestId}
      className="login-modal"
    >
      <div className="login-modal__container" data-testid={`${dataTestId}-container`}>

        <div className="login-modal__header" data-testid={`${dataTestId}-header`}>
          <h1 className="login-modal__title">
            <span className="login-modal__title-accent">Welcome Back</span>
            <span className="login-modal__title-bold"> Traveler!</span>
          </h1>
        </div>

        <div className="login-modal__avatar" data-testid={`${dataTestId}-avatar`}>
          <div className="login-modal__avatar-placeholder">
            <span className="login-modal__avatar-icon">
              <img src="img/user-avatar.png" alt="user avatar" />
            </span>
          </div>
        </div>
        <p className="login-modal__subtitle">Login</p>

        <div className="login-modal__form" data-testid={`${dataTestId}-form`}>
          <Input
            placeholder="Email or Phone Number"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            dataTestId={`${dataTestId}-email`}
          />

          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            dataTestId={`${dataTestId}-password`}
          />

          {error && (
            <p className="login-modal__error" data-testid={`${dataTestId}-error`}>
              {error}
            </p>
          )}

          <div className="login-modal__forgot-password" data-testid={`${dataTestId}-forgot`}>
            <a href="#" className="login-modal__forgot-link">
              Forgot password?
            </a>
          </div>

          <div className="login-modal__actions" data-testid={`${dataTestId}-actions`}>
            <Button
              variant="yellow"
              size="small"
              fullWidth={false}
              onClick={handleLogin}
              dataTestId={`${dataTestId}-sign-in`}
              className='login-modal__sign-in-button'
              disabled={isLoading}
            >
              {isLoading ? 'SIGNING IN...' : 'SIGN IN'}
            </Button>
            <Button
              variant="primary"
              size="small"
              fullWidth={false}
              onClick={handleLogin}
              dataTestId={`${dataTestId}-login`}
              className='login-modal__login-button'
              disabled={isLoading}
            >
              {isLoading ? 'LOADING...' : 'LOGIN'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default LoginModal;
