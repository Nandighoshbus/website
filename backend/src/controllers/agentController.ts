import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { AppError } from '../middleware/errorHandler';
import { ApiResponse, UserProfile } from '../types';
import { generateTokens } from '../utils/auth';
import { sendWelcomeEmail } from '../utils/email';

export const agentLogin = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Email and password are required', 400, 'MISSING_CREDENTIALS');
  }

  // Get agent from database
  const { data: agent, error: agentError } = await supabaseAdmin
    .from('user_profiles')
    .select('*')
    .eq('email', email)
    .eq('role', 'agent')
    .single();

  if (agentError || !agent) {
    throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }

  if (!agent.is_active) {
    throw new AppError('Agent account is deactivated', 401, 'ACCOUNT_DEACTIVATED');
  }

  if (!agent.is_verified) {
    throw new AppError('Agent account is not verified', 401, 'ACCOUNT_NOT_VERIFIED');
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
  const { accessToken, refreshToken } = generateTokens(agent.id);

  // Update last login
  await supabaseAdmin
    .from('user_profiles')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', agent.id);

  const response: ApiResponse = {
    success: true,
    message: 'Agent login successful',
    data: {
      user: agent,
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  };

  res.status(200).json(response);
};

export const agentRegister = async (req: Request, res: Response): Promise<void> => {
  const {
    email,
    password,
    full_name,
    phone,
    agent_code,
    branch_location,
    commission_rate = 5.0
  } = req.body;

  if (!email || !password || !full_name || !agent_code) {
    throw new AppError('Email, password, full name, and agent code are required', 400, 'MISSING_REQUIRED_FIELDS');
  }

  // Check if agent code already exists
  const { data: existingAgent } = await supabaseAdmin
    .from('agent_profiles')
    .select('agent_code')
    .eq('agent_code', agent_code)
    .single();

  if (existingAgent) {
    throw new AppError('Agent code already exists', 409, 'AGENT_CODE_EXISTS');
  }

  // Check if user already exists
  const { data: existingUser } = await supabaseAdmin
    .from('user_profiles')
    .select('email')
    .eq('email', email)
    .single();

  if (existingUser) {
    throw new AppError('User already exists with this email', 409, 'USER_EXISTS');
  }

  // Create user in Supabase Auth
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: false
  });

  if (authError || !authData.user) {
    throw new AppError('Failed to create agent account', 500, 'AUTH_ERROR');
  }

  try {
    // Create user profile
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .insert([{
        id: authData.user.id,
        email,
        full_name,
        phone,
        role: 'agent',
        is_verified: false, // Agents need admin approval
        is_active: false    // Agents need admin approval
      }])
      .select()
      .single();

    if (profileError || !userProfile) {
      throw new AppError('Failed to create user profile', 500, 'PROFILE_ERROR');
    }

    // Create agent profile
    const { data: agentProfile, error: agentProfileError } = await supabaseAdmin
      .from('agent_profiles')
      .insert([{
        user_id: authData.user.id,
        agent_code,
        branch_location,
        commission_rate,
        is_approved: false,
        total_bookings: 0,
        total_commission: 0,
        status: 'pending'
      }])
      .select()
      .single();

    if (agentProfileError || !agentProfile) {
      throw new AppError('Failed to create agent profile', 500, 'AGENT_PROFILE_ERROR');
    }

    // Send welcome email (but agent is not active yet)
    try {
      await sendWelcomeEmail(email, full_name);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
    }

    const response: ApiResponse = {
      success: true,
      message: 'Agent registration successful. Please wait for admin approval.',
      data: {
        user: userProfile,
        agent: agentProfile
      }
    };

    res.status(201).json(response);
  } catch (error) {
    // Cleanup: delete auth user if profile creation fails
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
    throw error;
  }
};

export const getAgentProfile = async (req: Request, res: Response): Promise<void> => {
  const userId = req.userId!;

  const { data: agent, error } = await supabaseAdmin
    .from('user_profiles')
    .select(`
      *,
      agent_profile:agent_profiles(*)
    `)
    .eq('id', userId)
    .eq('role', 'agent')
    .single();

  if (error || !agent) {
    throw new AppError('Agent not found', 404, 'AGENT_NOT_FOUND');
  }

  const response: ApiResponse = {
    success: true,
    message: 'Agent profile fetched successfully',
    data: agent
  };

  res.status(200).json(response);
};

