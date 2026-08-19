import { NextResponse } from 'next/server';
import { errorResponse } from './api-response';

export class ApiError extends Error {
  public statusCode: number;
  public errorCode: string;
  public details?: unknown;

  constructor(message: string, statusCode: number = 500, errorCode: string = 'INTERNAL_ERROR', details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
  }
}

export class BadRequestError extends ApiError {
  constructor(message: string = 'Bad request parameters', details?: unknown) {
    super(message, 400, 'BAD_REQUEST', details);
    this.name = 'BadRequestError';
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = 'Requested resource not found', details?: unknown) {
    super(message, 404, 'NOT_FOUND', details);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends ApiError {
  constructor(message: string = 'Resource conflict detected', details?: unknown) {
    super(message, 409, 'CONFLICT', details);
    this.name = 'ConflictError';
  }
}

/**
 * Global Centralized Route Error Handler
 * Protects against credential/stack leaks while producing standard JSON error envelopes
 */
export function handleApiError(err: unknown): NextResponse {
  if (err instanceof ApiError) {
    return errorResponse(err.message, err.statusCode, err.errorCode, err.details);
  }

  // Handle generic / unexpected server error
  console.error('[Storefront API Error]:', err);
  return errorResponse(
    'An unexpected server error occurred while processing your request.',
    500,
    'INTERNAL_SERVER_ERROR'
  );
}
