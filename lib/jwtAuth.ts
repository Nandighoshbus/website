// Pure JWT Authentication System for Admin and Agent
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'super_admin' | 'agent' | 'customer' | 'passenger';
  full_name?: string;
  phone?: string;
  is_active: boolean;
  is_verified?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_at: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  error?: string;
  retryAfter?: number;
  data?: {
    user: User;
    access_token: string;
    refresh_token: string;
    expires_at: string;
  };
}

class JWTAuthService {
  private readonly API_BASE_URL: string;

  constructor() {
    this.API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
  }

  // Admin Login
  async adminLogin(email: string, password: string): Promise<AuthResponse> {
    console.log('Admin login attempt:', { email, apiUrl: `${this.API_BASE_URL}/api/v1/auth/admin/login` });
    
    const response = await fetch(`${this.API_BASE_URL}/api/v1/auth/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });

    const result = await response.json();
    
    console.log('Admin login response:', { 
      status: response.status, 
      ok: response.ok, 
      result,
      errorMessage: result.message,
      errorDetails: result.error
    });
    
    if (response.ok && result.success) {
      this.storeTokens('admin', result.data);
    }
    
    return result;
  }

  // Agent Login
  async agentLogin(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${this.API_BASE_URL}/api/v1/auth/agent/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });

    const result = await response.json();
    
    if (response.ok && result.success) {
      this.storeTokens('agent', result.data);
    }
    
    return result;
  }

  // Customer Login
  async customerLogin(email: string, password: string): Promise<AuthResponse> {
    console.log('Customer login attempt:', { email, apiUrl: `${this.API_BASE_URL}/api/v1/auth/login` });
    
    const response = await fetch(`${this.API_BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });

    const result = await response.json();
    
    console.log('Customer login response:', { 
      status: response.status, 
      ok: response.ok, 
      result
    });
    
    if (response.ok && result.success) {
      this.storeTokens('customer', result.data);
    }
    
    return result;
  }

