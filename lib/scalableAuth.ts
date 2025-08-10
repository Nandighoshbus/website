/**
 * Scalable Frontend Authentication Service
 * Integrates with the backend scalable authentication system
 */

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

interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: 'Bearer';
  expires_in: number;
  expires_at: Date;
}

interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: AuthUser;
    tokens: AuthTokens;
    requires_verification?: boolean;
  };
  errors?: any[];
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

class ScalableFrontendAuth {
  private readonly API_BASE_URL: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private user: AuthUser | null = null;
  private tokenRefreshPromise: Promise<void> | null = null;

  constructor() {
    this.API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
    this.loadFromStorage();
    this.setupTokenRefresh();
  }

  /**
   * Load tokens and user data from localStorage
   */
  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const accessToken = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');
      const userData = localStorage.getItem('user_data');

      if (accessToken) this.accessToken = accessToken;
      if (refreshToken) this.refreshToken = refreshToken;
      if (userData) this.user = JSON.parse(userData);

      // Validate token expiry
      if (accessToken && this.isTokenExpired(accessToken)) {
        this.refreshAccessToken();
      }
    } catch (error) {
      console.error('Error loading auth data from storage:', error);
      this.clearStorage();
    }
  }

  /**
   * Save tokens and user data to localStorage
   */
  private saveToStorage(tokens: AuthTokens, user: AuthUser): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem('access_token', tokens.access_token);
      localStorage.setItem('refresh_token', tokens.refresh_token);
      localStorage.setItem('user_data', JSON.stringify(user));
      localStorage.setItem('token_expires_at', tokens.expires_at.toISOString());
    } catch (error) {
      console.error('Error saving auth data to storage:', error);
    }
  }

  /**
   * Clear all authentication data
   */
  private clearStorage(): void {
    if (typeof window === 'undefined') return;

    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('token_expires_at');
    
    this.accessToken = null;
    this.refreshToken = null;
    this.user = null;
  }

  /**
   * Check if token is expired
   */
  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  /**
   * Setup automatic token refresh
   */
  private setupTokenRefresh(): void {
    if (typeof window === 'undefined') return;

    // Check token expiry every minute
    setInterval(() => {
      if (this.accessToken && this.isTokenExpired(this.accessToken)) {
        this.refreshAccessToken();
      }
    }, 60000);
  }

  /**
   * Make authenticated API request
   */
  private async apiRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    // Ensure we have a valid access token
    if (this.accessToken && this.isTokenExpired(this.accessToken)) {
      await this.refreshAccessToken();
    }

    const url = `${this.API_BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    // Add auth header if we have a token
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Unauthorized - try to refresh token
        await this.refreshAccessToken();
        
        // Retry request with new token
        if (this.accessToken) {
          headers['Authorization'] = `Bearer ${this.accessToken}`;
          const retryResponse = await fetch(url, { ...options, headers });
          
          if (!retryResponse.ok) {
            throw new Error(`API request failed: ${retryResponse.status}`);
          }
          
          return retryResponse.json();
        }
      }
      
      throw new Error(`API request failed: ${response.status}`);
    }

    return response.json();
  }

  /**
   * User registration
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await this.apiRequest<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (response.success && response.data) {
        this.accessToken = response.data.tokens.access_token;
        this.refreshToken = response.data.tokens.refresh_token;
        this.user = response.data.user;
        this.saveToStorage(response.data.tokens, response.data.user);
      }

      return response;
    } catch (error) {
      throw new Error(`Registration failed: ${error}`);
    }
  }

  /**
   * User login
   */
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await this.apiRequest<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (response.success && response.data) {
        this.accessToken = response.data.tokens.access_token;
        this.refreshToken = response.data.tokens.refresh_token;
        this.user = response.data.user;
        this.saveToStorage(response.data.tokens, response.data.user);
      }

      return response;
    } catch (error) {
      throw new Error(`Login failed: ${error}`);
    }
  }

  /**
   * User logout
   */
  async logout(): Promise<void> {
    try {
      if (this.refreshToken) {
        await this.apiRequest('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refresh_token: this.refreshToken }),
        });
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Continue with local cleanup even if API call fails
    } finally {
      this.clearStorage();
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(): Promise<void> {
    if (this.tokenRefreshPromise) {
      return this.tokenRefreshPromise;
    }

    if (!this.refreshToken) {
      this.clearStorage();
      throw new Error('No refresh token available');
    }

    this.tokenRefreshPromise = (async () => {
      try {
        const response = await fetch(`${this.API_BASE_URL}/auth/refresh-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: this.refreshToken }),
        });

        if (!response.ok) {
          throw new Error('Token refresh failed');
        }

        const data = await response.json();
        
        if (data.success && data.data?.tokens) {
          this.accessToken = data.data.tokens.access_token;
          this.refreshToken = data.data.tokens.refresh_token;
          
          if (this.user) {
            this.saveToStorage(data.data.tokens, this.user);
          }
        } else {
          throw new Error('Invalid refresh response');
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
        this.clearStorage();
        throw error;
      } finally {
        this.tokenRefreshPromise = null;
      }
    })();

    return this.tokenRefreshPromise;
  }

  /**
   * Get current user
   */
  getCurrentUser(): AuthUser | null {
    return this.user;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.user && !!this.accessToken && !this.isTokenExpired(this.accessToken);
  }

  /**
   * Check if user has specific role
   */
  hasRole(...roles: string[]): boolean {
    return !!this.user && roles.includes(this.user.role);
  }

  /**
   * Check if user is verified
   */
  isVerified(): boolean {
    return !!this.user && this.user.is_verified;
  }

  /**
   * Get user profile
   */
  async getProfile(): Promise<AuthUser> {
    const response = await this.apiRequest<AuthResponse>('/auth/profile');
    
    if (response.success && response.data) {
      this.user = response.data.user;
      return response.data.user;
    }
    
    throw new Error('Failed to get profile');
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: Partial<AuthUser>): Promise<AuthUser> {
    const response = await this.apiRequest<AuthResponse>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    
    if (response.success && response.data) {
      this.user = response.data.user;
      if (this.refreshToken) {
        this.saveToStorage(response.data.tokens, response.data.user);
      }
      return response.data.user;
    }
    
    throw new Error('Failed to update profile');
  }

  /**
   * Change password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const response = await this.apiRequest<AuthResponse>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    });
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to change password');
    }
  }

  /**
   * Request password reset
   */
  async forgotPassword(email: string): Promise<void> {
    const response = await this.apiRequest<AuthResponse>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to request password reset');
    }
  }

  /**
   * Verify email
   */
  async verifyEmail(token: string): Promise<void> {
    const response = await this.apiRequest<AuthResponse>('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to verify email');
    }
    
    // Update user verification status
    if (this.user) {
      this.user.is_verified = true;
      if (this.refreshToken && this.accessToken) {
        localStorage.setItem('user_data', JSON.stringify(this.user));
      }
    }
  }

  /**
   * Resend verification email
   */
  async resendVerification(): Promise<void> {
    const response = await this.apiRequest<AuthResponse>('/auth/resend-verification', {
      method: 'POST',
    });
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to resend verification');
    }
  }

  /**
   * Get login history
   */
  async getLoginHistory(): Promise<any[]> {
    const response = await this.apiRequest<any>('/auth/login-history');
    return response.data?.history || [];
  }

  /**
   * Get active sessions
   */
  async getSessions(): Promise<any[]> {
    const response = await this.apiRequest<any>('/auth/sessions');
    return response.data?.sessions || [];
  }

  /**
   * Revoke session
   */
  async revokeSession(sessionId: string): Promise<void> {
    const response = await this.apiRequest<AuthResponse>(`/auth/sessions/${sessionId}`, {
      method: 'DELETE',
    });
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to revoke session');
    }
  }
}

// Export singleton instance
export const scalableAuth = new ScalableFrontendAuth();
export default scalableAuth;
