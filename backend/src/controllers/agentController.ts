import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { AppError } from '../middleware/errorHandler';
import { ApiResponse } from '../types';

// Get agent dashboard stats
export const getAgentStats = async (req: Request, res: Response): Promise<void> => {
  console.log('=== AGENT CONTROLLER - getAgentStats CALLED ===');
  console.log('Request user:', req.user);
  console.log('Request userId:', req.userId);
  console.log('Request userRole:', req.userRole);
  
  const agentId = req.userId; // This is already the agent ID from auth middleware

  if (!agentId) {
    console.log('ERROR: No agentId found in request');
    throw new AppError('Agent authentication required', 401, 'UNAUTHORIZED');
  }

  try {
    // Verify agent exists and get basic info
    const { data: agent, error: agentError } = await supabaseAdmin
      .from('agents')
      .select('id, is_active')
      .eq('id', agentId)
      .single();

    if (agentError || !agent) {
      console.log('Agent not found with ID:', agentId, 'Error:', agentError);
      throw new AppError('Agent not found', 404, 'AGENT_NOT_FOUND');
    }

    if (!agent.is_active) {
      throw new AppError('Agent account is inactive', 403, 'AGENT_INACTIVE');
    }

    // Get total bookings
    const { data: totalBookings } = await supabaseAdmin
      .from('bookings')
      .select('id', { count: 'exact' })
      .eq('agent_id', agentId);

    // Get monthly bookings
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
    const { data: monthlyBookings } = await supabaseAdmin
      .from('bookings')
      .select('id', { count: 'exact' })
      .eq('agent_id', agentId)
      .gte('journey_date', `${currentMonth}-01`);

    // Get total commission
    const { data: totalCommission } = await supabaseAdmin
      .from('agent_earnings')
      .select('commission_amount')
      .eq('agent_id', agentId);

    // Get monthly commission
    const { data: monthlyCommission } = await supabaseAdmin
      .from('agent_earnings')
      .select('commission_amount')
      .eq('agent_id', agentId)
      .gte('earning_date', `${currentMonth}-01`);

    const stats = {
      totalBookings: totalBookings?.length || 0,
      monthlyBookings: monthlyBookings?.length || 0,
      totalCommission: totalCommission?.reduce((sum, earning) => sum + parseFloat(earning.commission_amount), 0) || 0,
      monthlyCommission: monthlyCommission?.reduce((sum, earning) => sum + parseFloat(earning.commission_amount), 0) || 0,
      activeRoutes: 0 // TODO: Calculate based on agent's active routes
    };

    const response: ApiResponse = {
      success: true,
      message: 'Agent stats retrieved successfully',
      data: stats
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching agent stats:', error);
    throw error;
  }
};

// Get available routes for booking
export const getAvailableRoutes = async (_req: Request, res: Response): Promise<void> => {
  try {
    console.log('Fetching routes from database...');
    
    // First, get routes from the main routes table
    const { data: routes, error: routesError } = await supabaseAdmin
      .from('routes')
      .select(`
        id,
        route_code,
        name,
        source_city,
        destination_city,
        distance_km,
        estimated_duration,
        base_fare,
        is_active
      `)
      .eq('is_active', true);

    console.log('Routes query result:', { routes, error: routesError });

    if (routesError) {
      console.error('Routes error:', routesError);
      throw new AppError(`Failed to fetch routes: ${routesError.message}`, 500, 'DATABASE_ERROR');
    }

    if (!routes || routes.length === 0) {
      console.log('No routes found in database');
      const response: ApiResponse = {
        success: true,
        message: 'No routes available',
        data: []
      };
      res.status(200).json(response);
      return;
    }

    // Get schedules for these routes (if schedules table exists)
    let schedulesData: any[] = [];
    try {
      const { data: schedules, error: schedulesError } = await supabaseAdmin
        .from('schedules')
        .select(`
          id,
          route_id,
          bus_id,
          departure_time,
          arrival_time,
          fare,
          operating_days,
          is_active,
          buses (
            id,
            bus_number,
            bus_type,
            total_seats,
            amenities
          )
        `)
        .eq('is_active', true);

      if (!schedulesError && schedules) {
        schedulesData = schedules;
      }
    } catch (scheduleError) {
      console.log('Schedules table not available yet, using routes only');
    }

    // Combine routes with their schedules
    const routesWithSchedules = routes?.map(route => ({
      ...route,
      schedules: schedulesData.filter(schedule => schedule.route_id === route.id)
    })) || [];

    const response: ApiResponse = {
      success: true,
      message: 'Routes retrieved successfully',
      data: routesWithSchedules
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching routes:', error);
    throw error;
  }
};

// Create a new booking
export const createBooking = async (req: Request, res: Response): Promise<void> => {
  const {
    scheduleId,
    passengers,
    journeyDate,
    seatNumbers,
    paymentMethod,
    contactDetails
  } = req.body;

  // Get agent ID from authenticated user
  const agentId = req.userId; // This is already the agent ID from auth middleware
  
  try {
    // Get agent details
    const { data: agent, error: agentError } = await supabaseAdmin
      .from('agents')
      .select('id, commission_rate')
      .eq('id', agentId)
      .single();

    if (agentError || !agent) {
      throw new AppError('Agent not found', 404, 'AGENT_NOT_FOUND');
    }

    // Get schedule details for pricing
    const { data: schedule, error: scheduleError } = await supabaseAdmin
      .from('schedules')
      .select(`
        *,
        routes (base_fare, name, source_city, destination_city),
        buses (bus_number, bus_type)
      `)
      .eq('id', scheduleId)
      .single();

    if (scheduleError || !schedule) {
      throw new AppError('Schedule not found', 404, 'SCHEDULE_NOT_FOUND');
    }

    // Create or get passengers
    const passengerIds: string[] = [];
    
    for (const passengerDetails of passengers) {
      let passengerId;
      const { data: existingPassenger } = await supabaseAdmin
        .from('passengers')
        .select('id')
        .eq('phone', passengerDetails.phone)
        .single();

      if (existingPassenger) {
        passengerId = existingPassenger.id;
      } else {
        const { data: newPassenger, error: passengerError } = await supabaseAdmin
          .from('passengers')
          .insert([{
            full_name: passengerDetails.fullName,
            phone: passengerDetails.phone,
            email: passengerDetails.email,
            age: passengerDetails.age,
            gender: passengerDetails.gender,
            id_proof_type: passengerDetails.idProofType,
            id_proof_number: passengerDetails.idProofNumber
          }])
          .select('id')
          .single();

        if (passengerError || !newPassenger) {
          throw new AppError('Failed to create passenger record', 500, 'PASSENGER_CREATE_ERROR');
        }
        passengerId = newPassenger.id;
      }
      passengerIds.push(passengerId);
    }

    // Calculate pricing
    const baseFare = parseFloat(schedule.fare);
    const totalSeats = seatNumbers.length;
    const totalAmount = baseFare * totalSeats;
    const agentCommission = (totalAmount * parseFloat(agent.commission_rate)) / 100;

    // Generate booking reference
    const bookingReference = `BK${Date.now().toString().slice(-8)}`;

    // Create bookings for each passenger
    const bookings = [];
    for (let i = 0; i < passengerIds.length; i++) {
      const { data: booking, error: bookingError } = await supabaseAdmin
        .from('bookings')
        .insert([{
          booking_reference: `${bookingReference}-${i + 1}`,
          schedule_id: scheduleId,
          passenger_id: passengerIds[i],
          agent_id: agent.id,
          journey_date: journeyDate,
          seat_numbers: [seatNumbers[i]], // Individual seat for each passenger
          total_seats: 1,
          base_fare: baseFare,
          total_amount: baseFare,
          agent_commission: (baseFare * parseFloat(agent.commission_rate)) / 100,
          payment_method: paymentMethod,
          payment_status: 'paid',
          booking_status: 'confirmed',
          contact_name: contactDetails?.name || passengers[0].fullName,
          contact_phone: contactDetails?.phone || passengers[0].phone,
          contact_email: contactDetails?.email || passengers[0].email
        }])
        .select()
        .single();

      if (bookingError || !booking) {
        throw new AppError(`Failed to create booking for passenger ${i + 1}`, 500, 'BOOKING_CREATE_ERROR');
      }
      bookings.push(booking);
    }

    // Create agent earning record for total commission
    await supabaseAdmin
      .from('agent_earnings')
      .insert([{
        agent_id: agent.id,
        booking_id: bookings[0].id, // Reference the first booking
        commission_amount: agentCommission,
        commission_rate: agent.commission_rate,
        earning_date: new Date().toISOString().split('T')[0],
        status: 'pending'
      }]);

    const response: ApiResponse = {
      success: true,
      message: `Booking created successfully for ${passengers.length} passenger(s)`,
      data: {
        bookings,
        bookingReference,
        totalAmount,
        agentCommission,
        passengerCount: passengers.length
      }
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};

// Get agent's bookings
export const getAgentBookings = async (req: Request, res: Response): Promise<void> => {
  const agentId = req.userId; // This is already the agent ID from auth middleware
  const { page = 1, limit = 10, status } = req.query;

  try {
    // Verify agent exists
    const { data: agent, error: agentError } = await supabaseAdmin
      .from('agents')
      .select('id')
      .eq('id', agentId)
      .single();

    if (agentError || !agent) {
      throw new AppError('Agent not found', 404, 'AGENT_NOT_FOUND');
    }

    let query = supabaseAdmin
      .from('bookings')
      .select(`
        *,
        passengers (full_name, phone, email),
        schedules (
          departure_time,
          arrival_time,
          routes (name, source_city, destination_city),
          buses (bus_number, bus_type)
        )
      `)
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('booking_status', status);
    }

    const { data: bookings, error } = await query
      .range((Number(page) - 1) * Number(limit), Number(page) * Number(limit) - 1);

    if (error) {
      throw new AppError(`Failed to fetch bookings: ${error.message}`, 500, 'DATABASE_ERROR');
    }

    const response: ApiResponse = {
      success: true,
      message: 'Bookings retrieved successfully',
      data: bookings
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching agent bookings:', error);
    throw error;
  }
};
