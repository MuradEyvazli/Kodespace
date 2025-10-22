import { z } from 'zod';
import { logger } from '../logger.js';

// Environment validation schema with Zod
const envSchema = z.object({
  // Application Settings (Required)
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url('NEXT_PUBLIC_APP_URL must be a valid URL'),
  PORT: z.string().default('3000').refine(val => /^\d+$/.test(val), 'PORT must be a number').transform(Number),

  // Database (Required)
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),

  // Authentication (Required)
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters long'),
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL'),

  // OAuth Providers (Optional)
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // Caching (Optional)
  REDIS_URL: z.string().optional(),

  // Email Provider (Optional)
  EMAIL_PROVIDER: z.enum(['resend', 'ses']).optional(),
  RESEND_API_KEY: z.string().optional(),
  FROM_EMAIL: z.string().email().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().optional(),

  // Monitoring (Optional)
  SENTRY_DSN: z.string().url().optional().or(z.literal('')),
  GOOGLE_ANALYTICS_ID: z.string().optional(),

  // Security & Features
  JWT_SECRET: z.string().optional(),
  UPLOAD_MAX_SIZE: z.string().default('5242880').refine(val => /^\d+$/.test(val)).transform(Number),
  ALLOWED_FILE_TYPES: z.string().default('image/jpeg,image/png,image/webp,image/gif'),
  RATE_LIMIT_WINDOW_MS: z.string().default('900000').refine(val => /^\d+$/.test(val)).transform(Number),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100').refine(val => /^\d+$/.test(val)).transform(Number),

  // Feature Flags
  FEATURE_COMMENTS: z.string().default('true').transform(val => val === 'true'),
  FEATURE_CODE_EXECUTION: z.string().default('false').transform(val => val === 'true'),
  FEATURE_LIVE_COLLABORATION: z.string().default('false').transform(val => val === 'true'),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  LOG_FORMAT: z.enum(['json', 'text']).default('json'),

  // Development
  DEBUG: z.string().optional(),
  ANALYZE: z.string().default('false').transform(val => val === 'true'),
});

// Refined validation for production environment
const productionEnvSchema = envSchema.refine(
  (data) => {
    if (data.NODE_ENV === 'production') {
      // In production, ensure OAuth providers are configured
      const hasGitHub = data.GITHUB_CLIENT_ID && data.GITHUB_CLIENT_SECRET;
      const hasGoogle = data.GOOGLE_CLIENT_ID && data.GOOGLE_CLIENT_SECRET;

      if (!hasGitHub && !hasGoogle) {
        return false;
      }

      // In production, ensure email provider is configured if features require it
      if (data.FEATURE_COMMENTS && data.EMAIL_PROVIDER) {
        if (data.EMAIL_PROVIDER === 'resend' && !data.RESEND_API_KEY) {
          return false;
        }
        if (data.EMAIL_PROVIDER === 'ses' && (!data.AWS_ACCESS_KEY_ID || !data.AWS_SECRET_ACCESS_KEY)) {
          return false;
        }
      }
    }
    return true;
  },
  {
    message: 'Production environment requires OAuth providers and email configuration',
    path: ['NODE_ENV']
  }
);

// Environment variables type
export type EnvVars = z.infer<typeof envSchema>;

// Validated environment variables
let env: EnvVars;

/**
 * Validates environment variables using Zod schema
 * Throws error if validation fails (fail fast)
 */
