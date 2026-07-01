'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '@/lib/api';
import { getFromStorage, setInStorage, removeFromStorage } from '@/lib/functions';

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [admin, setAdmin]               = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading]       = useState(true);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const user  = getFromStorage('adminUser');
    const token = getFromStorage('accessToken');
    if (user && token) {
      setAdmin(user);
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  /**
   * Login with email/phone + password.
   * Stores tokens and user in localStorage, returns the user object.
   */
  const login = useCallback(async (identifier, password, isPhone = false) => {
    const payload = isPhone
      ? { phone: identifier, password }
      : { email: identifier, password };

    const res = await authAPI.login(payload);
    const { user, token, refreshToken } = res.data.data;

    localStorage.setItem('accessToken', token);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    setInStorage('adminUser', user);

    setAdmin(user);
    setIsAuthenticated(true);
    return user;
  }, []);

  /**
   * Login with OTP.
   * isEmail = true means identifier is an email address.
   */
  const loginWithOtp = useCallback(async (identifier, otp, isEmail = true) => {
    const payload = isEmail
      ? { email: identifier, otp }
      : { phone: identifier, otp };

    const res = await authAPI.verifyLoginOtp(payload);
    const { user, token, refreshToken } = res.data.data;

    localStorage.setItem('accessToken', token);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    setInStorage('adminUser', user);

    setAdmin(user);
    setIsAuthenticated(true);
    return user;
  }, []);

  const logout = useCallback(() => {
    removeFromStorage('accessToken');
    removeFromStorage('refreshToken');
    removeFromStorage('adminUser');
    setAdmin(null);
    setIsAuthenticated(false);
  }, []);

  return (
    <AdminContext.Provider value={{ admin, isAuthenticated, isLoading, login, loginWithOtp, logout }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider');
  return ctx;
}
