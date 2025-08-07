import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { AppError } from '../middleware/errorHandler';
import { ApiResponse, UserProfile } from '../types';

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  const userId = req.userId!;

  const { data: user, error } = await supabaseAdmin
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  const response: ApiResponse<UserProfile> = {
    success: true,
    message: 'Profile fetched successfully',
    data: user
  };

  res.status(200).json(response);
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  const userId = req.userId!;
  const { full_name, phone, date_of_birth, gender, avatar_url, address, emergency_contact, preferences } = req.body;

  const updates: any = {};
  if (full_name) updates.full_name = full_name;
  if (phone) updates.phone = phone;
  if (date_of_birth) updates.date_of_birth = date_of_birth;
  if (gender) updates.gender = gender;
  if (avatar_url) updates.avatar_url = avatar_url;
  if (address) updates.address = address;
  if (emergency_contact) updates.emergency_contact = emergency_contact;
  if (preferences) updates.preferences = preferences;

  if (Object.keys(updates).length === 0) {
    throw new AppError('No valid updates provided', 400, 'NO_UPDATES');
  }

  // Check if phone number is already taken by another user
  if (phone) {
    const { data: existingUser } = await supabaseAdmin
      .from('user_profiles')
      .select('id')
      .eq('phone', phone)
      .neq('id', userId)
      .single();

    if (existingUser) {
      throw new AppError('Phone number already exists', 409, 'PHONE_EXISTS');
    }
  }

  const { data: user, error } = await supabaseAdmin
    .from('user_profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error || !user) {
    throw new AppError('Failed to update profile', 500, 'UPDATE_ERROR');
  }

  const response: ApiResponse<UserProfile> = {
    success: true,
    message: 'Profile updated successfully',
    data: user
  };

  res.status(200).json(response);
};

export const deleteAccount = async (req: Request, res: Response): Promise<void> => {
  const userId = req.userId!;

  // Check if user has any active bookings
  const { data: activeBookings } = await supabaseAdmin
    .from('bookings')
    .select('id')
    .eq('user_id', userId)
    .in('status', ['pending', 'confirmed']);

  if (activeBookings && activeBookings.length > 0) {
    throw new AppError('Cannot delete account with active bookings', 400, 'ACTIVE_BOOKINGS_EXIST');
  }

  // Deactivate user instead of deleting
  const { error } = await supabaseAdmin
    .from('user_profiles')
    .update({ is_active: false })
    .eq('id', userId);

  if (error) {
    throw new AppError('Failed to delete account', 500, 'DELETE_ERROR');
  }

  // Also disable in Supabase Auth
  await supabaseAdmin.auth.admin.updateUserById(userId, {
    ban_duration: 'none',
    user_metadata: { account_deleted: true }
  });

  const response: ApiResponse = {
    success: true,
    message: 'Account deleted successfully'
  };

  res.status(200).json(response);
};

export const getUserBookings = async (req: Request, res: Response): Promise<void> => {
  const userId = req.userId!;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;

  const { data: bookings, error, count } = await supabaseAdmin
    .from('bookings')
    .select(`
      *,
      route:routes(*),
      bus:buses(*),
      payment:payments(*)
    `, { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new AppError('Failed to fetch bookings', 500, 'FETCH_ERROR');
  }

  const response: ApiResponse = {
    success: true,
    message: 'Bookings fetched successfully',
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

export const getUserPayments = async (req: Request, res: Response): Promise<void> => {
  const userId = req.userId!;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;

  const { data: payments, error, count } = await supabaseAdmin
    .from('payments')
    .select(`
      *,
      booking:bookings(*)
    `, { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new AppError('Failed to fetch payments', 500, 'FETCH_ERROR');
  }

  const response: ApiResponse = {
    success: true,
    message: 'Payments fetched successfully',
    data: payments || [],
    meta: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit)
    }
  };

  res.status(200).json(response);
};

export const getBookingDetails = async (req: Request, res: Response): Promise<void> => {
  const { bookingId } = req.params;
  const userId = req.userId!;

  const { data: booking, error } = await supabaseAdmin
    .from('bookings')
    .select(`
      *,
      route:routes(*),
      payment:payments(*)
    `)
    .eq('id', bookingId)
    .eq('user_id', userId)
    .single();

  if (error || !booking) {
    throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
  }

  const response: ApiResponse = {
    success: true,
    message: 'Booking details fetched successfully',
    data: booking
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

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params;

  const { data: user, error } = await supabaseAdmin
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  const response: ApiResponse<UserProfile> = {
    success: true,
    message: 'User fetched successfully',
    data: user
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
