import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { AppError } from '../middleware/errorHandler';
import { ApiResponse } from '../types';

// Get customer profile
export const getCustomerProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;

    const { data: user, error } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    const response: ApiResponse = {
      success: true,
      message: 'Profile retrieved successfully',
      data: user
    };

    res.status(200).json(response);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to retrieve profile'
    });
  }
};

// Update customer profile
export const updateCustomerProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { full_name, phone } = req.body;

    const updates: any = {};
    if (full_name) updates.full_name = full_name;
    if (phone) updates.phone = phone;
    updates.updated_at = new Date().toISOString();

    const { data: user, error } = await supabaseAdmin
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error || !user) {
      throw new AppError('Failed to update profile', 400, 'UPDATE_FAILED');
    }

    const response: ApiResponse = {
      success: true,
      message: 'Profile updated successfully',
      data: user
    };

    res.status(200).json(response);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to update profile'
    });
  }
};

// Get customer booking history
export const getBookingHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    // Get bookings with related data
    const { data: bookings, error, count } = await supabaseAdmin
      .from('bookings')
      .select(`
        *,
        schedules:schedule_id (
          departure_time,
          arrival_time,
          routes:route_id (
            name,
            source_city,
            destination_city
          ),
          buses:bus_id (
            bus_number,
            bus_name
          )
        ),
        passengers (
          passenger_name,
          seat_number
        )
      `, { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new AppError('Failed to fetch booking history', 500, 'FETCH_ERROR');
    }

    // Transform the data for frontend consumption
    const transformedBookings = bookings?.map(booking => ({
      id: booking.id,
      booking_reference: booking.booking_reference,
      route_name: booking.schedules?.routes?.name || 'Unknown Route',
      source: booking.schedules?.routes?.source_city || 'Unknown',
      destination: booking.schedules?.routes?.destination_city || 'Unknown',
      journey_date: booking.journey_date,
      departure_time: booking.schedules?.departure_time || 'Unknown',
      arrival_time: booking.schedules?.arrival_time || 'Unknown',
      seat_numbers: booking.passengers?.map((p: any) => p.seat_number) || [],
      total_amount: booking.total_amount,
      booking_status: booking.booking_status,
      payment_status: booking.payment_status,
      passenger_count: booking.passenger_count,
      bus_number: booking.schedules?.buses?.bus_number || 'Unknown',
      created_at: booking.created_at
    })) || [];

    const response: ApiResponse = {
      success: true,
      message: 'Booking history retrieved successfully',
      data: transformedBookings,
      meta: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    };

    res.status(200).json(response);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to retrieve booking history'
    });
  }
};

// Get booking details by ID
export const getBookingDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { bookingId } = req.params;

    const { data: booking, error } = await supabaseAdmin
      .from('bookings')
      .select(`
        *,
        schedules:schedule_id (
          departure_time,
          arrival_time,
          routes:route_id (
            name,
            source_city,
            destination_city,
            distance_km
          ),
          buses:bus_id (
            bus_number,
            bus_name,
            bus_type,
            amenities
          )
        ),
        passengers (
          passenger_name,
          passenger_age,
          passenger_gender,
          seat_number,
          id_proof_type,
          id_proof_number
        )
      `)
      .eq('id', bookingId)
      .eq('user_id', userId)
      .single();

    if (error || !booking) {
      throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
    }

    const response: ApiResponse = {
      success: true,
      message: 'Booking details retrieved successfully',
      data: booking
    };

    res.status(200).json(response);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to retrieve booking details'
    });
  }
};

// Cancel booking
export const cancelBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { bookingId } = req.params;
    const { cancellation_reason } = req.body;

    // Get booking details
    const { data: booking, error: fetchError } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !booking) {
      throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
    }

    if (booking.booking_status === 'cancelled') {
      throw new AppError('Booking is already cancelled', 400, 'ALREADY_CANCELLED');
    }

    // Check if cancellation is allowed (e.g., not too close to departure)
    const journeyDateTime = new Date(`${booking.journey_date}T${booking.departure_time || '00:00:00'}`);
    const now = new Date();
    const hoursUntilDeparture = (journeyDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilDeparture < 2) {
      throw new AppError('Cancellation not allowed within 2 hours of departure', 400, 'CANCELLATION_NOT_ALLOWED');
    }

    // Calculate refund amount based on cancellation policy
    let refundPercentage = 0;
    if (hoursUntilDeparture >= 24) refundPercentage = 90;
    else if (hoursUntilDeparture >= 12) refundPercentage = 75;
    else if (hoursUntilDeparture >= 6) refundPercentage = 50;
    else if (hoursUntilDeparture >= 2) refundPercentage = 25;

    const refundAmount = (booking.total_amount * refundPercentage) / 100;

    // Update booking status
    const { data: updatedBooking, error: updateError } = await supabaseAdmin
      .from('bookings')
      .update({
        booking_status: 'cancelled',
        cancellation_reason,
        cancelled_at: new Date().toISOString(),
        refund_amount: refundAmount,
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId)
      .select()
      .single();

    if (updateError || !updatedBooking) {
      throw new AppError('Failed to cancel booking', 500, 'CANCELLATION_FAILED');
    }

    // TODO: Process refund if applicable
    // TODO: Send cancellation confirmation email

    const response: ApiResponse = {
      success: true,
      message: 'Booking cancelled successfully',
      data: {
        booking: updatedBooking,
        refund_amount: refundAmount,
        refund_percentage: refundPercentage
      }
    };

    res.status(200).json(response);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to cancel booking'
    });
  }
};

// Get dashboard statistics
export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;

    // Get total bookings count
    const { count: totalBookings } = await supabaseAdmin
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Get total amount spent
    const { data: bookings } = await supabaseAdmin
      .from('bookings')
      .select('total_amount')
      .eq('user_id', userId)
      .eq('payment_status', 'paid');

    const totalSpent = bookings?.reduce((sum, booking) => sum + (booking.total_amount || 0), 0) || 0;

    // Get upcoming bookings count
    const { count: upcomingBookings } = await supabaseAdmin
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('booking_status', 'confirmed')
      .gte('journey_date', new Date().toISOString().split('T')[0]);

    const response: ApiResponse = {
      success: true,
      message: 'Dashboard statistics retrieved successfully',
      data: {
        total_bookings: totalBookings || 0,
        total_spent: totalSpent,
        upcoming_bookings: upcomingBookings || 0
      }
    };

    res.status(200).json(response);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to retrieve dashboard statistics'
    });
  }
};
