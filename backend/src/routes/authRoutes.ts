import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import * as authController from '../controllers/authController';
import { sendVerificationEmail, verifyEmail } from '../controllers/emailVerificationController';

const router = Router();

// Public routes
router.post('/register', asyncHandler(authController.register));
router.post('/login', asyncHandler(authController.login));
router.post('/admin/login', asyncHandler(authController.adminLogin));
router.post('/agent/login', asyncHandler(authController.agentLogin));
router.post('/agent/register', asyncHandler(authController.agentRegister));
router.post('/agent/verify-email', asyncHandler(authController.verifyAgentEmail));
router.post('/forgot-password', asyncHandler(authController.forgotPassword));
router.post('/reset-password', asyncHandler(authController.resetPassword));
router.post('/send-verification-email', asyncHandler(sendVerificationEmail));
router.post('/verify-email', asyncHandler(verifyEmail));
router.post('/resend-verification', asyncHandler(authController.resendVerification));

// Protected routes
router.post('/refresh-token', authenticate, asyncHandler(authController.refreshToken));
router.post('/logout', authenticate, asyncHandler(authController.logout));
router.post('/change-password', authenticate, asyncHandler(authController.changePassword));

// Admin routes
router.get('/users', authenticate, authorize('admin', 'super_admin'), asyncHandler(authController.getAllUsers));
router.patch('/users/:userId/status', authenticate, authorize('admin', 'super_admin'), asyncHandler(authController.updateUserStatus));

export default router;
