import { render, screen, fireEvent } from '@testing-library/react';
import LoginModal from '@/components/shared/LoginModal/LoginModal';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en', changeLanguage: jest.fn() },
  }),
}));

describe('LoginModal', () => {
  it('renders form fields when open', () => {
    render(<LoginModal isOpen onClose={() => {}} />);

    expect(screen.getByTestId('login-modal-email')).toBeInTheDocument();
    expect(screen.getByTestId('login-modal-password')).toBeInTheDocument();
    expect(screen.getByTestId('login-modal-sign-in')).toBeInTheDocument();
  });

  it('calls onClose after successful login', () => {
    const onClose = jest.fn();
    render(<LoginModal isOpen onClose={onClose} />);

    fireEvent.change(screen.getByTestId('login-modal-email'), { target: { value: 'user@test.com' } });
    fireEvent.change(screen.getByTestId('login-modal-password'), { target: { value: 'secret' } });
    fireEvent.click(screen.getByTestId('login-modal-sign-in'));

    expect(onClose).toHaveBeenCalled();
  });
});
