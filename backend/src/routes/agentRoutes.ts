import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import * as agentController from '../controllers/agentController';

const router = Router();

// Agent registration and profile
router.post('/register', authenticate, asyncHandler(agentController.registerAgent));
router.get('/profile', authenticate, authorize('agent'), asyncHandler(agentController.getAgentProfile));
router.patch('/profile', authenticate, authorize('agent'), asyncHandler(agentController.updateAgentProfile));

// Agent bookings and earnings
router.get('/bookings', authenticate, authorize('agent'), asyncHandler(agentController.getAgentBookings));
router.get('/earnings', authenticate, authorize('agent'), asyncHandler(agentController.getAgentEarnings));
router.get('/analytics', authenticate, authorize('agent'), asyncHandler(agentController.getAgentAnalytics));

// Admin agent management
router.get('/', authenticate, authorize('admin', 'super_admin'), asyncHandler(agentController.getAllAgents));
router.get('/:agentId', authenticate, authorize('admin', 'super_admin'), asyncHandler(agentController.getAgentById));
router.patch('/:agentId/verify', authenticate, authorize('admin', 'super_admin'), asyncHandler(agentController.verifyAgent));
router.patch('/:agentId/status', authenticate, authorize('admin', 'super_admin'), asyncHandler(agentController.updateAgentStatus));
router.patch('/:agentId/commission', authenticate, authorize('admin', 'super_admin'), asyncHandler(agentController.updateCommissionRate));

export default router;
