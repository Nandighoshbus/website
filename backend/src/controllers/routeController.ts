import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { AppError } from '../middleware/errorHandler';
import { ApiResponse, Route } from '../types';

export const getAllRoutes = async (req: Request, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;

  const { data: routes, error, count } = await supabaseAdmin
    .from('routes')
    .select(`
      *,
      bus:buses(*)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new AppError('Failed to fetch routes', 500, 'FETCH_ERROR');
  }

  const response: ApiResponse<Route[]> = {
    success: true,
    message: 'Routes fetched successfully',
    data: routes || [],
    meta: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit)
    }
  };

  res.status(200).json(response);
};

export const getRouteById = async (req: Request, res: Response): Promise<void> => {
  const { routeId } = req.params;

  const { data: route, error } = await supabaseAdmin
    .from('routes')
    .select(`
      *,
      bus:buses(*)
    `)
    .eq('id', routeId)
    .single();

  if (error || !route) {
    throw new AppError('Route not found', 404, 'ROUTE_NOT_FOUND');
  }

  const response: ApiResponse<Route> = {
    success: true,
    message: 'Route fetched successfully',
    data: route
  };

  res.status(200).json(response);
};

export const createRoute = async (req: Request, res: Response): Promise<void> => {
  const {
    bus_id,
    route_name,
    source,
    destination,
    stops,
    departure_time,
    arrival_time,
    duration,
    distance,
    base_fare,
    fare_per_km,
    is_active = true
  } = req.body;

  // Check if bus exists and is active
  const { data: bus, error: busError } = await supabaseAdmin
    .from('buses')
    .select('id, is_active')
    .eq('id', bus_id)
    .single();

  if (busError || !bus) {
    throw new AppError('Bus not found', 404, 'BUS_NOT_FOUND');
  }

  if (!bus.is_active) {
    throw new AppError('Cannot create route for inactive bus', 400, 'INACTIVE_BUS');
  }

  // Check if route name already exists
  const { data: existingRoute } = await supabaseAdmin
    .from('routes')
    .select('route_name')
    .eq('route_name', route_name)
    .single();

  if (existingRoute) {
    throw new AppError('Route name already exists', 409, 'ROUTE_NAME_EXISTS');
  }

  const { data: route, error } = await supabaseAdmin
    .from('routes')
    .insert([{
      bus_id,
      route_name,
      source,
      destination,
      stops,
      departure_time,
      arrival_time,
      duration,
      distance,
      base_fare,
      fare_per_km,
      is_active
    }])
    .select(`
      *,
      bus:buses(*)
    `)
    .single();

  if (error || !route) {
    throw new AppError('Failed to create route', 500, 'CREATE_ERROR');
  }

  const response: ApiResponse<Route> = {
    success: true,
    message: 'Route created successfully',
    data: route
  };

  res.status(201).json(response);
};

export const updateRoute = async (req: Request, res: Response): Promise<void> => {
  const { routeId } = req.params;
  const updates = req.body;

  // Remove id and timestamps from updates
  delete updates.id;
  delete updates.created_at;
  delete updates.updated_at;

  if (Object.keys(updates).length === 0) {
    throw new AppError('No valid updates provided', 400, 'NO_UPDATES');
  }

  // Check if bus_id is being updated
  if (updates.bus_id) {
    const { data: bus, error: busError } = await supabaseAdmin
      .from('buses')
      .select('id, is_active')
      .eq('id', updates.bus_id)
      .single();

    if (busError || !bus) {
      throw new AppError('Bus not found', 404, 'BUS_NOT_FOUND');
    }

    if (!bus.is_active) {
      throw new AppError('Cannot assign inactive bus to route', 400, 'INACTIVE_BUS');
    }
  }

  // Check if route name is being updated and already exists
  if (updates.route_name) {
    const { data: existingRoute } = await supabaseAdmin
      .from('routes')
      .select('id')
      .eq('route_name', updates.route_name)
      .neq('id', routeId)
      .single();

    if (existingRoute) {
      throw new AppError('Route name already exists', 409, 'ROUTE_NAME_EXISTS');
    }
  }

  const { data: route, error } = await supabaseAdmin
    .from('routes')
    .update(updates)
    .eq('id', routeId)
    .select(`
      *,
      bus:buses(*)
    `)
    .single();

  if (error || !route) {
    throw new AppError('Route not found or failed to update', 404, 'UPDATE_ERROR');
  }

  const response: ApiResponse<Route> = {
    success: true,
    message: 'Route updated successfully',
    data: route
  };

  res.status(200).json(response);
};

export const deleteRoute = async (req: Request, res: Response): Promise<void> => {
  const { routeId } = req.params;

  // Check if route has any active bookings
  const { data: activeBookings } = await supabaseAdmin
    .from('bookings')
    .select('id')
    .eq('route_id', routeId)
    .in('status', ['pending', 'confirmed']);

  if (activeBookings && activeBookings.length > 0) {
    throw new AppError('Cannot delete route with active bookings', 400, 'ACTIVE_BOOKINGS_EXIST');
  }

  // Soft delete by setting is_active to false
  const { data: route, error } = await supabaseAdmin
    .from('routes')
    .update({ is_active: false })
    .eq('id', routeId)
    .select()
    .single();

  if (error || !route) {
    throw new AppError('Route not found', 404, 'ROUTE_NOT_FOUND');
  }

  const response: ApiResponse = {
    success: true,
    message: 'Route deleted successfully'
  };

  res.status(200).json(response);
};

export const searchRoutes = async (req: Request, res: Response): Promise<void> => {
  const { source, destination } = req.query;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;

  if (!source || !destination) {
    throw new AppError('Source and destination are required', 400, 'MISSING_REQUIRED_FIELDS');
  }

  let query = supabaseAdmin
    .from('routes')
    .select(`
      *,
      bus:buses(*)
    `, { count: 'exact' })
    .eq('is_active', true)
    .ilike('source', `%${source}%`)
    .ilike('destination', `%${destination}%`);

  // If departure_date is provided, we can add more sophisticated filtering
  // For now, we'll just return active routes matching source and destination

  const { data: routes, error, count } = await query
    .order('departure_time', { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new AppError('Failed to search routes', 500, 'SEARCH_ERROR');
  }

  const response: ApiResponse<Route[]> = {
    success: true,
    message: 'Routes searched successfully',
    data: routes || [],
    meta: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit)
    }
  };

  res.status(200).json(response);
};

export const getRouteStops = async (req: Request, res: Response): Promise<void> => {
  const { routeId } = req.params;

  const { data: route, error } = await supabaseAdmin
    .from('routes')
    .select('stops, route_name')
    .eq('id', routeId)
    .single();

  if (error || !route) {
    throw new AppError('Route not found', 404, 'ROUTE_NOT_FOUND');
  }

  const response: ApiResponse = {
    success: true,
    message: 'Route stops fetched successfully',
    data: {
      route_id: routeId,
      route_name: route.route_name,
      stops: route.stops
    }
  };

  res.status(200).json(response);
};

export const getAvailableSeats = async (req: Request, res: Response): Promise<void> => {
  const { routeId } = req.params;
  const { journey_date } = req.query;

  if (!journey_date) {
    throw new AppError('Journey date is required', 400, 'MISSING_JOURNEY_DATE');
  }

  // Get route with bus details
  const { data: route, error: routeError } = await supabaseAdmin
    .from('routes')
    .select(`
      *,
      bus:buses(total_seats, seat_layout)
    `)
    .eq('id', routeId)
    .single();

  if (routeError || !route) {
    throw new AppError('Route not found', 404, 'ROUTE_NOT_FOUND');
  }

  // Get booked seats for the specific date
  const { data: bookings, error: bookingError } = await supabaseAdmin
    .from('bookings')
    .select('seat_numbers')
    .eq('route_id', routeId)
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

  // Generate available seats (this is a simplified version)
  const totalSeats = route.bus.total_seats;
  const allSeats = Array.from({ length: totalSeats }, (_, i) => `${i + 1}`);
  const availableSeats = allSeats.filter(seat => !bookedSeats.includes(seat));

  const response: ApiResponse = {
    success: true,
    message: 'Available seats fetched successfully',
    data: {
      route_id: routeId,
      journey_date,
      total_seats: totalSeats,
      booked_seats: bookedSeats,
      available_seats: availableSeats,
      seat_layout: route.bus.seat_layout
    }
  };

  res.status(200).json(response);
};

export const searchCities = async (_req: Request, res: Response): Promise<void> => {
  // Get distinct cities from routes
  const { data: routes, error } = await supabaseAdmin
    .from('routes')
    .select('source, destination')
    .eq('is_active', true);

  if (error) {
    throw new AppError('Failed to fetch cities', 500, 'FETCH_ERROR');
  }

  // Extract unique cities
  const cities = new Set<string>();
  routes?.forEach(route => {
    cities.add(route.source);
    cities.add(route.destination);
  });

  const response: ApiResponse = {
    success: true,
    message: 'Cities fetched successfully',
    data: Array.from(cities).sort()
  };

  res.status(200).json(response);
};

export const addRouteStop = async (req: Request, res: Response): Promise<void> => {
  const { routeId } = req.params;
  const { stop_name, arrival_time, departure_time, distance_from_source } = req.body;

  if (!stop_name || !arrival_time || !departure_time) {
    throw new AppError('Stop name, arrival time, and departure time are required', 400, 'MISSING_REQUIRED_FIELDS');
  }

  // Get current route
  const { data: route, error: routeError } = await supabaseAdmin
    .from('routes')
    .select('stops')
    .eq('id', routeId)
    .single();

  if (routeError || !route) {
    throw new AppError('Route not found', 404, 'ROUTE_NOT_FOUND');
  }

  // Add new stop to existing stops
  const currentStops = route.stops || [];
  const newStop = {
    id: Date.now().toString(),
    stop_name,
    arrival_time,
    departure_time,
    distance_from_source: distance_from_source || 0
  };

  const updatedStops = [...currentStops, newStop];

  const { data: updatedRoute, error } = await supabaseAdmin
    .from('routes')
    .update({ stops: updatedStops })
    .eq('id', routeId)
    .select()
    .single();

  if (error || !updatedRoute) {
    throw new AppError('Failed to add route stop', 500, 'UPDATE_ERROR');
  }

  const response: ApiResponse = {
    success: true,
    message: 'Route stop added successfully',
    data: updatedRoute
  };

  res.status(200).json(response);
};

export const updateRouteStop = async (req: Request, res: Response): Promise<void> => {
  const { routeId, stopId } = req.params;
  const { stop_name, arrival_time, departure_time, distance_from_source } = req.body;

  // Get current route
  const { data: route, error: routeError } = await supabaseAdmin
    .from('routes')
    .select('stops')
    .eq('id', routeId)
    .single();

  if (routeError || !route) {
    throw new AppError('Route not found', 404, 'ROUTE_NOT_FOUND');
  }

  // Update specific stop
  const stops = route.stops || [];
  const stopIndex = stops.findIndex((stop: any) => stop.id === stopId);

  if (stopIndex === -1) {
    throw new AppError('Stop not found', 404, 'STOP_NOT_FOUND');
  }

  if (stop_name) stops[stopIndex].stop_name = stop_name;
  if (arrival_time) stops[stopIndex].arrival_time = arrival_time;
  if (departure_time) stops[stopIndex].departure_time = departure_time;
  if (distance_from_source) stops[stopIndex].distance_from_source = distance_from_source;

  const { data: updatedRoute, error } = await supabaseAdmin
    .from('routes')
    .update({ stops })
    .eq('id', routeId)
    .select()
    .single();

  if (error || !updatedRoute) {
    throw new AppError('Failed to update route stop', 500, 'UPDATE_ERROR');
  }

  const response: ApiResponse = {
    success: true,
    message: 'Route stop updated successfully',
    data: updatedRoute
  };

  res.status(200).json(response);
};

export const deleteRouteStop = async (req: Request, res: Response): Promise<void> => {
  const { routeId, stopId } = req.params;

  // Get current route
  const { data: route, error: routeError } = await supabaseAdmin
    .from('routes')
    .select('stops')
    .eq('id', routeId)
    .single();

  if (routeError || !route) {
    throw new AppError('Route not found', 404, 'ROUTE_NOT_FOUND');
  }

  // Remove specific stop
  const stops = route.stops || [];
  const updatedStops = stops.filter((stop: any) => stop.id !== stopId);

  if (stops.length === updatedStops.length) {
    throw new AppError('Stop not found', 404, 'STOP_NOT_FOUND');
  }

  const { data: updatedRoute, error } = await supabaseAdmin
    .from('routes')
    .update({ stops: updatedStops })
    .eq('id', routeId)
    .select()
    .single();

  if (error || !updatedRoute) {
    throw new AppError('Failed to delete route stop', 500, 'UPDATE_ERROR');
  }

  const response: ApiResponse = {
    success: true,
    message: 'Route stop deleted successfully',
    data: updatedRoute
  };

  res.status(200).json(response);
};
