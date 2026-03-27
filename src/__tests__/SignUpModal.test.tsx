import { render, screen, fireEvent } from '@testing-library/react';
import SignUpModal from '@/components/shared/SignUpModal/SignUpModal';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en', changeLanguage: jest.fn() },
  }),
}));

describe('SignUpModal', () => {
  it('renders fields when open', () => {
    render(<SignUpModal isOpen onClose={() => {}} />);

    expect(screen.getByTestId('signup-modal-form')).toBeInTheDocument();
    expect(screen.getByTestId('signup-modal-fullname')).toBeInTheDocument();
    expect(screen.getByTestId('signup-modal-username')).toBeInTheDocument();
  });

  it('calls onClose after successful sign up', () => {
    const onClose = jest.fn();
    render(<SignUpModal isOpen onClose={onClose} />);

    fireEvent.change(screen.getByTestId('signup-modal-fullname'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByTestId('signup-modal-username'), { target: { value: 'jdoe' } });
    fireEvent.change(screen.getByTestId('signup-modal-password'), { target: { value: 'secret' } });
    fireEvent.change(screen.getByTestId('signup-modal-repeat-password'), { target: { value: 'secret' } });
    fireEvent.change(screen.getByTestId('signup-modal-country'), { target: { value: 'us' } });
    fireEvent.change(screen.getByTestId('signup-modal-language'), { target: { value: 'en' } });
    fireEvent.change(screen.getByTestId('signup-modal-phone'), { target: { value: '+12345678' } });
    fireEvent.change(screen.getByTestId('signup-modal-currency'), { target: { value: 'usd' } });
    fireEvent.change(screen.getByTestId('signup-modal-notifications'), { target: { value: 'email' } });

    fireEvent.click(screen.getByTestId('signup-modal-sign-in'));

    expect(onClose).toHaveBeenCalled();
  });
});
