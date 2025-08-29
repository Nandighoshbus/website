import { Request, Response } from 'express';
import { AppError } from '../middleware/errorHandler';

// Temporary stub controller - Razorpay not configured
export const createPaymentOrder = async (_req: Request, _res: Response): Promise<void> => {
  throw new AppError('Payment gateway not configured. Please contact support.', 503, 'PAYMENT_GATEWAY_UNAVAILABLE');
};

export const verifyPayment = async (_req: Request, _res: Response): Promise<void> => {
  throw new AppError('Payment gateway not configured. Please contact support.', 503, 'PAYMENT_GATEWAY_UNAVAILABLE');
};

export const getPaymentById = async (_req: Request, _res: Response): Promise<void> => {
  throw new AppError('Payment gateway not configured. Please contact support.', 503, 'PAYMENT_GATEWAY_UNAVAILABLE');
};

export const getAllPayments = async (_req: Request, _res: Response): Promise<void> => {
  throw new AppError('Payment gateway not configured. Please contact support.', 503, 'PAYMENT_GATEWAY_UNAVAILABLE');
};

export const initiateRefund = async (_req: Request, _res: Response): Promise<void> => {
  throw new AppError('Payment gateway not configured. Please contact support.', 503, 'PAYMENT_GATEWAY_UNAVAILABLE');
};

export const getPaymentStatus = async (_req: Request, _res: Response): Promise<void> => {
  throw new AppError('Payment gateway not configured. Please contact support.', 503, 'PAYMENT_GATEWAY_UNAVAILABLE');
};

export const handleWebhook = async (_req: Request, _res: Response): Promise<void> => {
  throw new AppError('Payment gateway not configured. Please contact support.', 503, 'PAYMENT_GATEWAY_UNAVAILABLE');
};

export const getPaymentAnalytics = async (_req: Request, _res: Response): Promise<void> => {
  throw new AppError('Payment gateway not configured. Please contact support.', 503, 'PAYMENT_GATEWAY_UNAVAILABLE');
};

// Aliases for route compatibility
export const createPayment = createPaymentOrder;
export const getPaymentDetails = getPaymentById;
