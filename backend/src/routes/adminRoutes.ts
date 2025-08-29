import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import * as adminController from '../controllers/adminController';

const router = Router();

// All routes require admin authentication
router.use(authenticate);
router.use(authorize('admin', 'super_admin'));

// User Management
router.get('/users', asyncHandler(adminController.getAllUsers));

// Bus Management
router.get('/buses', asyncHandler(adminController.getAllBuses));
router.post('/buses', asyncHandler(adminController.createBus));
router.get('/buses/:id', asyncHandler(adminController.getBusById));
router.put('/buses/:id', asyncHandler(adminController.updateBus));
router.delete('/buses/:id', asyncHandler(adminController.deleteBus));

// Route Management
router.get('/routes', asyncHandler(adminController.getAllRoutes));
router.post('/routes', asyncHandler(adminController.createRoute));
router.get('/routes/:id', asyncHandler(adminController.getRouteById));
router.put('/routes/:id', asyncHandler(adminController.updateRoute));
router.delete('/routes/:id', asyncHandler(adminController.deleteRoute));

// Booking Management
router.get('/bookings', asyncHandler(adminController.getAllBookings));
router.get('/bookings/:id', asyncHandler(adminController.getBookingById));
router.put('/bookings/:id', asyncHandler(adminController.updateBooking));
router.delete('/bookings/:id', asyncHandler(adminController.cancelBooking));

// Dashboard Statistics
router.get('/statistics', asyncHandler(adminController.getDashboardStatistics));

// Agent Request Management
router.get('/agent-requests', asyncHandler(adminController.getAgentRequests));
router.put('/agent-requests/:requestId', asyncHandler(adminController.updateAgentRequestStatus));

// Agent Management
router.get('/agents', asyncHandler(adminController.getAllAgents));
router.get('/agents/:id', asyncHandler(adminController.getAgentById));
router.put('/agents/:id', asyncHandler(adminController.updateAgent));
router.delete('/agents/:id', asyncHandler(adminController.deleteAgent));

// Database Operations
router.post('/database/backup', asyncHandler(adminController.createBackup));
router.post('/database/optimize', asyncHandler(adminController.optimizeTables));
router.post('/database/clear-logs', asyncHandler(adminController.clearLogs));

export default router;
