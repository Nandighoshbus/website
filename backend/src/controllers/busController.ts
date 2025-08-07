import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { AppError } from '../middleware/errorHandler';
import { ApiResponse, Bus } from '../types';

export const getAllBuses = async (req: Request, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;

  const { data: buses, error, count } = await supabaseAdmin
    .from('buses')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new AppError('Failed to fetch buses', 500, 'FETCH_ERROR');
  }

  const response: ApiResponse<Bus[]> = {
    success: true,
    message: 'Buses fetched successfully',
    data: buses || [],
    meta: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit)
    }
  };

  res.status(200).json(response);
};

export const getBusById = async (req: Request, res: Response): Promise<void> => {
  const { busId } = req.params;

  const { data: bus, error } = await supabaseAdmin
    .from('buses')
    .select('*')
    .eq('id', busId)
    .single();

  if (error || !bus) {
    throw new AppError('Bus not found', 404, 'BUS_NOT_FOUND');
  }

  const response: ApiResponse<Bus> = {
    success: true,
    message: 'Bus fetched successfully',
    data: bus
  };

  res.status(200).json(response);
};

export const createBus = async (req: Request, res: Response): Promise<void> => {
  const {
    bus_number,
    bus_type,
    total_seats,
    seat_layout,
    amenities,
    is_active = true,
    registration_number,
    manufacturer,
    model,
    year_of_manufacture
  } = req.body;

  // Check if bus number already exists
  const { data: existingBus } = await supabaseAdmin
    .from('buses')
    .select('bus_number')
    .eq('bus_number', bus_number)
    .single();

  if (existingBus) {
    throw new AppError('Bus number already exists', 409, 'BUS_NUMBER_EXISTS');
  }

  const { data: bus, error } = await supabaseAdmin
    .from('buses')
    .insert([{
      bus_number,
      bus_type,
      total_seats,
      seat_layout,
      amenities,
      is_active,
      registration_number,
      manufacturer,
      model,
      year_of_manufacture
    }])
    .select()
    .single();

  if (error || !bus) {
    throw new AppError('Failed to create bus', 500, 'CREATE_ERROR');
  }

  const response: ApiResponse<Bus> = {
    success: true,
    message: 'Bus created successfully',
    data: bus
  };

  res.status(201).json(response);
};

export const updateBus = async (req: Request, res: Response): Promise<void> => {
  const { busId } = req.params;
  const updates = req.body;

  // Remove id and timestamps from updates
  delete updates.id;
  delete updates.created_at;
  delete updates.updated_at;

  if (Object.keys(updates).length === 0) {
    throw new AppError('No valid updates provided', 400, 'NO_UPDATES');
  }

  // Check if bus number is being updated and already exists
  if (updates.bus_number) {
    const { data: existingBus } = await supabaseAdmin
      .from('buses')
      .select('id')
      .eq('bus_number', updates.bus_number)
      .neq('id', busId)
      .single();

    if (existingBus) {
      throw new AppError('Bus number already exists', 409, 'BUS_NUMBER_EXISTS');
    }
  }

  const { data: bus, error } = await supabaseAdmin
    .from('buses')
    .update(updates)
    .eq('id', busId)
    .select()
    .single();

  if (error || !bus) {
    throw new AppError('Bus not found or failed to update', 404, 'UPDATE_ERROR');
  }

  const response: ApiResponse<Bus> = {
    success: true,
    message: 'Bus updated successfully',
    data: bus
  };

  res.status(200).json(response);
};

export const deleteBus = async (req: Request, res: Response): Promise<void> => {
  const { busId } = req.params;

  // Check if bus has any active routes or bookings
  const { data: activeRoutes } = await supabaseAdmin
    .from('routes')
    .select('id')
    .eq('bus_id', busId)
    .eq('is_active', true);

  if (activeRoutes && activeRoutes.length > 0) {
    throw new AppError('Cannot delete bus with active routes', 400, 'ACTIVE_ROUTES_EXIST');
  }

  // Soft delete by setting is_active to false
  const { data: bus, error } = await supabaseAdmin
    .from('buses')
    .update({ is_active: false })
    .eq('id', busId)
    .select()
    .single();

  if (error || !bus) {
    throw new AppError('Bus not found', 404, 'BUS_NOT_FOUND');
  }

  const response: ApiResponse = {
    success: true,
    message: 'Bus deleted successfully'
  };

  res.status(200).json(response);
};

export const getBusSeats = async (req: Request, res: Response): Promise<void> => {
  const { busId } = req.params;

  const { data: bus, error: busError } = await supabaseAdmin
    .from('buses')
    .select('seat_layout, total_seats')
    .eq('id', busId)
    .single();

  if (busError || !bus) {
    throw new AppError('Bus not found', 404, 'BUS_NOT_FOUND');
  }

  const response: ApiResponse = {
    success: true,
    message: 'Bus seats fetched successfully',
    data: {
      bus_id: busId,
      total_seats: bus.total_seats,
      seat_layout: bus.seat_layout
    }
  };

  res.status(200).json(response);
};

export const searchBuses = async (req: Request, res: Response): Promise<void> => {
  const { bus_type, manufacturer, year_from, year_to, is_active } = req.query;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;

  let query = supabaseAdmin.from('buses').select('*', { count: 'exact' });

  if (bus_type) {
    query = query.eq('bus_type', bus_type);
  }

  if (manufacturer) {
    query = query.ilike('manufacturer', `%${manufacturer}%`);
  }

  if (year_from) {
    query = query.gte('year_of_manufacture', parseInt(year_from as string));
  }

  if (year_to) {
    query = query.lte('year_of_manufacture', parseInt(year_to as string));
  }

  if (is_active !== undefined) {
    query = query.eq('is_active', is_active === 'true');
  }

  const { data: buses, error, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new AppError('Failed to search buses', 500, 'SEARCH_ERROR');
  }

  const response: ApiResponse<Bus[]> = {
    success: true,
    message: 'Buses searched successfully',
    data: buses || [],
    meta: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit)
    }
  };

  res.status(200).json(response);
};

// Alias for getBusById
export const getBusDetails = getBusById;

export const updateBusStatus = async (req: Request, res: Response): Promise<void> => {
  const { busId } = req.params;
  const { is_active } = req.body;

  if (typeof is_active !== 'boolean') {
    throw new AppError('Valid is_active status (true/false) is required', 400, 'INVALID_STATUS');
  }

  const { data: bus, error } = await supabaseAdmin
    .from('buses')
    .update({ is_active })
    .eq('id', busId)
    .select()
    .single();

  if (error || !bus) {
    throw new AppError('Bus not found', 404, 'BUS_NOT_FOUND');
  }

  const response: ApiResponse<Bus> = {
    success: true,
    message: 'Bus status updated successfully',
    data: bus
  };

  res.status(200).json(response);
};
