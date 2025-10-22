#!/usr/bin/env ts-node

/**
 * Database migration script for KODESPACE
 * Handles schema changes and data transformations
 */

import { connectToDatabase } from '../lib/database.js';
import { logger } from '../lib/logger.js';
import { validateEnv } from '../lib/config/env.js';

interface Migration {
  version: string;
  description: string;
  up: () => Promise<void>;
  down: () => Promise<void>;
}

// Migration registry
const migrations: Migration[] = [
  {
    version: '001',
    description: 'Initial schema setup with indexes',
    up: async () => {
      const connection = await connectToDatabase();
      const db = connection.db;
      if (!db) throw new Error('Database connection failed');

      // Create users collection indexes
      await db.collection('users').createIndex({ email: 1 }, { unique: true });
      await db.collection('users').createIndex({ githubId: 1 }, { unique: true, sparse: true });
      await db.collection('users').createIndex({ googleId: 1 }, { unique: true, sparse: true });
      await db.collection('users').createIndex({ createdAt: 1 });
      await db.collection('users').createIndex({ role: 1 });

      // Create code snippets collection indexes
      await db.collection('codesnippets').createIndex({ authorId: 1 });
      await db.collection('codesnippets').createIndex({ language: 1 });
      await db.collection('codesnippets').createIndex({ tags: 1 });
      await db.collection('codesnippets').createIndex({ createdAt: -1 });
      await db.collection('codesnippets').createIndex({ isPublic: 1 });

      // Create search index for snippets
      await db.collection('codesnippets').createIndex({
        title: 'text',
        description: 'text',
        code: 'text'
      }, {
        name: 'snippet_search_index',
        weights: {
          title: 10,
          description: 5,
          code: 1
        }
      });

      // Create comments collection indexes
      await db.collection('comments').createIndex({ snippetId: 1 });
      await db.collection('comments').createIndex({ authorId: 1 });
      await db.collection('comments').createIndex({ createdAt: -1 });

      logger.info('Migration 001: Initial schema setup completed');
    },
    down: async () => {
      const connection = await connectToDatabase();
      const db = connection.db;
      if (!db) throw new Error('Database connection failed');

      // Drop indexes (keep collections)
      await db.collection('users').dropIndexes();
      await db.collection('codesnippets').dropIndexes();
      await db.collection('comments').dropIndexes();

      logger.info('Migration 001: Rollback completed');
    }
  },
  {
    version: '002',
    description: 'Add user skills and bio fields',
    up: async () => {
      const connection = await connectToDatabase();
      const db = connection.db;
      if (!db) throw new Error('Database connection failed');

      // Add skills and bio fields to existing users
      await db.collection('users').updateMany(
        { skills: { $exists: false } },
        {
          $set: {
            skills: [],
            bio: '',
            githubUsername: null,
            updatedAt: new Date()
          }
        }
      );

      // Create index on skills for better search
      await db.collection('users').createIndex({ skills: 1 });

      logger.info('Migration 002: User profile enhancements completed');
    },
    down: async () => {
      const connection = await connectToDatabase();
      const db = connection.db;
      if (!db) throw new Error('Database connection failed');

      // Remove added fields
      await db.collection('users').updateMany(
        {},
        {
          $unset: {
            skills: '',
            bio: '',
            githubUsername: ''
          }
        }
      );

      logger.info('Migration 002: Rollback completed');
    }
  },
  {
    version: '003',
    description: 'Add snippet favoriting and view count',
    up: async () => {
      const connection = await connectToDatabase();
      const db = connection.db;
      if (!db) throw new Error('Database connection failed');

      // Add view count and favorites to existing snippets
      await db.collection('codesnippets').updateMany(
        { viewCount: { $exists: false } },
        {
          $set: {
            viewCount: 0,
            favoriteCount: 0,
            updatedAt: new Date()
          }
        }
      );

      // Create favorites collection
      await db.createCollection('favorites');
      await db.collection('favorites').createIndex({ userId: 1, snippetId: 1 }, { unique: true });
      await db.collection('favorites').createIndex({ snippetId: 1 });
      await db.collection('favorites').createIndex({ createdAt: -1 });

      logger.info('Migration 003: Snippet favoriting system completed');
    },
    down: async () => {
      const connection = await connectToDatabase();
      const db = connection.db;
      if (!db) throw new Error('Database connection failed');

      // Remove favoriting fields
      await db.collection('codesnippets').updateMany(
        {},
        {
          $unset: {
            viewCount: '',
            favoriteCount: ''
          }
        }
      );

      // Drop favorites collection
      await db.collection('favorites').drop();

      logger.info('Migration 003: Rollback completed');
    }
  }
];

