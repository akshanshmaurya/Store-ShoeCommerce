import { NextResponse } from 'next/server';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: PaginationMeta | Record<string, unknown>;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/**
 * Standardized API JSON Success Response Helper
 */
export function jsonResponse<T>(
  data: T,
  status: number = 200,
  meta?: PaginationMeta | Record<string, unknown>
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(meta ? { meta } : {}),
    },
    { status }
  );
}

/**
 * Standardized API JSON Error Response Helper
 */
export function errorResponse(
  message: string,
  statusCode: number = 500,
  errorCode: string = 'INTERNAL_ERROR',
  details?: unknown
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: errorCode,
        message,
        ...(details !== undefined ? { details } : {}),
      },
    },
    { status: statusCode }
  );
}
