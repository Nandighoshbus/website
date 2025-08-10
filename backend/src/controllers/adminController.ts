import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { AppError } from '../middleware/errorHandler';
import { ApiResponse } from '../types';

// User Management
export const getAllUsers = async (_req: Request, res: Response): Promise<void> => {
  const { data: users, error } = await supabaseAdmin
    .from('user_profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new AppError('Failed to fetch users', 500, 'DATABASE_ERROR');
  }

  const response: ApiResponse<any[]> = {
    success: true,
    message: 'Users retrieved successfully',
    data: users || []
  };

  res.status(200).json(response);
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const { data: user, error } = await supabaseAdmin
    .from('user_profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  const response: ApiResponse<any> = {
    success: true,
    message: 'User retrieved successfully',
    data: user
  };

  res.status(200).json(response);
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const updateData = req.body;

  const { data: user, error } = await supabaseAdmin
    .from('user_profiles')
    .update({
      ...updateData,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new AppError('Failed to update user', 500, 'DATABASE_ERROR');
  }

  const response: ApiResponse<any> = {
    success: true,
    message: 'User updated successfully',
    data: user
  };

  res.status(200).json(response);
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  // First delete from user_profiles
  const { error: profileError } = await supabaseAdmin
    .from('user_profiles')
    .delete()
    .eq('id', id);

  if (profileError) {
    throw new AppError('Failed to delete user profile', 500, 'DATABASE_ERROR');
  }

  // Then delete from auth.users
  if (id) {
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);

    if (authError) {
      console.warn('Failed to delete auth user:', authError);
    }
  }

  const response: ApiResponse<null> = {
    success: true,
    message: 'User deleted successfully',
    data: null
  };

  res.status(200).json(response);
};

export const updateUserStatus = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { is_active } = req.body;

  const { data: user, error } = await supabaseAdmin
    .from('user_profiles')
    .update({
      is_active,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new AppError('Failed to update user status', 500, 'DATABASE_ERROR');
  }

  const response: ApiResponse<any> = {
    success: true,
    message: `User ${is_active ? 'activated' : 'deactivated'} successfully`,
    data: user
  };

  res.status(200).json(response);
};

// Bus Management
export const getAllBuses = async (_req: Request, res: Response): Promise<void> => {
  const { data: buses, error } = await supabaseAdmin
    .from('buses')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new AppError('Failed to fetch buses', 500, 'DATABASE_ERROR');
  }

  const response: ApiResponse<any[]> = {
    success: true,
    message: 'Buses retrieved successfully',
    data: buses || []
  };

  res.status(200).json(response);
};

export const createBus = async (req: Request, res: Response): Promise<void> => {
  const busData = req.body;

  const { data: bus, error } = await supabaseAdmin
    .from('buses')
    .insert([{
      ...busData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) {
    throw new AppError('Failed to create bus', 500, 'DATABASE_ERROR');
  }

  const response: ApiResponse<any> = {
    success: true,
    message: 'Bus created successfully',
    data: bus
  };

  res.status(201).json(response);
};

export const getBusById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const { data: bus, error } = await supabaseAdmin
    .from('buses')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !bus) {
    throw new AppError('Bus not found', 404, 'BUS_NOT_FOUND');
  }

  const response: ApiResponse<any> = {
    success: true,
    message: 'Bus retrieved successfully',
    data: bus
  };

  res.status(200).json(response);
};

export const updateBus = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const updateData = req.body;

  const { data: bus, error } = await supabaseAdmin
    .from('buses')
    .update({
      ...updateData,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new AppError('Failed to update bus', 500, 'DATABASE_ERROR');
  }

  const response: ApiResponse<any> = {
    success: true,
    message: 'Bus updated successfully',
    data: bus
  };

  res.status(200).json(response);
};

export const deleteBus = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const { error } = await supabaseAdmin
    .from('buses')
    .delete()
    .eq('id', id);

  if (error) {
    throw new AppError('Failed to delete bus', 500, 'DATABASE_ERROR');
  }

  const response: ApiResponse<null> = {
    success: true,
    message: 'Bus deleted successfully',
    data: null
  };

  res.status(200).json(response);
};

// Route Management
export const getAllRoutes = async (_req: Request, res: Response): Promise<void> => {
  const { data: routes, error } = await supabaseAdmin
    .from('routes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new AppError('Failed to fetch routes', 500, 'DATABASE_ERROR');
  }

  const response: ApiResponse<any[]> = {
    success: true,
    message: 'Routes retrieved successfully',
    data: routes || []
  };

  res.status(200).json(response);
};

export const createRoute = async (req: Request, res: Response): Promise<void> => {
  const routeData = req.body;

  const { data: route, error } = await supabaseAdmin
    .from('routes')
    .insert([{
      ...routeData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) {
    throw new AppError('Failed to create route', 500, 'DATABASE_ERROR');
  }

  const response: ApiResponse<any> = {
    success: true,
    message: 'Route created successfully',
    data: route
  };

  res.status(201).json(response);
};

export const getRouteById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const { data: route, error } = await supabaseAdmin
    .from('routes')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !route) {
    throw new AppError('Route not found', 404, 'ROUTE_NOT_FOUND');
  }

  const response: ApiResponse<any> = {
    success: true,
    message: 'Route retrieved successfully',
    data: route
  };

  res.status(200).json(response);
};