async function getMigrationStatus() {
  const connection = await connectToDatabase();
  const db = connection.db;

  try {
    if (!db) throw new Error('Database connection failed');
    const result = await db.collection('migrations').find({}).toArray();
    return result.map(m => m.version);
  } catch {
    // Migrations collection doesn't exist yet
    return [];
  }
}

async function recordMigration(version: string) {
  const connection = await connectToDatabase();
  const db = connection.db;

  if (!db) throw new Error('Database connection failed');
  await db.collection('migrations').insertOne({
    version,
    executedAt: new Date()
  });
}

async function removeMigrationRecord(version: string) {
  const connection = await connectToDatabase();
  const db = connection.db;

  if (!db) throw new Error('Database connection failed');
  await db.collection('migrations').deleteOne({ version });
}

async function runMigrations(targetVersion?: string) {
  try {
    validateEnv();
    logger.info('Starting migration process');

    const appliedMigrations = await getMigrationStatus();
    console.log('📊 Current migration status:');
    console.log(`   Applied: ${appliedMigrations.join(', ') || 'none'}`);

    let migrationsToRun = migrations.filter(m => !appliedMigrations.includes(m.version));

    if (targetVersion) {
      migrationsToRun = migrationsToRun.filter(m => m.version <= targetVersion);
    }

    if (migrationsToRun.length === 0) {
      console.log('✅ No migrations to run. Database is up to date.');
      return;
    }

    console.log(`🚀 Running ${migrationsToRun.length} migration(s):`);

    for (const migration of migrationsToRun) {
      console.log(`   📦 ${migration.version}: ${migration.description}`);

      try {
        await migration.up();
        await recordMigration(migration.version);

        logger.info(`Migration ${migration.version} completed successfully`);
        console.log(`   ✅ Migration ${migration.version} completed`);

      } catch (error) {
        logger.error(`Migration ${migration.version} failed`, {
          error: error instanceof Error ? error.message : String(error),
          migration: migration.version
        });

        console.error(`   ❌ Migration ${migration.version} failed:`, error);
        throw error;
      }
    }

    console.log('🎉 All migrations completed successfully!');

  } catch (error) {
    logger.error('Migration process failed', {
      error: error instanceof Error ? error.message : String(error)
    });

    console.error('❌ Migration process failed:', error);
    process.exit(1);
  }
}

async function rollbackMigration(version: string) {
  try {
    validateEnv();
    logger.info(`Starting rollback of migration ${version}`);

    const migration = migrations.find(m => m.version === version);
    if (!migration) {
      throw new Error(`Migration ${version} not found`);
    }

    const appliedMigrations = await getMigrationStatus();
    if (!appliedMigrations.includes(version)) {
      console.log(`⚠️  Migration ${version} is not applied. Nothing to rollback.`);
      return;
    }

    console.log(`🔄 Rolling back migration ${version}: ${migration.description}`);

    await migration.down();
    await removeMigrationRecord(version);

    logger.info(`Migration ${version} rolled back successfully`);
    console.log(`✅ Migration ${version} rolled back successfully`);

  } catch (error) {
    logger.error(`Rollback failed for migration ${version}`, {
      error: error instanceof Error ? error.message : String(error)
    });

    console.error('❌ Rollback failed:', error);
    process.exit(1);
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'up':
      await runMigrations(args[1]);
      break;

    case 'down':
      if (!args[1]) {
        console.error('❌ Version required for rollback');
        process.exit(1);
      }
      await rollbackMigration(args[1]);
      break;

    case 'status':
      const applied = await getMigrationStatus();
      const pending = migrations.filter(m => !applied.includes(m.version));

      console.log('📊 Migration Status:');
      console.log(`   Applied (${applied.length}): ${applied.join(', ') || 'none'}`);
      console.log(`   Pending (${pending.length}): ${pending.map(m => m.version).join(', ') || 'none'}`);
      break;

    default:
      console.log('📚 Migration Commands:');
      console.log('   npm run migrate up [version]  - Run migrations up to version (or all)');
      console.log('   npm run migrate down <version> - Rollback specific migration');
      console.log('   npm run migrate status        - Show migration status');
      break;
  }
}

// Run CLI if called directly
if (require.main === module) {
  main()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration command failed:', error);
      process.exit(1);
    });
}

export { runMigrations, rollbackMigration, getMigrationStatus };