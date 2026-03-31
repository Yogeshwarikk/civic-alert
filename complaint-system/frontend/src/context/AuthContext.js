/**
 * AuthContext.js
 * Provides global authentication state and helper functions.
 * Wraps the entire app so any component can access auth info.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

// Create the context
const AuthContext = createContext(null);

// Custom hook for easy access: const { user, login, logout } = useAuth();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // User info (username, email, id, is_staff)
  const [user, setUser]       = useState(null);
  // JWT tokens
  const [tokens, setTokens]   = useState(null);
  // Loading state while restoring session from localStorage
  const [loading, setLoading] = useState(true);

  /**
   * Restore session on page refresh.
   * Reads tokens & user from localStorage when the app first loads.
   */
  useEffect(() => {
    const savedTokens = localStorage.getItem('tokens');
    const savedUser   = localStorage.getItem('user');

    if (savedTokens && savedUser) {
      const parsedTokens = JSON.parse(savedTokens);
      const parsedUser   = JSON.parse(savedUser);
      setTokens(parsedTokens);
      setUser(parsedUser);
      // Attach token to all future axios requests
      api.defaults.headers.common['Authorization'] = `Bearer ${parsedTokens.access}`;
    }
    setLoading(false);
  }, []);

  /**
   * login() - Store tokens and user info after successful authentication.
   * Called after register or login API success.
   */
  const login = useCallback((userData, tokenData) => {
    setUser(userData);
    setTokens(tokenData);
    // Persist to localStorage for page refresh survival
    localStorage.setItem('tokens', JSON.stringify(tokenData));
    localStorage.setItem('user',   JSON.stringify(userData));
    // Set default Authorization header for all future requests
    api.defaults.headers.common['Authorization'] = `Bearer ${tokenData.access}`;
  }, []);

  /**
   * logout() - Clear all auth state.
   */
  const logout = useCallback(async () => {
    try {
      // Attempt server-side token blacklist (best effort)
      if (tokens?.refresh) {
        await api.post('/auth/logout/', { refresh: tokens.refresh });
      }
    } catch {
      // Ignore errors — local logout still happens
    } finally {
      setUser(null);
      setTokens(null);
      localStorage.removeItem('tokens');
      localStorage.removeItem('user');
      delete api.defaults.headers.common['Authorization'];
    }
  }, [tokens]);

  // Value exposed to all child components
  const value = {
    user,
    tokens,
    loading,
    login,
    logout,
    isAdmin: user?.is_staff || false,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {/* Don't render children until we've restored the session */}
      {!loading && children}
    </AuthContext.Provider>
  );
};
