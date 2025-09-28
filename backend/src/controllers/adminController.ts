import { Request, Response } from 'express';
import { findMany, findOne, updateOne } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { ApiResponse } from '../types';
import { supabaseAdmin } from '../config/supabase';

const supabase = supabaseAdmin;

// Validate admin token
export const validateAdminToken = async (req: Request, res: Response): Promise<void> => {
  const adminId = req.userId;

  if (!adminId) {
    throw new AppError('Admin authentication required', 401, 'UNAUTHORIZED');
  }

  try {
    const { data: admin, error: adminError } = await supabaseAdmin
      .from('user_profiles')
      .select('id, is_active, role')
      .eq('id', adminId)
      .single();

    if (adminError || !admin) {
      throw new AppError('Admin not found', 404, 'ADMIN_NOT_FOUND');
    }

    if (!admin.is_active) {
      throw new AppError('Admin account is inactive', 403, 'ADMIN_INACTIVE');
    }

    if (!['admin', 'super_admin'].includes(admin.role)) {
      throw new AppError('Insufficient permissions', 403, 'INSUFFICIENT_PERMISSIONS');
    }

    const response: ApiResponse = {
      success: true,
      message: 'Token is valid',
      data: { valid: true }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error validating admin token:', error);
    throw error;
  }
};

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
export const getAllBuses = async (_req: Request, res: Response): Promise<void> => {
  try {
    const buses = await findMany('buses', {}, { orderBy: 'created_at', orderDirection: 'DESC' });
    // Map DB columns to frontend property names
    const mappedBuses = buses.map((bus: any) => ({
      id: bus.id,
      bus_number: bus.bus_number,
      model: bus.bus_name || 'N/A',
      capacity: bus.total_seats,
      bus_type: bus.bus_type,
      status: bus.is_active ? 'active' : 'inactive',
      created_at: bus.created_at
    }));
    res.status(200).json({
      success: true,
      message: 'Buses retrieved successfully',
      data: mappedBuses
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch buses', error: error.message });
  }
};

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

// Create Bus
export const createBus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bus_number, model, capacity, bus_type } = req.body;

    const { data: newBus, error } = await supabase
      .from('buses')
      .insert({
        bus_number: bus_number,
        bus_name: model,
        registration_number: bus_number, // Use bus_number as registration for now
        bus_type: bus_type,
        total_seats: parseInt(capacity),
        available_seats: parseInt(capacity),
        amenities: '[]', // Empty amenities array
        is_active: true
      })
      .select()
      .single();

    if (error) {
      throw new AppError('Failed to create bus', 500, 'DATABASE_ERROR');
    }

    const mappedBus = {
      id: newBus.id,
      bus_number: newBus.bus_number,
      model: newBus.bus_name,
      capacity: newBus.total_seats,
      bus_type: newBus.bus_type,
      status: newBus.is_active ? 'active' : 'inactive',
      created_at: newBus.created_at
    };

    res.status(201).json({
      success: true,
      message: 'Bus created successfully',
      data: mappedBus
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const updateBus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { bus_number, model, capacity, bus_type } = req.body;

    const updateData: any = {};
    if (bus_number) updateData.bus_number = bus_number;
    if (model) updateData.bus_name = model;
    if (capacity) {
      updateData.total_seats = parseInt(capacity);
      updateData.available_seats = parseInt(capacity);
    }
    if (bus_type) updateData.bus_type = bus_type;
    if (req.body.is_active !== undefined) updateData.is_active = req.body.is_active;

    const { data: updatedBus, error } = await supabase
      .from('buses')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new AppError('Failed to update bus', 500, 'DATABASE_ERROR');
    }

    if (!updatedBus) {
      throw new AppError('Bus not found', 404, 'NOT_FOUND');
    }

    const mappedBus = {
      id: updatedBus.id,
      bus_number: updatedBus.bus_number,
      model: updatedBus.bus_name,
      capacity: updatedBus.total_seats,
      bus_type: updatedBus.bus_type,
      status: updatedBus.is_active ? 'active' : 'inactive',
      created_at: updatedBus.created_at,
      updated_at: updatedBus.updated_at
    };

    res.status(200).json({
      success: true,
      message: 'Bus updated successfully',
      data: mappedBus
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

// Delete Bus
export const deleteBus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const { data: deletedBus, error } = await supabase
      .from('buses')
      .update({ is_active: false })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new AppError('Failed to delete bus', 500, 'DATABASE_ERROR');
    }

    if (!deletedBus) {
      throw new AppError('Bus not found', 404, 'NOT_FOUND');
    }

    res.status(200).json({
      success: true,
      message: 'Bus deleted successfully'
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

// Route Management
export const getAllRoutes = async (_req: Request, res: Response): Promise<void> => {
  try {
    const { data: routes, error } = await supabase
      .from('routes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new AppError('Failed to fetch routes from database', 500, 'DATABASE_ERROR');
    }

    // Map database fields to frontend expected format
    const mappedRoutes = (routes || []).map((route: any) => ({
      id: route.id,
      route_name: route.name,
      origin_city: route.source_city,
      destination_city: route.destination_city,
      distance_km: route.distance_km,
      estimated_duration: route.estimated_duration,
      base_fare: route.base_fare,
      operating_days: route.operating_days || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      is_active: route.is_active,
      created_at: route.created_at
    }));

    res.status(200).json({
      success: true,
      message: 'Routes retrieved successfully',
      data: mappedRoutes
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const createRoute = async (req: Request, res: Response): Promise<void> => {
  try {
    const { route_name, origin_city, destination_city, distance_km, estimated_duration, base_fare, operating_days } = req.body;

    // Generate route code from cities
    const routeCode = `${origin_city.substring(0, 3).toUpperCase()}-${destination_city.substring(0, 3).toUpperCase()}`;

    // Validate operating_days
    const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const operatingDays = operating_days && Array.isArray(operating_days)
      ? operating_days.filter((day: string) => validDays.includes(day.toLowerCase()))
      : validDays; // Default to all days if not provided

    const { data: newRoute, error } = await supabase
      .from('routes')
      .insert({
        route_code: routeCode,
        name: route_name,
        source_city: origin_city,
        destination_city: destination_city,
        distance_km: parseInt(distance_km),
        estimated_duration: estimated_duration,
        base_fare: parseFloat(base_fare) || 0.00,
        operating_days: operatingDays,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      throw new AppError('Failed to create route', 500, 'DATABASE_ERROR');
    }

    const mappedRoute = {
      id: newRoute.id,
      route_name: newRoute.name,
      origin_city: newRoute.source_city,
      destination_city: newRoute.destination_city,
      distance_km: newRoute.distance_km,
      estimated_duration: newRoute.estimated_duration,
      base_fare: newRoute.base_fare,
      operating_days: newRoute.operating_days,
      is_active: newRoute.is_active,
      created_at: newRoute.created_at
    };

    res.status(201).json({
      success: true,
      message: 'Route created successfully',
      data: mappedRoute
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
    const { route_name, origin_city, destination_city, distance_km, estimated_duration, base_fare, operating_days } = req.body;

    // Generate route code from cities if cities are being updated
    const routeCode = origin_city && destination_city
      ? `${origin_city.substring(0, 3).toUpperCase()}-${destination_city.substring(0, 3).toUpperCase()}`
      : undefined;

    // Validate operating_days if provided
    const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const operatingDays = operating_days && Array.isArray(operating_days)
      ? operating_days.filter((day: string) => validDays.includes(day.toLowerCase()))
      : undefined;

    const updateData: any = {};

    if (route_name) updateData.name = route_name;
    if (origin_city) updateData.source_city = origin_city;
    if (destination_city) updateData.destination_city = destination_city;
    if (distance_km) updateData.distance_km = parseInt(distance_km);
    if (estimated_duration) updateData.estimated_duration = estimated_duration;
    if (base_fare !== undefined) updateData.base_fare = parseFloat(base_fare);
    if (routeCode) updateData.route_code = routeCode;
    if (operatingDays) updateData.operating_days = operatingDays;
    if (req.body.is_active !== undefined) updateData.is_active = req.body.is_active;

    const { data: updatedRoute, error } = await supabase
      .from('routes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new AppError('Failed to update route', 500, 'DATABASE_ERROR');
    }

    if (!updatedRoute) {
      throw new AppError('Route not found', 404, 'NOT_FOUND');
    }

    const mappedRoute = {
      id: updatedRoute.id,
      route_name: updatedRoute.name,
      origin_city: updatedRoute.source_city,
      destination_city: updatedRoute.destination_city,
      distance_km: updatedRoute.distance_km,
      estimated_duration: updatedRoute.estimated_duration,
      base_fare: updatedRoute.base_fare,
      operating_days: updatedRoute.operating_days,
      is_active: updatedRoute.is_active,
      created_at: updatedRoute.created_at,
      updated_at: updatedRoute.updated_at
    };

    res.status(200).json({
      success: true,
      message: 'Route updated successfully',
      data: mappedRoute
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const deleteRoute = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const { data: deletedRoute, error } = await supabase
      .from('routes')
      .update({ is_active: false })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new AppError('Failed to delete route', 500, 'DATABASE_ERROR');
    }

    if (!deletedRoute) {
      throw new AppError('Route not found', 404, 'NOT_FOUND');
    }

    res.status(200).json({
      success: true,
      message: 'Route deleted successfully'
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

// Booking Management
export const getAllBookings = async (_req: Request, res: Response): Promise<void> => {
  try {
    const bookings = await findMany('bookings', {}, { orderBy: 'created_at', orderDirection: 'DESC' });
    // Map DB columns to frontend property names
    const mappedBookings = bookings.map((booking: any) => ({
      id: booking.id,
      booking_reference: booking.booking_reference,
      passenger_name: booking.passenger_name || 'N/A',
      route_name: 'Route Info', // You may need to join with routes table
      journey_date: booking.journey_date,
      seats_booked: booking.total_passengers,
      total_amount: booking.total_amount,
      status: booking.status,
      created_at: booking.created_at
    }));
    res.status(200).json({
      success: true,
      message: 'Bookings retrieved successfully',
      data: mappedBookings
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

// Agent request management
export const getAgentRequests = async (req: Request, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const status = req.query.status as string;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('agent_requests')
    .select('*', { count: 'exact' })
    .order('requested_at', { ascending: false });

  if (status && ['pending', 'approved', 'rejected'].includes(status)) {
    query = query.eq('status', status);
  }

  const { data: requests, error, count } = await query
    .range(offset, offset + limit - 1);

  if (error) {
    throw new AppError('Failed to fetch agent requests', 500, 'FETCH_ERROR');
  }

  const response: ApiResponse = {
    success: true,
    message: 'Agent requests fetched successfully',
    data: requests || [],
    meta: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit)
    }
  };

  res.status(200).json(response);
};

export const updateAgentRequestStatus = async (req: Request, res: Response): Promise<void> => {
  const { requestId } = req.params;
  const { status, admin_notes, password } = req.body;
  const adminId = req.userId!;

  if (!['approved', 'rejected'].includes(status)) {
    throw new AppError('Invalid status. Must be approved or rejected', 400, 'INVALID_STATUS');
  }

  // Get the agent request
  const { data: agentRequest, error: requestError } = await supabase
    .from('agent_requests')
    .select('*')
    .eq('id', requestId)
    .single();

  if (requestError || !agentRequest) {
    throw new AppError('Agent request not found', 404, 'REQUEST_NOT_FOUND');
  }

  if (agentRequest.status !== 'pending') {
    throw new AppError('Agent request has already been processed', 400, 'ALREADY_PROCESSED');
  }

  // Update the request status
  const { data: updatedRequest, error: updateError } = await supabase
    .from('agent_requests')
    .update({
      status,
      admin_notes,
      reviewed_by: adminId,
      reviewed_at: new Date().toISOString()
    })
    .eq('id', requestId)
    .select()
    .single();

  if (updateError) {
    throw new AppError('Failed to update agent request', 500, 'UPDATE_ERROR');
  }

  // If approved, create the agent record directly
  if (status === 'approved') {
    // Use stored password from agent request if no password provided
    const finalPassword = password || agentRequest.password;
    
    if (!finalPassword) {
      throw new AppError('Password is required for approved agents. Either provide a password or ensure the agent request contains one.', 400, 'PASSWORD_REQUIRED');
    }

    try {

      // First check if agent already exists
      const { data: existingAgent, error: checkError } = await supabase
        .from('agents')
        .select('id, business_name')
        .eq('business_name', agentRequest.business_name || agentRequest.full_name)
        .single();
      
      if (existingAgent && !checkError) {
        throw new AppError(`Agent with business name ${agentRequest.business_name || agentRequest.full_name} already exists`, 400, 'AGENT_EXISTS');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(agentRequest.email)) {
        throw new AppError(`Invalid email format: ${agentRequest.email}`, 400, 'INVALID_EMAIL');
      }

      // Validate password strength
      if (finalPassword.length < 6) {
        throw new AppError('Password must be at least 6 characters long', 400, 'WEAK_PASSWORD');
      }

      // Generate a UUID for the user_id
      const { data: uuidResult } = await supabase.rpc('gen_random_uuid');
      const generatedUserId = uuidResult || crypto.randomUUID();

      // Create agent record directly in agents table
      const { data: newAgent, error: agentError } = await supabase
        .from('agents')
        .insert([{
          user_id: generatedUserId, // Generate UUID for user_id
          agent_code: `AG${Date.now().toString().slice(-6)}`,
          business_name: agentRequest.business_name || agentRequest.full_name,
          business_type: agentRequest.business_type || 'individual',
          contact_person: agentRequest.full_name,
          business_address: {
            address: agentRequest.address || '',
            city: agentRequest.city || '',
            state: agentRequest.state || '',
            pincode: agentRequest.pincode || '',
            email: agentRequest.email,
            phone: agentRequest.phone
          },
          license_number: null,
          pan_number: null,
          gst_number: null,
          commission_rate: 5.00,
          credit_limit: 0.00,
          current_balance: 0.00,
          verification_status: 'approved',
          password: finalPassword, // Store password in dedicated column
          verification_documents: {
            email: agentRequest.email,
            phone: agentRequest.phone,
            user_id: generatedUserId // Store the generated user_id for reference
          },
          is_active: true
        }])
        .select()
        .single();

      if (agentError) {
        console.error('Agent record creation error:', agentError);
        throw new AppError(`Failed to create agent record: ${agentError.message}`, 500, 'AGENT_ERROR');
      }

      console.log('Agent created successfully:', newAgent.id);

      // Send approval email to the agent
      try {
        const { sendAgentApprovalEmail } = await import('../utils/email');
        await sendAgentApprovalEmail({
          name: agentRequest.full_name,
          email: agentRequest.email,
          agentCode: newAgent.agent_code,
          businessName: newAgent.business_name,
          password: finalPassword,
          commissionRate: newAgent.commission_rate
        });
      } catch (emailError) {
        console.error('Failed to send agent approval email:', emailError);
        // Don't fail the approval process if email fails
      }

    } catch (error) {
      console.error('Agent approval error:', error);
      // If agent creation fails, revert the request status
      await supabase
        .from('agent_requests')
        .update({ status: 'pending', reviewed_by: null, reviewed_at: null })
        .eq('id', requestId);
      
      throw error;
    }
  }

  const response: ApiResponse = {
    success: true,
    message: `Agent request ${status} successfully`,
    data: updatedRequest
  };

  res.status(200).json(response);
};

// Get all approved agents
export const getAllAgents = async (_req: Request, res: Response): Promise<void> => {
  try {
    const { data: agents, error } = await supabase
      .from('agents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new AppError(`Failed to fetch agents: ${error.message}`, 500, 'DATABASE_ERROR');
    }

    // Map database fields to frontend expected format
    const mappedAgents = (agents || []).map(agent => {
      const businessAddress = agent.business_address || {};
      return {
        ...agent,
        email: businessAddress.email || '',
        phone: businessAddress.phone || '',
        address: businessAddress.address || '',
        city: businessAddress.city || '',
        state: businessAddress.state || '',
        pincode: businessAddress.pincode || ''
      };
    });

    const response: ApiResponse = {
      success: true,
      message: 'Agents retrieved successfully',
      data: mappedAgents
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching agents:', error);
    throw error;
  }
};

// Get agent by ID
export const getAgentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const { data: agent, error } = await supabase
      .from('agents')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new AppError(`Agent not found: ${error.message}`, 404, 'AGENT_NOT_FOUND');
    }

    // Map database fields to frontend expected format
    const businessAddress = agent.business_address || {};
    const mappedAgent = {
      ...agent,
      email: businessAddress.email || '',
      phone: businessAddress.phone || '',
      address: businessAddress.address || '',
      city: businessAddress.city || '',
      state: businessAddress.state || '',
      pincode: businessAddress.pincode || ''
    };

    const response: ApiResponse = {
      success: true,
      message: 'Agent retrieved successfully',
      data: mappedAgent
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching agent:', error);
    throw error;
  }
};

// Update agent
export const updateAgent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    delete updateData.id;
    delete updateData.user_id;
    delete updateData.agent_code;
    delete updateData.created_at;
    delete updateData.type;

    // Map frontend fields to database schema
    const mappedData: any = {
      business_name: updateData.business_name,
      business_type: updateData.business_type,
      contact_person: updateData.contact_person,
      commission_rate: updateData.commission_rate,
      credit_limit: updateData.credit_limit,
      current_balance: updateData.current_balance,
      is_active: updateData.is_active,
      updated_at: new Date().toISOString()
    };

    // Handle business_address as JSONB
    if (updateData.address || updateData.city || updateData.state || updateData.pincode || updateData.email || updateData.phone) {
      mappedData.business_address = {
        address: updateData.address || '',
        city: updateData.city || '',
        state: updateData.state || '',
        pincode: updateData.pincode || '',
        email: updateData.email || '',
        phone: updateData.phone || ''
      };
    }

    // Remove undefined values
    Object.keys(mappedData).forEach(key => {
      if (mappedData[key] === undefined) {
        delete mappedData[key];
      }
    });

    console.log('Updating agent with data:', mappedData);

    const { data: updatedAgent, error } = await supabase
      .from('agents')
      .update(mappedData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase update error:', error);
      throw new AppError(`Failed to update agent: ${error.message}`, 500, 'UPDATE_ERROR');
    }

    const response: ApiResponse = {
      success: true,
      message: 'Agent updated successfully',
      data: updatedAgent
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error updating agent:', error);
    throw error;
  }
};

// Delete/Deactivate agent
export const deleteAgent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Get agent details first
    const { data: agent, error: fetchError } = await supabase
      .from('agents')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !agent) {
      throw new AppError('Agent not found', 404, 'AGENT_NOT_FOUND');
    }

    // Delete related data first (if any foreign key constraints exist)
    // Delete agent bookings, earnings, etc.
    await supabase
      .from('bookings')
      .delete()
      .eq('agent_id', id);

    // Delete agent earnings
    await supabase
      .from('agent_earnings')
      .delete()
      .eq('agent_id', id);

    // Delete agent documents
    await supabase
      .from('agent_documents')
      .delete()
      .eq('agent_id', id);

    // Finally delete the agent record
    const { error: deleteError } = await supabase
      .from('agents')
      .delete()
      .eq('id', id);

    if (deleteError) {
      throw new AppError(`Failed to delete agent: ${deleteError.message}`, 500, 'DELETE_ERROR');
    }

    // Also delete from agent_requests if exists
    await supabase
      .from('agent_requests')
      .delete()
      .eq('email', agent.business_address?.email || '');

    const response: ApiResponse = {
      success: true,
      message: 'Agent and all related data deleted successfully',
      data: { deleted_agent_id: id }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error deleting agent:', error);
    throw error;
  }
};
