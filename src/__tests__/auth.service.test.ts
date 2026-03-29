import { authService } from '@/services/auth.service';
import type { TokenResponse, UserResponse } from '@/services/auth.service';

const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockTokenResponse: TokenResponse = {
  access_token: 'access_token_123',
  refresh_token: 'refresh_token_456',
  token_type: 'bearer',
  expires_in: 900,
};

const mockUserResponse: UserResponse = {
  id: 'user-uuid-123',
  email: 'test@example.com',
  username: 'testuser',
  nombre: 'Test User',
  telefono: '+1234567890',
  pais: 'us',
  idioma: 'en',
  moneda_preferida: 'USD',
  mfa_activo: false,
  rol: 'traveler',
  fecha_registro: '2024-01-01T00:00:00Z',
};

beforeEach(() => {
  mockFetch.mockClear();
});

// ─── login ────────────────────────────────────────────────────────────────────

describe('authService.login', () => {
  it('returns token response on successful login', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTokenResponse,
    });

    const result = await authService.login('test@example.com', 'password123');

    expect(result).toEqual(mockTokenResponse);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/auth/login'),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
      })
    );
  });

  it('includes totp_code in request body when provided', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTokenResponse,
    });

    await authService.login('test@example.com', 'password123', '123456');

    expect(mockFetch).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        body: JSON.stringify({ email: 'test@example.com', password: 'password123', totp_code: '123456' }),
      })
    );
  });

  it('throws with string detail on 401 error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ detail: 'Credenciales inválidas' }),
    });

    await expect(authService.login('test@example.com', 'wrong')).rejects.toThrow('Credenciales inválidas');
  });

  it('throws with joined message on 422 validation error with array detail', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 422,
      json: async () => ({
        detail: [{ msg: 'String should have at least 8 characters', loc: ['body', 'password'] }],
      }),
    });

    await expect(authService.login('test@example.com', 'short')).rejects.toThrow(
      'String should have at least 8 characters'
    );
  });

  it('joins multiple validation messages with comma', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 422,
      json: async () => ({
        detail: [
          { msg: 'Field required', loc: ['body', 'email'] },
          { msg: 'String should have at least 8 characters', loc: ['body', 'password'] },
        ],
      }),
    });

    await expect(authService.login('', '')).rejects.toThrow(
      'Field required, String should have at least 8 characters'
    );
  });

  it('throws fallback message when json parsing fails', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => { throw new Error('not json'); },
    });

    await expect(authService.login('test@example.com', 'pass')).rejects.toThrow('HTTP 500');
  });
});

// ─── register ─────────────────────────────────────────────────────────────────

describe('authService.register', () => {
  it('returns user response on successful registration', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUserResponse,
    });

    const result = await authService.register({
      email: 'test@example.com',
      username: 'testuser',
      nombre: 'Test User',
      password: 'password123',
    });

    expect(result).toEqual(mockUserResponse);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/auth/register'),
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('throws on 409 duplicate email', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: async () => ({ detail: 'Email ya registrado' }),
    });

    await expect(
      authService.register({ email: 'dup@example.com', username: 'dup', nombre: 'Dup', password: 'pass1234' })
    ).rejects.toThrow('Email ya registrado');
  });

  it('passes optional fields in request body', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUserResponse,
    });

    await authService.register({
      email: 'test@example.com',
      username: 'testuser',
      nombre: 'Test User',
      password: 'password123',
      telefono: '+57300123',
      pais: 'co',
      idioma: 'es',
      moneda_preferida: 'COP',
    });

    const body = JSON.parse((mockFetch.mock.calls[0] as [string, RequestInit])[1].body as string);
    expect(body.telefono).toBe('+57300123');
    expect(body.pais).toBe('co');
    expect(body.moneda_preferida).toBe('COP');
  });
});

// ─── getCurrentUser ───────────────────────────────────────────────────────────

describe('authService.getCurrentUser', () => {
  it('returns user response with correct Authorization header', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUserResponse,
    });

    const result = await authService.getCurrentUser('my_access_token');

    expect(result).toEqual(mockUserResponse);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/auth/me'),
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: 'Bearer my_access_token',
        }),
      })
    );
  });

  it('throws on 401 invalid token', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ detail: 'Token inválido' }),
    });

    await expect(authService.getCurrentUser('bad_token')).rejects.toThrow('Token inválido');
  });
});
