import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

// Types for authentication context
interface User {
  id: string;
  email: string;
  role: 'admin';
  name?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (role: string | string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user: supabaseUser } } = await supabase.auth.getUser();
        
        if (supabaseUser) {
          // Check if user has admin role
          const userRole = supabaseUser.user_metadata?.role || (supabaseUser as any)?.raw_user_meta_data?.role;
          
          if (userRole === 'admin') {
            setUser({
              id: supabaseUser.id,
              email: supabaseUser.email || '',
              role: 'admin',
              name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || 'Admin User'
            });
          } else {
            // User exists but not admin, sign them out
            await supabase.auth.signOut();
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error || !data.user) {
        throw new Error(error?.message || 'Login failed');
      }

      // Check if user has admin role
      const userRole = data.user.user_metadata?.role || (data.user as any)?.raw_user_meta_data?.role;
      
      if (userRole === 'admin') {
        const userData: User = {
          id: data.user.id,
          email: data.user.email || '',
          role: 'admin',
          name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || 'Admin User'
        };
        setUser(userData);
      } else {
        await supabase.auth.signOut();
        throw new Error('Access denied. This account does not have admin privileges.');
      }
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    setUser(null);
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Role check function
  const hasRole = useCallback((role: string | string[]): boolean => {
    if (!user) return false;
    
    const roles = Array.isArray(role) ? role : [role];
    return roles.includes(user.role);
  }, [user]);

  const contextValue: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
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
  requiredRole?: 'admin' | string[]
) => {
  return function ProtectedComponent(props: P) {
    const { user, isLoading, isAuthenticated, hasRole } = useAdminAuth();

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

    return <WrappedComponent {...props} />;
  };
};

export default AdminAuthProvider;
