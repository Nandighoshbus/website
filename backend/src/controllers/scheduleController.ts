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

  try {
    let query = supabaseAdmin
      .from('bus_schedules')
      .select(`
        *,
        buses!inner(*),
        routes!inner(*)
      `);

    // Apply filters
    if (route_id) query = query.eq('route_id', route_id);
    if (bus_id) query = query.eq('bus_id', bus_id);
    if (departure_date) query = query.eq('departure_date', departure_date);
    if (is_active !== undefined) query = query.eq('is_active', is_active === 'true');

    // Get total count with same filters
    let countQuery = supabaseAdmin.from('bus_schedules').select('*', { count: 'exact', head: true });
    if (route_id) countQuery = countQuery.eq('route_id', route_id);
    if (bus_id) countQuery = countQuery.eq('bus_id', bus_id);
    if (departure_date) countQuery = countQuery.eq('departure_date', departure_date);
    if (is_active !== undefined) countQuery = countQuery.eq('is_active', is_active === 'true');
    
    const { count } = await countQuery;
    const total = count || 0;

    // Get paginated data
    const { data: schedules, error } = await query
      .order('departure_date', { ascending: true })
      .order('departure_time', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const formattedSchedules = (schedules || []).map((schedule: any) => ({
      ...schedule,
      bus: {
        ...schedule.buses,
        amenities: Array.isArray(schedule.buses.amenities) ? schedule.buses.amenities : []
      },
      route: schedule.routes
    }));

    const response: ApiResponse<any[]> = {
      success: true,
      message: 'Schedules fetched successfully',
      data: formattedSchedules,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };

    res.status(200).json(response);
  } catch (error) {
    throw new AppError('Failed to fetch schedules', 500, 'FETCH_ERROR');
  }
};

export const getScheduleById = async (req: Request, res: Response): Promise<void> => {
  const { scheduleId } = req.params;
  
  try {
    const { data: schedule, error } = await supabaseAdmin
      .from('bus_schedules')
      .select(`
        *,
        buses!inner(*),
        routes!inner(*)
      `)
      .eq('id', scheduleId)
      .single();

    if (error || !schedule) {
      throw new AppError('Schedule not found', 404, 'SCHEDULE_NOT_FOUND');
    }

    const formattedSchedule = {
      ...schedule,
      bus: {
        ...schedule.buses,
        amenities: Array.isArray(schedule.buses.amenities) ? schedule.buses.amenities : []
      },
      route: schedule.routes
    };

    const response: ApiResponse<any> = {
      success: true,
      message: 'Schedule fetched successfully',
      data: formattedSchedule
    };
    
    res.status(200).json(response);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to fetch schedule', 500, 'FETCH_ERROR');
  }
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

  try {
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
    const { data: conflicts } = await supabaseAdmin
      .from('bus_schedules')
      .select('id')
      .eq('bus_id', bus_id)
      .eq('departure_date', departure_date)
      .eq('departure_time', departure_time);
    
    if (conflicts && conflicts.length > 0) {
      throw new AppError('Bus already scheduled for this date and time', 409, 'SCHEDULE_CONFLICT');
    }

    // Insert schedule
    const { data: newSchedule, error: insertError } = await supabaseAdmin
      .from('bus_schedules')
      .insert({
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
      })
      .select(`
        *,
        buses!inner(*),
        routes!inner(*)
      `)
      .single();

    if (insertError) {
      throw new AppError('Failed to create schedule', 500, 'CREATE_ERROR');
    }

    const formattedSchedule = {
      ...newSchedule,
      bus: {
        ...newSchedule.buses,
        amenities: Array.isArray(newSchedule.buses.amenities) ? newSchedule.buses.amenities : []
      },
      route: newSchedule.routes
    };

    const response: ApiResponse<any> = {
      success: true,
      message: 'Schedule created successfully',
      data: formattedSchedule
    };
    
    res.status(201).json(response);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to create schedule', 500, 'CREATE_ERROR');
  }
};

