import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('jobtrack_token') || null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount (FR-A12)
  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = localStorage.getItem('jobtrack_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
          setToken(storedToken);
        } catch (err) {
          console.error('Session restore failed:', err);
          localStorage.removeItem('jobtrack_token');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    restoreSession();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token: newToken, user: userData } = res.data;
      localStorage.setItem('jobtrack_token', newToken);
      setToken(newToken);
      setUser(userData);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please check your credentials.';
      return { success: false, message };
    }
  };

  const register = async (name, email, password, confirmPassword) => {
    try {
      const res = await api.post('/auth/register', { name, email, password, confirmPassword });
      const { token: newToken, user: userData } = res.data;
      localStorage.setItem('jobtrack_token', newToken);
      setToken(newToken);
      setUser(userData);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('jobtrack_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
