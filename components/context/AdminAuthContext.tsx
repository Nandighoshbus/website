import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';

// Types for authentication context
interface User {
  id: string;
  email: string;
  role: 'admin' | 'super_admin' | 'user';
  name?: string;
  permissions: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string | string[]) => boolean;
}

// JWT token interface
interface DecodedToken {
  id: string;
  email: string;
  role: string;
  permissions: string[];
  name?: string;
  exp: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Decode and validate token
  const decodeAndValidateToken = useCallback((token: string): User | null => {
    try {
      const decoded: DecodedToken = jwtDecode(token);
      
      // Check if token is expired
      if (decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem('adminToken');
        return null;
      }

      // Validate admin role
      if (!['admin', 'super_admin'].includes(decoded.role)) {
        localStorage.removeItem('adminToken');
        return null;
      }

      return {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role as 'admin' | 'super_admin',
        name: decoded.name,
        permissions: decoded.permissions || []
      };
    } catch (error) {
      console.error('Token decode error:', error);
      localStorage.removeItem('adminToken');
      return null;
    }
  }, []);

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      
      const token = localStorage.getItem('adminToken');
      if (token) {
        const userData = decodeAndValidateToken(token);
        setUser(userData);
        
        // If token is valid but close to expiry, refresh it
        if (userData) {
          const decoded: DecodedToken = jwtDecode(token);
          const timeToExpiry = decoded.exp * 1000 - Date.now();
          
          // Refresh if less than 5 minutes remaining
          if (timeToExpiry < 5 * 60 * 1000) {
            try {
              await refreshToken();
            } catch (error) {
              console.error('Auto refresh failed:', error);
              setUser(null);
              localStorage.removeItem('adminToken');
            }
          }
        }
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, [decodeAndValidateToken]);

  // Login function
  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
      
      const response = await fetch(`${baseURL}/api/v1/auth/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const { token, user: userData } = await response.json();
      
      localStorage.setItem('adminToken', token);
      setUser(userData);
    } catch (error) {
      setUser(null);
      localStorage.removeItem('adminToken');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('adminToken');
    const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
    
    // Optional: Call logout endpoint to invalidate token server-side
    fetch(`${baseURL}/api/v1/auth/admin/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
      },
    }).catch(console.error);
  }, []);

  // Refresh token function
  const refreshToken = useCallback(async () => {
    try {
      const currentToken = localStorage.getItem('adminToken');
      if (!currentToken) {
        throw new Error('No token available');
      }

      const response = await fetch('/api/v1/auth/admin/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const { token, user: userData } = await response.json();
      
      localStorage.setItem('adminToken', token);
      setUser(userData);
      
      return token;
    } catch (error) {
      logout();
      throw error;
    }
  }, [logout]);

  // Permission check function
  const hasPermission = useCallback((permission: string): boolean => {
    if (!user) return false;
    
    // Super admin has all permissions
    if (user.role === 'super_admin') return true;
    
    return user.permissions.includes(permission);
  }, [user]);

  // Role check function
  const hasRole = useCallback((role: string | string[]): boolean => {
    if (!user) return false;
    
    const roles = Array.isArray(role) ? role : [role];
    return roles.includes(user.role);
  }, [user]);

  // Auto-refresh token setup
  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem('adminToken');
    if (!token) return;

    try {
      const decoded: DecodedToken = jwtDecode(token);
      const timeToExpiry = decoded.exp * 1000 - Date.now();
      
      // Set up auto-refresh 5 minutes before expiry
      const refreshTime = Math.max(timeToExpiry - 5 * 60 * 1000, 60 * 1000);
      
      const refreshTimeout = setTimeout(() => {
        refreshToken().catch(console.error);
      }, refreshTime);

      return () => clearTimeout(refreshTimeout);
    } catch (error) {
      console.error('Auto-refresh setup failed:', error);
    }
  }, [user, refreshToken]);

  const contextValue: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshToken,
    hasPermission,
    hasRole,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using auth context
export const useAdminAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

// HOC for protecting admin routes
export const withAdminAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredRole?: 'admin' | 'super_admin' | string[],
  requiredPermissions?: string[]
) => {
  return function ProtectedComponent(props: P) {
    const { user, isLoading, isAuthenticated, hasRole, hasPermission } = useAdminAuth();

    // Show loading while checking authentication
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    // Redirect if not authenticated
    if (!isAuthenticated || !user) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-6">Please log in to access the admin dashboard.</p>
            <button
              onClick={() => window.location.href = '/admin/login'}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Go to Login
            </button>
          </div>
        </div>
      );
    }

    // Check role requirements
    if (requiredRole && !hasRole(requiredRole)) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Insufficient Permissions</h2>
            <p className="text-gray-600 mb-6">You don't have the required role to access this resource.</p>
            <p className="text-sm text-gray-500">Required role: {Array.isArray(requiredRole) ? requiredRole.join(', ') : requiredRole}</p>
          </div>
        </div>
      );
    }

    // Check permission requirements
    if (requiredPermissions && !requiredPermissions.every(permission => hasPermission(permission))) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Insufficient Permissions</h2>
            <p className="text-gray-600 mb-6">You don't have the required permissions to access this resource.</p>
            <p className="text-sm text-gray-500">Required permissions: {requiredPermissions.join(', ')}</p>
          </div>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
};

export default AdminAuthProvider;
