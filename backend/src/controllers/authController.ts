import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '../config/supabase';
import { AppError } from '../middleware/errorHandler';
import { generateTokens } from '../utils/auth';
import { validateRegistration, validateLogin } from '../utils/validation';
import { ApiResponse, AuthResponse, LoginRequest, RegisterRequest, UserProfile, UserRole } from '../types';
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

// Admin-specific login endpoint
export const adminLogin = async (req: Request, res: Response): Promise<void> => {
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

  // Check if user has admin role
  if (!['admin', 'super_admin'].includes(user.role)) {
    throw new AppError('Access denied. Admin privileges required.', 403, 'INSUFFICIENT_PERMISSIONS');
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
    message: 'Admin login successful',
    data: {
      user,
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  };

  res.status(200).json(response);
};

// Agent-specific login endpoint
export const agentLogin = async (req: Request, res: Response): Promise<void> => {
  const { error: validationError } = validateLogin(req.body);
  if (validationError) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR');
  }

  const { email, password }: LoginRequest = req.body;
  
  console.log('=== AGENT LOGIN DEBUG START ===');
  console.log('Login attempt with:', { email, password: password ? 'provided' : 'missing' });

  try {
    // First, let's see ALL agents in the database
    const { data: allAgentsInDB } = await supabaseAdmin
      .from('agents')
      .select('id, agent_code, business_name, contact_person, business_address, is_active, verification_status, verification_documents');
    
    console.log('Total agents in database:', allAgentsInDB?.length || 0);
    console.log('All agents:', allAgentsInDB?.map(a => ({
      id: a.id,
      agent_code: a.agent_code,
      business_name: a.business_name,
      contact_person: a.contact_person,
      email: a.business_address?.email,
      is_active: a.is_active,
      verification_status: a.verification_status,
      has_password: !!a.verification_documents?.password
    })));

    // Get agent from agents table - first try direct email match
    let { data: agent, error: agentError } = await supabaseAdmin
      .from('agents')
      .select('*')
      .eq('business_address->>email', email)
      .eq('is_active', true)
      .single();

    console.log('Direct email search result:', { 
      email, 
      agentError: agentError?.message, 
      agentCode: agentError?.code,
      agent: agent ? 'found' : 'not found'
    });

    // If not found, try without the single() constraint to see all matches
    if (agentError) {
      const { data: allAgents } = await supabaseAdmin
        .from('agents')
        .select('*')
        .eq('business_address->>email', email);
      
      console.log('All agents with this email (including inactive):', allAgents?.map(a => ({
        id: a.id,
        email: a.business_address?.email,
        is_active: a.is_active,
        verification_status: a.verification_status
      })));
      
      if (allAgents && allAgents.length > 0) {
        // Find the active one
        agent = allAgents.find(a => a.is_active === true) || null;
        agentError = agent ? null : agentError;
        console.log('Found active agent after fallback search:', !!agent);
      }
    }

    console.log('Final agent search result:', { 
      agent: agent ? 'found' : 'not found',
      agentId: agent?.id,
      agentEmail: agent?.business_address?.email,
      isActive: agent?.is_active,
      verificationStatus: agent?.verification_status
    });

    if (agentError || !agent) {
      console.log('Agent not found or error:', agentError);
      
      // Try alternative email search
      const { data: altAgent, error: altError } = await supabaseAdmin
        .from('agents')
        .select('*')
        .or(`business_address->>email.eq.${email},contact_person.ilike.%${email}%`)
        .eq('is_active', true);
        
      console.log('Alternative search result:', { 
        altError: altError?.message, 
        foundAgents: altAgent?.length || 0,
        agents: altAgent?.map(a => ({ id: a.id, email: a.business_address?.email, name: a.contact_person }))
      });
      
      throw new AppError('Invalid credentials or agent not found', 401, 'INVALID_CREDENTIALS');
    }

    // Check if agent is active
    if (!agent.is_active) {
      throw new AppError('Account is deactivated or not yet approved by admin', 401, 'ACCOUNT_DEACTIVATED');
    }

    // Verify password from dedicated password column (fallback to verification_documents)
    const storedPassword = agent.password || agent.verification_documents?.password;
    console.log('Password verification:', { 
      storedPassword: storedPassword ? 'exists' : 'missing', 
      inputPassword: password ? 'provided' : 'missing',
      match: storedPassword === password 
    });
    
    if (!storedPassword || storedPassword !== password) {
      console.log('Password mismatch or missing stored password');
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    // Create user object for token generation
    const userForToken: UserProfile = {
      id: agent.id, // Use agent.id instead of agent.user_id
      email: agent.business_address?.email || email,
      full_name: agent.contact_person || agent.business_name,
      role: 'agent' as UserRole,
      is_verified: true,
      is_active: agent.is_active,
      created_at: new Date(agent.created_at),
      updated_at: new Date(agent.updated_at || agent.created_at),
      phone: agent.business_address?.phone,
      // Add agent-specific metadata
      preferences: {
        agent_id: agent.id,
        agent_code: agent.agent_code,
        business_name: agent.business_name
      }
    };

    // Generate tokens with agent.id instead of agent.user_id
    const { accessToken, refreshToken } = generateTokens(agent.id);

    // Update last login
    await supabaseAdmin
      .from('agents')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', agent.id);

    const response: ApiResponse<AuthResponse> = {
      success: true,
      message: 'Agent login successful',
      data: {
        user: userForToken,
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Agent login error:', error);
    throw error;
  }
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

// Agent email verification endpoint
export const verifyAgentEmail = async (req: Request, res: Response): Promise<void> => {
  const { token } = req.body;

  if (!token) {
    res.status(400).json({
      success: false,
      message: 'Verification token is required',
      error: 'MISSING_TOKEN'
    });
    return;
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET + 'agent_verify') as any;
    const { requestId, email } = decoded;

    // Update agent request as verified
    const { data: updatedRequest, error: updateError } = await supabaseAdmin
      .from('agent_requests')
      .update({ 
        email_verified: true,
        email_verified_at: new Date().toISOString()
      })
      .eq('id', requestId)
      .eq('email', email)
      .select()
      .single();

    if (updateError || !updatedRequest) {
      res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token',
        error: 'INVALID_TOKEN'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! Your agent request is now ready for admin review.',
      data: {
        request_id: updatedRequest.id,
        email_verified: true
      }
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(400).json({
      success: false,
      message: 'Invalid or expired verification token',
      error: 'VERIFICATION_ERROR'
    });
  }
};

// Helper functions
const generateVerificationToken = (userId: string): string => {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET + 'verify', { expiresIn: '24h' });
};

const generatePasswordResetToken = (userId: string): string => {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET + 'reset', { expiresIn: '1h' });
};

// Agent registration endpoint
export const agentRegister = async (req: Request, res: Response): Promise<void> => {
  console.log('=== AGENT REGISTRATION START ===');
  console.log('Request method:', req.method);
  console.log('Request headers:', req.headers);
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  
  // Simple test response first
  if (!req.body || Object.keys(req.body).length === 0) {
    console.log('ERROR: Empty request body');
    res.status(400).json({
      success: false,
      message: 'Request body is empty',
      error: 'EMPTY_BODY'
    });
    return;
  }

  const {
    full_name,
    email,
    password,
    phone,
    address,
    city,
    state,
    pincode,
    experience_years,
    reason
  } = req.body;

  console.log('Extracted fields:', { full_name, email, password: password ? 'provided' : 'missing', phone, address, city, state, pincode, experience_years, reason });

  // Validate required fields
  if (!full_name || !email || !password || !phone || !address || !city || !state || !pincode || !reason) {
    const missingFields = [];
    if (!full_name) missingFields.push('full_name');
    if (!email) missingFields.push('email');
    if (!password) missingFields.push('password');
    if (!phone) missingFields.push('phone');
    if (!address) missingFields.push('address');
    if (!city) missingFields.push('city');
    if (!state) missingFields.push('state');
    if (!pincode) missingFields.push('pincode');
    if (!reason) missingFields.push('reason');
    
    console.log('Missing required fields:', missingFields);
    res.status(400).json({
      success: false,
      message: `Missing required fields: ${missingFields.join(', ')}`,
      error: 'VALIDATION_ERROR',
      missingFields
    });
    return;
  }

  try {
    // Check if agent request already exists
    const { data: existingRequest, error: requestCheckError } = await supabaseAdmin
      .from('agent_requests')
      .select('email, status')
      .eq('email', email)
      .single();

    console.log('Agent registration check:', { email, existingRequest, requestCheckError });

    if (requestCheckError && requestCheckError.code !== 'PGRST116') {
      console.error('Database error during duplicate check:', requestCheckError);
      res.status(500).json({
        success: false,
        message: 'Database error during validation',
        error: requestCheckError.message
      });
      return;
    }

    if (existingRequest) {
      if (existingRequest.status === 'pending') {
        res.status(409).json({
          success: false,
          message: 'Agent request already submitted and is pending review',
          error: 'REQUEST_PENDING'
        });
        return;
      } else if (existingRequest.status === 'approved') {
        res.status(409).json({
          success: false,
          message: 'Agent request already approved. Please login to your agent account.',
          error: 'REQUEST_APPROVED'
        });
        return;
      } else if (existingRequest.status === 'rejected') {
        // Allow resubmission if previously rejected
        console.log('Previous request was rejected, allowing resubmission');
      }
    }

    // Check if user already exists
    const { data: existingUser, error: userCheckError } = await supabaseAdmin
      .from('user_profiles')
      .select('email')
      .eq('email', email)
      .single();

    console.log('User check:', { email, existingUser, userCheckError });

    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'User already exists with this email',
        error: 'USER_EXISTS'
      });
      return;
    }

    // Create agent request
    const insertData = {
      full_name,
      email,
      password, // Store password for later use during approval
      phone,
      address,
      city,
      state,
      pincode,
      business_name: '',
      business_type: 'individual',
      experience_years,
      documents: '',
      reason,
      status: 'pending'
      // Removed email_verified and registration_ip - let them use default values from table
    };

    console.log('Inserting agent request data:', insertData);

    const { data: agentRequest, error: requestError } = await supabaseAdmin
      .from('agent_requests')
      .insert([insertData])
      .select()
      .single();

    console.log('Database insert result:', { agentRequest, requestError });

    if (requestError || !agentRequest) {
      console.error('Failed to create agent request:', requestError);
      console.error('Error details:', {
        code: requestError?.code,
        message: requestError?.message,
        details: requestError?.details,
        hint: requestError?.hint
      });
      res.status(500).json({
        success: false,
        message: `Database error: ${requestError?.message || 'Unknown error'}`,
        error: 'REQUEST_ERROR',
        details: {
          code: requestError?.code,
          hint: requestError?.hint
        }
      });
      return;
    }

    // Generate verification token and send email
    const verificationToken = jwt.sign(
      { requestId: agentRequest.id, email: agentRequest.email },
      process.env.JWT_SECRET + 'agent_verify',
      { expiresIn: '24h' }
    );

    // Update agent request with verification token
    await supabaseAdmin
      .from('agent_requests')
      .update({ email_verification_token: verificationToken })
      .eq('id', agentRequest.id);

    // Send verification email
    try {
      const { sendVerificationEmail } = await import('../utils/email');
      
      await sendVerificationEmail(agentRequest.email, agentRequest.full_name, verificationToken);
      console.log('Verification email sent successfully to:', agentRequest.email);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Don't fail the registration if email fails
    }

    const response: ApiResponse = {
      success: true,
      message: 'Agent registration request submitted successfully. Please check your email to verify your account.',
      data: {
        request_id: agentRequest.id,
        status: agentRequest.status
      }
    };

    res.status(201).json(response);

  } catch (error) {
    console.error('Error in agent registration:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during agent registration',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
