import { Router } from 'express';
import { 
  getCustomerProfile, 
  updateCustomerProfile, 
  getBookingHistory, 
  getBookingDetails, 
  cancelBooking,
  getDashboardStats
} from '../controllers/customerController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All customer routes require authentication
router.use(authenticate);

// Profile routes
router.get('/profile', getCustomerProfile);
router.put('/profile', updateCustomerProfile);

// Booking routes
router.get('/bookings', getBookingHistory);
router.get('/bookings/:bookingId', getBookingDetails);
router.put('/bookings/:bookingId/cancel', cancelBooking);

// Dashboard routes
router.get('/dashboard/stats', getDashboardStats);

export default router;
