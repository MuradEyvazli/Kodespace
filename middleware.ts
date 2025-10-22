import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { RateLimiter, getClientIP } from '@/lib/security';
import { logger } from '@/lib/logger';
import { RATE_LIMITS } from '@/lib/constants';

// Rate limiter instance
const rateLimiter = RateLimiter.getInstance();

// Protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/create-snippet',
  '/snippets/[id]/edit',
  '/api/profile',
  '/api/snippets'
];

// Admin routes that require special permissions
const adminRoutes = [
  '/admin',
  '/api/admin'
];

// API routes that need rate limiting
const rateLimitedRoutes = [
  '/api/auth',
  '/api/profile',
  '/api/snippets'
];

function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some(route => {
    if (route.includes('[id]')) {
      const pattern = route.replace('[id]', '[^/]+');
      return new RegExp(`^${pattern}$`).test(pathname);
    }
    return pathname.startsWith(route);
  });
}

function isAdminRoute(pathname: string): boolean {
  return adminRoutes.some(route => pathname.startsWith(route));
}

function isRateLimitedRoute(pathname: string): boolean {
  return rateLimitedRoutes.some(route => pathname.startsWith(route));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = getClientIP(request);
  const userAgent = request.headers.get('user-agent') || 'unknown';

  // Start timing
  const startTime = Date.now();

  try {
    // Security headers for all requests
    const response = NextResponse.next();

    // Comprehensive security headers
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

    // Content Security Policy
    const cspPolicy = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://va.vercel-scripts.com https://www.googletagmanager.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "media-src 'self' https:",
      "object-src 'none'",
      "frame-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "connect-src 'self' https://api.github.com https://api.google.com https://accounts.google.com wss: ws:",
      "worker-src 'self' blob:",
      "child-src 'self'",
      "manifest-src 'self'"
    ].join('; ');
    response.headers.set('Content-Security-Policy', cspPolicy);

    // Enhanced Permissions Policy
    const permissionsPolicy = [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'interest-cohort=()',
      'payment=()',
      'usb=()',
      'bluetooth=()',
      'accelerometer=()',
      'gyroscope=()',
      'magnetometer=()',
      'ambient-light-sensor=()',
      'encrypted-media=()',
      'autoplay=(self)',
      'fullscreen=(self)',
      'picture-in-picture=(self)'
    ].join(', ');
    response.headers.set('Permissions-Policy', permissionsPolicy);

    // Rate limiting for API routes (exclude NextAuth internal callbacks)
    const isAuthCallback = pathname.includes('/api/auth/callback') ||
                           pathname.includes('/api/auth/session') ||
                           pathname.includes('/api/auth/_log');

    if (isRateLimitedRoute(pathname) && !isAuthCallback) {
      const identifier = ip;
      const isProduction = process.env.NODE_ENV === 'production';

      // Environment-based rate limits: stricter in production, more lenient in development
      const limit = pathname.startsWith('/api/auth')
        ? (isProduction ? RATE_LIMITS.PROD_AUTH_REQUESTS : RATE_LIMITS.DEV_AUTH_REQUESTS)
        : (isProduction ? RATE_LIMITS.PROD_API_REQUESTS : RATE_LIMITS.DEV_API_REQUESTS);

      const windowMs = RATE_LIMITS.AUTH_WINDOW;

      if (rateLimiter.isRateLimited(identifier, limit, windowMs)) {
        logger.securityEvent('Rate limit exceeded', {
          ip,
          path: pathname,
          userAgent,
          limit,
          window: windowMs
        });

        return new NextResponse(
          JSON.stringify({
            error: 'Too many requests. Please try again later.',
            retryAfter: Math.ceil(windowMs / 1000)
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': String(Math.ceil(windowMs / 1000))
            }
          }
        );
      }
    }

    // Authentication check for protected routes
    if (isProtectedRoute(pathname)) {
      const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET
      });

      if (!token) {
        logger.authAttempt('unknown', false, ip);

        // Redirect to login for page routes, return 401 for API routes
        if (pathname.startsWith('/api/')) {
          return new NextResponse(
            JSON.stringify({ error: 'Unauthorized' }),
            { status: 401, headers: { 'Content-Type': 'application/json' } }
          );
        }

        const loginUrl = new URL('/auth/signin', request.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
      }

      // Admin route check
      if (isAdminRoute(pathname)) {
        const userRole = token.role as string;
        const isAdmin = userRole === 'moderator' || userRole === 'admin';

        if (!isAdmin) {
          logger.securityEvent('Unauthorized admin access attempt', {
            userId: token.sub,
            userRole,
            path: pathname,
            ip
          });

          if (pathname.startsWith('/api/')) {
            return new NextResponse(
              JSON.stringify({ error: 'Forbidden' }),
              { status: 403, headers: { 'Content-Type': 'application/json' } }
            );
          }

          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
      }

      // Log authenticated request
      logger.apiRequest(
        request.method,
        pathname,
        200,
        Date.now() - startTime,
        token.sub
      );
    }

    // CSRF protection for state-changing requests
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      const origin = request.headers.get('origin');
      const referer = request.headers.get('referer');
      const allowedOrigins = [
        process.env.NEXTAUTH_URL,
        process.env.NEXT_PUBLIC_APP_URL,
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002' // Development port
      ].filter(Boolean);

      let isValidOrigin = false;

      if (origin) {
        isValidOrigin = allowedOrigins.includes(origin);
      } else if (referer) {
        try {
          const refererUrl = new URL(referer);
          isValidOrigin = allowedOrigins.includes(refererUrl.origin);
        } catch {
          isValidOrigin = false;
        }
      }

      if (!isValidOrigin) {
        logger.securityEvent('CSRF attempt detected', {
          ip,
          path: pathname,
          method: request.method,
          origin,
          referer,
          userAgent
        });

        return new NextResponse(
          JSON.stringify({ error: 'Forbidden' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Log successful request
    logger.apiRequest(
      request.method,
      pathname,
      200,
      Date.now() - startTime
    );

    return response;

  } catch (error) {
    logger.error('Middleware error', {
      path: pathname,
      method: request.method,
      ip,
      userAgent,
      error: error instanceof Error ? error.message : String(error)
    }, error instanceof Error ? error : undefined);

    return new NextResponse(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    // Match all request paths except for the ones starting with:
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    // - public folder files
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};