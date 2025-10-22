#!/usr/bin/env ts-node

/**
 * Database seeding script for KODESPACE
 * Creates initial data for development and testing
 */

import { connectToDatabase } from '../lib/database.js';
import { logger } from '../lib/logger.js';
import { validateEnv } from '../lib/config/env.js';

// Seed data
const seedUsers = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    role: 'developer',
    skills: ['JavaScript', 'TypeScript', 'React', 'Node.js'],
    bio: 'Full-stack developer with 5 years of experience',
    githubUsername: 'johndoe',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'senior_developer',
    skills: ['Python', 'Django', 'PostgreSQL', 'Docker'],
    bio: 'Senior backend developer and DevOps enthusiast',
    githubUsername: 'janesmith',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Admin User',
    email: 'admin@kodespace.dev',
    role: 'admin',
    skills: ['System Administration', 'Security', 'Monitoring'],
    bio: 'Platform administrator',
    githubUsername: 'kodespace-admin',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const seedSnippets = [
  {
    title: 'Hello World in TypeScript',
    description: 'A simple hello world example in TypeScript',
    code: `function hello(name: string): string {
  return \`Hello, \${name}!\`;
}

console.log(hello('World'));`,
    language: 'typescript',
    tags: ['basics', 'typescript', 'functions'],
    isPublic: true,
    authorId: null, // Will be set after user creation
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: 'React useState Hook',
    description: 'Example of using React useState hook with TypeScript',
    code: `import React, { useState } from 'react';

interface CounterProps {
  initialValue?: number;
}

const Counter: React.FC<CounterProps> = ({ initialValue = 0 }) => {
  const [count, setCount] = useState<number>(initialValue);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
      <button onClick={() => setCount(count - 1)}>
        Decrement
      </button>
    </div>
  );
};

export default Counter;`,
    language: 'typescript',
    tags: ['react', 'hooks', 'typescript', 'components'],
    isPublic: true,
    authorId: null,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: 'Express.js Middleware',
    description: 'Custom middleware for Express.js with error handling',
    code: `import { Request, Response, NextFunction } from 'express';

interface AuthRequest extends Request {
  userId?: string;
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify token logic here
    // req.userId = decodedToken.userId;

    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};`,
    language: 'typescript',
    tags: ['express', 'middleware', 'authentication', 'nodejs'],
    isPublic: true,
    authorId: null,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

async function seedDatabase() {
  try {
    // Validate environment first
    validateEnv();

    logger.info('Starting database seeding process');

    // Connect to database
    const connection = await connectToDatabase();
    const db = connection.db;
    if (!db) throw new Error('Database connection failed');

    // Clear existing data
    logger.info('Clearing existing data');
    await db.collection('users').deleteMany({});
    await db.collection('codesnippets').deleteMany({});
    await db.collection('comments').deleteMany({});

    // Insert users
    logger.info('Seeding users');
    const usersResult = await db.collection('users').insertMany(seedUsers);
    const userIds = Object.values(usersResult.insertedIds).filter(id => id);

    // Update snippets with author IDs
    (seedSnippets[0] as any).authorId = userIds[0];
    (seedSnippets[1] as any).authorId = userIds[1];
    (seedSnippets[2] as any).authorId = userIds[0];

    // Insert snippets
    logger.info('Seeding code snippets');
    const snippetsResult = await db.collection('codesnippets').insertMany(seedSnippets);
    const snippetIds = Object.values(snippetsResult.insertedIds);

    // Insert sample comments
    const seedComments = [
      {
        content: 'Great example! This helped me understand TypeScript functions better.',
        authorId: userIds[1],
        snippetId: snippetIds[0],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        content: 'Nice use of React hooks. Could you add error handling?',
        authorId: userIds[0],
        snippetId: snippetIds[1],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        content: 'This middleware pattern is very useful. Thanks for sharing!',
        authorId: userIds[2],
        snippetId: snippetIds[2],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    logger.info('Seeding comments');
    await db.collection('comments').insertMany(seedComments);

    // Create indexes for performance
    logger.info('Creating database indexes');
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ githubUsername: 1 }, { unique: true, sparse: true });
    await db.collection('codesnippets').createIndex({ authorId: 1 });
    await db.collection('codesnippets').createIndex({ language: 1 });
    await db.collection('codesnippets').createIndex({ tags: 1 });
    await db.collection('codesnippets').createIndex({ createdAt: -1 });
    await db.collection('codesnippets').createIndex({ isPublic: 1 });
    await db.collection('comments').createIndex({ snippetId: 1 });
    await db.collection('comments').createIndex({ authorId: 1 });

    // Create text search index for snippets
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

    logger.info('Database seeding completed successfully', {
      users: seedUsers.length,
      snippets: seedSnippets.length,
      comments: seedComments.length
    });

    console.log('✅ Database seeding completed successfully!');
    console.log(`📊 Created ${seedUsers.length} users, ${seedSnippets.length} snippets, ${seedComments.length} comments`);
    console.log('🔍 Search indexes created for optimal performance');

  } catch (error) {
    logger.error('Database seeding failed', {
      error: error instanceof Error ? error.message : String(error)
    }, error instanceof Error ? error : undefined);

    console.error('❌ Database seeding failed:');
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Run seeding if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Seeding process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding process failed:', error);
      process.exit(1);
    });
}

export default seedDatabase;