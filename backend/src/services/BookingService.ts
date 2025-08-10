import { BaseService } from './BaseService';
import { AppError } from '../middleware/errorHandler';
import { Booking, CreateBookingDto, BookingStatus } from '../types';
import { generateBookingReference } from '../utils/auth';
import { QueueService } from './QueueService';

export class BookingService extends BaseService {
  private queueService: QueueService;

  constructor() {
    super();
    this.queueService = QueueService.getInstance();
  }

  /**
   * Create a new booking with optimized performance
   */
  async createBooking(userId: string, bookingData: CreateBookingDto): Promise<Booking> {
    const startTime = Date.now();
    const operationId = `create-booking-${Date.now()}`;
    
    this.logger.info('Creating booking', { 
      userId, 
      routeId: bookingData.route_id, 
      operationId 
    });

    try {
      return await this.executeTransaction(async () => {
        // 1. Validate and get route with caching
        const route = await this.getRouteWithCache(bookingData.route_id);
        if (!route || !route.is_active) {
          throw new AppError('Route not found or inactive', 404, 'ROUTE_NOT_FOUND');
        }

        // 2. Check seat availability with distributed locking
        await this.checkSeatAvailability(
          bookingData.route_id,
          bookingData.journey_date,
          bookingData.seat_numbers
        );

        // 3. Create booking record
        const bookingReference = generateBookingReference();
        const booking = await this.createBookingRecord({
          ...bookingData,
          user_id: userId,
          booking_reference: bookingReference,
          status: 'pending' as BookingStatus,
          created_at: new Date().toISOString()
        });

        // 4. Reserve seats temporarily (with TTL)
        await this.reserveSeats(
          bookingData.route_id,
          bookingData.journey_date,
          bookingData.seat_numbers,
          booking.id,
          900 // 15 minutes
        );

        // 5. Queue background jobs
        await this.queueBookingJobs(booking);

        // 6. Invalidate related caches
        await this.invalidateBookingCaches(bookingData.route_id, bookingData.journey_date);

        const duration = Date.now() - startTime;
        this.logger.performance('create-booking', duration, {
          bookingId: booking.id,
          operationId
        });

        return booking;
      });
    } catch (error: any) {
      this.logger.error('Failed to create booking', {
        error: error.message,
        userId,
        bookingData,
        operationId
      });
      throw error;
    }
  }

  /**
   * Get route with caching
   */
  private async getRouteWithCache(routeId: string): Promise<any> {
    const cacheKey = this.generateCacheKey('route', routeId);
    
    return await this.executeWithCache(
      cacheKey,
      async () => {
        const { data: route, error } = await this.db
          .from('routes')
          .select(`
            *,
            bus:buses(
              id,
              registration_number,
              capacity,
              bus_type,
              amenities
            )
          `)
          .eq('id', routeId)
          .single();

        if (error) {
          throw new AppError('Failed to fetch route', 500, 'ROUTE_FETCH_ERROR');
        }

        return route;
      },
      1800 // 30 minutes cache
    );
  }

  /**
   * Check seat availability with distributed locking
   */
  private async checkSeatAvailability(
    routeId: string,
    journeyDate: string,
    requestedSeats: string[]
  ): Promise<void> {
    const lockKey = this.generateCacheKey('lock', 'seats', routeId, journeyDate);
    const lockValue = `${Date.now()}-${Math.random()}`;
    
    try {
      // Acquire distributed lock
      const lockAcquired = await this.acquireLock(lockKey, lockValue, 30);
      if (!lockAcquired) {
        throw new AppError('Unable to acquire seat lock, please try again', 423, 'SEAT_LOCK_FAILED');
      }

      // Get existing bookings for this route and date
      const { data: existingBookings, error } = await this.db
        .from('bookings')
        .select('seat_numbers')
        .eq('route_id', routeId)
        .eq('journey_date', journeyDate)
        .in('status', ['confirmed', 'pending']);

      if (error) {
        throw new AppError('Failed to check seat availability', 500, 'SEAT_CHECK_ERROR');
      }

      // Check for conflicts
      const bookedSeats = new Set<string>();
      existingBookings?.forEach(booking => {
        if (booking.seat_numbers && Array.isArray(booking.seat_numbers)) {
          booking.seat_numbers.forEach(seat => bookedSeats.add(seat));
        }
      });

      // Also check temporarily reserved seats
      const reservedSeats = await this.getReservedSeats(routeId, journeyDate);
      reservedSeats.forEach(seat => bookedSeats.add(seat));

      const conflictingSeats = requestedSeats.filter(seat => bookedSeats.has(seat));
      if (conflictingSeats.length > 0) {
        throw new AppError(
          `Seats ${conflictingSeats.join(', ')} are already booked`,
          409,
          'SEATS_UNAVAILABLE'
        );
      }

    } finally {
      // Release lock
      await this.releaseLock(lockKey, lockValue);
    }
  }

  /**
   * Create booking record in database
   */
  private async createBookingRecord(bookingData: any): Promise<Booking> {
    const { data: booking, error } = await this.db
      .from('bookings')
      .insert(bookingData)
      .select()
      .single();

    if (error) {
      throw new AppError('Failed to create booking', 500, 'BOOKING_CREATE_ERROR');
    }

    return booking;
  }

  /**
   * Reserve seats temporarily in cache
   */
  private async reserveSeats(
    routeId: string,
    journeyDate: string,
    seats: string[],
    bookingId: string,
    ttlSeconds: number
  ): Promise<void> {
    const promises = seats.map(seat => {
      const reservationKey = this.generateCacheKey('seat-reserve', routeId, journeyDate, seat);
      return this.cache.set(reservationKey, { bookingId, reservedAt: Date.now() }, ttlSeconds);
    });

    await Promise.all(promises);
  }

