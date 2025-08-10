import { Request, Response, NextFunction } from 'express';
import { BookingService } from '../services/BookingService';
import { AppError } from '../middleware/errorHandler';
import { ApiResponse, CreateBookingDto, Booking } from '../types';
import { Logger } from '../utils/logger';
import { supabaseAdmin } from '../config/supabase';

const bookingService = new BookingService();
const logger = Logger.getInstance();

/**
 * Create a new booking
 */
export const createBooking = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const startTime = Date.now();
  const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const requestLogger = logger.setRequestId(requestId);

  try {
    const userId = req.userId!;
    const bookingData: CreateBookingDto = req.body;

    requestLogger.info('Creating booking request received', {
      userId,
      routeId: bookingData.route_id,
      seatCount: bookingData.seat_numbers?.length
    });

    // Create booking using service layer
    const booking = await bookingService.createBooking(userId, bookingData);

    const duration = Date.now() - startTime;
    requestLogger.performance('create-booking-controller', duration, {
      bookingId: booking.id,
      success: true
    });

    const response: ApiResponse<typeof booking> = {
      success: true,
      message: 'Booking created successfully',
      data: booking
    };

    res.status(201).json(response);

  } catch (error: any) {
    const duration = Date.now() - startTime;
    requestLogger.error('Failed to create booking', {
      error: error.message,
      stack: error.stack,
      userId: req.userId,
      duration
    });
    
    next(error);
  }
};

export const getBookingById = async (req: Request, res: Response): Promise<void> => {
  const { bookingId } = req.params;
  const userId = req.userId!;
  const userRole = req.userRole!;

  let query = supabaseAdmin
    .from('bookings')
    .select(`
      *,
      route:routes(*),
      user:user_profiles(*),
      payment:payments(*)
    `)
    .eq('id', bookingId);

  // Only allow users to see their own bookings unless they're admin/agent
  if (!['admin', 'super_admin', 'agent'].includes(userRole)) {
    query = query.eq('user_id', userId);
  }

  const { data: booking, error } = await query.single();

  if (error || !booking) {
    throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
  }

  const response: ApiResponse<Booking> = {
    success: true,
    message: 'Booking fetched successfully',
    data: booking
  };

  res.status(200).json(response);
};

