import React, { createContext, useContext, useState, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [error, setError] = useState('');

  const login = useCallback(async (username, password) => {
    setError('');
    try {
      const { data } = await authAPI.login({ username, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({ username: data.username, email: data.email }));
      setUser({ username: data.username, email: data.email });
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
      return false;
    }
  }, []);

  const register = useCallback(async (username, email, password) => {
    setError('');
    try {
      const { data } = await authAPI.register({ username, email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({ username: data.username, email: data.email }));
      setUser({ username: data.username, email: data.email });
      return true;
    } catch (err) {
      const errors = err.response?.data?.errors;
      const message = errors ? Object.values(errors).join(', ') : (err.response?.data?.message || 'Registration failed.');
      setError(message);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, error, setError }}>
      {children}
    </AuthContext.Provider>
  );
};
