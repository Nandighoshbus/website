"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { scalableAuth } from '@/lib/scalableAuth';

interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: 'customer' | 'agent' | 'admin' | 'super_admin';
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

interface LoginData {
  email: string;
  password: string;
  remember_me?: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  phone: string;
  terms_accepted: boolean;
}

interface AuthContextType {
  // State
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  
  // Authentication methods
  login: (data: LoginData) => Promise<{ success: boolean; message: string; requiresVerification?: boolean }>;
  register: (data: RegisterData) => Promise<{ success: boolean; message: string; requiresVerification?: boolean }>;
  logout: () => Promise<void>;
  
  // Profile methods
  getProfile: () => Promise<AuthUser>;
  updateProfile: (updates: Partial<AuthUser>) => Promise<AuthUser>;
  
  // Password methods
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  
  // Email verification
  verifyEmail: (token: string) => Promise<void>;
  resendVerification: () => Promise<void>;
  
  // Utility methods
  hasRole: (...roles: string[]) => boolean;
  isVerified: () => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function ScalableAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        
        // Check if user is already authenticated
        const currentUser = scalableAuth.getCurrentUser();
        
        if (currentUser && scalableAuth.isAuthenticated()) {
          setUser(currentUser);
          
          // Optionally refresh user data from server
          try {
            const freshUserData = await scalableAuth.getProfile();
            setUser(freshUserData);
          } catch (error) {
            console.error('Failed to refresh user data:', error);
            // Keep the cached user data if refresh fails
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (data: LoginData) => {
    try {
      setLoading(true);
      const response = await scalableAuth.login(data);
      
      if (response.success && response.data) {
        setUser(response.data.user);
        return {
          success: true,
          message: response.message,
          requiresVerification: response.data.requires_verification
        };
      } else {
        return {
          success: false,
          message: response.message || 'Login failed'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Login failed'
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setLoading(true);
      const response = await scalableAuth.register(data);
      
      if (response.success && response.data) {
        setUser(response.data.user);
        return {
          success: true,
          message: response.message,
          requiresVerification: response.data.requires_verification
        };
      } else {
        return {
          success: false,
          message: response.message || 'Registration failed'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Registration failed'
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await scalableAuth.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Clear user state even if logout fails
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const getProfile = async (): Promise<AuthUser> => {
    try {
      const profile = await scalableAuth.getProfile();
      setUser(profile);
      return profile;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<AuthUser>): Promise<AuthUser> => {
    try {
      const updatedProfile = await scalableAuth.updateProfile(updates);
      setUser(updatedProfile);
      return updatedProfile;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      await scalableAuth.changePassword(currentPassword, newPassword);
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  };

  const forgotPassword = async (email: string): Promise<void> => {
    try {
      await scalableAuth.forgotPassword(email);
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  };

  const verifyEmail = async (token: string): Promise<void> => {
    try {
      await scalableAuth.verifyEmail(token);
      
      // Update user verification status
      if (user) {
        setUser({ ...user, is_verified: true });
      }
    } catch (error) {
      console.error('Verify email error:', error);
      throw error;
    }
  };

  const resendVerification = async (): Promise<void> => {
    try {
      await scalableAuth.resendVerification();
    } catch (error) {
      console.error('Resend verification error:', error);
      throw error;
    }
  };

  const hasRole = (...roles: string[]): boolean => {
    return scalableAuth.hasRole(...roles);
  };

  const isVerified = (): boolean => {
    return scalableAuth.isVerified();
  };

  const refreshUser = async (): Promise<void> => {
    try {
      if (scalableAuth.isAuthenticated()) {
        const freshUserData = await scalableAuth.getProfile();
        setUser(freshUserData);
      }
    } catch (error) {
      console.error('Refresh user error:', error);
      // Don't throw error for refresh failures
    }
  };

  const value: AuthContextType = {
    // State
    user,
    loading,
    isAuthenticated: scalableAuth.isAuthenticated(),
    
    // Methods
    login,
    register,
    logout,
    getProfile,
    updateProfile,
    changePassword,
    forgotPassword,
    verifyEmail,
    resendVerification,
    hasRole,
    isVerified,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useScalableAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useScalableAuth must be used within a ScalableAuthProvider');
  }
  return context;
}

// Keep backward compatibility with existing useAuth
export const useAuth = useScalableAuth;
