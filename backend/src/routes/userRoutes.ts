import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import * as userController from '../controllers/userController';

const router = Router();

// Token validation route
router.get('/validate', authenticate, asyncHandler(userController.validateUserToken));

// Protected user routes
router.get('/profile', authenticate, asyncHandler(userController.getProfile));
router.patch('/profile', authenticate, asyncHandler(userController.updateProfile));
router.delete('/profile', authenticate, asyncHandler(userController.deleteAccount));
router.get('/bookings', authenticate, asyncHandler(userController.getUserBookings));
router.get('/bookings/:bookingId', authenticate, asyncHandler(userController.getBookingDetails));

// Admin user management routes
router.get('/', authenticate, authorize('admin', 'super_admin'), asyncHandler(userController.getAllUsers));
router.get('/:userId', authenticate, authorize('admin', 'super_admin'), asyncHandler(userController.getUserById));
router.patch('/:userId/status', authenticate, authorize('admin', 'super_admin'), asyncHandler(userController.updateUserStatus));

export default router;
