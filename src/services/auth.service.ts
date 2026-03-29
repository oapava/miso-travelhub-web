// ─── Request types (mirror backend schemas) ───────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
  totp_code?: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  nombre: string;
  password: string;
  telefono?: string;
  pais?: string;
  idioma?: string;
  moneda_preferida?: string;
}

// ─── Response types ────────────────────────────────────────────────────────────

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface UserResponse {
  id: string;
  email: string;
  username: string;
  nombre: string;
  telefono: string | null;
  pais: string | null;
  idioma: string;
  moneda_preferida: string;
  mfa_activo: boolean;
  rol: string;
  fecha_registro: string;
}

import { AUTH_BASE_URL as VITE_AUTH_BASE_URL } from '@/config/env';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const AUTH_BASE_URL = `${VITE_AUTH_BASE_URL}/api/v1/auth`;

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: `HTTP ${response.status}` }));
    const detail = error.detail;
    if (Array.isArray(detail)) {
      // FastAPI 422 validation errors: array of {msg, loc} objects
      const message = detail.map((e: { msg?: string }) => e.msg ?? 'Validation error').join(', ');
      throw new Error(message);
    }
    throw new Error(typeof detail === 'string' ? detail : `HTTP ${response.status}`);
  }
  return response.json() as Promise<T>;
}

// ─── Auth service ─────────────────────────────────────────────────────────────

export const authService = {
  async login(email: string, password: string, totp_code?: string): Promise<TokenResponse> {
    const body: LoginRequest = { email, password, ...(totp_code ? { totp_code } : {}) };
    const response = await fetch(`${AUTH_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return handleResponse<TokenResponse>(response);
  },

  async register(data: RegisterRequest): Promise<UserResponse> {
    const response = await fetch(`${AUTH_BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<UserResponse>(response);
  },

  async getCurrentUser(accessToken: string): Promise<UserResponse> {
    const response = await fetch(`${AUTH_BASE_URL}/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return handleResponse<UserResponse>(response);
  },
};
