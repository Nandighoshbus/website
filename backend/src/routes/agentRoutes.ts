import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import * as agentController from '../controllers/agentController';

const router = Router();

// Agent registration endpoint (no auth required) - Simplified version
router.post('/register', async (req: any, res: any) => {
  try {
    const {
      fullName,
      email,
      phone,
      password,
      address,
      emergencyContact,
      dateOfJoining
    } = req.body;

    // Basic validation
    if (!fullName || !email || !password || !phone || !address || !emergencyContact || !dateOfJoining) {
      return res.status(400).json({ error: 'Please fill in all required fields' });
    }

    // Check if email already exists (simplified)
    const existingUser = await req.db.query(
      'SELECT id FROM user_profiles WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // For now, just return success (the actual implementation will be in the JS file)
    res.status(201).json({
      message: 'Registration request submitted successfully. Please check your email to verify your account.',
      registrationId: 'temp-id',
      requiresEmailVerification: true
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// Existing authenticated agent routes
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
