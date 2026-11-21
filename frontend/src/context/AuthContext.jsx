import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize session by verifying HttpOnly cookie with /api/auth/me
  const initSession = useCallback(async () => {
    try {
      const res = await api.auth.me();
      if (res && res.user) {
        setUser(res.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      // 401 or network failure means no active session
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initSession();
  }, [initSession]);

  const login = async (email, password) => {
    const res = await api.auth.login({ email, password });
    if (res && res.user) {
      setUser(res.user);
      return res.user;
    }
    throw new Error(res?.message || 'Login failed');
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch (err) {
      console.warn('Backend logout call failed, clearing local session anyway:', err.message);
    } finally {
      setUser(null);
    }
  };

  const isAdmin = user?.role === 'admin';
  const isOrganizer = user?.role === 'organizer';
  const isAuthenticated = Boolean(user);

  const value = {
    user,
    loading,
    isAuthenticated,
    isAdmin,
    isOrganizer,
    login,
    logout,
    refreshUser: initSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
