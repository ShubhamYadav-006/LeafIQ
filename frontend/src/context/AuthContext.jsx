import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('leafiq_token') || null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await authApi.getProfile();
          if (res.success && res.data?.user) {
            setUser(res.data.user);
          } else {
            logout();
          }
        } catch (err) {
          console.warn('Auth token validation failed:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    if (res.success && res.data?.token) {
      localStorage.setItem('leafiq_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      setAuthModalOpen(false);
      return res.data;
    }
  };

  const register = async (email, password, full_name) => {
    const res = await authApi.register({ email, password, full_name });
    if (res.success && res.data?.token) {
      localStorage.setItem('leafiq_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      setAuthModalOpen(false);
      return res.data;
    }
  };

  const logout = () => {
    localStorage.removeItem('leafiq_token');
    setToken(null);
    setUser(null);
  };

  const openAuthModal = (mode = 'login') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        authModalOpen,
        authMode,
        login,
        register,
        logout,
        openAuthModal,
        closeAuthModal,
        setAuthMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
