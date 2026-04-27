import { createContext, useContext, useState, useEffect } from 'react';
import type { TokenResponse, UserResponse } from '@/services/auth.service';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthUser {
  id: string;
  email: string;
  username: string;
  nombre: string;
  rol: string;
  telefono: string | null;
  pais: string | null;
  idioma: string;
  moneda_preferida: string;
}

interface AuthContextValue {
  isAuthenticated: boolean;
  user: AuthUser | null;
  accessToken: string | null;
  login: (token: TokenResponse, user: UserResponse) => void;
  logout: () => void;
}

// ─── Storage ──────────────────────────────────────────────────────────────────

const SESSION_KEY = 'travelhub_session';

interface StoredSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: AuthUser;
}

function saveSession(token: TokenResponse, user: UserResponse): StoredSession {
  const session: StoredSession = {
    accessToken: token.access_token,
    refreshToken: token.refresh_token,
    expiresAt: Date.now() + token.expires_in * 1000,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      nombre: user.nombre,
      rol: user.rol,
      telefono: user.telefono ?? null,
      pais: user.pais ?? null,
      idioma: user.idioma,
      moneda_preferida: user.moneda_preferida,
    },
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

function loadSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session: StoredSession = JSON.parse(raw);
    if (Date.now() >= session.expiresAt) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize synchronously from localStorage so ProtectedRoute sees auth state on first render
  const [user, setUser] = useState<AuthUser | null>(() => loadSession()?.user ?? null);
  const [accessToken, setAccessToken] = useState<string | null>(() => loadSession()?.accessToken ?? null);

  const login = (token: TokenResponse, userResponse: UserResponse) => {
    const session = saveSession(token, userResponse);
    setUser(session.user);
    setAccessToken(session.accessToken);
  };

  const logout = () => {
    clearSession();
    setUser(null);
    setAccessToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: user !== null,
        user,
        accessToken,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
