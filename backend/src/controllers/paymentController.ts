import { Request, Response } from 'express';
const Razorpay = require('razorpay');
import crypto from 'crypto';
import { supabaseAdmin } from '../config/supabase';
import { AppError } from '../middleware/errorHandler';
import { ApiResponse, Payment } from '../types';

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!
});

export const createPaymentOrder = async (req: Request, res: Response): Promise<void> => {
  const { booking_id, amount, currency = 'INR' } = req.body;
  const userId = req.userId!;

  if (!booking_id || !amount) {
    throw new AppError('Booking ID and amount are required', 400, 'MISSING_REQUIRED_FIELDS');
  }

  // Verify booking belongs to user
  const { data: booking, error: bookingError } = await supabaseAdmin
    .from('bookings')
    .select('*')
    .eq('id', booking_id)
    .eq('user_id', userId)
    .single();

  if (bookingError || !booking) {
    throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
  }

  if (booking.status !== 'pending') {
    throw new AppError('Payment can only be made for pending bookings', 400, 'INVALID_BOOKING_STATUS');
  }

  try {
    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Razorpay expects amount in paise
      currency,
      receipt: `booking_${booking_id}_${Date.now()}`,
      notes: {
        booking_id,
        user_id: userId
      }
    });

    // Save payment record in database
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from('payments')
      .insert([{
        user_id: userId,
        booking_id,
        razorpay_order_id: razorpayOrder.id,
        amount,
        currency,
        status: 'pending',
        payment_method: 'razorpay'
      }])
      .select()
      .single();

    if (paymentError || !payment) {
      throw new AppError('Failed to create payment record', 500, 'PAYMENT_CREATE_ERROR');
    }

    const response: ApiResponse = {
      success: true,
      message: 'Payment order created successfully',
      data: {
        order_id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        payment_id: payment.id,
        key_id: process.env.RAZORPAY_KEY_ID
      }
    };

    res.status(201).json(response);
  } catch (error: any) {
    throw new AppError('Failed to create payment order', 500, 'RAZORPAY_ERROR', error.message);
  }
};

export const verifyPayment = async (req: Request, res: Response): Promise<void> => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    payment_id
  } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !payment_id) {
    throw new AppError('All payment verification fields are required', 400, 'MISSING_VERIFICATION_DATA');
  }

  // Verify signature
  const sign = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSign = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(sign.toString())
    .digest('hex');

  if (razorpay_signature !== expectedSign) {
    throw new AppError('Invalid payment signature', 400, 'INVALID_SIGNATURE');
  }

  try {
    // Get payment record
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from('payments')
      .select('*')
      .eq('id', payment_id)
      .eq('razorpay_order_id', razorpay_order_id)
      .single();

    if (paymentError || !payment) {
      throw new AppError('Payment record not found', 404, 'PAYMENT_NOT_FOUND');
    }

    // Update payment record
    const { data: updatedPayment, error: updateError } = await supabaseAdmin
      .from('payments')
      .update({
        razorpay_payment_id,
        razorpay_signature,
        status: 'success',
        paid_at: new Date().toISOString()
      })
      .eq('id', payment_id)
      .select(`
        *,
        booking:bookings(*)
      `)
      .single();

    if (updateError || !updatedPayment) {
      throw new AppError('Failed to update payment record', 500, 'PAYMENT_UPDATE_ERROR');
    }

    // Update booking status to confirmed
    const { error: bookingUpdateError } = await supabaseAdmin
      .from('bookings')
      .update({ status: 'confirmed' })
      .eq('id', payment.booking_id);

    if (bookingUpdateError) {
      throw new AppError('Failed to confirm booking', 500, 'BOOKING_UPDATE_ERROR');
    }

    const response: ApiResponse<Payment> = {
      success: true,
      message: 'Payment verified and booking confirmed',
      data: updatedPayment
    };

    res.status(200).json(response);
  } catch (error: any) {
    throw new AppError('Payment verification failed', 500, 'VERIFICATION_ERROR', error.message);
  }
};

