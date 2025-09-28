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

  // Check if user is authenticated
  isAuthenticated(userType: 'admin' | 'agent' | 'customer'): boolean {
    const token = this.getToken(userType);
    const user = this.getUser(userType);
    const expiresAt = this.getExpiresAt(userType);
    
    if (!token || !user) {
      return false;
    }
    
    // Check if token is expired
    if (expiresAt && new Date(expiresAt) <= new Date()) {
      console.log(`${userType} token expired, logging out`);
      this.logout(userType);
      return false;
    }
    
    return true;
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

  // Make authenticated API request
  async authenticatedRequest<T>(
    userType: 'admin' | 'agent' | 'customer',
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken(userType);
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...((options.headers as Record<string, string>) || {})
    };

    const response = await fetch(`${this.API_BASE_URL}/api/v1${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid, logout user
        this.logout(userType);
        throw new Error('Authentication expired. Please login again.');
      }
      throw new Error(`API request failed: ${response.status}`);
    }

    return response.json();
  }
}

// Export singleton instance
export const jwtAuth = new JWTAuthService();
