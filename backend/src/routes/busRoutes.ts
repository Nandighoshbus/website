import { Router } from 'express';
import { authenticate, authorize, optionalAuth } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import * as busController from '../controllers/busController';

const router = Router();

// Public routes
router.get('/search', optionalAuth, asyncHandler(busController.searchBuses));
router.get('/:busId', optionalAuth, asyncHandler(busController.getBusDetails));
router.get('/:busId/seats', optionalAuth, asyncHandler(busController.getBusSeats));

// Admin routes
router.post('/', authenticate, authorize('admin', 'super_admin'), asyncHandler(busController.createBus));
router.get('/', authenticate, authorize('admin', 'super_admin'), asyncHandler(busController.getAllBuses));
router.patch('/:busId', authenticate, authorize('admin', 'super_admin'), asyncHandler(busController.updateBus));
router.delete('/:busId', authenticate, authorize('admin', 'super_admin'), asyncHandler(busController.deleteBus));
router.patch('/:busId/status', authenticate, authorize('admin', 'super_admin'), asyncHandler(busController.updateBusStatus));

export default router;
