import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { AppError } from '../middleware/errorHandler';
import { ApiResponse } from '../types';

export const getAllSchedules = async (req: Request, res: Response): Promise<void> => {
  const { 
    route_id,
    bus_id, 
    departure_date,
    is_active = 'true'
  } = req.query;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;

  let query = supabaseAdmin
    .from('bus_schedules')
    .select(`
      *,
      bus:buses(*),
      route:routes(*)
    `, { count: 'exact' });

  // Filter by route_id if provided
  if (route_id) {
    query = query.eq('route_id', route_id);
  }

  // Filter by bus_id if provided
  if (bus_id) {
    query = query.eq('bus_id', bus_id);
  }

  // Filter by departure_date if provided
  if (departure_date) {
    query = query.eq('departure_date', departure_date);
  }

  // Filter by active status
  if (is_active !== undefined) {
    query = query.eq('is_active', is_active === 'true');
  }

  const { data: schedules, error, count } = await query
    .order('departure_date', { ascending: true })
    .order('departure_time', { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new AppError('Failed to fetch schedules', 500, 'FETCH_ERROR');
  }

  const response: ApiResponse<any[]> = {
    success: true,
    message: 'Schedules fetched successfully',
    data: schedules || [],
    meta: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit)
    }
  };

  res.status(200).json(response);
};

export const getScheduleById = async (req: Request, res: Response): Promise<void> => {
  const { scheduleId } = req.params;

  const { data: schedule, error } = await supabaseAdmin
    .from('bus_schedules')
    .select(`
      *,
      bus:buses(*),
      route:routes(*)
    `)
    .eq('id', scheduleId)
    .single();

  if (error || !schedule) {
    throw new AppError('Schedule not found', 404, 'SCHEDULE_NOT_FOUND');
  }

  const response: ApiResponse<any> = {
    success: true,
    message: 'Schedule fetched successfully',
    data: schedule
  };

  res.status(200).json(response);
};

export const createSchedule = async (req: Request, res: Response): Promise<void> => {
  const {
    bus_id,
    route_id,
    departure_date,
    departure_time,
    arrival_date,
    arrival_time,
    base_fare,
    days_of_operation,
    is_active = true,
    special_notes,
    cancellation_policy
  } = req.body;

  // Verify bus exists and is active
  const { data: bus, error: busError } = await supabaseAdmin
    .from('buses')
    .select('id, total_seats, is_active')
    .eq('id', bus_id)
    .single();

  if (busError || !bus) {
    throw new AppError('Bus not found', 404, 'BUS_NOT_FOUND');
  }

  if (!bus.is_active) {
    throw new AppError('Cannot create schedule for inactive bus', 400, 'INACTIVE_BUS');
  }

  // Verify route exists and is active
  const { data: route, error: routeError } = await supabaseAdmin
    .from('routes')
    .select('id, is_active')
    .eq('id', route_id)
    .single();

  if (routeError || !route) {
    throw new AppError('Route not found', 404, 'ROUTE_NOT_FOUND');
  }

  if (!route.is_active) {
    throw new AppError('Cannot create schedule for inactive route', 400, 'INACTIVE_ROUTE');
  }

  // Check for conflicting schedules (same bus, same date/time)
  const { data: existingSchedule } = await supabaseAdmin
    .from('bus_schedules')
    .select('id')
    .eq('bus_id', bus_id)
    .eq('departure_date', departure_date)
    .eq('departure_time', departure_time)
    .single();

  if (existingSchedule) {
    throw new AppError('Bus already scheduled for this date and time', 409, 'SCHEDULE_CONFLICT');
  }

  const { data: schedule, error } = await supabaseAdmin
    .from('bus_schedules')
    .insert([{
      bus_id,
      route_id,
      departure_date,
      departure_time,
      arrival_date,
      arrival_time,
      base_fare,
      available_seats: bus.total_seats,
      days_of_operation,
      is_active,
      special_notes,
      cancellation_policy
    }])
    .select(`
      *,
      bus:buses(*),
      route:routes(*)
    `)
    .single();

  if (error || !schedule) {
    throw new AppError('Failed to create schedule', 500, 'CREATE_ERROR');
  }

  const response: ApiResponse<any> = {
    success: true,
    message: 'Schedule created successfully',
    data: schedule
  };

  res.status(201).json(response);
};

