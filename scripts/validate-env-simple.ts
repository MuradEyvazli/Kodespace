#!/usr/bin/env ts-node

/**
 * Simple environment validation script for KODESPACE
 * Tests Zod schema validation without complex imports
 */

import { config } from 'dotenv';
import { z } from 'zod';

// Load environment variables from .env.local
config({ path: '.env.local' });

// Simplified environment validation schema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url('NEXT_PUBLIC_APP_URL must be a valid URL'),
  PORT: z.string().default('3000').refine(val => /^\d+$/.test(val), 'PORT must be a number').transform(Number),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters long'),
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL'),

  // Optional fields
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  REDIS_URL: z.string().optional(),
  EMAIL_PROVIDER: z.enum(['resend', 'ses']).optional(),
  RESEND_API_KEY: z.string().optional(),
  FROM_EMAIL: z.string().email().optional(),
  SENTRY_DSN: z.string().url().optional().or(z.literal('')),
  GOOGLE_ANALYTICS_ID: z.string().optional(),
});

function main() {
  try {
    console.log('🔍 Validating environment configuration...');

    const result = envSchema.safeParse(process.env);

    if (!result.success) {
      console.error('❌ Environment validation failed:');
      result.error.issues.forEach((error: any) => {
        console.error(`  • ${error.path.join('.')}: ${error.message}`);
      });
      console.error('\n📋 Please check your .env.local file and ensure all required variables are set.');
      console.error('📖 See .env.example for reference configuration.');
      process.exit(1);
    }

    const env = result.data;
    console.log('✅ Environment validation successful!');
    console.log(`📊 Configuration loaded for ${env.NODE_ENV} environment`);

    // Show summary of configured features
    console.log('\n📋 Feature Summary:');
    console.log(`   • Database: ${env.MONGODB_URI ? '✅ Configured' : '❌ Missing'}`);
    console.log(`   • Authentication: ${env.NEXTAUTH_SECRET ? '✅ Configured' : '❌ Missing'}`);
    console.log(`   • Redis Cache: ${env.REDIS_URL ? '✅ Configured' : '➖ Optional'}`);
    console.log(`   • Email Provider: ${env.EMAIL_PROVIDER ? '✅ Configured' : '➖ Optional'}`);
    console.log(`   • Monitoring: ${env.SENTRY_DSN ? '✅ Configured' : '➖ Optional'}`);
    console.log(`   • GitHub OAuth: ${env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET ? '✅ Configured' : '➖ Optional'}`);
    console.log(`   • Google OAuth: ${env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET ? '✅ Configured' : '➖ Optional'}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Environment validation failed');
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Run main function directly
main();