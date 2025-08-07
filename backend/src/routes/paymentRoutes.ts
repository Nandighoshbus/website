import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import * as paymentController from '../controllers/paymentController';

const router = Router();

// Payment routes
router.post('/create', authenticate, asyncHandler(paymentController.createPayment));
router.post('/verify', authenticate, asyncHandler(paymentController.verifyPayment));
router.post('/webhook', asyncHandler(paymentController.handleWebhook)); // No auth for webhook
router.get('/:paymentId', authenticate, asyncHandler(paymentController.getPaymentDetails));
router.post('/:paymentId/refund', authenticate, authorize('admin', 'super_admin'), asyncHandler(paymentController.initiateRefund));

// Admin payment management
router.get('/', authenticate, authorize('admin', 'super_admin'), asyncHandler(paymentController.getAllPayments));
router.get('/analytics/summary', authenticate, authorize('admin', 'super_admin'), asyncHandler(paymentController.getPaymentAnalytics));

export default router;
