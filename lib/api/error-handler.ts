import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { logger } from '../logger.js';
import { formatValidationError } from '../validations/api-schemas.js';

// Error codes for consistent API responses
export enum ErrorCode {
  // Authentication & Authorization
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',

  // Validation
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',

  // Resources
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  CONFLICT = 'CONFLICT',

  // Rate Limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',

  // File Upload
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  UPLOAD_FAILED = 'UPLOAD_FAILED',

  // Password & Security
  WEAK_PASSWORD = 'WEAK_PASSWORD',
  PASSWORD_MISMATCH = 'PASSWORD_MISMATCH',
  TOTP_INVALID = 'TOTP_INVALID',
  TOTP_REQUIRED = 'TOTP_REQUIRED',

  // Email
  EMAIL_SEND_FAILED = 'EMAIL_SEND_FAILED',
  EMAIL_ALREADY_VERIFIED = 'EMAIL_ALREADY_VERIFIED',

  // Server Errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR'
}

export interface ApiError {
  code: ErrorCode;
  message: string;
  details?: Record<string, any>;
  statusCode: number;
  timestamp: string;
  requestId?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiError;
}

export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    hasNext?: boolean;
    hasPrev?: boolean;
  };
}

// Custom error classes
export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    public message: string,
    public statusCode: number = 500,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(ErrorCode.VALIDATION_FAILED, message, 400, details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required', details?: Record<string, any>) {
    super(ErrorCode.UNAUTHORIZED, message, 401, details);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions', details?: Record<string, any>) {
    super(ErrorCode.FORBIDDEN, message, 403, details);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', details?: Record<string, any>) {
    super(ErrorCode.NOT_FOUND, message, 404, details);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource already exists', details?: Record<string, any>) {
    super(ErrorCode.ALREADY_EXISTS, message, 409, details);
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded', retryAfter?: number) {
    super(ErrorCode.RATE_LIMIT_EXCEEDED, message, 429, { retryAfter });
    this.name = 'RateLimitError';
  }
}

export class FileUploadError extends AppError {
  constructor(code: ErrorCode, message: string, details?: Record<string, any>) {
    super(code, message, 400, details);
    this.name = 'FileUploadError';
  }
}

// Error response builder
export function createErrorResponse(
  error: AppError | Error | ZodError,
  requestId?: string
): NextResponse<ApiErrorResponse> {
  let apiError: ApiError;

  if (error instanceof AppError) {
    apiError = {
      code: error.code,
      message: error.message,
      details: error.details,
      statusCode: error.statusCode,
      timestamp: new Date().toISOString(),
      requestId
    };
  } else if (error instanceof ZodError) {
    const validationDetails = formatValidationError(error);
    apiError = {
      code: ErrorCode.VALIDATION_FAILED,
      message: 'Request validation failed',
      details: validationDetails,
      statusCode: 400,
      timestamp: new Date().toISOString(),
      requestId
    };
  } else {
    // Generic error handling
    apiError = {
      code: ErrorCode.INTERNAL_ERROR,
      message: 'An unexpected error occurred',
      statusCode: 500,
      timestamp: new Date().toISOString(),
      requestId
    };

    // Log unexpected errors
    logger.error('Unexpected error in API handler', {
      error: error.message,
      stack: error.stack,
      requestId
    }, error);
  }

  // Log security-related errors
  if ([
    ErrorCode.UNAUTHORIZED,
    ErrorCode.FORBIDDEN,
    ErrorCode.INVALID_CREDENTIALS,
    ErrorCode.RATE_LIMIT_EXCEEDED
  ].includes(apiError.code)) {
    logger.securityEvent('Security error occurred', {
      code: apiError.code,
      message: apiError.message,
      details: apiError.details,
      requestId
    });
  }

  return NextResponse.json(
    {
      success: false,
      error: apiError
    },
    {
      status: apiError.statusCode,
      headers: {
        'Content-Type': 'application/json',
        ...(apiError.code === ErrorCode.RATE_LIMIT_EXCEEDED && apiError.details?.retryAfter && {
          'Retry-After': String(apiError.details.retryAfter)
        })
      }
    }
  );
}

// Success response builder
export function createSuccessResponse<T>(
  data: T,
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    hasNext?: boolean;
    hasPrev?: boolean;
  }
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    ...(meta && { meta })
  });
}

// API wrapper for error handling
export function withErrorHandler(
  handler: (request: Request, context?: any) => Promise<NextResponse>
) {
  return async (request: Request, context?: any): Promise<NextResponse> => {
    const requestId = crypto.randomUUID();

    try {
      return await handler(request, context);
    } catch (error) {
      return createErrorResponse(
        error instanceof Error ? error : new Error('Unknown error'),
        requestId
      );
    }
  };
}

// Validation middleware
export function validateRequestBody<T>(schema: any) {
  return (handler: (request: Request, validatedData: T, context?: any) => Promise<NextResponse>) => {
    return withErrorHandler(async (request: Request, context?: any) => {
      let body;

      try {
        body = await request.json();
      } catch {
        throw new ValidationError('Invalid JSON in request body');
      }

      const validatedData = schema.parse(body);
      return handler(request, validatedData, context);
    });
  };
}

// Query parameter validation
export function validateQueryParams<T>(schema: any) {
  return (handler: (request: Request, validatedParams: T, context?: any) => Promise<NextResponse>) => {
    return withErrorHandler(async (request: Request, context?: any) => {
      const url = new URL(request.url);
      const params: Record<string, any> = {};

      for (const [key, value] of url.searchParams.entries()) {
        params[key] = value;
      }

      const validatedParams = schema.parse(params);
      return handler(request, validatedParams, context);
    });
  };
}

// Authentication middleware
export function requireAuth(
  handler: (request: Request, user: any, context?: any) => Promise<NextResponse>
) {
  return withErrorHandler(async (request: Request, context?: any) => {
    const userId = request.headers.get('X-User-ID');
    const userRole = request.headers.get('X-User-Role');
    const emailVerified = request.headers.get('X-Email-Verified') === 'true';

    if (!userId) {
      throw new AuthenticationError('Authentication required');
    }

    const user = {
      id: userId,
      role: userRole || 'user',
      emailVerified
    };

    return handler(request, user, context);
  });
}

// Email verification middleware
export function requireEmailVerification(
  handler: (request: Request, user: any, context?: any) => Promise<NextResponse>
) {
  return requireAuth(async (request: Request, user: any, context?: any) => {
    if (!user.emailVerified) {
      throw new AppError(
        ErrorCode.EMAIL_NOT_VERIFIED,
        'Email verification required to access this resource',
        403
      );
    }

    return handler(request, user, context);
  });
}

// Role-based authorization middleware
export function requireRole(allowedRoles: string[]) {
  return (handler: (request: Request, user: any, context?: any) => Promise<NextResponse>) => {
    return requireAuth(async (request: Request, user: any, context?: any) => {
      if (!allowedRoles.includes(user.role)) {
        throw new AuthorizationError(
          `Access denied. Required roles: ${allowedRoles.join(', ')}`
        );
      }

      return handler(request, user, context);
    });
  };
}

// Combined middleware for common use cases
export const withValidation = {
  body: validateRequestBody,
  query: validateQueryParams,
  auth: requireAuth,
  emailVerified: requireEmailVerification,
  role: requireRole
};