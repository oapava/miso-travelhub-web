import { useState } from 'react';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import { Modal } from '@/components/ui';
import './LoginModal.scss';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
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

  const handleSignIn = () => {
    if (email && password) {
      onLoginSuccess?.();
      onClose();
    }
  };

  const handleLogin = () => {
    if (email && password) {
      onLoginSuccess?.();
      onClose();
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
        <div className="login-modal__avatar" data-testid={`${dataTestId}-avatar`}>
          <div className="login-modal__avatar-placeholder">
            <span className="login-modal__avatar-icon">👤</span>
          </div>
        </div>

        <div className="login-modal__header" data-testid={`${dataTestId}-header`}>
          <h1 className="login-modal__title">
            <span className="login-modal__title-accent">Welcome Back</span>
            <span className="login-modal__title-bold"> Traveler!</span>
          </h1>
          <p className="login-modal__subtitle">Login</p>
        </div>

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

          <div className="login-modal__forgot-password" data-testid={`${dataTestId}-forgot`}>
            <a href="#" className="login-modal__forgot-link">
              Forgot password?
            </a>
          </div>

          <div className="login-modal__actions" data-testid={`${dataTestId}-actions`}>
            <Button
              variant="primary"
              size="medium"
              fullWidth
              onClick={handleSignIn}
              dataTestId={`${dataTestId}-sign-in`}
            >
              SIGN IN
            </Button>
            <Button
              variant="outline"
              size="medium"
              fullWidth
              onClick={handleLogin}
              dataTestId={`${dataTestId}-login`}
            >
              LOGIN
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default LoginModal;