export const getPaymentById = async (req: Request, res: Response): Promise<void> => {
  const { paymentId } = req.params;
  const userId = req.userId!;

  const { data: payment, error } = await supabaseAdmin
    .from('payments')
    .select(`
      *,
      booking:bookings(*)
    `)
    .eq('id', paymentId)
    .eq('user_id', userId)
    .single();

  if (error || !payment) {
    throw new AppError('Payment not found', 404, 'PAYMENT_NOT_FOUND');
  }

  const response: ApiResponse<Payment> = {
    success: true,
    message: 'Payment fetched successfully',
    data: payment
  };

  res.status(200).json(response);
};

export const getAllPayments = async (req: Request, res: Response): Promise<void> => {
  const userId = req.userId!;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;

  const { data: payments, error, count } = await supabaseAdmin
    .from('payments')
    .select(`
      *,
      booking:bookings(*)
    `, { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new AppError('Failed to fetch payments', 500, 'FETCH_ERROR');
  }

  const response: ApiResponse<Payment[]> = {
    success: true,
    message: 'Payments fetched successfully',
    data: payments || [],
    meta: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit)
    }
  };

  res.status(200).json(response);
};

export const initiateRefund = async (req: Request, res: Response): Promise<void> => {
  const { paymentId } = req.params;
  const { amount, reason } = req.body;
  const userId = req.userId!;

  // Get payment record
  const { data: payment, error: paymentError } = await supabaseAdmin
    .from('payments')
    .select(`
      *,
      booking:bookings(*)
    `)
    .eq('id', paymentId)
    .eq('user_id', userId)
    .single();

  if (paymentError || !payment) {
    throw new AppError('Payment not found', 404, 'PAYMENT_NOT_FOUND');
  }

  if (payment.status !== 'success') {
    throw new AppError('Only successful payments can be refunded', 400, 'INVALID_PAYMENT_STATUS');
  }

  if (!payment.razorpay_payment_id) {
    throw new AppError('Razorpay payment ID not found', 400, 'MISSING_RAZORPAY_ID');
  }

  try {
    // Calculate refund amount (if not specified, refund full amount)
    const refundAmount = amount ? Math.round(amount * 100) : Math.round(payment.amount * 100);

    // Create refund with Razorpay
    const refund = await razorpay.payments.refund(payment.razorpay_payment_id, {
      amount: refundAmount,
      notes: {
        reason: reason || 'User requested refund',
        booking_id: payment.booking_id
      }
    });

    // Update payment record
    const { data: updatedPayment, error: updateError } = await supabaseAdmin
      .from('payments')
      .update({
        status: 'refunded',
        razorpay_refund_id: refund.id,
        refund_amount: refundAmount / 100,
        refund_reason: reason,
        refunded_at: new Date().toISOString()
      })
      .eq('id', paymentId)
      .select(`
        *,
        booking:bookings(*)
      `)
      .single();

    if (updateError || !updatedPayment) {
      throw new AppError('Failed to update payment record', 500, 'REFUND_UPDATE_ERROR');
    }

    // Update booking status
    const { error: bookingUpdateError } = await supabaseAdmin
      .from('bookings')
      .update({ 
        status: 'refunded',
        cancellation_reason: reason || 'Refund initiated'
      })
      .eq('id', payment.booking_id);

    if (bookingUpdateError) {
      console.error('Failed to update booking status:', bookingUpdateError);
    }

    const response: ApiResponse<Payment> = {
      success: true,
      message: 'Refund initiated successfully',
      data: updatedPayment
    };

    res.status(200).json(response);
  } catch (error: any) {
    throw new AppError('Failed to process refund', 500, 'REFUND_ERROR', error.message);
  }
};

export const getPaymentStatus = async (req: Request, res: Response): Promise<void> => {
  const { razorpayPaymentId } = req.params;

  if (!razorpayPaymentId) {
    throw new AppError('Payment ID is required', 400, 'MISSING_PAYMENT_ID');
  }

  try {
    const payment = await razorpay.payments.fetch(razorpayPaymentId);

    const response: ApiResponse = {
      success: true,
      message: 'Payment status fetched successfully',
      data: {
        id: payment.id,
        status: payment.status,
        amount: payment.amount / 100,
        currency: payment.currency,
        method: payment.method,
        captured: payment.captured,
        created_at: new Date(payment.created_at * 1000).toISOString()
      }
    };

    res.status(200).json(response);
  } catch (error: any) {
    throw new AppError('Failed to fetch payment status', 500, 'RAZORPAY_FETCH_ERROR', error.message);
  }
};

