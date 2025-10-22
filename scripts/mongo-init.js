// MongoDB initialization script for Docker
// This script runs when the MongoDB container starts for the first time

// Connect to the kodespace database
db = db.getSiblingDB('kodespace');

// Create collections with proper indexes
db.createCollection('users');
db.createCollection('codesnippets');
db.createCollection('comments');

// Users collection indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ githubId: 1 }, { unique: true, sparse: true });
db.users.createIndex({ googleId: 1 }, { unique: true, sparse: true });
db.users.createIndex({ createdAt: 1 });
db.users.createIndex({ role: 1 });
db.users.createIndex({ skills: 1 });

// Code snippets collection indexes
db.codesnippets.createIndex({ authorId: 1 });
db.codesnippets.createIndex({ language: 1 });
db.codesnippets.createIndex({ tags: 1 });
db.codesnippets.createIndex({ createdAt: -1 });
db.codesnippets.createIndex({ updatedAt: -1 });
db.codesnippets.createIndex({ isPublic: 1 });
db.codesnippets.createIndex({
  title: "text",
  description: "text",
  code: "text"
}, {
  name: "snippet_search_index",
  weights: {
    title: 10,
    description: 5,
    code: 1
  }
});

// Comments collection indexes
db.comments.createIndex({ snippetId: 1 });
db.comments.createIndex({ authorId: 1 });
db.comments.createIndex({ createdAt: -1 });
db.comments.createIndex({ parentId: 1 }, { sparse: true });

// Create application user
db.createUser({
  user: process.env.MONGO_APP_USERNAME || 'kodespace',
  pwd: process.env.MONGO_APP_PASSWORD || 'kodespace123',
  roles: [
    {
      role: 'readWrite',
      db: 'kodespace'
    }
  ]
});

print('MongoDB initialization completed successfully');
print('Database: kodespace');
print('Collections created: users, codesnippets, comments');
print('Indexes created for optimal performance');
print('Application user created: kodespace');