export const updateAgentProfile = async (req: Request, res: Response): Promise<void> => {
  const userId = req.userId!;
  const { full_name, phone, branch_location } = req.body;

  const updates: any = {};
  if (full_name) updates.full_name = full_name;
  if (phone) updates.phone = phone;

  if (Object.keys(updates).length > 0) {
    const { error: userUpdateError } = await supabaseAdmin
      .from('user_profiles')
      .update(updates)
      .eq('id', userId);

    if (userUpdateError) {
      throw new AppError('Failed to update user profile', 500, 'USER_UPDATE_ERROR');
    }
  }

  if (branch_location) {
    const { error: agentUpdateError } = await supabaseAdmin
      .from('agent_profiles')
      .update({ branch_location })
      .eq('user_id', userId);

    if (agentUpdateError) {
      throw new AppError('Failed to update agent profile', 500, 'AGENT_UPDATE_ERROR');
    }
  }

  // Get updated profile
  const { data: agent, error } = await supabaseAdmin
    .from('user_profiles')
    .select(`
      *,
      agent_profile:agent_profiles(*)
    `)
    .eq('id', userId)
    .single();

  if (error || !agent) {
    throw new AppError('Failed to fetch updated profile', 500, 'FETCH_ERROR');
  }

  const response: ApiResponse = {
    success: true,
    message: 'Agent profile updated successfully',
    data: agent
  };

  res.status(200).json(response);
};

export const getAgentBookings = async (req: Request, res: Response): Promise<void> => {
  const userId = req.userId!;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;

  const { data: bookings, error, count } = await supabaseAdmin
    .from('bookings')
    .select(`
      *,
      route:routes(*),
      user:user_profiles(*),
      payment:payments(*)
    `, { count: 'exact' })
    .eq('agent_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new AppError('Failed to fetch agent bookings', 500, 'FETCH_ERROR');
  }

  const response: ApiResponse = {
    success: true,
    message: 'Agent bookings fetched successfully',
    data: bookings || [],
    meta: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit)
    }
  };

  res.status(200).json(response);
};

export const getAgentCommission = async (req: Request, res: Response): Promise<void> => {
  const userId = req.userId!;
  const { start_date, end_date } = req.query;

  let query = supabaseAdmin
    .from('agent_commissions')
    .select('*')
    .eq('agent_id', userId);

  if (start_date) {
    query = query.gte('created_at', start_date);
  }

  if (end_date) {
    query = query.lte('created_at', end_date);
  }

  const { data: commissions, error } = await query
    .order('created_at', { ascending: false });

  if (error) {
    throw new AppError('Failed to fetch commission data', 500, 'FETCH_ERROR');
  }

  // Calculate total commission
  const totalCommission = commissions?.reduce((sum, commission) => sum + commission.commission_amount, 0) || 0;

  const response: ApiResponse = {
    success: true,
    message: 'Agent commission data fetched successfully',
    data: {
      commissions: commissions || [],
      total_commission: totalCommission,
      period: { start_date, end_date }
    }
  };

  res.status(200).json(response);
};

export const getAllAgents = async (req: Request, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;

  const { data: agents, error, count } = await supabaseAdmin
    .from('user_profiles')
    .select(`
      *,
      agent_profile:agent_profiles(*)
    `, { count: 'exact' })
    .eq('role', 'agent')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new AppError('Failed to fetch agents', 500, 'FETCH_ERROR');
  }

  const response: ApiResponse<UserProfile[]> = {
    success: true,
    message: 'Agents fetched successfully',
    data: agents || [],
    meta: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit)
    }
  };

  res.status(200).json(response);
};

export const approveAgent = async (req: Request, res: Response): Promise<void> => {
  const { agentId } = req.params;
  const { is_approved = true } = req.body;

  // Update agent profile
  const { error: agentError } = await supabaseAdmin
    .from('agent_profiles')
    .update({
      is_approved,
      status: is_approved ? 'active' : 'rejected'
    })
    .eq('user_id', agentId);

  if (agentError) {
    throw new AppError('Failed to update agent status', 500, 'AGENT_UPDATE_ERROR');
  }

  // Update user profile
  const { data: user, error: userError } = await supabaseAdmin
    .from('user_profiles')
    .update({
      is_active: is_approved,
      is_verified: is_approved
    })
    .eq('id', agentId)
    .select()
    .single();

  if (userError || !user) {
    throw new AppError('Failed to update user status', 500, 'USER_UPDATE_ERROR');
  }

  const response: ApiResponse = {
    success: true,
    message: `Agent ${is_approved ? 'approved' : 'rejected'} successfully`,
    data: user
  };

  res.status(200).json(response);
};

// Alias for route compatibility
export const registerAgent = agentRegister;

export const getAgentEarnings = async (req: Request, res: Response): Promise<void> => {
  const userId = req.userId!;
  const { start_date, end_date } = req.query;

  let query = supabaseAdmin
    .from('agent_commissions')
    .select('*')
    .eq('agent_id', userId);

  if (start_date) {
    query = query.gte('created_at', start_date);
  }

  if (end_date) {
    query = query.lte('created_at', end_date);
  }

  const { data: commissions, error } = await query
    .order('created_at', { ascending: false });

  if (error) {
    throw new AppError('Failed to fetch earnings', 500, 'FETCH_ERROR');
  }

  const totalEarnings = commissions?.reduce((sum, commission) => sum + commission.commission_amount, 0) || 0;

  const response: ApiResponse = {
    success: true,
    message: 'Agent earnings fetched successfully',
    data: {
      earnings: commissions || [],
      total_earnings: totalEarnings,
      period: { start_date, end_date }
    }
  };

  res.status(200).json(response);
};

