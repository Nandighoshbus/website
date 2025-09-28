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

// Test endpoint without authentication
router.get('/test', (_req, res) => {
  console.log('=== TEST ENDPOINT HIT ===');
  res.json({ success: true, message: 'Agent routes working', timestamp: new Date().toISOString() });
});

// Agent profile and dashboard functionality
router.get('/validate', authenticate, authorize('agent'), asyncHandler(agentController.validateAgentToken));
router.get('/profile', authenticate, authorize('agent'), asyncHandler(agentController.getAgentProfile));
router.get('/stats', authenticate, authorize('agent'), asyncHandler(agentController.getAgentStats));
router.get('/routes', authenticate, authorize('agent'), asyncHandler(agentController.getAvailableRoutes));
router.post('/bookings', authenticate, authorize('agent'), asyncHandler(agentController.createBooking));
router.get('/bookings', authenticate, authorize('agent'), asyncHandler(agentController.getAgentBookings));

export default router;
