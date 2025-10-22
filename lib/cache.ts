import { logger } from './logger';

// Cache interface for type safety
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
  accessCount: number;
  lastAccessed: number;
}

// Cache statistics for monitoring
interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  evictions: number;
  totalSize: number;
  averageAccessTime: number;
}

// Cache configuration
interface CacheConfig {
  maxSize: number;
  defaultTtl: number;
  cleanupInterval: number;
  enableStats: boolean;
}

// Memory cache implementation with LRU eviction
export class MemoryCache {
  private cache = new Map<string, CacheItem<any>>();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    evictions: 0,
    totalSize: 0,
    averageAccessTime: 0
  };
  private accessTimes: number[] = [];
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor(private config: CacheConfig) {
    // Start cleanup timer
    this.startCleanup();

    // Log cache initialization
    logger.info('Memory cache initialized', {
      maxSize: config.maxSize,
      defaultTtl: config.defaultTtl,
      cleanupInterval: config.cleanupInterval
    });
  }

  // Get item from cache
  public get<T>(key: string): T | null {
    const startTime = Date.now();

    try {
      const item = this.cache.get(key);

      if (!item) {
        this.stats.misses++;
        return null;
      }

      const now = Date.now();

      // Check if item has expired
      if (now > item.timestamp + item.ttl) {
        this.cache.delete(key);
        this.stats.evictions++;
        this.stats.misses++;

        logger.debug('Cache item expired', {
          key,
          age: now - item.timestamp,
          ttl: item.ttl
        });

        return null;
      }

      // Update access tracking
      item.accessCount++;
      item.lastAccessed = now;
      this.stats.hits++;

      // Move to end (LRU)
      this.cache.delete(key);
      this.cache.set(key, item);

      // Track access time
      if (this.config.enableStats) {
        const accessTime = Date.now() - startTime;
        this.recordAccessTime(accessTime);
      }

      return item.data;

    } catch (error) {
      logger.error('Cache get error', {
        key,
        error: error instanceof Error ? error.message : String(error)
      }, error instanceof Error ? error : undefined);
      return null;
    }
  }

  // Set item in cache
  public set<T>(key: string, data: T, ttl?: number): void {
    try {
      const now = Date.now();
      const itemTtl = ttl || this.config.defaultTtl;

      // Check cache size limit
      if (this.cache.size >= this.config.maxSize && !this.cache.has(key)) {
        this.evictLRU();
      }

      const item: CacheItem<T> = {
        data,
        timestamp: now,
        ttl: itemTtl,
        accessCount: 0,
        lastAccessed: now
      };

      this.cache.set(key, item);
      this.stats.sets++;
      this.stats.totalSize = this.cache.size;

      logger.debug('Cache item set', {
        key,
        ttl: itemTtl,
        cacheSize: this.cache.size
      });

    } catch (error) {
      logger.error('Cache set error', {
        key,
        error: error instanceof Error ? error.message : String(error)
      }, error instanceof Error ? error : undefined);
    }
  }

  // Delete item from cache
  public delete(key: string): boolean {
    try {
      const deleted = this.cache.delete(key);
      if (deleted) {
        this.stats.deletes++;
        this.stats.totalSize = this.cache.size;

        logger.debug('Cache item deleted', {
          key,
          cacheSize: this.cache.size
        });
      }
      return deleted;
    } catch (error) {
      logger.error('Cache delete error', {
        key,
        error: error instanceof Error ? error.message : String(error)
      }, error instanceof Error ? error : undefined);
      return false;
    }
  }

  // Clear all cache items
  public clear(): void {
    try {
      const size = this.cache.size;
      this.cache.clear();
      this.stats.totalSize = 0;

      logger.info('Cache cleared', { previousSize: size });
    } catch (error) {
      logger.error('Cache clear error', {
        error: error instanceof Error ? error.message : String(error)
      }, error instanceof Error ? error : undefined);
    }
  }

  // Get cache statistics
  public getStats(): CacheStats {
    return { ...this.stats };
  }

  // Get cache size
  public size(): number {
    return this.cache.size;
  }

  // Check if key exists
  public has(key: string): boolean {
    return this.cache.has(key) && !this.isExpired(key);
  }

  // Get all keys
  public keys(): string[] {
    return Array.from(this.cache.keys());
  }

  // Cleanup expired items
  public cleanup(): void {
    const now = Date.now();
    let evicted = 0;

    for (const [key, item] of this.cache.entries()) {
      if (now > item.timestamp + item.ttl) {
        this.cache.delete(key);
        evicted++;
      }
    }

    if (evicted > 0) {
      this.stats.evictions += evicted;
      this.stats.totalSize = this.cache.size;

      logger.debug('Cache cleanup completed', {
        evicted,
        remaining: this.cache.size
      });
    }
  }

  // Reset statistics
  public resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0,
      totalSize: this.cache.size,
      averageAccessTime: 0
    };
    this.accessTimes = [];
  }

  // Stop cleanup timer
  public destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.clear();
    logger.info('Memory cache destroyed');
  }

  // Private methods
  private evictLRU(): void {
    // Find the least recently used item
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, item] of this.cache.entries()) {
      if (item.lastAccessed < oldestTime) {
        oldestTime = item.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.stats.evictions++;

      logger.debug('LRU eviction', {
        evictedKey: oldestKey,
        age: Date.now() - oldestTime
      });
    }
  }

  private isExpired(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return true;

    const now = Date.now();
    return now > item.timestamp + item.ttl;
  }

  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  private recordAccessTime(time: number): void {
    this.accessTimes.push(time);

    // Keep only last 1000 access times to calculate average
    if (this.accessTimes.length > 1000) {
      this.accessTimes = this.accessTimes.slice(-1000);
    }

    this.stats.averageAccessTime =
      this.accessTimes.reduce((sum, t) => sum + t, 0) / this.accessTimes.length;
  }
}

