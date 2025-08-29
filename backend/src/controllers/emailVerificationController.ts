import { Request, Response } from 'express';
import { AppError } from '../middleware/errorHandler';
import { ApiResponse } from '../types';

// Store verification codes temporarily (in production, use Redis or database)
const verificationCodes = new Map<string, { code: string; expires: number; email: string }>();

// Generate 6-digit verification code
const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send verification email
export const sendVerificationEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new AppError('Email is required', 400, 'EMAIL_REQUIRED');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new AppError('Invalid email format', 400, 'INVALID_EMAIL');
    }

    // Generate verification code
    const code = generateVerificationCode();
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store verification code
    verificationCodes.set(email.toLowerCase(), { code, expires, email });

    // In a real application, you would send an email here
    // For now, we'll just log it (in development) or use a mock email service
    console.log(`Verification code for ${email}: ${code}`);

    // TODO: Integrate with actual email service (NodeMailer, SendGrid, etc.)
    // await sendEmail({
    //   to: email,
    //   subject: 'Nandighosh Bus Service - Email Verification',
    //   html: `Your verification code is: <strong>${code}</strong>`
    // });

    const response: ApiResponse = {
      success: true,
      message: 'Verification code sent successfully',
      data: {
        email,
        expires: new Date(expires).toISOString()
      }
    };

    res.status(200).json(response);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to send verification email'
    });
  }
};

// Verify email with code
export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      throw new AppError('Email and verification code are required', 400, 'MISSING_FIELDS');
    }

    const emailKey = email.toLowerCase();
    const storedData = verificationCodes.get(emailKey);

    if (!storedData) {
      throw new AppError('No verification code found for this email', 400, 'CODE_NOT_FOUND');
    }

    if (Date.now() > storedData.expires) {
      verificationCodes.delete(emailKey);
      throw new AppError('Verification code has expired', 400, 'CODE_EXPIRED');
    }

    if (storedData.code !== code.toString()) {
      throw new AppError('Invalid verification code', 400, 'INVALID_CODE');
    }

    // Code is valid, remove it from storage
    verificationCodes.delete(emailKey);

    const response: ApiResponse = {
      success: true,
      message: 'Email verified successfully',
      data: {
        email,
        verified: true,
        verifiedAt: new Date().toISOString()
      }
    };

    res.status(200).json(response);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Email verification failed'
    });
  }
};

// Clean up expired codes (should be called periodically)
export const cleanupExpiredCodes = (): void => {
  const now = Date.now();
  for (const [email, data] of verificationCodes.entries()) {
    if (now > data.expires) {
      verificationCodes.delete(email);
    }
  }
};

// Run cleanup every 5 minutes
setInterval(cleanupExpiredCodes, 5 * 60 * 1000);
