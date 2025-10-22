import { logger } from './logger';

// Performance monitoring utilities
interface PerformanceMetrics {
  name: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface ResourceMetrics {
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage: NodeJS.CpuUsage;
  timestamp: number;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics[] = [];
  private resourceSnapshots: ResourceMetrics[] = [];
  private timers = new Map<string, number>();
  private maxMetrics = 1000; // Keep last 1000 metrics

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Start timing an operation
  public startTimer(name: string): void {
    this.timers.set(name, Date.now());
  }

  // End timing and record metric
  public endTimer(name: string, metadata?: Record<string, any>): number {
    const startTime = this.timers.get(name);
    if (!startTime) {
      logger.warn('Timer not found', { name });
      return 0;
    }

    const duration = Date.now() - startTime;
    this.timers.delete(name);

    this.recordMetric({
      name,
      duration,
      timestamp: Date.now(),
      metadata
    });

    return duration;
  }

  // Record a performance metric
  public recordMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric);

    // Keep only the last N metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Log slow operations (>1000ms)
    if (metric.duration > 1000) {
      logger.warn('Slow operation detected', {
        operation: metric.name,
        duration: metric.duration,
        metadata: metric.metadata
      });
    }
  }

  // Take a snapshot of resource usage
  public takeResourceSnapshot(): ResourceMetrics {
    const snapshot: ResourceMetrics = {
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      timestamp: Date.now()
    };

    this.resourceSnapshots.push(snapshot);

    // Keep only the last 100 snapshots
    if (this.resourceSnapshots.length > 100) {
      this.resourceSnapshots = this.resourceSnapshots.slice(-100);
    }

    return snapshot;
  }

  // Get performance statistics
  public getStats(): {
    totalOperations: number;
    averageDuration: number;
    slowOperations: number;
    topSlowOperations: Array<{ name: string; duration: number }>;
    recentMetrics: PerformanceMetrics[];
  } {
    if (this.metrics.length === 0) {
      return {
        totalOperations: 0,
        averageDuration: 0,
        slowOperations: 0,
        topSlowOperations: [],
        recentMetrics: []
      };
    }

    const totalDuration = this.metrics.reduce((sum, m) => sum + m.duration, 0);
    const averageDuration = totalDuration / this.metrics.length;
    const slowOperations = this.metrics.filter(m => m.duration > 1000).length;

    const topSlowOperations = this.metrics
      .filter(m => m.duration > 500) // Operations slower than 500ms
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10)
      .map(m => ({ name: m.name, duration: m.duration }));

    const recentMetrics = this.metrics.slice(-20); // Last 20 operations

    return {
      totalOperations: this.metrics.length,
      averageDuration: Math.round(averageDuration * 100) / 100,
      slowOperations,
      topSlowOperations,
      recentMetrics
    };
  }

  // Get resource usage trends
  public getResourceTrends(): {
    memoryTrend: Array<{ timestamp: number; heapUsed: number; heapTotal: number }>;
    cpuTrend: Array<{ timestamp: number; user: number; system: number }>;
  } {
    const memoryTrend = this.resourceSnapshots.map(snapshot => ({
      timestamp: snapshot.timestamp,
      heapUsed: Math.round(snapshot.memoryUsage.heapUsed / 1024 / 1024 * 100) / 100,
      heapTotal: Math.round(snapshot.memoryUsage.heapTotal / 1024 / 1024 * 100) / 100
    }));

    const cpuTrend = this.resourceSnapshots.map(snapshot => ({
      timestamp: snapshot.timestamp,
      user: snapshot.cpuUsage.user,
      system: snapshot.cpuUsage.system
    }));

    return { memoryTrend, cpuTrend };
  }

  // Clear all metrics (useful for testing)
  public clear(): void {
    this.metrics = [];
    this.resourceSnapshots = [];
    this.timers.clear();
  }
}

// Global performance monitor instance
export const performanceMonitor = PerformanceMonitor.getInstance();

// Decorator for measuring function execution time
export function measurePerformance<T extends any[], R>(
  name?: string
) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const methodName = name || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = async function (...args: T): Promise<R> {
      performanceMonitor.startTimer(methodName);

      try {
        const result = await originalMethod.apply(this, args);
        performanceMonitor.endTimer(methodName, {
          success: true,
          args: args.length
        });
        return result;
      } catch (error) {
        performanceMonitor.endTimer(methodName, {
          success: false,
          error: error instanceof Error ? error.message : String(error),
          args: args.length
        });
        throw error;
      }
    };

    return descriptor;
  };
}