// Cache instances with different configurations
export const appCache = new MemoryCache({
  maxSize: 1000,
  defaultTtl: 5 * 60 * 1000, // 5 minutes
  cleanupInterval: 60 * 1000, // 1 minute
  enableStats: true
});

export const sessionCache = new MemoryCache({
  maxSize: 500,
  defaultTtl: 30 * 60 * 1000, // 30 minutes
  cleanupInterval: 5 * 60 * 1000, // 5 minutes
  enableStats: true
});

export const userCache = new MemoryCache({
  maxSize: 200,
  defaultTtl: 15 * 60 * 1000, // 15 minutes
  cleanupInterval: 2 * 60 * 1000, // 2 minutes
  enableStats: true
});

// Cache decorator for functions
export function cached<Args extends any[], Return>(
  fn: (...args: Args) => Promise<Return>,
  options: {
    cache?: MemoryCache;
    keyGenerator?: (...args: Args) => string;
    ttl?: number;
  } = {}
) {
  const cache = options.cache || appCache;
  const keyGenerator = options.keyGenerator || ((...args) => JSON.stringify(args));

  return async (...args: Args): Promise<Return> => {
    const key = `fn:${fn.name}:${keyGenerator(...args)}`;

    // Try to get from cache first
    const cached = cache.get<Return>(key);
    if (cached !== null) {
      return cached;
    }

    // Execute function and cache result
    try {
      const result = await fn(...args);
      cache.set(key, result, options.ttl);
      return result;
    } catch (error) {
      // Don't cache errors
      throw error;
    }
  };
}

// Graceful shutdown
const cleanup = () => {
  logger.info('Shutting down cache instances');
  appCache.destroy();
  sessionCache.destroy();
  userCache.destroy();
};

process.on('SIGTERM', cleanup);
process.on('SIGINT', cleanup);

export default appCache;