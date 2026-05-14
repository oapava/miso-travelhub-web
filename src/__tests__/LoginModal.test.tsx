import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import LoginModal from '@/components/shared/LoginModal/LoginModal';
import { authService } from '@/services/auth.service';
import type { TokenResponse, UserResponse } from '@/services/auth.service';

jest.mock('@/services/auth.service', () => ({
  authService: {
    login: jest.fn(),
    getCurrentUser: jest.fn(),
  },
}));

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
  rol: 'viajero',
  fecha_registro: '2024-01-01T00:00:00Z',
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('LoginModal', () => {
  it('renders email and password fields when open', () => {
    render(<LoginModal isOpen onClose={() => {}} />);

    expect(screen.getByTestId('login-modal-email')).toBeInTheDocument();
    expect(screen.getByTestId('login-modal-password')).toBeInTheDocument();
    expect(screen.getByTestId('login-modal-sign-in')).toBeInTheDocument();
  });

  it('does not call the API when fields are empty', () => {
    render(<LoginModal isOpen onClose={() => {}} />);

    fireEvent.click(screen.getByTestId('login-modal-sign-in'));

    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('calls login and getCurrentUser with entered credentials', async () => {
    mockLogin.mockResolvedValueOnce(mockToken);
    mockGetCurrentUser.mockResolvedValueOnce(mockUser);

    render(<LoginModal isOpen onClose={() => {}} onLoginSuccess={jest.fn()} />);

    fireEvent.change(screen.getByTestId('login-modal-email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByTestId('login-modal-password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByTestId('login-modal-sign-in'));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(mockGetCurrentUser).toHaveBeenCalledWith('token123');
    });
  });

  it('calls onLoginSuccess with token and user on successful login', async () => {
    mockLogin.mockResolvedValueOnce(mockToken);
    mockGetCurrentUser.mockResolvedValueOnce(mockUser);

    const onLoginSuccess = jest.fn();
    render(<LoginModal isOpen onClose={() => {}} onLoginSuccess={onLoginSuccess} />);

    fireEvent.change(screen.getByTestId('login-modal-email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByTestId('login-modal-password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByTestId('login-modal-sign-in'));

    await waitFor(() => {
      expect(onLoginSuccess).toHaveBeenCalledWith(mockToken, mockUser);
    });
  });

  it('shows error message on failed login', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Credenciales inválidas'));

    render(<LoginModal isOpen onClose={() => {}} />);

    fireEvent.change(screen.getByTestId('login-modal-email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByTestId('login-modal-password'), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByTestId('login-modal-sign-in'));

    await waitFor(() => {
      expect(screen.getByTestId('login-modal-error')).toHaveTextContent('Credenciales inválidas');
    });
  });

  it('shows error and does not call onLoginSuccess when user has hotel_admin role', async () => {
    const adminUser = { ...mockUser, rol: 'hotel_admin' };
    mockLogin.mockResolvedValueOnce(mockToken);
    mockGetCurrentUser.mockResolvedValueOnce(adminUser);

    const onLoginSuccess = jest.fn();
    render(<LoginModal isOpen onClose={() => {}} onLoginSuccess={onLoginSuccess} />);

    fireEvent.change(screen.getByTestId('login-modal-email'), {
      target: { value: 'admin@hotel.com' },
    });
    fireEvent.change(screen.getByTestId('login-modal-password'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByTestId('login-modal-sign-in'));

    await waitFor(() => {
      expect(screen.getByTestId('login-modal-error')).toBeInTheDocument();
    });
    expect(onLoginSuccess).not.toHaveBeenCalled();
  });

  it('shows the correct error message for non-traveler role', async () => {
    const adminUser = { ...mockUser, rol: 'hotel_admin' };
    mockLogin.mockResolvedValueOnce(mockToken);
    mockGetCurrentUser.mockResolvedValueOnce(adminUser);

    render(<LoginModal isOpen onClose={() => {}} />);

    fireEvent.change(screen.getByTestId('login-modal-email'), {
      target: { value: 'admin@hotel.com' },
    });
    fireEvent.change(screen.getByTestId('login-modal-password'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByTestId('login-modal-sign-in'));

    await waitFor(() => {
      expect(screen.getByTestId('login-modal-error')).toHaveTextContent(
        'This portal is for travelers. Hotel administrators should use the Business portal.',
      );
    });
  });

  it('disables button and shows loading text while submitting', async () => {
    let resolveLogin!: (value: TokenResponse) => void;
    mockLogin.mockReturnValueOnce(new Promise((res) => { resolveLogin = res; }));
    mockGetCurrentUser.mockResolvedValueOnce(mockUser);

    render(<LoginModal isOpen onClose={() => {}} />);

    fireEvent.change(screen.getByTestId('login-modal-email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByTestId('login-modal-password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByTestId('login-modal-sign-in'));

    expect(screen.getByTestId('login-modal-sign-in')).toBeDisabled();
    expect(screen.getByTestId('login-modal-sign-in')).toHaveTextContent('SIGNING IN...');

    await act(async () => { resolveLogin(mockToken); });
  });
});