export function validateEnv(): EnvVars {
  try {
    // First validate basic schema
    const basicValidation = envSchema.safeParse(process.env);

    if (!basicValidation.success) {
      const errors = basicValidation.error.format();
      logger.error('Environment validation failed', {
        errors,
        type: 'env-validation'
      });

      console.error('❌ Environment Configuration Error:');
      console.error('The following environment variables are invalid or missing:');

      Object.entries(errors).forEach(([key, value]) => {
        if (key !== '_errors' && value && typeof value === 'object' && '_errors' in value) {
          console.error(`  • ${key}: ${value._errors.join(', ')}`);
        }
      });

      console.error('\n📋 Please check your .env.local file and ensure all required variables are set.');
      console.error('📖 See .env.example for reference configuration.');

      process.exit(1);
    }

    // Then validate production-specific requirements
    const productionValidation = productionEnvSchema.safeParse(basicValidation.data);

    if (!productionValidation.success) {
      const errors = productionValidation.error.format();
      logger.error('Production environment validation failed', {
        errors,
        type: 'env-validation'
      });

      console.error('❌ Production Environment Error:');
      console.error('Production environment requires additional configuration:');
      console.error('  • At least one OAuth provider (GitHub or Google)');
      console.error('  • Email service configuration if features require it');
      console.error('\n📖 See PRODUCTION-DEPLOYMENT.md for setup instructions.');

      process.exit(1);
    }

    env = productionValidation.data;

    logger.info('Environment validation successful', {
      nodeEnv: env.NODE_ENV,
      hasRedis: !!env.REDIS_URL,
      hasEmail: !!env.EMAIL_PROVIDER,
      hasSentry: !!env.SENTRY_DSN,
      features: {
        comments: env.FEATURE_COMMENTS,
        codeExecution: env.FEATURE_CODE_EXECUTION,
        liveCollaboration: env.FEATURE_LIVE_COLLABORATION
      }
    });

    return env;

  } catch (error) {
    logger.error('Environment validation error', {
      error: error instanceof Error ? error.message : String(error)
    }, error instanceof Error ? error : undefined);

    console.error('❌ Failed to validate environment configuration');
    console.error('Please check your environment variables and try again.');
    process.exit(1);
  }
}

/**
 * Gets validated environment variables
 * Must call validateEnv() first
 */
export function getEnv(): EnvVars {
  if (!env) {
    throw new Error('Environment not validated. Call validateEnv() first.');
  }
  return env;
}

/**
 * Checks if a feature is enabled
 */
export function isFeatureEnabled(feature: keyof Pick<EnvVars, 'FEATURE_COMMENTS' | 'FEATURE_CODE_EXECUTION' | 'FEATURE_LIVE_COLLABORATION'>): boolean {
  const environment = getEnv();
  return environment[feature];
}

/**
 * Gets database configuration
 */
export function getDatabaseConfig() {
  const environment = getEnv();
  return {
    uri: environment.MONGODB_URI,
    options: {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }
  };
}

/**
 * Gets cache configuration
 */
export function getCacheConfig() {
  const environment = getEnv();
  return {
    redis: environment.REDIS_URL,
    fallbackToMemory: !environment.REDIS_URL
  };
}

/**
 * Gets email configuration
 */
export function getEmailConfig() {
  const environment = getEnv();

  if (!environment.EMAIL_PROVIDER) {
    return null;
  }

  if (environment.EMAIL_PROVIDER === 'resend') {
    return {
      provider: 'resend' as const,
      apiKey: environment.RESEND_API_KEY!,
      fromEmail: environment.FROM_EMAIL!
    };
  }

  if (environment.EMAIL_PROVIDER === 'ses') {
    return {
      provider: 'ses' as const,
      accessKeyId: environment.AWS_ACCESS_KEY_ID!,
      secretAccessKey: environment.AWS_SECRET_ACCESS_KEY!,
      region: environment.AWS_REGION!,
      fromEmail: environment.FROM_EMAIL!
    };
  }

  return null;
}

/**
 * Gets monitoring configuration
 */
export function getMonitoringConfig() {
  const environment = getEnv();
  return {
    sentry: environment.SENTRY_DSN || null,
    googleAnalytics: environment.GOOGLE_ANALYTICS_ID || null
  };
}

// Don't auto-validate to prevent script errors - scripts call validateEnv() explicitly