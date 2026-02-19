import { useState, useEffect, useCallback } from 'react';
import { User, AuthState, getAuthState, login as authLogin, logout as authLogout, isAuthenticated, hasRole, UserRole } from '../lib/auth';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>(getAuthState());
  const [loading, setLoading] = useState(false);

  // Update auth state when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setAuthState(getAuthState());
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (response.ok && data.user) {
        setAuthState({ user: data.user, token: 'api token' }); // Token handling for later
        return { success: true };
      }
      return { success: false, error: data.error || 'Invalid credentials' };
    } catch (error) {
      return { success: false, error: 'Login failed' };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authLogout();
    setAuthState({ user: null, token: null });
  }, []);

  const checkRole = useCallback((role: UserRole) => {
    return hasRole(role);
  }, []);

  return {
    user: authState.user,
    token: authState.token,
    isAuthenticated: isAuthenticated(),
    loading,
    login,
    logout,
    checkRole,
  };
};