export const updateSchedule = async (req: Request, res: Response): Promise<void> => {
  const { scheduleId } = req.params;
  const updates = req.body;

  // Remove id and timestamps from updates
  delete updates.id;
  delete updates.created_at;
  delete updates.updated_at;

  if (Object.keys(updates).length === 0) {
    throw new AppError('No valid updates provided', 400, 'NO_UPDATES');
  }

  const { data: schedule, error } = await supabaseAdmin
    .from('bus_schedules')
    .update(updates)
    .eq('id', scheduleId)
    .select(`
      *,
      bus:buses(*),
      route:routes(*)
    `)
    .single();

  if (error || !schedule) {
    throw new AppError('Schedule not found or failed to update', 404, 'UPDATE_ERROR');
  }

  const response: ApiResponse<any> = {
    success: true,
    message: 'Schedule updated successfully',
    data: schedule
  };

  res.status(200).json(response);
};

export const deleteSchedule = async (req: Request, res: Response): Promise<void> => {
  const { scheduleId } = req.params;

  const { data: schedule, error } = await supabaseAdmin
    .from('bus_schedules')
    .delete()
    .eq('id', scheduleId)
    .select()
    .single();

  if (error || !schedule) {
    throw new AppError('Schedule not found', 404, 'SCHEDULE_NOT_FOUND');
  }

  const response: ApiResponse<any> = {
    success: true,
    message: 'Schedule deleted successfully',
    data: { id: scheduleId }
  };

  res.status(200).json(response);
};

export const searchAvailableSchedules = async (req: Request, res: Response): Promise<void> => {
  const { 
    source_city,
    destination_city,
    departure_date,
    bus_type,
    min_seats
  } = req.query;

  if (!source_city || !destination_city || !departure_date) {
    throw new AppError('Source city, destination city, and departure date are required', 400, 'MISSING_REQUIRED_PARAMS');
  }

  // First, find routes between the cities
  let routeQuery = supabaseAdmin
    .from('routes')
    .select('id')
    .eq('source_city', source_city)
    .eq('destination_city', destination_city)
    .eq('is_active', true);

  const { data: routes, error: routeError } = await routeQuery;

  if (routeError || !routes || routes.length === 0) {
    const response: ApiResponse<any[]> = {
      success: true,
      message: 'No routes found between the specified cities',
      data: []
    };
    res.status(200).json(response);
    return;
  }

  const routeIds = routes.map(route => route.id);

  // Find schedules for these routes on the specified date
  let scheduleQuery = supabaseAdmin
    .from('bus_schedules')
    .select(`
      *,
      bus:buses(*),
      route:routes(*)
    `)
    .in('route_id', routeIds)
    .eq('departure_date', departure_date)
    .eq('is_active', true);

  // Filter by bus type if provided
  if (bus_type) {
    scheduleQuery = scheduleQuery.eq('bus.bus_type', bus_type);
  }

  // Filter by minimum available seats
  if (min_seats) {
    scheduleQuery = scheduleQuery.gte('available_seats', parseInt(min_seats as string));
  }

  const { data: schedules, error: scheduleError } = await scheduleQuery
    .order('departure_time', { ascending: true });

  if (scheduleError) {
    throw new AppError('Failed to search schedules', 500, 'SEARCH_ERROR');
  }

  const response: ApiResponse<any[]> = {
    success: true,
    message: 'Available schedules found',
    data: schedules || []
  };

  res.status(200).json(response);
};
