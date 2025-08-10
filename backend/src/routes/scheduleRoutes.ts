import { Router } from 'express';
import { authenticate, authorize, optionalAuth } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import * as scheduleController from '../controllers/scheduleController';

const router = Router();

// Public routes
router.get('/search', optionalAuth, asyncHandler(scheduleController.searchAvailableSchedules));
router.get('/', optionalAuth, asyncHandler(scheduleController.getAllSchedules));
router.get('/:scheduleId', optionalAuth, asyncHandler(scheduleController.getScheduleById));

// Admin routes
router.post('/', authenticate, authorize('admin', 'super_admin'), asyncHandler(scheduleController.createSchedule));
router.patch('/:scheduleId', authenticate, authorize('admin', 'super_admin'), asyncHandler(scheduleController.updateSchedule));
router.delete('/:scheduleId', authenticate, authorize('admin', 'super_admin'), asyncHandler(scheduleController.deleteSchedule));

export default router;
