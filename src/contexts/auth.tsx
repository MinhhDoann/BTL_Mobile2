import { apiRequest, AuthUser, onSessionExpired, restoreAuthToken, setAuthToken } from '@/src/lib/api/auth-api';
import React, { createContext, PropsWithChildren, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  register: (data: any) => Promise<AuthUser>;
  upgrade: (data: any) => Promise<AuthUser>;
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
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network errors during logout
    } finally {
      revision.current++;
      setAuthToken(null);
      setUser(null);
    }
  }
  async function register(data: any) {
    const { registerUser } = await import('@/src/lib/api/auth-api');
    const result = await registerUser(data);
    setAuthToken(result.token);
    revision.current++;
    setUser(result.user);
    return result.user;
  }
  async function upgrade(data: any) {
    const { upgradeToArtist } = await import('@/src/lib/api/auth-api');
    const updatedUser = await upgradeToArtist(data);
    setUser(updatedUser);
    return updatedUser;
  }
  return <AuthContext.Provider value={{ user, loading, login, logout, register, upgrade }}>{children}</AuthContext.Provider>;
}
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      loading: false,
      login: async () => ({ user_id: 0, username: '', email: '', role: 'user' }),
      logout: async () => {},
      register: async () => ({ user_id: 0, username: '', email: '', role: 'user' }),
      upgrade: async () => ({ user_id: 0, username: '', email: '', role: 'user' }),
    };
  }
  return context;
}
