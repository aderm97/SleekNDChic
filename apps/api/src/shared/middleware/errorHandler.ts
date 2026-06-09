import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  // In production, log a structured error without leaking stack traces
  if (process.env.NODE_ENV === 'production') {
    console.error(JSON.stringify({
      error: err.name,
      message: err.message,
      code: err instanceof AppError ? err.code : 'INTERNAL_ERROR',
      timestamp: new Date().toISOString(),
    }));
  } else {
    console.error('Error:', err);
  }

  // Zod validation error
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: err.errors.reduce((acc, error) => {
          acc[error.path.join('.')] = error.message;
          return acc;
        }, {} as Record<string, string>),
      },
    });
  }

  // Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({
        error: {
          code: 'DUPLICATE_ERROR',
          message: 'Resource already exists',
        },
      });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Resource not found',
        },
      });
    }
  }

  // Custom AppError
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        ...(process.env.NODE_ENV !== 'production' && err.details ? { details: err.details } : {}),
      },
    });
  }

  // Default error — NEVER leak internal details in production
  return res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
  });
}
