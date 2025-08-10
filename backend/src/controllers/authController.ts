import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '../config/supabase';
import { AppError } from '../middleware/errorHandler';
import { ApiResponse, AuthResponse, LoginRequest, RegisterRequest, UserProfile } from '../types';
import { validateRegistration, validateLogin } from '../utils/validation';
import { generateTokens } from '../utils/auth';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email';

export const register = async (req: Request, res: Response): Promise<void> => {
  const { error: validationError } = validateRegistration(req.body);
  if (validationError) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR');
  }

  const { email, password, full_name, phone, role = 'customer' }: RegisterRequest = req.body;

  // Check if user already exists
  const { data: existingUser } = await supabaseAdmin
    .from('user_profiles')
    .select('email')
    .eq('email', email)
    .single();

  if (existingUser) {
    throw new AppError('User already exists with this email', 409, 'USER_EXISTS');
  }

  // Check phone number if provided
  if (phone) {
    const { data: existingPhone } = await supabaseAdmin
      .from('user_profiles')
      .select('phone')
      .eq('phone', phone)
      .single();

    if (existingPhone) {
      throw new AppError('User already exists with this phone number', 409, 'PHONE_EXISTS');
    }
  }

  // Create user in Supabase Auth
  const shouldAutoConfirm = role === 'admin' || role === 'super_admin';
  
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: shouldAutoConfirm // Auto-confirm admin users
  });

  if (authError || !authData.user) {
    throw new AppError('Failed to create user account', 500, 'AUTH_ERROR');
  }

  // Create user profile
  const { data: userProfile, error: profileError } = await supabaseAdmin
    .from('user_profiles')
    .insert([{
      id: authData.user.id,
      email,
      full_name,
      phone,
      role,
      is_verified: shouldAutoConfirm, // Auto-verify admin users
      is_active: true
    }])
    .select()
    .single();

  if (profileError || !userProfile) {
    // Cleanup: delete auth user if profile creation fails
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
    throw new AppError('Failed to create user profile', 500, 'PROFILE_ERROR');
  }

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(userProfile.id);

  // Send verification email
  try {
    await sendVerificationEmail(email, full_name, generateVerificationToken(userProfile.id));
  } catch (emailError) {
    console.error('Failed to send verification email:', emailError);
    // Don't throw error for email sending failure
  }

  const response: ApiResponse<AuthResponse> = {
    success: true,
    message: 'User registered successfully. Please check your email for verification.',
    data: {
      user: userProfile,
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    }
  };

  res.status(201).json(response);
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { error: validationError } = validateLogin(req.body);
  if (validationError) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR');
  }

  const { email, password }: LoginRequest = req.body;

  // Get user from database
  const { data: user, error: userError } = await supabaseAdmin
    .from('user_profiles')
    .select('*')
    .eq('email', email)
    .single();

  if (userError || !user) {
    throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }

  if (!user.is_active) {
    throw new AppError('Account is deactivated', 401, 'ACCOUNT_DEACTIVATED');
  }

  // Verify password with Supabase Auth
  const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
    email,
    password
  });

  if (authError || !authData.user) {
    throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user.id);

  // Update last login
  await supabaseAdmin
    .from('user_profiles')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', user.id);

  const response: ApiResponse<AuthResponse> = {
    success: true,
    message: 'Login successful',
    data: {
      user,
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  };

  res.status(200).json(response);
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  const { refresh_token } = req.body;

  if (!refresh_token) {
    throw new AppError('Refresh token is required', 400, 'MISSING_REFRESH_TOKEN');
  }

  try {
    const decoded = jwt.verify(refresh_token, process.env.JWT_REFRESH_SECRET!) as any;
    const userId = decoded.sub;

    // Get user
    const { data: user, error } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !user || !user.is_active) {
      throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user.id);

    const response: ApiResponse<AuthResponse> = {
      success: true,
      message: 'Token refreshed successfully',
      data: {
        user,
        access_token: accessToken,
        refresh_token: newRefreshToken,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    };

    res.status(200).json(response);
  } catch (error) {
    throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
  }
};

