import { Request, Response, NextFunction } from 'express';
import { ApiResponse, ApiError } from '../types';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public code?: string | undefined;
  public field?: string | undefined;

  constructor(message: string, statusCode: number, code?: string, field?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;
    this.field = field;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  error: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal server error';
  let errors: ApiError[] = [];

  // Handle different types of errors
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    if (error.code && error.field) {
      errors.push({
        code: error.code,
        message: error.message,
        field: error.field
      });
    }
  } else if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation error';
    // Handle Joi validation errors
    if ('details' in error && Array.isArray((error as any).details)) {
      errors = (error as any).details.map((detail: any) => ({
        code: 'VALIDATION_ERROR',
        message: detail.message,
        field: detail.path.join('.')
      }));
    }
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    errors.push({
      code: 'INVALID_TOKEN',
      message: 'Invalid or malformed token'
    });
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    errors.push({
      code: 'TOKEN_EXPIRED',
      message: 'Token has expired'
    });
  } else if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
    errors.push({
      code: 'INVALID_ID',
      message: 'Invalid ID format'
    });
  }

  // Log error in development
  if (process.env.NODE_ENV !== 'production') {
    console.error('Error:', {
      message: error.message,
      stack: error.stack,
      url: _req.url,
      method: _req.method,
      body: _req.body,
      params: _req.params,
      query: _req.query
    });
  }

  const response: ApiResponse = {
    success: false,
    message,
    ...(errors.length > 0 && { errors })
  };

  res.status(statusCode).json(response);
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
