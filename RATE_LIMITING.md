# Rate Limiting Configuration

This document explains the rate limiting strategy implemented in KODESPACE to protect against abuse while maintaining a good user experience.

## Overview

Rate limiting is implemented at the middleware level and applies different limits based on:
- **Environment** (development vs production)
- **Route type** (auth endpoints vs general API endpoints)
- **Excluded routes** (NextAuth internal callbacks)

## Configuration

### Development Environment

More lenient limits to facilitate testing and development:

| Endpoint Type | Limit | Window |
|--------------|-------|--------|
| Auth endpoints (`/api/auth/*`) | 50 requests | 15 minutes |
| Other API endpoints | 100 requests | 15 minutes |

### Production Environment

Stricter limits for security:

| Endpoint Type | Limit | Window |
|--------------|-------|--------|
| Auth endpoints (`/api/auth/*`) | 30 requests | 15 minutes |
| Other API endpoints | 60 requests | 15 minutes |

## Excluded Routes

The following NextAuth internal routes are **excluded from rate limiting**:
- `/api/auth/callback` - OAuth callbacks
- `/api/auth/session` - Session validation requests
- `/api/auth/_log` - Internal logging

These routes are called frequently by NextAuth and should not be rate limited to prevent authentication issues.

## Implementation Details

### Location
- **Middleware**: `middleware.ts:110-142`
- **Rate Limiter Class**: `lib/security.ts:28-75`
- **Constants**: `lib/constants.ts:47-66`

### How It Works

1. **IP-based tracking**: Requests are tracked by client IP address
2. **Time-windowed**: Counters reset after the specified window (15 minutes)
3. **Per-endpoint limits**: Different limits for auth vs general API routes
4. **Environment-aware**: Automatically adjusts based on NODE_ENV

### Response on Rate Limit Exceeded

```json
{
  "error": "Too many requests. Please try again later.",
  "retryAfter": 900
}
```

**HTTP Status**: 429 (Too Many Requests)
**Headers**: `Retry-After: 900` (seconds)

## Monitoring

Rate limit events are logged with the following information:
```typescript
{
  "identifier": "client-ip",
  "limit": 50,
  "current": 50,
  "window": 900000,
  "type": "security"
}
```

## Customization

### Adjusting Limits

Edit `lib/constants.ts`:

```typescript
export const RATE_LIMITS = {
  DEV_AUTH_REQUESTS: 50,    // Development auth limit
  DEV_API_REQUESTS: 100,    // Development API limit
  PROD_AUTH_REQUESTS: 30,   // Production auth limit
  PROD_API_REQUESTS: 60,    // Production API limit
  AUTH_WINDOW: 15 * 60 * 1000, // 15 minutes
}
```

### Adding Route Exceptions

Edit `middleware.ts`:

```typescript
const isAuthCallback = pathname.includes('/api/auth/callback') ||
                       pathname.includes('/api/auth/session') ||
                       pathname.includes('/api/auth/_log') ||
                       pathname.includes('/your/custom/route'); // Add here
```

## Production Considerations

### Scaling with Redis

The current implementation uses in-memory storage (`Map`). For production deployments with multiple instances, consider implementing Redis-based rate limiting:

```typescript
// Example Redis implementation
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export class RedisRateLimiter {
  async isRateLimited(identifier: string, limit: number, windowMs: number): Promise<boolean> {
    const key = `ratelimit:${identifier}:${Math.floor(Date.now() / windowMs)}`;
    const current = await redis.incr(key);

    if (current === 1) {
      await redis.expire(key, Math.ceil(windowMs / 1000));
    }

    return current > limit;
  }
}
```

### Load Balancer Considerations

When behind a load balancer or CDN:
1. Ensure `X-Forwarded-For` headers are properly configured
2. Trust proxy headers (already implemented in `lib/security.ts:78-96`)
3. Consider implementing distributed rate limiting with Redis

### Cloudflare/CDN Rate Limiting

For additional protection, consider enabling rate limiting at the CDN level:
- Cloudflare Rate Limiting Rules
- AWS WAF Rate-Based Rules
- Nginx rate limiting

## Troubleshooting

### "Too many requests" errors during development

**Solution**: Ensure `NODE_ENV` is not set to `production` in development:
```bash
npm run dev  # Uses development mode by default
```

### NextAuth authentication failures

**Symptom**: `CLIENT_FETCH_ERROR` in browser console
**Solution**: Verify that NextAuth internal routes are excluded (already implemented)

### Rate limits too strict/lenient

**Solution**: Adjust values in `lib/constants.ts` based on your application's needs

## Security Best Practices

1. **Monitor logs** for suspicious rate limit patterns
2. **Combine with CSRF protection** (already implemented)
3. **Use environment-based configuration** (already implemented)
4. **Consider user-based limits** for authenticated endpoints
5. **Implement exponential backoff** on the client side

## Related Files

- `middleware.ts` - Main middleware implementation
- `lib/security.ts` - RateLimiter class and security utilities
- `lib/constants.ts` - Rate limit configuration constants
- `lib/logger.ts` - Logging and monitoring