export const getAllBookings = async (req: Request, res: Response): Promise<void> => {
  const userId = req.userId!;
  const userRole = req.userRole!;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;

  let query = supabaseAdmin
    .from('bookings')
    .select(`
      *,
      route:routes(*),
      user:user_profiles(*),
      payment:payments(*)
    `, { count: 'exact' });

  // Filter by user for non-admin roles
  if (!['admin', 'super_admin', 'agent'].includes(userRole)) {
    query = query.eq('user_id', userId);
  }

  const { data: bookings, error, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new AppError('Failed to fetch bookings', 500, 'FETCH_ERROR');
  }

  const response: ApiResponse<Booking[]> = {
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

export const updateBookingStatus = async (req: Request, res: Response): Promise<void> => {
  const { bookingId } = req.params;
  const { status, cancellation_reason } = req.body;
  const userId = req.userId!;
  const userRole = req.userRole!;

  if (!status) {
    throw new AppError('Status is required', 400, 'MISSING_STATUS');
  }

  // Get current booking
  let query = supabaseAdmin
    .from('bookings')
    .select('*')
    .eq('id', bookingId);

  // Only allow users to update their own bookings unless they're admin/agent
  if (!['admin', 'super_admin', 'agent'].includes(userRole)) {
    query = query.eq('user_id', userId);
  }

  const { data: currentBooking, error: fetchError } = await query.single();

  if (fetchError || !currentBooking) {
    throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
  }

  // Validate status transition
  const validTransitions: Record<string, string[]> = {
    'pending': ['confirmed', 'cancelled'],
    'confirmed': ['completed', 'cancelled'],
    'cancelled': [], // Cannot change from cancelled
    'completed': [], // Cannot change from completed
    'refunded': [] // Cannot change from refunded
  };

  if (!validTransitions[currentBooking.status]?.includes(status)) {
    throw new AppError(`Cannot change status from ${currentBooking.status} to ${status}`, 400, 'INVALID_STATUS_TRANSITION');
  }

  const updates: any = { status };
  if (status === 'cancelled' && cancellation_reason) {
    updates.cancellation_reason = cancellation_reason;
  }

  const { data: booking, error } = await supabaseAdmin
    .from('bookings')
    .update(updates)
    .eq('id', bookingId)
    .select(`
      *,
      route:routes(*),
      user:user_profiles(*),
      payment:payments(*)
    `)
    .single();

  if (error || !booking) {
    throw new AppError('Failed to update booking status', 500, 'UPDATE_ERROR');
  }

  const response: ApiResponse<Booking> = {
    success: true,
    message: 'Booking status updated successfully',
    data: booking
  };

  res.status(200).json(response);
};

export const cancelBooking = async (req: Request, res: Response): Promise<void> => {
  const { bookingId } = req.params;
  const { cancellation_reason } = req.body;
  const userId = req.userId!;

  // Get booking
  const { data: booking, error: fetchError } = await supabaseAdmin
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .eq('user_id', userId)
    .single();

  if (fetchError || !booking) {
    throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
  }

  if (booking.status !== 'pending' && booking.status !== 'confirmed') {
    throw new AppError('Only pending or confirmed bookings can be cancelled', 400, 'CANNOT_CANCEL_BOOKING');
  }

  // Check if cancellation is allowed based on journey date
  const journeyDate = new Date(booking.journey_date);
  const now = new Date();
  const hoursUntilJourney = (journeyDate.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursUntilJourney < 2) {
    throw new AppError('Cannot cancel booking less than 2 hours before journey', 400, 'CANCELLATION_TIME_EXPIRED');
  }

  const { data: updatedBooking, error } = await supabaseAdmin
    .from('bookings')
    .update({
      status: 'cancelled',
      cancellation_reason: cancellation_reason || 'User cancelled'
    })
    .eq('id', bookingId)
    .select(`
      *,
      route:routes(*),
      user:user_profiles(*),
      payment:payments(*)
    `)
    .single();

  if (error || !updatedBooking) {
    throw new AppError('Failed to cancel booking', 500, 'CANCEL_ERROR');
  }

  const response: ApiResponse<Booking> = {
    success: true,
    message: 'Booking cancelled successfully',
    data: updatedBooking
  };

  res.status(200).json(response);
};

export const getBookingsByRoute = async (req: Request, res: Response): Promise<void> => {
  const { routeId } = req.params;
  const { journey_date } = req.query;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;

  let query = supabaseAdmin
    .from('bookings')
    .select(`
      *,
      route:routes(*),
      user:user_profiles(*),
      payment:payments(*)
    `, { count: 'exact' })
    .eq('route_id', routeId);

  if (journey_date) {
    query = query.eq('journey_date', journey_date);
  }

  const { data: bookings, error, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new AppError('Failed to fetch bookings', 500, 'FETCH_ERROR');
  }

  const response: ApiResponse<Booking[]> = {
    success: true,
    message: 'Route bookings fetched successfully',
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

export const searchBookings = async (req: Request, res: Response): Promise<void> => {
  const { booking_reference, status, journey_date_from, journey_date_to } = req.query;
  const userId = req.userId!;
  const userRole = req.userRole!;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;

  let query = supabaseAdmin
    .from('bookings')
    .select(`
      *,
      route:routes(*),
      user:user_profiles(*),
      payment:payments(*)
    `, { count: 'exact' });

  // Filter by user for non-admin roles
  if (!['admin', 'super_admin', 'agent'].includes(userRole)) {
    query = query.eq('user_id', userId);
  }

  if (booking_reference) {
    query = query.eq('booking_reference', booking_reference);
  }

  if (status) {
    query = query.eq('status', status);
  }

  if (journey_date_from) {
    query = query.gte('journey_date', journey_date_from);
  }

  if (journey_date_to) {
    query = query.lte('journey_date', journey_date_to);
  }

  const { data: bookings, error, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new AppError('Failed to search bookings', 500, 'SEARCH_ERROR');
  }

  const response: ApiResponse<Booking[]> = {
    success: true,
    message: 'Bookings searched successfully',
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

export const checkSeatAvailability = async (req: Request, res: Response): Promise<void> => {
  const { route_id, journey_date } = req.query;

  if (!route_id || !journey_date) {
    throw new AppError('Route ID and journey date are required', 400, 'MISSING_REQUIRED_FIELDS');
  }

  // Get route with bus details
  const { data: route, error: routeError } = await supabaseAdmin
    .from('routes')
    .select(`
      *,
      bus:buses(total_seats, seat_layout)
    `)
    .eq('id', route_id)
    .single();

  if (routeError || !route) {
    throw new AppError('Route not found', 404, 'ROUTE_NOT_FOUND');
  }

  // Get booked seats for the specific date
  const { data: bookings, error: bookingError } = await supabaseAdmin
    .from('bookings')
    .select('seat_numbers')
    .eq('route_id', route_id)
    .eq('journey_date', journey_date)
    .in('status', ['confirmed', 'pending']);

  if (bookingError) {
    throw new AppError('Failed to fetch booking information', 500, 'BOOKING_FETCH_ERROR');
  }

  // Calculate booked seats
  const bookedSeats: string[] = [];
  bookings?.forEach(booking => {
    if (booking.seat_numbers) {
      bookedSeats.push(...booking.seat_numbers);
    }
  });

  // Generate available seats
  const totalSeats = route.bus.total_seats;
  const allSeats = Array.from({ length: totalSeats }, (_, i) => `${i + 1}`);
  const availableSeats = allSeats.filter(seat => !bookedSeats.includes(seat));

  const response: ApiResponse = {
    success: true,
    message: 'Seat availability fetched successfully',
    data: {
      route_id,
      journey_date,
      total_seats: totalSeats,
      booked_seats: bookedSeats,
      available_seats: availableSeats,
      available_count: availableSeats.length,
      seat_layout: route.bus.seat_layout
    }
  };

  res.status(200).json(response);
};

export const getTicket = async (req: Request, res: Response): Promise<void> => {
  const { bookingId } = req.params;
  const userId = req.userId!;
  const userRole = req.userRole!;

  let query = supabaseAdmin
    .from('bookings')
    .select(`
      *,
      route:routes(*),
      user:user_profiles(*),
      payment:payments(*)
    `)
    .eq('id', bookingId);

  // Only allow users to see their own tickets unless they're admin/agent
  if (!['admin', 'super_admin', 'agent'].includes(userRole)) {
    query = query.eq('user_id', userId);
  }

  const { data: booking, error } = await query.single();

  if (error || !booking) {
    throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
  }

  if (booking.status !== 'confirmed' && booking.status !== 'completed') {
    throw new AppError('Ticket is only available for confirmed bookings', 400, 'BOOKING_NOT_CONFIRMED');
  }

  const response: ApiResponse = {
    success: true,
    message: 'Ticket fetched successfully',
    data: {
      ticket: {
        booking_reference: booking.booking_reference,
        passenger_details: booking.passenger_details,
        journey_date: booking.journey_date,
        seat_numbers: booking.seat_numbers,
        route: booking.route,
        total_amount: booking.total_amount,
        booking_status: booking.status,
        qr_code_data: `${booking.booking_reference}|${booking.journey_date}|${booking.seat_numbers.join(',')}`
      }
    }
  };

  res.status(200).json(response);
};

export const getBookingAnalytics = async (_req: Request, res: Response): Promise<void> => {
  // Get booking statistics
  const { data: bookings, error } = await supabaseAdmin
    .from('bookings')
    .select('status, total_amount, created_at, journey_date');

  if (error) {
    throw new AppError('Failed to fetch booking analytics', 500, 'FETCH_ERROR');
  }

  const analytics = {
    total_bookings: bookings?.length || 0,
    total_revenue: bookings?.reduce((sum, booking) => sum + booking.total_amount, 0) || 0,
    bookings_by_status: bookings?.reduce((acc: any, booking) => {
      acc[booking.status] = (acc[booking.status] || 0) + 1;
      return acc;
    }, {}),
    average_booking_value: bookings?.length ? 
      (bookings.reduce((sum, booking) => sum + booking.total_amount, 0) / bookings.length) : 0
  };

  const response: ApiResponse = {
    success: true,
    message: 'Booking analytics fetched successfully',
    data: analytics
  };

  res.status(200).json(response);
};

// Alias for agent bookings
export const getAgentBookings = getAllBookings;
