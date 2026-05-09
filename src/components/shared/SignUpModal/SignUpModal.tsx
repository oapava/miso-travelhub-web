import { useState } from 'react';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import { Select } from '@/components/ui';
import { Modal } from '@/components/ui';
import { authService } from '@/services/auth.service';
import type { TokenResponse, UserResponse } from '@/services/auth.service';
import './SignUpModal.scss';

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignUpSuccess?: (token: TokenResponse, user: UserResponse) => void;
  dataTestId?: string;
}

const COUNTRY_OPTIONS = [
  { value: 'us', label: 'United States' },
  { value: 'mx', label: 'Mexico' },
  { value: 'ca', label: 'Canada' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'es', label: 'Spain' },
  { value: 'fr', label: 'France' },
];

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'pt', label: 'Português' },
];

const CURRENCY_OPTIONS = [
  { value: 'usd', label: 'USD ($)' },
  { value: 'eur', label: 'EUR (€)' },
  { value: 'mxn', label: 'MXN ($)' },
  { value: 'gbp', label: 'GBP (£)' },
];

const NOTIFICATION_OPTIONS = [
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
  { value: 'push', label: 'Push Notifications' },
  { value: 'all', label: 'All' },
];

const SignUpModal: React.FC<SignUpModalProps> = ({
  isOpen,
  onClose,
  onSignUpSuccess,
  dataTestId = 'signup-modal',
}) => {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [country, setCountry] = useState('');
  const [language, setLanguage] = useState('');
  const [phone, setPhone] = useState('');
  const [currency, setCurrency] = useState('');
  const [notifications, setNotifications] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async () => {
    if (!email || !fullName || !username || !password || !repeatPassword) return;

    if (password !== repeatPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Register the user
      await authService.register({
        email,
        username,
        nombre: fullName,
        password,
        telefono: phone || undefined,
        pais: country || undefined,
        idioma: language || 'es',
        moneda_preferida: currency.toUpperCase() || 'USD',
      });

      // Auto-login after successful registration
      const token = await authService.login(email, password);
      const user = await authService.getCurrentUser(token.access_token);
      onSignUpSuccess?.(token, user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed. Please try again.');
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
      className="signup-modal"
    >
      <div className="signup-modal__container" data-testid={`${dataTestId}-container`}>
        {/* Título del modal — h2 porque está dentro de un dialog */}
        <h2 className="signup-modal__title">Crear cuenta</h2>

        <div className="signup-modal__avatar" data-testid={`${dataTestId}-avatar`}>
          <div className="signup-modal__avatar-placeholder">
            <span className="signup-modal__avatar-icon">
              {/* Decorativa — el heading provee el contexto */}
              <img src="/img/user-avatar.png" alt="" aria-hidden="true" />
            </span>
            <div className="signup-modal__avatar-edit" role="button" tabIndex={0} aria-label="Cambiar foto de perfil">
              <img src="/img/edit.svg" alt="" aria-hidden="true" />
            </div>
          </div>
        </div>

        <div className="signup-modal__form" data-testid={`${dataTestId}-form`}>
          <Input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            dataTestId={`${dataTestId}-email`}
          />

          <div className="signup-modal__row" data-testid={`${dataTestId}-name-row`}>
            <Input
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              fullWidth
              dataTestId={`${dataTestId}-fullname`}
            />
            <Input
              placeholder="User Name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              fullWidth
              dataTestId={`${dataTestId}-username`}
            />
          </div>

          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            dataTestId={`${dataTestId}-password`}
          />

          <Input
            type="password"
            placeholder="Repeat Password"
            value={repeatPassword}
            onChange={(e) => setRepeatPassword(e.target.value)}
            fullWidth
            dataTestId={`${dataTestId}-repeat-password`}
          />

          <div className="signup-modal__row" data-testid={`${dataTestId}-country-language-row`}>
            <Select
              options={COUNTRY_OPTIONS}
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              fullWidth
              dataTestId={`${dataTestId}-country`}
            />
            <Select
              options={LANGUAGE_OPTIONS}
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              fullWidth
              dataTestId={`${dataTestId}-language`}
            />
          </div>

          <Input
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            fullWidth
            dataTestId={`${dataTestId}-phone`}
          />

          <div className="signup-modal__row" data-testid={`${dataTestId}-currency-notifications-row`}>
            <Select
              options={CURRENCY_OPTIONS}
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              fullWidth
              dataTestId={`${dataTestId}-currency`}
            />
            <Select
              options={NOTIFICATION_OPTIONS}
              value={notifications}
              onChange={(e) => setNotifications(e.target.value)}
              fullWidth
              dataTestId={`${dataTestId}-notifications`}
            />
          </div>

          {error && (
            <p className="signup-modal__error" data-testid={`${dataTestId}-error`}>
              {error}
            </p>
          )}

          <Button
            variant="yellow"
            size="small"
            fullWidth={false}
            onClick={handleSignUp}
            dataTestId={`${dataTestId}-sign-in`}
            className='signup-modal__sign-in-button'
            disabled={isLoading}
          >
            {isLoading ? 'SIGNING UP...' : 'SIGN IN'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default SignUpModal;
