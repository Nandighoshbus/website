import { Router } from 'express';
import { authenticate, authorize, optionalAuth } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import * as routeController from '../controllers/routeController';

const router = Router();

// Public routes
router.get('/', optionalAuth, asyncHandler(routeController.getAllRoutes));
router.get('/:routeId', optionalAuth, asyncHandler(routeController.getRouteById));
router.get('/:routeId/stops', optionalAuth, asyncHandler(routeController.getRouteStops));
router.get('/search/cities', optionalAuth, asyncHandler(routeController.searchCities));

// Admin routes
router.post('/', authenticate, authorize('admin', 'super_admin'), asyncHandler(routeController.createRoute));
router.patch('/:routeId', authenticate, authorize('admin', 'super_admin'), asyncHandler(routeController.updateRoute));
router.delete('/:routeId', authenticate, authorize('admin', 'super_admin'), asyncHandler(routeController.deleteRoute));
router.post('/:routeId/stops', authenticate, authorize('admin', 'super_admin'), asyncHandler(routeController.addRouteStop));
router.patch('/:routeId/stops/:stopId', authenticate, authorize('admin', 'super_admin'), asyncHandler(routeController.updateRouteStop));
router.delete('/:routeId/stops/:stopId', authenticate, authorize('admin', 'super_admin'), asyncHandler(routeController.deleteRouteStop));

export default router;
