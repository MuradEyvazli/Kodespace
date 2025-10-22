#!/usr/bin/env ts-node

/**
 * Environment validation script for KODESPACE
 * Validates environment variables using Zod schema
 */

const { validateEnv } = require('../lib/config/env');

async function main() {
  try {
    console.log('🔍 Validating environment configuration...');
    const env = validateEnv();
    console.log('✅ Environment validation successful!');
    console.log(`📊 Configuration loaded for ${env.NODE_ENV} environment`);

    // Show summary of configured features
    console.log('\n📋 Feature Summary:');
    console.log(`   • Database: ${env.MONGODB_URI ? '✅ Configured' : '❌ Missing'}`);
    console.log(`   • Authentication: ${env.NEXTAUTH_SECRET ? '✅ Configured' : '❌ Missing'}`);
    console.log(`   • Redis Cache: ${env.REDIS_URL ? '✅ Configured' : '➖ Optional'}`);
    console.log(`   • Email Provider: ${env.EMAIL_PROVIDER ? '✅ Configured' : '➖ Optional'}`);
    console.log(`   • Monitoring: ${env.SENTRY_DSN ? '✅ Configured' : '➖ Optional'}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Environment validation failed');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}