// Utility function to measure async operations
export async function measureAsync<T>(
  name: string,
  operation: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  performanceMonitor.startTimer(name);

  try {
    const result = await operation();
    performanceMonitor.endTimer(name, { ...metadata, success: true });
    return result;
  } catch (error) {
    performanceMonitor.endTimer(name, {
      ...metadata,
      success: false,
      error: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
}

// Utility function to measure sync operations
export function measureSync<T>(
  name: string,
  operation: () => T,
  metadata?: Record<string, any>
): T {
  performanceMonitor.startTimer(name);

  try {
    const result = operation();
    performanceMonitor.endTimer(name, { ...metadata, success: true });
    return result;
  } catch (error) {
    performanceMonitor.endTimer(name, {
      ...metadata,
      success: false,
      error: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
}

// API route performance wrapper
export function withPerformanceMonitoring(handler: Function) {
  return async (request: Request, context?: any) => {
    const url = new URL(request.url);
    const operationName = `API:${request.method}:${url.pathname}`;

    performanceMonitor.startTimer(operationName);
    performanceMonitor.takeResourceSnapshot();

    try {
      const response = await handler(request, context);

      performanceMonitor.endTimer(operationName, {
        method: request.method,
        path: url.pathname,
        status: response.status || 200,
        success: true
      });

      return response;
    } catch (error) {
      performanceMonitor.endTimer(operationName, {
        method: request.method,
        path: url.pathname,
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });

      throw error;
    }
  };
}

// Memory leak detection
export class MemoryLeakDetector {
  private static instance: MemoryLeakDetector;
  private baselineMemory: number = 0;
  private checkInterval: NodeJS.Timeout | null = null;
  private warningThreshold = 100; // MB increase
  private criticalThreshold = 200; // MB increase

  public static getInstance(): MemoryLeakDetector {
    if (!MemoryLeakDetector.instance) {
      MemoryLeakDetector.instance = new MemoryLeakDetector();
    }
    return MemoryLeakDetector.instance;
  }

  public start(intervalMs: number = 60000): void {
    this.baselineMemory = process.memoryUsage().heapUsed / 1024 / 1024;

    this.checkInterval = setInterval(() => {
      this.checkMemoryUsage();
    }, intervalMs);

    logger.info('Memory leak detector started', {
      baseline: Math.round(this.baselineMemory * 100) / 100,
      interval: intervalMs
    });
  }

  public stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    logger.info('Memory leak detector stopped');
  }

  private checkMemoryUsage(): void {
    const currentMemory = process.memoryUsage().heapUsed / 1024 / 1024;
    const increase = currentMemory - this.baselineMemory;

    if (increase > this.criticalThreshold) {
      logger.error('Critical memory leak detected', {
        baseline: Math.round(this.baselineMemory * 100) / 100,
        current: Math.round(currentMemory * 100) / 100,
        increase: Math.round(increase * 100) / 100,
        threshold: this.criticalThreshold
      });
    } else if (increase > this.warningThreshold) {
      logger.warn('Potential memory leak detected', {
        baseline: Math.round(this.baselineMemory * 100) / 100,
        current: Math.round(currentMemory * 100) / 100,
        increase: Math.round(increase * 100) / 100,
        threshold: this.warningThreshold
      });
    }
  }

  public forceGarbageCollection(): void {
    if (global.gc) {
      const beforeGC = process.memoryUsage().heapUsed / 1024 / 1024;
      global.gc();
      const afterGC = process.memoryUsage().heapUsed / 1024 / 1024;

      logger.info('Forced garbage collection', {
        before: Math.round(beforeGC * 100) / 100,
        after: Math.round(afterGC * 100) / 100,
        freed: Math.round((beforeGC - afterGC) * 100) / 100
      });
    } else {
      logger.warn('Garbage collection not exposed. Start Node.js with --expose-gc flag');
    }
  }
}

// Start memory leak detection in production
if (process.env.NODE_ENV === 'production') {
  const detector = MemoryLeakDetector.getInstance();
  detector.start(5 * 60 * 1000); // Check every 5 minutes
}

// Graceful shutdown
const cleanup = () => {
  logger.info('Shutting down performance monitoring');
  const detector = MemoryLeakDetector.getInstance();
  detector.stop();
};

process.on('SIGTERM', cleanup);
process.on('SIGINT', cleanup);

export default performanceMonitor;