export const updateSchedule = async (req: Request, res: Response): Promise<void> => {
  const { scheduleId } = req.params;
  const updates = req.body;
  delete updates.id;
  delete updates.created_at;
  delete updates.updated_at;
  
  if (Object.keys(updates).length === 0) {
    throw new AppError('No valid updates provided', 400, 'NO_UPDATES');
  }

  try {
    // Update schedule
    const { data: updatedSchedule, error } = await supabaseAdmin
      .from('bus_schedules')
      .update(updates)
      .eq('id', scheduleId)
      .select(`
        *,
        buses!inner(*),
        routes!inner(*)
      `)
      .single();

    if (error || !updatedSchedule) {
      throw new AppError('Schedule not found or failed to update', 404, 'UPDATE_ERROR');
    }

    const formattedSchedule = {
      ...updatedSchedule,
      bus: {
        ...updatedSchedule.buses,
        amenities: Array.isArray(updatedSchedule.buses.amenities) ? updatedSchedule.buses.amenities : []
      },
      route: updatedSchedule.routes
    };

    const response: ApiResponse<any> = {
      success: true,
      message: 'Schedule updated successfully',
      data: formattedSchedule
    };
    
    res.status(200).json(response);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to update schedule', 500, 'UPDATE_ERROR');
  }
};

export const deleteSchedule = async (req: Request, res: Response): Promise<void> => {
  const { scheduleId } = req.params;
  
  try {
    // Check if schedule exists before delete
    const { data: existingSchedule } = await supabaseAdmin
      .from('bus_schedules')
      .select('id')
      .eq('id', scheduleId)
      .single();

    if (!existingSchedule) {
      throw new AppError('Schedule not found', 404, 'SCHEDULE_NOT_FOUND');
    }

    // Delete schedule
    const { error } = await supabaseAdmin
      .from('bus_schedules')
      .delete()
      .eq('id', scheduleId);

    if (error) {
      throw new AppError('Failed to delete schedule', 500, 'DELETE_ERROR');
    }

    const response: ApiResponse<any> = {
      success: true,
      message: 'Schedule deleted successfully',
      data: { id: scheduleId }
    };
    
    res.status(200).json(response);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to delete schedule', 500, 'DELETE_ERROR');
  }
};

export const searchAvailableSchedules = async (req: Request, res: Response): Promise<void> => {
  const source_city = req.query.source_city as string;
  const destination_city = req.query.destination_city as string;
  const departure_date = req.query.departure_date as string;
  const bus_type = req.query.bus_type as string;
  const min_seats = req.query.min_seats as string;

  if (!source_city || !destination_city || !departure_date) {
    throw new AppError('Source city, destination city, and departure date are required', 400, 'MISSING_REQUIRED_PARAMS');
  }

  try {
    // Find routes between cities
    const { data: routes, error: routeError } = await supabaseAdmin
      .from('routes')
      .select('id')
      .eq('source_city', source_city)
      .eq('destination_city', destination_city)
      .eq('is_active', true);

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

    // Build query for schedules
    let query = supabaseAdmin
      .from('bus_schedules')
      .select(`
        *,
        buses!inner(*),
        routes!inner(*)
      `)
      .in('route_id', routeIds)
      .eq('is_active', true);

    // Filter by bus type if provided
    if (bus_type) {
      query = query.eq('buses.bus_type', bus_type);
    }

    // Filter by minimum available seats
    if (min_seats) {
      query = query.gte('available_seats', Number(min_seats));
    }

    // Filter by departure date
    query = query.eq('departure_date', departure_date);

    const { data: schedules, error: scheduleError } = await query
      .order('departure_time', { ascending: true });

    if (scheduleError) {
      throw new AppError('Failed to search schedules', 500, 'SEARCH_ERROR');
    }

    // Format the response
    const formattedSchedules = (schedules || []).map((schedule: any) => ({
      ...schedule,
      bus: {
        ...schedule.buses,
        amenities: Array.isArray(schedule.buses.amenities) ? schedule.buses.amenities : []
      },
      route: schedule.routes
    }));

    const response: ApiResponse<any[]> = {
      success: true,
      message: 'Available schedules found',
      data: formattedSchedules
    };

    res.status(200).json(response);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to search schedules', 500, 'SEARCH_ERROR');
  }
};