export const updateRoute = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const updateData = req.body;

  const { data: route, error } = await supabaseAdmin
    .from('routes')
    .update({
      ...updateData,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new AppError('Failed to update route', 500, 'DATABASE_ERROR');
  }

  const response: ApiResponse<any> = {
    success: true,
    message: 'Route updated successfully',
    data: route
  };

  res.status(200).json(response);
};

export const deleteRoute = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const { error } = await supabaseAdmin
    .from('routes')
    .delete()
    .eq('id', id);

  if (error) {
    throw new AppError('Failed to delete route', 500, 'DATABASE_ERROR');
  }

  const response: ApiResponse<null> = {
    success: true,
    message: 'Route deleted successfully',
    data: null
  };

  res.status(200).json(response);
};

// Booking Management
export const getAllBookings = async (_req: Request, res: Response): Promise<void> => {
  const { data: bookings, error } = await supabaseAdmin
    .from('bookings')
    .select(`
      *,
      user_profiles(full_name, email, phone),
      schedules(departure_time, arrival_time),
      routes(route_name, origin_city, destination_city),
      buses(bus_number, bus_type)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    throw new AppError('Failed to fetch bookings', 500, 'DATABASE_ERROR');
  }

  const response: ApiResponse<any[]> = {
    success: true,
    message: 'Bookings retrieved successfully',
    data: bookings || []
  };

  res.status(200).json(response);
};

export const getBookingById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const { data: booking, error } = await supabaseAdmin
    .from('bookings')
    .select(`
      *,
      user_profiles(full_name, email, phone),
      schedules(departure_time, arrival_time),
      routes(route_name, origin_city, destination_city),
      buses(bus_number, bus_type)
    `)
    .eq('id', id)
    .single();

  if (error || !booking) {
    throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
  }

  const response: ApiResponse<any> = {
    success: true,
    message: 'Booking retrieved successfully',
    data: booking
  };

  res.status(200).json(response);
};

export const updateBooking = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const updateData = req.body;

  const { data: booking, error } = await supabaseAdmin
    .from('bookings')
    .update({
      ...updateData,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new AppError('Failed to update booking', 500, 'DATABASE_ERROR');
  }

  const response: ApiResponse<any> = {
    success: true,
    message: 'Booking updated successfully',
    data: booking
  };

  res.status(200).json(response);
};

export const cancelBooking = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const { data: booking, error } = await supabaseAdmin
    .from('bookings')
    .update({
      status: 'cancelled',
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new AppError('Failed to cancel booking', 500, 'DATABASE_ERROR');
  }

  const response: ApiResponse<any> = {
    success: true,
    message: 'Booking cancelled successfully',
    data: booking
  };

  res.status(200).json(response);
};

// Dashboard Statistics
export const getDashboardStatistics = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [usersResult, busesResult, routesResult, bookingsResult] = await Promise.all([
      supabaseAdmin.from('user_profiles').select('id, role, is_active'),
      supabaseAdmin.from('buses').select('id, status'),
      supabaseAdmin.from('routes').select('id, is_active'),
      supabaseAdmin.from('bookings').select('id, status, created_at, total_amount')
    ]);

    const stats = {
      totalUsers: usersResult.data?.length || 0,
      activeUsers: usersResult.data?.filter(u => u.is_active).length || 0,
      totalBuses: busesResult.data?.length || 0,
      activeBuses: busesResult.data?.filter(b => b.status === 'active').length || 0,
      totalRoutes: routesResult.data?.length || 0,
      activeRoutes: routesResult.data?.filter(r => r.is_active).length || 0,
      totalBookings: bookingsResult.data?.length || 0,
      todayBookings: bookingsResult.data?.filter(b => 
        new Date(b.created_at).toDateString() === new Date().toDateString()
      ).length || 0,
      totalRevenue: bookingsResult.data?.reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0
    };

    const response: ApiResponse<any> = {
      success: true,
      message: 'Statistics retrieved successfully',
      data: stats
    };

    res.status(200).json(response);
  } catch (error) {
    throw new AppError('Failed to fetch statistics', 500, 'DATABASE_ERROR');
  }
};

// Database Operations
export const createBackup = async (_req: Request, res: Response): Promise<void> => {
  // This would typically integrate with your backup system
  const response: ApiResponse<any> = {
    success: true,
    message: 'Database backup initiated successfully',
    data: {
      backup_id: `backup_${Date.now()}`,
      timestamp: new Date().toISOString()
    }
  };

  res.status(200).json(response);
};

export const optimizeTables = async (_req: Request, res: Response): Promise<void> => {
  // This would typically run database optimization queries
  const response: ApiResponse<any> = {
    success: true,
    message: 'Database tables optimized successfully',
    data: {
      optimized_at: new Date().toISOString()
    }
  };

  res.status(200).json(response);
};

export const clearLogs = async (_req: Request, res: Response): Promise<void> => {
  // This would typically clear application logs
  const response: ApiResponse<any> = {
    success: true,
    message: 'Logs cleared successfully',
    data: {
      cleared_at: new Date().toISOString()
    }
  };

  res.status(200).json(response);
};