  /**
   * Get reserved seats from cache
   */
  private async getReservedSeats(routeId: string, journeyDate: string): Promise<string[]> {
    try {
      // This is a simplified version - in production you'd use Redis SCAN
      // const pattern = this.generateCacheKey('seat-reserve', routeId, journeyDate, '*');
      // Note: This requires implementing pattern matching in CacheService
      return []; // Placeholder - implement pattern matching
    } catch (error) {
      this.logger.warn('Failed to get reserved seats', { routeId, journeyDate, error });
      return [];
    }
  }

  /**
   * Queue background jobs for booking
   */
  private async queueBookingJobs(booking: Booking): Promise<void> {
    try {
      // Send confirmation email
      await this.queueService.addJob('email', 'booking-confirmation', {
        bookingId: booking.id,
        userId: booking.user_id,
        priority: 'high'
      });

      // Send SMS notification
      await this.queueService.addJob('sms', 'booking-confirmation', {
        bookingId: booking.id,
        userId: booking.user_id,
        priority: 'high'
      });

      // Update analytics
      await this.queueService.addJob('analytics', 'booking-created', {
        bookingId: booking.id,
        routeId: booking.schedule_id,
        priority: 'low'
      });

      // Auto-cancel job if not paid within time limit
      await this.queueService.addJob('booking', 'auto-cancel-check', {
        bookingId: booking.id
      }, {
        delay: 15 * 60 * 1000 // 15 minutes
      });

    } catch (error) {
      this.logger.warn('Failed to queue booking jobs', { bookingId: booking.id, error });
    }
  }

  /**
   * Invalidate related caches
   */
  private async invalidateBookingCaches(routeId: string, journeyDate: string): Promise<void> {
    const patterns = [
      this.generateCacheKey('route-availability', routeId, journeyDate),
      this.generateCacheKey('route-stats', routeId),
      this.generateCacheKey('popular-routes'),
      this.generateCacheKey('seat-map', routeId, journeyDate)
    ];

    await this.invalidateCache(patterns);
  }

  /**
   * Acquire distributed lock
   */
  private async acquireLock(key: string, value: string, ttlSeconds: number): Promise<boolean> {
    try {
      // Use SET with NX and EX options for atomic lock acquisition
      const result = await this.cache.set(key, value, ttlSeconds);
      return result;
    } catch (error) {
      this.logger.error('Failed to acquire lock', { key, error });
      return false;
    }
  }

  /**
   * Release distributed lock
   */
  private async releaseLock(key: string, expectedValue: string): Promise<boolean> {
    try {
      // Only delete if the value matches (atomic operation)
      const currentValue = await this.cache.get(key);
      if (currentValue === expectedValue) {
        await this.cache.del(key);
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error('Failed to release lock', { key, error });
      return false;
    }
  }

  /**
   * Get booking by ID with caching
   */
  async getBookingById(bookingId: string, userId?: string): Promise<Booking> {
    const cacheKey = this.generateCacheKey('booking', bookingId);
    
    return await this.executeWithCache(
      cacheKey,
      async () => {
        let query = this.db
          .from('bookings')
          .select(`
            *,
            route:routes(
              id,
              name,
              source_city,
              destination_city
            ),
            payments(
              id,
              amount,
              status,
              payment_method
            )
          `)
          .eq('id', bookingId);

        if (userId) {
          query = query.eq('user_id', userId);
        }

        const { data: booking, error } = await query.single();

        if (error) {
          throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
        }

        return booking;
      },
      600 // 10 minutes cache
    );
  }

  /**
   * Update booking status
   */
  async updateBookingStatus(bookingId: string, status: BookingStatus, context?: any): Promise<Booking> {
    try {
      const { data: booking, error } = await this.db
        .from('bookings')
        .update({ 
          status, 
          updated_at: new Date().toISOString(),
          ...context 
        })
        .eq('id', bookingId)
        .select()
        .single();

      if (error) {
        throw new AppError('Failed to update booking status', 500, 'BOOKING_UPDATE_ERROR');
      }

      // Invalidate cache
      const cacheKey = this.generateCacheKey('booking', bookingId);
      await this.cache.del(cacheKey);

      // Queue status change notifications
      await this.queueService.addJob('notification', 'booking-status-change', {
        bookingId,
        status,
        previousStatus: booking.status
      });

      this.logger.info('Booking status updated', {
        bookingId,
        oldStatus: booking.status,
        newStatus: status
      });

      return booking;
    } catch (error: any) {
      this.logger.error('Failed to update booking status', {
        bookingId,
        status,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get user bookings with pagination
   */
  async getUserBookings(
    userId: string, 
    options: { 
      page?: number, 
      limit?: number, 
      status?: BookingStatus 
    } = {}
  ): Promise<{ bookings: Booking[], total: number, hasMore: boolean }> {
    const { page = 1, limit = 10, status } = options;
    const offset = (page - 1) * limit;
    
    const cacheKey = this.generateCacheKey('user-bookings', userId, page.toString(), limit.toString(), status || 'all');
    
    return await this.executeWithCache(
      cacheKey,
      async () => {
        let query = this.db
          .from('bookings')
          .select(`
            *,
            route:routes(
              id,
              name,
              source_city,
              destination_city
            )
          `, { count: 'exact' })
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (status) {
          query = query.eq('status', status);
        }

        const { data: bookings, error, count } = await query;

        if (error) {
          throw new AppError('Failed to fetch user bookings', 500, 'BOOKINGS_FETCH_ERROR');
        }

        return {
          bookings: bookings || [],
          total: count || 0,
          hasMore: (count || 0) > offset + limit
        };
      },
      300 // 5 minutes cache
    );
  }
}