export const getAgentAnalytics = async (req: Request, res: Response): Promise<void> => {
  const userId = req.userId!;

  // Get agent profile with stats
  const { data: agentProfile, error: agentError } = await supabaseAdmin
    .from('agent_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (agentError || !agentProfile) {
    throw new AppError('Agent profile not found', 404, 'AGENT_NOT_FOUND');
  }

  // Get booking stats
  const { data: bookings, error: bookingError } = await supabaseAdmin
    .from('bookings')
    .select('status, total_amount, created_at')
    .eq('agent_id', userId);

  if (bookingError) {
    throw new AppError('Failed to fetch booking stats', 500, 'FETCH_ERROR');
  }

  const response: ApiResponse = {
    success: true,
    message: 'Agent analytics fetched successfully',
    data: {
      profile: agentProfile,
      booking_stats: {
        total_bookings: bookings?.length || 0,
        total_revenue: bookings?.reduce((sum, booking) => sum + booking.total_amount, 0) || 0,
        bookings_by_status: bookings?.reduce((acc: any, booking) => {
          acc[booking.status] = (acc[booking.status] || 0) + 1;
          return acc;
        }, {})
      }
    }
  };

  res.status(200).json(response);
};

export const getAgentById = async (req: Request, res: Response): Promise<void> => {
  const { agentId } = req.params;

  const { data: agent, error } = await supabaseAdmin
    .from('user_profiles')
    .select(`
      *,
      agent_profile:agent_profiles(*)
    `)
    .eq('id', agentId)
    .eq('role', 'agent')
    .single();

  if (error || !agent) {
    throw new AppError('Agent not found', 404, 'AGENT_NOT_FOUND');
  }

  const response: ApiResponse = {
    success: true,
    message: 'Agent fetched successfully',
    data: agent
  };

  res.status(200).json(response);
};

export const verifyAgent = async (req: Request, res: Response): Promise<void> => {
  const { agentId } = req.params;
  const { is_verified = true } = req.body;

  const { data: user, error } = await supabaseAdmin
    .from('user_profiles')
    .update({ is_verified })
    .eq('id', agentId)
    .eq('role', 'agent')
    .select()
    .single();

  if (error || !user) {
    throw new AppError('Agent not found', 404, 'AGENT_NOT_FOUND');
  }

  const response: ApiResponse = {
    success: true,
    message: `Agent ${is_verified ? 'verified' : 'unverified'} successfully`,
    data: user
  };

  res.status(200).json(response);
};

export const updateAgentStatus = async (req: Request, res: Response): Promise<void> => {
  const { agentId } = req.params;
  const { is_active, status } = req.body;

  const userUpdates: any = {};
  const agentUpdates: any = {};

  if (typeof is_active === 'boolean') {
    userUpdates.is_active = is_active;
  }

  if (status) {
    agentUpdates.status = status;
  }

  // Update user profile
  if (Object.keys(userUpdates).length > 0) {
    const { error: userError } = await supabaseAdmin
      .from('user_profiles')
      .update(userUpdates)
      .eq('id', agentId);

    if (userError) {
      throw new AppError('Failed to update user status', 500, 'UPDATE_ERROR');
    }
  }

  // Update agent profile
  if (Object.keys(agentUpdates).length > 0) {
    const { error: agentError } = await supabaseAdmin
      .from('agent_profiles')
      .update(agentUpdates)
      .eq('user_id', agentId);

    if (agentError) {
      throw new AppError('Failed to update agent status', 500, 'UPDATE_ERROR');
    }
  }

  // Get updated agent
  const { data: agent, error } = await supabaseAdmin
    .from('user_profiles')
    .select(`
      *,
      agent_profile:agent_profiles(*)
    `)
    .eq('id', agentId)
    .single();

  if (error || !agent) {
    throw new AppError('Failed to fetch updated agent', 500, 'FETCH_ERROR');
  }

  const response: ApiResponse = {
    success: true,
    message: 'Agent status updated successfully',
    data: agent
  };

  res.status(200).json(response);
};

export const updateCommissionRate = async (req: Request, res: Response): Promise<void> => {
  const { agentId } = req.params;
  const { commission_rate } = req.body;

  if (typeof commission_rate !== 'number' || commission_rate < 0 || commission_rate > 100) {
    throw new AppError('Valid commission rate (0-100) is required', 400, 'INVALID_COMMISSION_RATE');
  }

  const { data: agentProfile, error } = await supabaseAdmin
    .from('agent_profiles')
    .update({ commission_rate })
    .eq('user_id', agentId)
    .select()
    .single();

  if (error || !agentProfile) {
    throw new AppError('Agent not found', 404, 'AGENT_NOT_FOUND');
  }

  const response: ApiResponse = {
    success: true,
    message: 'Commission rate updated successfully',
    data: agentProfile
  };

  res.status(200).json(response);
};
