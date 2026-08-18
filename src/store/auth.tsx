import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { api, onUnauthorized, tokens } from '@/api/client';
import type { AuthResult, AuthUser } from '@/api/types';

interface AuthContextValue {
  user: AuthUser | null;
  status: 'loading' | 'authenticated' | 'anonymous';
  login: (email: string, password: string) => Promise<void>;
  register: (input: {
    email: string;
    password: string;
    name: string;
    monthlyIncome?: number;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthContextValue['status']>('loading');

  const loadSession = useCallback(async () => {
    if (!tokens.access()) {
      setStatus('anonymous');
      return;
    }
    try {
      const me = await api.get<AuthUser>('/auth/me');
      setUser(me);
      setStatus('authenticated');
    } catch {
      tokens.clear();
      setUser(null);
      setStatus('anonymous');
    }
  }, []);

  useEffect(() => {
    void loadSession();
    // A refresh failure anywhere in the app drops the session here, once.
    return onUnauthorized(() => {
      setUser(null);
      setStatus('anonymous');
    });
  }, [loadSession]);

  const login = useCallback(async (email: string, password: string) => {
    const result = await api.post<AuthResult>('/auth/login', { email, password });
    tokens.set(result.accessToken, result.refreshToken);
    setUser(result.user);
    setStatus('authenticated');
  }, []);

  const register = useCallback(
    async (input: { email: string; password: string; name: string; monthlyIncome?: number }) => {
      const result = await api.post<AuthResult>('/auth/register', input);
      tokens.set(result.accessToken, result.refreshToken);
      setUser(result.user);
      setStatus('authenticated');
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout', { refreshToken: tokens.refresh() });
    } catch {
      // Logging out locally matters more than the server acknowledging it.
    }
    tokens.clear();
    setUser(null);
    setStatus('anonymous');
  }, []);

  const value = useMemo(
    () => ({ user, status, login, register, logout, refreshUser: loadSession }),
    [user, status, login, register, logout, loadSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