export const logout = async (_req: Request, res: Response): Promise<void> => {
  // In a more robust implementation, you might want to blacklist the token
  // For now, we'll just return success (client should delete the token)
  
  const response: ApiResponse = {
    success: true,
    message: 'Logged out successfully'
  };

  res.status(200).json(response);
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  if (!email) {
    throw new AppError('Email is required', 400, 'MISSING_EMAIL');
  }

  // Check if user exists
  const { data: user } = await supabaseAdmin
    .from('user_profiles')
    .select('id, full_name, email')
    .eq('email', email)
    .single();

  // Always return success to prevent email enumeration
  const response: ApiResponse = {
    success: true,
    message: 'If an account with this email exists, you will receive a password reset link.'
  };

  if (user) {
    // Generate reset token
    const resetToken = generatePasswordResetToken(user.id);
    
    // Send password reset email
    try {
      await sendPasswordResetEmail(email, user.full_name, resetToken);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
    }
  }

  res.status(200).json(response);
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { token, password } = req.body;

  if (!token || !password) {
    throw new AppError('Token and password are required', 400, 'MISSING_FIELDS');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET + 'reset') as any;
    const userId = decoded.sub;

    // Update password in Supabase Auth
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password }
    );

    if (updateError) {
      throw new AppError('Failed to update password', 500, 'PASSWORD_UPDATE_ERROR');
    }

    const response: ApiResponse = {
      success: true,
      message: 'Password reset successful'
    };

    res.status(200).json(response);
  } catch (error) {
    throw new AppError('Invalid or expired reset token', 400, 'INVALID_RESET_TOKEN');
  }
};

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  const { token } = req.body;

  if (!token) {
    throw new AppError('Verification token is required', 400, 'MISSING_TOKEN');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET + 'verify') as any;
    const userId = decoded.sub;

    // Update user verification status
    const { data: user, error } = await supabaseAdmin
      .from('user_profiles')
      .update({ is_verified: true })
      .eq('id', userId)
      .select()
      .single();

    if (error || !user) {
      throw new AppError('Invalid verification token', 400, 'INVALID_VERIFICATION_TOKEN');
    }

    // Update user in Supabase Auth
    await supabaseAdmin.auth.admin.updateUserById(userId, {
      email_confirm: true
    });

    const response: ApiResponse = {
      success: true,
      message: 'Email verified successfully'
    };

    res.status(200).json(response);
  } catch (error) {
    throw new AppError('Invalid or expired verification token', 400, 'INVALID_VERIFICATION_TOKEN');
  }
};

export const resendVerification = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  if (!email) {
    throw new AppError('Email is required', 400, 'MISSING_EMAIL');
  }

  const { data: user } = await supabaseAdmin
    .from('user_profiles')
    .select('id, full_name, email, is_verified')
    .eq('email', email)
    .single();

  const response: ApiResponse = {
    success: true,
    message: 'If an unverified account with this email exists, you will receive a verification link.'
  };

  if (user && !user.is_verified) {
    const verificationToken = generateVerificationToken(user.id);
    
    try {
      await sendVerificationEmail(email, user.full_name, verificationToken);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
    }
  }

  res.status(200).json(response);
};

export const changePassword = async (req: Request, res: Response): Promise<void> => {
  const { current_password, new_password } = req.body;
  const userId = req.userId!;

  if (!current_password || !new_password) {
    throw new AppError('Current password and new password are required', 400, 'MISSING_PASSWORDS');
  }

  // Get user email
  const { data: user } = await supabaseAdmin
    .from('user_profiles')
    .select('email')
    .eq('id', userId)
    .single();

  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  // Verify current password
  const { error: signInError } = await supabaseAdmin.auth.signInWithPassword({
    email: user.email,
    password: current_password
  });

  if (signInError) {
    throw new AppError('Current password is incorrect', 400, 'INCORRECT_PASSWORD');
  }

  // Update password
  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
    userId,
    { password: new_password }
  );

  if (updateError) {
    throw new AppError('Failed to update password', 500, 'PASSWORD_UPDATE_ERROR');
  }

  const response: ApiResponse = {
    success: true,
    message: 'Password changed successfully'
  };

  res.status(200).json(response);
};

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;

  const { data: users, error, count } = await supabaseAdmin
    .from('user_profiles')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new AppError('Failed to fetch users', 500, 'FETCH_ERROR');
  }

  const response: ApiResponse<UserProfile[]> = {
    success: true,
    message: 'Users fetched successfully',
    data: users || [],
    meta: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit)
    }
  };

  res.status(200).json(response);
};

export const updateUserStatus = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params;
  const { is_active, is_verified } = req.body;

  const updates: any = {};
  if (typeof is_active === 'boolean') updates.is_active = is_active;
  if (typeof is_verified === 'boolean') updates.is_verified = is_verified;

  if (Object.keys(updates).length === 0) {
    throw new AppError('No valid updates provided', 400, 'NO_UPDATES');
  }

  const { data: user, error } = await supabaseAdmin
    .from('user_profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error || !user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  const response: ApiResponse<UserProfile> = {
    success: true,
    message: 'User status updated successfully',
    data: user
  };

  res.status(200).json(response);
};

// Helper functions
const generateVerificationToken = (userId: string): string => {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET + 'verify', { expiresIn: '24h' });
};

const generatePasswordResetToken = (userId: string): string => {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET + 'reset', { expiresIn: '1h' });
};
