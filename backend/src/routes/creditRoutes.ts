import { Router } from 'express';
import {
  getAgentCreditBalance,
  getAgentCreditTransactions,
  addCreditsToAgent,
  getAllAgentsCreditSummary,
  getAdminCreditTransactions,
  updateAgentCreditLimit,
  getCreditStatistics
} from '../controllers/creditController';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Agent routes - require authentication
router.get('/balance', authenticate, asyncHandler(getAgentCreditBalance));
router.get('/transactions', authenticate, asyncHandler(getAgentCreditTransactions));
router.get('/statistics', authenticate, asyncHandler(getCreditStatistics));

// Admin routes - require admin authentication
router.post('/add', authenticate, asyncHandler(addCreditsToAgent));
router.get('/agents', authenticate, asyncHandler(getAllAgentsCreditSummary));
router.get('/admin/transactions', authenticate, asyncHandler(getAdminCreditTransactions));
router.put('/limit', authenticate, asyncHandler(updateAgentCreditLimit));

export default router;
