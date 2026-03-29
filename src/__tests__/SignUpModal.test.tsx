import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import SignUpModal from '@/components/shared/SignUpModal/SignUpModal';
import { authService } from '@/services/auth.service';
import type { TokenResponse, UserResponse } from '@/services/auth.service';

jest.mock('@/services/auth.service', () => ({
  authService: {
    register: jest.fn(),
    login: jest.fn(),
    getCurrentUser: jest.fn(),
  },
}));

const mockRegister = authService.register as jest.MockedFunction<typeof authService.register>;
const mockLogin = authService.login as jest.MockedFunction<typeof authService.login>;
const mockGetCurrentUser = authService.getCurrentUser as jest.MockedFunction<typeof authService.getCurrentUser>;

const mockToken: TokenResponse = {
  access_token: 'token123',
  refresh_token: 'refresh123',
  token_type: 'bearer',
  expires_in: 900,
};

const mockUser: UserResponse = {
  id: 'uuid',
  email: 'test@example.com',
  username: 'testuser',
  nombre: 'Test User',
  telefono: null,
  pais: null,
  idioma: 'en',
  moneda_preferida: 'USD',
  mfa_activo: false,
  rol: 'traveler',
  fecha_registro: '2024-01-01T00:00:00Z',
};

const fillRequiredFields = () => {
  fireEvent.change(screen.getByTestId('signup-modal-email'), { target: { value: 'test@example.com' } });
  fireEvent.change(screen.getByTestId('signup-modal-fullname'), { target: { value: 'Test User' } });
  fireEvent.change(screen.getByTestId('signup-modal-username'), { target: { value: 'testuser' } });
  fireEvent.change(screen.getByTestId('signup-modal-password'), { target: { value: 'password123' } });
  fireEvent.change(screen.getByTestId('signup-modal-repeat-password'), { target: { value: 'password123' } });
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('SignUpModal', () => {
  it('renders all form fields including the email field', () => {
    render(<SignUpModal isOpen onClose={() => {}} />);

    expect(screen.getByTestId('signup-modal-email')).toBeInTheDocument();
    expect(screen.getByTestId('signup-modal-fullname')).toBeInTheDocument();
    expect(screen.getByTestId('signup-modal-username')).toBeInTheDocument();
    expect(screen.getByTestId('signup-modal-password')).toBeInTheDocument();
    expect(screen.getByTestId('signup-modal-repeat-password')).toBeInTheDocument();
  });

  it('does not call the API when required fields are empty', () => {
    render(<SignUpModal isOpen onClose={() => {}} />);

    fireEvent.click(screen.getByTestId('signup-modal-sign-in'));

    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('shows error and does not call API when passwords do not match', async () => {
    render(<SignUpModal isOpen onClose={() => {}} />);

    fireEvent.change(screen.getByTestId('signup-modal-email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByTestId('signup-modal-fullname'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByTestId('signup-modal-username'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByTestId('signup-modal-password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByTestId('signup-modal-repeat-password'), { target: { value: 'different' } });
    fireEvent.click(screen.getByTestId('signup-modal-sign-in'));

    expect(screen.getByTestId('signup-modal-error')).toHaveTextContent('Passwords do not match.');
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('calls register with correct mapped fields', async () => {
    mockRegister.mockResolvedValueOnce(mockUser);
    mockLogin.mockResolvedValueOnce(mockToken);
    mockGetCurrentUser.mockResolvedValueOnce(mockUser);

    render(<SignUpModal isOpen onClose={() => {}} onSignUpSuccess={jest.fn()} />);

    fillRequiredFields();
    fireEvent.change(screen.getByTestId('signup-modal-country'), { target: { value: 'us' } });
    fireEvent.change(screen.getByTestId('signup-modal-language'), { target: { value: 'en' } });
    fireEvent.change(screen.getByTestId('signup-modal-currency'), { target: { value: 'usd' } });
    fireEvent.click(screen.getByTestId('signup-modal-sign-in'));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith(expect.objectContaining({
        email: 'test@example.com',
        username: 'testuser',
        nombre: 'Test User',
        password: 'password123',
        pais: 'us',
        idioma: 'en',
      }));
    });
  });

  it('auto-logs in and calls onSignUpSuccess with token and user after registration', async () => {
    mockRegister.mockResolvedValueOnce(mockUser);
    mockLogin.mockResolvedValueOnce(mockToken);
    mockGetCurrentUser.mockResolvedValueOnce(mockUser);

    const onSignUpSuccess = jest.fn();
    render(<SignUpModal isOpen onClose={() => {}} onSignUpSuccess={onSignUpSuccess} />);

    fillRequiredFields();
    fireEvent.click(screen.getByTestId('signup-modal-sign-in'));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(onSignUpSuccess).toHaveBeenCalledWith(mockToken, mockUser);
    });
  });

  it('shows error message on API failure', async () => {
    mockRegister.mockRejectedValueOnce(new Error('Email ya registrado'));

    render(<SignUpModal isOpen onClose={() => {}} />);

    fillRequiredFields();
    fireEvent.click(screen.getByTestId('signup-modal-sign-in'));

    await waitFor(() => {
      expect(screen.getByTestId('signup-modal-error')).toHaveTextContent('Email ya registrado');
    });
  });

  it('disables button and shows loading text while submitting', async () => {
    let resolveRegister!: (value: UserResponse) => void;
    mockRegister.mockReturnValueOnce(new Promise((res) => { resolveRegister = res; }));

    render(<SignUpModal isOpen onClose={() => {}} />);

    fillRequiredFields();
    fireEvent.click(screen.getByTestId('signup-modal-sign-in'));

    expect(screen.getByTestId('signup-modal-sign-in')).toBeDisabled();
    expect(screen.getByTestId('signup-modal-sign-in')).toHaveTextContent('SIGNING UP...');

    await act(async () => { resolveRegister(mockUser); });
  });
});
