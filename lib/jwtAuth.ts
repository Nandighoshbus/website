// Pure JWT Authentication System for Admin and Agent
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'super_admin' | 'agent';
  full_name?: string;
  is_active: boolean;
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

  // Store tokens in localStorage
  private storeTokens(userType: 'admin' | 'agent', data: any): void {
    const prefix = userType === 'admin' ? 'admin' : 'agent';
    localStorage.setItem(`${prefix}_token`, data.access_token);
    localStorage.setItem(`${prefix}_refresh_token`, data.refresh_token);
    localStorage.setItem(`${prefix}_user`, JSON.stringify(data.user));
    localStorage.setItem(`${prefix}_expires_at`, data.expires_at);
  }

  // Get stored token
  getToken(userType: 'admin' | 'agent'): string | null {
    const prefix = userType === 'admin' ? 'admin' : 'agent';
    return localStorage.getItem(`${prefix}_token`);
  }

  // Get stored user
  getUser(userType: 'admin' | 'agent'): User | null {
    const prefix = userType === 'admin' ? 'admin' : 'agent';
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
  isAuthenticated(userType: 'admin' | 'agent'): boolean {
    const token = this.getToken(userType);
    const user = this.getUser(userType);
    return !!(token && user);
  }

  // Logout
  logout(userType: 'admin' | 'agent'): void {
    const prefix = userType === 'admin' ? 'admin' : 'agent';
    localStorage.removeItem(`${prefix}_token`);
    localStorage.removeItem(`${prefix}_refresh_token`);
    localStorage.removeItem(`${prefix}_user`);
    localStorage.removeItem(`${prefix}_expires_at`);
  }

  // Make authenticated API request
  async authenticatedRequest<T>(
    userType: 'admin' | 'agent',
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