export const handleWebhook = async (req: Request, res: Response): Promise<void> => {
  const webhookSignature = req.headers['x-razorpay-signature'] as string;
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!;

  if (!webhookSignature || !webhookSecret) {
    throw new AppError('Invalid webhook request', 400, 'INVALID_WEBHOOK');
  }

  // Verify webhook signature
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (webhookSignature !== expectedSignature) {
    throw new AppError('Invalid webhook signature', 400, 'INVALID_WEBHOOK_SIGNATURE');
  }

  const { event, payload } = req.body;

  try {
    switch (event) {
      case 'payment.captured':
        // Handle successful payment
        await handlePaymentCaptured(payload.payment.entity);
        break;
      
      case 'payment.failed':
        // Handle failed payment
        await handlePaymentFailed(payload.payment.entity);
        break;
      
      case 'refund.processed':
        // Handle refund processed
        await handleRefundProcessed(payload.refund.entity);
        break;
      
      default:
        console.log(`Unhandled webhook event: ${event}`);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ success: false });
  }
};

// Helper functions for webhook processing
const handlePaymentCaptured = async (paymentData: any) => {
  const { data: payment } = await supabaseAdmin
    .from('payments')
    .select('*')
    .eq('razorpay_payment_id', paymentData.id)
    .single();

  if (payment && payment.status === 'pending') {
    await supabaseAdmin
      .from('payments')
      .update({
        status: 'success',
        paid_at: new Date().toISOString()
      })
      .eq('id', payment.id);

    await supabaseAdmin
      .from('bookings')
      .update({ status: 'confirmed' })
      .eq('id', payment.booking_id);
  }
};

const handlePaymentFailed = async (paymentData: any) => {
  const { data: payment } = await supabaseAdmin
    .from('payments')
    .select('*')
    .eq('razorpay_payment_id', paymentData.id)
    .single();

  if (payment) {
    await supabaseAdmin
      .from('payments')
      .update({ status: 'failed' })
      .eq('id', payment.id);
  }
};

const handleRefundProcessed = async (refundData: any) => {
  const { data: payment } = await supabaseAdmin
    .from('payments')
    .select('*')
    .eq('razorpay_refund_id', refundData.id)
    .single();

  if (payment) {
    await supabaseAdmin
      .from('payments')
      .update({
        status: 'refunded',
        refunded_at: new Date().toISOString()
      })
      .eq('id', payment.id);
  }
};

// Aliases for route compatibility
export const createPayment = createPaymentOrder;
export const getPaymentDetails = getPaymentById;

export const getPaymentAnalytics = async (_req: Request, res: Response): Promise<void> => {
  // Get payment statistics
  const { data: payments, error } = await supabaseAdmin
    .from('payments')
    .select('status, amount, created_at, payment_method');

  if (error) {
    throw new AppError('Failed to fetch payment analytics', 500, 'FETCH_ERROR');
  }

  const analytics = {
    total_payments: payments?.length || 0,
    total_amount: payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0,
    payments_by_status: payments?.reduce((acc: any, payment) => {
      acc[payment.status] = (acc[payment.status] || 0) + 1;
      return acc;
    }, {}),
    payments_by_method: payments?.reduce((acc: any, payment) => {
      acc[payment.payment_method] = (acc[payment.payment_method] || 0) + 1;
      return acc;
    }, {}),
    average_payment_amount: payments?.length ? 
      (payments.reduce((sum, payment) => sum + payment.amount, 0) / payments.length) : 0
  };

  const response: ApiResponse = {
    success: true,
    message: 'Payment analytics fetched successfully',
    data: analytics
  };

  res.status(200).json(response);
};
