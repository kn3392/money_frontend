import { useCallback, useEffect, useMemo, useState } from 'react';
import api, { getStoredToken, setStoredToken } from '../services/api';
import { AuthContext } from './authContext';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => getStoredToken());
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    const res = await api.get('/api/auth/profile');
    setUser(res.data.user);
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      const t = getStoredToken();
      if (!t) {
        setLoading(false);
        return;
      }
      try {
        await loadProfile();
      } catch {
        setStoredToken(null);
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    void bootstrap();
  }, [loadProfile]);

  useEffect(() => {
    const onLogout = () => {
      setToken(null);
      setUser(null);
    };
    window.addEventListener('smartkhata:auth-logout', onLogout);
    return () => window.removeEventListener('smartkhata:auth-logout', onLogout);
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password });
    setStoredToken(res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const res = await api.post('/api/auth/register', { name, email, password });
    setStoredToken(res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data;
  }, []);

  const logout = useCallback(async () => {
    const t = getStoredToken();
    if (t) {
      try {
        await api.post('/api/auth/logout');
      } catch {
        /* ignore network errors on logout */
      }
    }
    setStoredToken(null);
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    await loadProfile();
  }, [loadProfile]);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, token, loading, login, register, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
