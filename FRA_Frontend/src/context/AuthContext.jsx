import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Sync token into localStorage and Axios default headers
  const setAuthSession = (authToken, authUser) => {
    if (authToken) {
      localStorage.setItem('token', authToken);
      setToken(authToken);
    } else {
      localStorage.removeItem('token');
      setToken(null);
    }

    if (authUser) {
      localStorage.setItem('user', JSON.stringify(authUser));
      setUser(authUser);
    } else {
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  // Check current session validity on initial load
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('user', JSON.stringify(res.user));
          }
        } catch {
          // Token is invalid or expired
          setAuthSession(null, null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Login handler
  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.success && res.token) {
        setAuthSession(res.token, res.user);
        return { success: true, user: res.user };
      }
      throw new Error(res.message || 'Login failed');
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Register handler
  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      if (res.success && res.token) {
        setAuthSession(res.token, res.user);
        return { success: true, user: res.user };
      }
      throw new Error(res.message || 'Registration failed');
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Logout handler
  const logout = useCallback(() => {
    setAuthSession(null, null);
  }, []);

  // Update profile handler (name, avatar, bio)
  const updateProfile = async (profileData) => {
    try {
      const res = await api.put('/auth/profile', profileData);
      if (res.success && res.user) {
        setUser(res.user);
        localStorage.setItem('user', JSON.stringify(res.user));
        return { success: true, user: res.user };
      }
      throw new Error(res.message || 'Failed to update profile');
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Update cooking preferences handler
  const updatePreferences = async (preferencesData) => {
    try {
      const res = await api.put('/auth/preferences', preferencesData);
      if (res.success && res.user) {
        setUser(res.user);
        localStorage.setItem('user', JSON.stringify(res.user));
        return { success: true, user: res.user };
      }
      throw new Error(res.message || 'Failed to update preferences');
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Change password handler
  const changePassword = async (passwordData) => {
    try {
      const res = await api.put('/auth/password', passwordData);
      if (res.success) {
        return { success: true, message: res.message };
      }
      throw new Error(res.message || 'Failed to change password');
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Google OAuth Login handler
  const loginWithGoogle = useCallback(async (googlePayload) => {
    try {
      const res = await api.post('/auth/google', googlePayload);
      if (res.success && res.token) {
        setAuthSession(res.token, res.user);
        return { success: true, user: res.user };
      }
      throw new Error(res.message || 'Google sign-in failed');
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  // Forgot password request (sends 6-digit email OTP)
  const forgotPassword = async (email) => {
    try {
      const res = await api.post('/auth/forgot-password', { email });
      return {
        success: true,
        message: res.message,
        devOtp: res.devOtp,
        retryAfter: res.retryAfter,
      };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Verify 6-digit OTP code and retrieve resetToken
  const verifyOtp = async (email, otp) => {
    try {
      const res = await api.post('/auth/verify-otp', { email, otp });
      return {
        success: true,
        message: res.message,
        resetToken: res.resetToken,
      };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Reset password using resetToken from OTP verification
  const resetPasswordWithOtp = async (resetData) => {
    try {
      const res = await api.post('/auth/reset-password', resetData);
      return { success: true, message: res.message };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Legacy URL token reset password handler
  const resetPassword = async (token, passwordData) => {
    try {
      const res = await api.post(`/auth/reset-password/${token}`, passwordData);
      if (res.success && res.token) {
        setAuthSession(res.token, res.user);
        return { success: true, message: res.message, user: res.user };
      }
      return { success: true, message: res.message };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Fast login helpers for User and Admin
  const loginAsDemoUser = async () => {
    return await login('chef@recipehaven.com', 'Password@123');
  };

  const loginAsDemoAdmin = async () => {
    return await login('admin@recipehaven.com', 'Password@123');
  };

  // Switch between demo accounts seamlessly
  const switchRole = async () => {
    if (user?.role === 'admin') {
      return await loginAsDemoUser();
    } else {
      return await loginAsDemoAdmin();
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(user && token),
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    updateProfile,
    updatePreferences,
    changePassword,
    loginWithGoogle,
    forgotPassword,
    verifyOtp,
    resetPasswordWithOtp,
    resetPassword,
    loginAsDemoUser,
    loginAsDemoAdmin,
    switchRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;

}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
