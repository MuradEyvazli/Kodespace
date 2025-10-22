import { NextRequest } from 'next/server';
import { RATE_LIMITS, ERROR_MESSAGES } from './constants';
import { logger } from './logger';

// Rate limiting store - in production, use Redis
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Security Headers
export const SECURITY_HEADERS = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'none'"
  ].join('; ')
};

// Rate Limiting
export class RateLimiter {
  private static instance: RateLimiter;

  public static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  public isRateLimited(
    identifier: string,
    limit: number,
    windowMs: number
  ): boolean {
    const now = Date.now();
    const key = `${identifier}:${Math.floor(now / windowMs)}`;

    const current = rateLimitStore.get(key);

    if (!current) {
      rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
      return false;
    }

    if (current.count >= limit) {
      logger.securityEvent('Rate limit exceeded', {
        identifier,
        limit,
        current: current.count,
        window: windowMs
      });
      return true;
    }

    current.count++;
    return false;
  }

  public cleanup(): void {
    const now = Date.now();
    for (const [key, value] of rateLimitStore.entries()) {
      if (now > value.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }
}

// IP Address extraction
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');

  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || 'unknown';
  }

  if (realIP) {
    return realIP;
  }

  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  return 'unknown';
}

// Authentication helpers (removed getServerSession import for Edge Runtime compatibility)
// These functions will need to be implemented with alternative auth methods in middleware
export async function requireAuth(request: NextRequest) {
  // This would be implemented with JWT token validation or similar
  // that doesn't require server session access in Edge Runtime
  throw new Error('Auth helpers need Edge Runtime compatible implementation');
}

export async function requireRole(request: NextRequest, allowedRoles: string[]) {
  // This would be implemented with JWT token validation or similar
  // that doesn't require server session access in Edge Runtime
  throw new Error('Role helpers need Edge Runtime compatible implementation');
}

// Input sanitization
export function sanitizeHTML(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
}

export function escapeSQL(input: string): string {
  return input.replace(/'/g, "''").replace(/;/g, '\\;');
}

// CSRF Protection
export function generateCSRFToken(): string {
  return Buffer.from(
    Array.from({ length: 32 }, () => Math.floor(Math.random() * 256))
  ).toString('base64');
}

export function validateCSRFToken(token: string, sessionToken: string): boolean {
  return token === sessionToken;
}

// File Upload Security
export function validateFileUpload(file: File): { isValid: boolean; error?: string } {
  // Check file size
  if (file.size > 5 * 1024 * 1024) { // 5MB
    return { isValid: false, error: 'File too large' };
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Invalid file type' };
  }

  // Check filename for suspicious patterns
  const suspiciousPatterns = [
    /\.php$/i,
    /\.asp$/i,
    /\.jsp$/i,
    /\.exe$/i,
    /\.bat$/i,
    /\.cmd$/i,
    /\.scr$/i,
    /\.pif$/i,
    /\.com$/i,
    /\.\./,
    /[<>:"|?*]/
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(file.name)) {
      logger.securityEvent('Suspicious file upload attempt', {
        filename: file.name,
        pattern: pattern.toString()
      });
      return { isValid: false, error: 'Suspicious filename' };
    }
  }

  return { isValid: true };
}

// Password Security
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  score: number;
  issues: string[];
} {
  const issues: string[] = [];
  let score = 0;

  // Length check
  if (password.length < 8) {
    issues.push('Password must be at least 8 characters long');
  } else if (password.length >= 12) {
    score += 2;
  } else {
    score += 1;
  }

  // Character variety
  if (!/[a-z]/.test(password)) {
    issues.push('Password must contain lowercase letters');
  } else {
    score += 1;
  }

  if (!/[A-Z]/.test(password)) {
    issues.push('Password must contain uppercase letters');
  } else {
    score += 1;
  }

  if (!/\d/.test(password)) {
    issues.push('Password must contain numbers');
  } else {
    score += 1;
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    issues.push('Password should contain special characters');
  } else {
    score += 2;
  }

  // Common patterns
  const commonPatterns = [
    /123456/,
    /password/i,
    /qwerty/i,
    /abc123/i,
    /(.)\1{3,}/ // Repeated characters
  ];

  for (const pattern of commonPatterns) {
    if (pattern.test(password)) {
      issues.push('Password contains common patterns');
      score -= 2;
      break;
    }
  }

  return {
    isValid: issues.length === 0 && score >= 4,
    score: Math.max(0, score),
    issues
  };
}

// API Security Middleware
export function withSecurity(handler: Function) {
  return async (request: NextRequest, context: any) => {
    try {
      // Rate limiting
      const ip = getClientIP(request);
      const rateLimiter = RateLimiter.getInstance();

      if (rateLimiter.isRateLimited(ip, RATE_LIMITS.API_REQUESTS, RATE_LIMITS.API_WINDOW)) {
        return new Response(
          JSON.stringify({ error: ERROR_MESSAGES.RATE_LIMITED }),
          { status: 429, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Security headers
      const response = await handler(request, context);

      // Add security headers to response
      Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      return response;
    } catch (error) {
      logger.error('Security middleware error', {
        path: request.nextUrl.pathname,
        method: request.method,
        error: error instanceof Error ? error.message : String(error)
      }, error instanceof Error ? error : undefined);

      return new Response(
        JSON.stringify({ error: ERROR_MESSAGES.INTERNAL_ERROR }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  };
}

// SQL Injection Prevention
export function preventSQLInjection(query: string): boolean {
  const suspiciousPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
    /(--|\*\/|\/\*)/,
    /(\b(OR|AND)\b.*=.*)/i,
    /'.*'/,
    /;/
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(query)) {
      logger.securityEvent('SQL injection attempt detected', {
        query,
        pattern: pattern.toString()
      });
      return true;
    }
  }

  return false;
}

// XSS Prevention
export function preventXSS(input: string): string {
  return input
    .replace(/[<>]/g, (match) => {
      return match === '<' ? '&lt;' : '&gt;';
    })
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Session Security
export function validateSessionSecurity(sessionToken: string, userAgent: string, ip: string): boolean {
  // In production, implement proper session validation
  // Check for session hijacking indicators

  // Basic checks
  if (!sessionToken || sessionToken.length < 32) {
    return false;
  }

  // Log for monitoring
  logger.info('Session validation', {
    hasToken: !!sessionToken,
    userAgent,
    ip: ip.replace(/\.\d+$/, '.***') // Mask last octet
  });

  return true;
}

// Audit Trail
export function auditAction(
  action: string,
  userId: string,
  resourceType: string,
  resourceId: string,
  metadata?: Record<string, any>
): void {
  logger.info('Audit trail', {
    action,
    userId,
    resourceType,
    resourceId,
    metadata,
    timestamp: new Date().toISOString(),
    type: 'audit'
  });
}

// Environment validation
export function validateEnvironment(): void {
  const requiredEnvVars = [
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'MONGODB_URI'
  ];

  const missing = requiredEnvVars.filter(name => !process.env[name]);

  if (missing.length > 0) {
    logger.error('Missing required environment variables', { missing });
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }

  // Validate secret strength
  const secret = process.env.NEXTAUTH_SECRET;
  if (secret && secret.length < 32) {
    logger.warn('NEXTAUTH_SECRET should be at least 32 characters long');
  }
}