import { apiRequest, AuthUser, onSessionExpired, restoreAuthToken, setAuthToken } from '@/src/lib/api/auth-api';
import React, { createContext, PropsWithChildren, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
};
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const revision = useRef(0);
  const refresh = useCallback(async () => {
    const current = revision.current;
    try {
      const result = await apiRequest<{ user: AuthUser }>('/api/auth/me');
      if (current === revision.current) setUser(result.user);
    } catch { if (current === revision.current) setUser(null); }
  }, []);
  useEffect(() => {
    const unsubscribe = onSessionExpired(() => { revision.current++; setUser(null); });
    if (restoreAuthToken()) void refresh().finally(() => setLoading(false));
    else setLoading(false);
    return unsubscribe;
  }, [refresh]);
  useEffect(() => {
    if (!user) return;
    const subscription = AppState.addEventListener('change', (state) => { if (state === 'active') void refresh(); });
    const timer = setInterval(() => { void refresh(); }, 60_000);
    return () => { subscription.remove(); clearInterval(timer); };
  }, [user, refresh]);
  async function login(email: string, password: string) {
    const result = await apiRequest<{ token: string; user: AuthUser }>('/api/auth/login', {
      method: 'POST', body: JSON.stringify({ email, password }),
    });
    setAuthToken(result.token);
    revision.current++;
    setUser(result.user);
    return result.user;
  }
  async function logout() {
    await apiRequest('/api/auth/logout', { method: 'POST' });
    revision.current++;
    setAuthToken(null);
    setUser(null);
  }
  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth requires AuthProvider');
  return context;
}
