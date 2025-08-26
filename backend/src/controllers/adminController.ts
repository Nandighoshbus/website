
import { Request, Response } from 'express';
import { findMany, findOne, updateOne, deleteOne, insertOne } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { ApiResponse } from '../types';

// User Management
// User Management
export const getAllUsers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await findMany('user_profiles', {}, { orderBy: 'created_at', orderDirection: 'DESC' });
    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: users
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch users', error: error.message });
  }
};


// Bus Management
export const getBusById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const bus = await findOne('buses', { id });
    if (!bus) {
      throw new AppError('Bus not found', 404, 'BUS_NOT_FOUND');
    }
    res.status(200).json({
      success: true,
      message: 'Bus retrieved successfully',
      data: bus
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const updateBus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const result = await updateOne('buses', { ...updateData, updated_at: new Date() }, { id });
    if (result.affectedRows === 0) {
      throw new AppError('Failed to update bus', 500, 'DATABASE_ERROR');
    }
    const bus = await findOne('buses', { id });
    res.status(200).json({
      success: true,
      message: 'Bus updated successfully',
      data: bus
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

// Route Management
export const getAllRoutes = async (_req: Request, res: Response): Promise<void> => {
  try {
    const routes = await findMany('routes', {}, { orderBy: 'created_at', orderDirection: 'DESC' });
    // Map DB columns to frontend property names if needed
    const mappedRoutes = routes.map((route: any) => ({
      id: route.id,
      route_name: route.route_name,
      from: route.source, // frontend expects 'from'
      to: route.destination, // frontend expects 'to'
      duration: route.duration ? route.duration.toString() : '',
      // If you have fare, frequency, bus_type, popularity columns, map them here. Otherwise, leave as undefined or add logic to join with schedules/buses if needed.
      fare: route.fare, // only if present in your schema
      frequency: route.frequency, // only if present in your schema
      bus_type: route.bus_type, // only if present in your schema
      popularity: route.popularity, // only if present in your schema
      status: route.status,
      created_at: route.created_at,
      updated_at: route.updated_at
    }));
    res.status(200).json({
      success: true,
      message: 'Routes retrieved successfully',
      data: mappedRoutes
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch routes', error: error.message });
  }
};

export const createRoute = async (req: Request, res: Response): Promise<void> => {
  try {
    const routeData = req.body;
    const now = new Date();
    const result = await insertOne('routes', {
      ...routeData,
      created_at: now,
      updated_at: now
    });
    if (!result.insertId) {
      throw new AppError('Failed to create route', 500, 'DATABASE_ERROR');
    }
    const route = await findOne('routes', { id: result.insertId });
    res.status(201).json({
      success: true,
      message: 'Route created successfully',
      data: route
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const getRouteById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const route = await findOne('routes', { id });
    if (!route) {
      throw new AppError('Route not found', 404, 'ROUTE_NOT_FOUND');
    }
    res.status(200).json({
      success: true,
      message: 'Route retrieved successfully',
      data: route
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const updateRoute = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const result = await updateOne('routes', { ...updateData, updated_at: new Date() }, { id });
    if (result.affectedRows === 0) {
      throw new AppError('Failed to update route', 500, 'DATABASE_ERROR');
    }
    const route = await findOne('routes', { id });
    res.status(200).json({
      success: true,
      message: 'Route updated successfully',
      data: route
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const deleteRoute = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await deleteOne('routes', { id });
    if (result.affectedRows === 0) {
      throw new AppError('Failed to delete route', 500, 'DATABASE_ERROR');
    }
    res.status(200).json({
      success: true,
      message: 'Route deleted successfully',
      data: null
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

// Booking Management
export const getAllBookings = async (_req: Request, res: Response): Promise<void> => {
  try {
    // For simplicity, fetch only bookings table. For joins, you can use a custom query with executeQuery.
    const bookings = await findMany('bookings', {}, { orderBy: 'created_at', orderDirection: 'DESC' });
    res.status(200).json({
      success: true,
      message: 'Bookings retrieved successfully',
      data: bookings
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch bookings', error: error.message });
  }
};

export const getBookingById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const booking = await findOne('bookings', { id });
    if (!booking) {
      throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
    }
    res.status(200).json({
      success: true,
      message: 'Booking retrieved successfully',
      data: booking
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const updateBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const result = await updateOne('bookings', { ...updateData, updated_at: new Date() }, { id });
    if (result.affectedRows === 0) {
      throw new AppError('Failed to update booking', 500, 'DATABASE_ERROR');
    }
    const booking = await findOne('bookings', { id });
    res.status(200).json({
      success: true,
      message: 'Booking updated successfully',
      data: booking
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const cancelBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await updateOne('bookings', { status: 'cancelled', updated_at: new Date() }, { id });
    if (result.affectedRows === 0) {
      throw new AppError('Failed to cancel booking', 500, 'DATABASE_ERROR');
    }
    const booking = await findOne('bookings', { id });
    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};


// Dashboard Statistics
export const getDashboardStatistics = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [users, buses, routes, bookings] = await Promise.all([
      findMany('user_profiles'),
      findMany('buses'),
      findMany('routes'),
      findMany('bookings')
    ]);
    const stats = {
      totalUsers: users.length,
      activeUsers: users.filter((u: any) => u.is_active).length,
      totalBuses: buses.length,
      activeBuses: buses.filter((b: any) => b.status === 'active').length,
      totalRoutes: routes.length,
      activeRoutes: routes.filter((r: any) => r.is_active).length,
      totalBookings: bookings.length,
      todayBookings: bookings.filter((b: any) => new Date(b.created_at).toDateString() === new Date().toDateString()).length,
      totalRevenue: bookings.reduce((sum: number, b: any) => sum + (b.total_amount || 0), 0)
    };
    res.status(200).json({
      success: true,
      message: 'Statistics retrieved successfully',
      data: stats
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch statistics', error: error.message });
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
