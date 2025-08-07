import { Router } from 'express';
import { authenticate, authorize, optionalAuth } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import * as bookingController from '../controllers/bookingController';

const router = Router();

// Public routes (requires authentication)
router.post('/', authenticate, asyncHandler(bookingController.createBooking));
router.get('/availability', optionalAuth, asyncHandler(bookingController.checkSeatAvailability));

// Protected routes
router.get('/:bookingId', authenticate, asyncHandler(bookingController.getBookingById));
router.patch('/:bookingId/cancel', authenticate, asyncHandler(bookingController.cancelBooking));
router.get('/:bookingId/ticket', authenticate, asyncHandler(bookingController.getTicket));

// Admin routes
router.get('/', authenticate, authorize('admin', 'super_admin', 'agent'), asyncHandler(bookingController.getAllBookings));
router.patch('/:bookingId/status', authenticate, authorize('admin', 'super_admin'), asyncHandler(bookingController.updateBookingStatus));
router.get('/analytics/summary', authenticate, authorize('admin', 'super_admin'), asyncHandler(bookingController.getBookingAnalytics));

// Agent routes
router.get('/agent/bookings', authenticate, authorize('agent'), asyncHandler(bookingController.getAgentBookings));

export default router;