  // Customer Registration
  async customerRegister(email: string, password: string, full_name: string, phone: string): Promise<AuthResponse> {
    console.log('Customer registration attempt:', { email, full_name, phone });
    
    const response = await fetch(`${this.API_BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email, 
        password, 
        full_name, 
        phone,
        role: 'customer'
      })
    });

    const result = await response.json();
    
    console.log('Customer registration response:', { 
      status: response.status, 
      ok: response.ok, 
      result
    });
    
    // Log detailed error information for debugging
    if (!response.ok) {
      console.error('Registration failed with status:', response.status);
      console.error('Error details:', result);
      if (result.message) {
        console.error('Error message:', result.message);
      }
      if (result.error) {
        console.error('Error code:', result.error);
      }
    }
    
    if (response.ok && result.success) {
      this.storeTokens('customer', result.data);
    }
    
    return result;
  }

  // Store tokens in localStorage
  private storeTokens(userType: 'admin' | 'agent' | 'customer', data: any): void {
    const prefix = userType === 'admin' ? 'admin' : userType === 'agent' ? 'agent' : 'customer';
    localStorage.setItem(`${prefix}_token`, data.access_token);
    localStorage.setItem(`${prefix}_refresh_token`, data.refresh_token);
    localStorage.setItem(`${prefix}_user`, JSON.stringify(data.user));
    localStorage.setItem(`${prefix}_expires_at`, data.expires_at);
  }

  // Get stored token
  getToken(userType: 'admin' | 'agent' | 'customer'): string | null {
    const prefix = userType === 'admin' ? 'admin' : userType === 'agent' ? 'agent' : 'customer';
    return localStorage.getItem(`${prefix}_token`);
  }

  // Get stored user
  getUser(userType: 'admin' | 'agent' | 'customer'): User | null {
    const prefix = userType === 'admin' ? 'admin' : userType === 'agent' ? 'agent' : 'customer';
    const userData = localStorage.getItem(`${prefix}_user`);
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch {
        return null;
      }
    }
    return null;
  }

  // Check if user is authenticated (with automatic refresh attempt)
  async isAuthenticatedAsync(userType: 'admin' | 'agent' | 'customer'): Promise<boolean> {
    const token = this.getToken(userType);
    const user = this.getUser(userType);
    const expiresAt = this.getExpiresAt(userType);
    
    if (!token || !user) {
      return false;
    }
    
    // Check if token is expired and try to refresh
    if (expiresAt && new Date(expiresAt) <= new Date()) {
      console.log(`${userType} token expired, attempting refresh...`);
      const refreshed = await this.refreshToken(userType);
      
      if (!refreshed) {
        console.log(`Failed to refresh ${userType} token, logging out`);
        this.logout(userType);
        return false;
      }
      
      console.log(`${userType} token refreshed successfully`);
    }
    
    return true;
  }

  // Check if user is authenticated (synchronous - for backward compatibility)
  isAuthenticated(userType: 'admin' | 'agent' | 'customer'): boolean {
    const token = this.getToken(userType);
    const user = this.getUser(userType);
    
    if (!token || !user) {
      return false;
    }
    
    // For synchronous check, be more lenient with expiration
    // Let the async methods handle token refresh
    return true;
  }

  // Check if refresh token is available
  hasRefreshToken(userType: 'admin' | 'agent' | 'customer'): boolean {
    const prefix = userType === 'admin' ? 'admin' : userType === 'agent' ? 'agent' : 'customer';
    const refreshToken = localStorage.getItem(`${prefix}_refresh_token`);
    return !!refreshToken;
  }

  // Get token expiration time
  private getExpiresAt(userType: 'admin' | 'agent' | 'customer'): string | null {
    const prefix = userType === 'admin' ? 'admin' : userType === 'agent' ? 'agent' : 'customer';
    return localStorage.getItem(`${prefix}_expires_at`);
  }

  // Validate token with server
  async validateToken(userType: 'admin' | 'agent' | 'customer'): Promise<boolean> {
    const token = this.getToken(userType);
    
    if (!token) {
      return false;
    }

    try {
      // Try to make a simple authenticated request to validate the token
      const endpoint = userType === 'admin' ? '/admin/validate' : 
                     userType === 'agent' ? '/agent/validate' : 
                     '/user/validate';
      
      const response = await fetch(`${this.API_BASE_URL}/api/v1${endpoint}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401 || response.status === 403) {
        // Token is invalid or expired
        console.log(`${userType} token validation failed, logging out`);
        this.logout(userType);
        return false;
      }

      return response.ok;
    } catch (error) {
      console.error(`Error validating ${userType} token:`, error);
      // On network error, assume token is still valid to avoid unnecessary logouts
      return true;
    }
  }

  // Logout
  logout(userType: 'admin' | 'agent' | 'customer'): void {
    const prefix = userType === 'admin' ? 'admin' : userType === 'agent' ? 'agent' : 'customer';
    localStorage.removeItem(`${prefix}_token`);
    localStorage.removeItem(`${prefix}_refresh_token`);
    localStorage.removeItem(`${prefix}_user`);
    localStorage.removeItem(`${prefix}_expires_at`);
  }

  // Check if backend supports refresh tokens
  private refreshEndpointsChecked = new Set<string>();
  private backendSupportsRefresh = new Map<string, boolean>();

  // Refresh token with backend capability detection
  async refreshToken(userType: 'admin' | 'agent' | 'customer'): Promise<boolean> {
    const prefix = userType === 'admin' ? 'admin' : userType === 'agent' ? 'agent' : 'customer';
    const refreshToken = localStorage.getItem(`${prefix}_refresh_token`);
    
    if (!refreshToken) {
      console.log(`No refresh token found for ${userType}`);
      return false;
    }

    // Check if we already know this backend doesn't support refresh
    if (this.backendSupportsRefresh.get(userType) === false) {
      console.log(`Backend doesn't support refresh for ${userType}, skipping attempts`);
      return false;
    }

    // Try multiple possible refresh endpoints
    const possibleEndpoints = [
      `/auth/${userType}/refresh`,
      `/auth/refresh`,
      `/${userType}/refresh`,
      `/refresh`
    ];

    let foundAnyEndpoint = false;

    for (const endpoint of possibleEndpoints) {
      try {
        console.log(`Attempting to refresh ${userType} token via ${endpoint}...`);
        
        const response = await fetch(`${this.API_BASE_URL}/api/v1${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${refreshToken}`
          },
          body: JSON.stringify({ 
            refresh_token: refreshToken,
            user_type: userType 
          })
        });

        console.log(`Refresh attempt ${endpoint}: ${response.status}`);

        if (response.status !== 404) {
          foundAnyEndpoint = true;
        }

        if (response.ok) {
          const result = await response.json();
          console.log(`Refresh response for ${endpoint}:`, result);
          
          if (result.success && result.data) {
            console.log(`${userType} token refreshed successfully via ${endpoint}`);
            this.backendSupportsRefresh.set(userType, true);
            this.storeTokens(userType, result.data);
            return true;
          }
        } else if (response.status === 404) {
          console.log(`Endpoint ${endpoint} not found, trying next...`);
          continue;
        } else {
          console.log(`Refresh failed at ${endpoint}: ${response.status}`);
          const errorText = await response.text();
          console.log(`Error response:`, errorText);
          foundAnyEndpoint = true; // Endpoint exists but failed for other reasons
        }
      } catch (error) {
        console.error(`Error refreshing ${userType} token via ${endpoint}:`, error);
        continue;
      }
    }
    
    // If no endpoints were found, mark backend as not supporting refresh
    if (!foundAnyEndpoint) {
      console.log(`Backend doesn't support refresh tokens for ${userType} - all endpoints returned 404`);
      this.backendSupportsRefresh.set(userType, false);
    }
    
    console.log(`All refresh attempts failed for ${userType}`);
    return false;
  }

  // Make authenticated API request with automatic token refresh and fallback
  async authenticatedRequest<T>(
    userType: 'admin' | 'agent' | 'customer',
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    let token = this.getToken(userType);
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    console.log(`Making authenticated request to ${endpoint} for ${userType}`);

    const makeRequest = async (authToken: string) => {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
        ...((options.headers as Record<string, string>) || {})
      };

      return fetch(`${this.API_BASE_URL}/api/v1${endpoint}`, {
        ...options,
        headers
      });
    };

    // First attempt with current token
    let response = await makeRequest(token);
    
    if (response.ok) {
      return response.json();
    }

    // If we get 401, try to refresh and retry
    if (response.status === 401) {
      console.log(`${userType} received 401, attempting token refresh...`);
      
      const refreshed = await this.refreshToken(userType);
      
      if (refreshed) {
        const newToken = this.getToken(userType);
        if (newToken) {
          console.log(`Retrying request with refreshed token...`);
          const retryResponse = await makeRequest(newToken);
          
          if (retryResponse.ok) {
            console.log(`Request successful after token refresh`);
            return retryResponse.json();
          } else {
            console.log(`Request still failed after refresh: ${retryResponse.status}`);
          }
        }
      }
      
      // If refresh failed, provide different messages based on backend capability
      const currentToken = this.getToken(userType);
      if (!currentToken) {
        console.log(`No token after refresh attempt, logging out ${userType}`);
        this.logout(userType);
        throw new Error('Authentication expired. Please login again.');
      }
      
      // Check if backend supports refresh at all
      if (this.backendSupportsRefresh.get(userType) === false) {
        console.log(`Backend doesn't support token refresh for ${userType}. Session will expire naturally.`);
        // Don't logout immediately, but inform that refresh isn't supported
        throw new Error('Session expired. Backend does not support token refresh. Please login again when needed.');
      } else {
        // Refresh is supported but failed for other reasons
        console.log(`Token refresh failed for ${userType}, but keeping session for manual retry`);
        throw new Error('Authentication expired. Please login again.');
      }
    }

    // For other errors, don't logout
    const errorText = await response.text();
    console.error(`API request failed: ${response.status} - ${errorText}`);
    throw new Error(`API request failed: ${response.status}`);
  }
}

// Export singleton instance
export const jwtAuth = new JWTAuthService();
