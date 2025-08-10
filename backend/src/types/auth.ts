/**
 * Authentication Types for Scalable Auth Service
 */

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: UserRole;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
  last_login_ip?: string;
  metadata?: Record<string, any>;
}

export interface UserProfile extends AuthUser {
  // Additional profile fields can be added here
}

export interface AuthSession {
  user: AuthUser;
  tokens: AuthTokens;
  created_at: Date;
  expires_at?: Date;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: 'Bearer';
  expires_in: number;
  expires_at: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
  ip_address?: string;
  user_agent?: string;
  remember_me?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  phone: string;
  role?: UserRole;
  ip_address?: string;
  user_agent?: string;
  terms_accepted?: boolean;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: AuthUser;
    tokens: AuthTokens;
    requires_verification?: boolean;
  };
  errors?: AuthError[];
}

export interface AuthError {
  code: string;
  message: string;
  field?: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  password: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface AuthEventData {
  userId?: string;
  email?: string;
  role?: string;
  ip_address?: string;
  user_agent?: string;
  error?: string;
  duration?: number;
  timestamp?: string;
}

export type AuthEventType = 
  | 'registration_success'
  | 'registration_failed'
  | 'login_success'
  | 'login_failed'
  | 'logout_success'
  | 'token_refresh'
  | 'password_reset'
  | 'email_verification'
  | 'account_locked'
  | 'suspicious_activity';

export type UserRole = 'customer' | 'agent' | 'admin' | 'super_admin';

export interface JWTPayload {
  sub: string; // User ID
  role: UserRole;
  iat: number;
  exp: number;
  jti: string; // JWT ID for tracking
}

export interface SessionData {
  userId: string;
  role: UserRole;
  email: string;
  is_verified: boolean;
  created_at: Date;
  last_activity: Date;
}

export interface SecuritySettings {
  max_login_attempts: number;
  lockout_duration: number;
  password_min_length: number;
  password_require_special: boolean;
  password_require_numbers: boolean;
  password_require_uppercase: boolean;
  session_timeout: number;
  require_2fa: boolean;
}

export interface AuthMiddlewareOptions {
  required?: boolean;
  roles?: UserRole[];
  verified_only?: boolean;
  check_permissions?: string[];
}

export interface TwoFactorSetup {
  secret: string;
  qr_code_url: string;
  backup_codes: string[];
}

export interface TwoFactorVerification {
  code: string;
  backup_code?: string;
}

export interface DeviceInfo {
  device_id: string;
  device_name: string;
  device_type: 'mobile' | 'desktop' | 'tablet';
  os: string;
  browser: string;
  ip_address: string;
  is_trusted: boolean;
  last_used: Date;
}

export interface LoginHistory {
  id: string;
  user_id: string;
  login_time: Date;
  ip_address: string;
  user_agent: string;
  device_info: DeviceInfo;
  success: boolean;
  failure_reason?: string;
}

export interface PermissionCheck {
  resource: string;
  action: string;
  user_id: string;
  role: UserRole;
}

export interface RateLimitInfo {
  key: string;
  attempts: number;
  reset_time: Date;
  blocked: boolean;
}

export interface AuthAuditLog {
  id: string;
  event_type: AuthEventType;
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  event_data: AuthEventData;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
}
