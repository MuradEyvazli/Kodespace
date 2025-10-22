// Production-ready logging system
interface LogLevel {
  ERROR: 'error';
  WARN: 'warn';
  INFO: 'info';
  DEBUG: 'debug';
}

const LOG_LEVELS: LogLevel = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug'
} as const;

type LogLevelType = LogLevel[keyof LogLevel];

interface LogEntry {
  timestamp: string;
  level: LogLevelType;
  message: string;
  context?: Record<string, any>;
  userId?: string;
  requestId?: string;
  stack?: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private logLevel = (process.env.LOG_LEVEL as LogLevelType) || 'info';

  private shouldLog(level: LogLevelType): boolean {
    const levels = ['error', 'warn', 'info', 'debug'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const requestedLevelIndex = levels.indexOf(level);
    return requestedLevelIndex <= currentLevelIndex;
  }

  private formatLogEntry(
    level: LogLevelType,
    message: string,
    context?: Record<string, any>,
    error?: Error
  ): LogEntry {
    const timestamp = new Date().toISOString();

    const logEntry: LogEntry = {
      timestamp,
      level,
      message,
      ...(context && { context }),
      ...(error?.stack && { stack: error.stack })
    };

    // Add request context if available
    if (typeof window === 'undefined') {
      // Server-side: Add request ID from async local storage or headers
      const requestId = this.getRequestId();
      if (requestId) {
        logEntry.requestId = requestId;
      }
    }

    return logEntry;
  }

  private getRequestId(): string | undefined {
    // In production, implement proper request ID tracking
    // For now, return undefined
    return undefined;
  }

  private writeLog(logEntry: LogEntry): void {
    if (this.isDevelopment) {
      // Development: Pretty console output
      const { timestamp, level, message, context, stack } = logEntry;
      const colorMap = {
        error: '\x1b[31m', // Red
        warn: '\x1b[33m',  // Yellow
        info: '\x1b[36m',  // Cyan
        debug: '\x1b[90m'  // Gray
      };
      const resetColor = '\x1b[0m';

      console.log(
        `${colorMap[level]}[${level.toUpperCase()}]${resetColor} ${timestamp} - ${message}`
      );

      if (context) {
        console.log('Context:', JSON.stringify(context, null, 2));
      }

      if (stack) {
        console.log('Stack:', stack);
      }
    } else {
      // Production: Structured JSON logging
      console.log(JSON.stringify(logEntry));
    }
  }

  public error(message: string, context?: Record<string, any>, error?: Error): void {
    if (!this.shouldLog('error')) return;

    const logEntry = this.formatLogEntry('error', message, context, error);
    this.writeLog(logEntry);

    // In production, send to external logging service
    this.sendToExternalService(logEntry);
  }

  public warn(message: string, context?: Record<string, any>): void {
    if (!this.shouldLog('warn')) return;

    const logEntry = this.formatLogEntry('warn', message, context);
    this.writeLog(logEntry);
  }

  public info(message: string, context?: Record<string, any>): void {
    if (!this.shouldLog('info')) return;

    const logEntry = this.formatLogEntry('info', message, context);
    this.writeLog(logEntry);
  }

  public debug(message: string, context?: Record<string, any>): void {
    if (!this.shouldLog('debug')) return;

    const logEntry = this.formatLogEntry('debug', message, context);
    this.writeLog(logEntry);
  }

  // Security-focused logging methods
  public authAttempt(email: string, success: boolean, ip?: string): void {
    this.info('Authentication attempt', {
      email: this.maskEmail(email),
      success,
      ip: ip ? this.maskIP(ip) : undefined,
      type: 'auth'
    });
  }

  public securityEvent(event: string, context?: Record<string, any>): void {
    this.warn(`Security event: ${event}`, {
      ...context,
      type: 'security'
    });
  }

  public dataAccess(resource: string, userId: string, action: string): void {
    this.info('Data access', {
      resource,
      userId: this.maskUserId(userId),
      action,
      type: 'data_access'
    });
  }

  public apiRequest(
    method: string,
    path: string,
    statusCode: number,
    duration: number,
    userId?: string
  ): void {
    this.info('API request', {
      method,
      path,
      statusCode,
      duration,
      userId: userId ? this.maskUserId(userId) : undefined,
      type: 'api'
    });
  }

  public performance(metric: string, value: number, context?: Record<string, any>): void {
    this.info(`Performance metric: ${metric}`, {
      metric,
      value,
      ...context,
      type: 'performance'
    });
  }

  // Data masking for privacy
  private maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    if (!local || !domain) return '***@***.***';
    return `${local.substring(0, 2)}***@${domain}`;
  }

  private maskIP(ip: string): string {
    const parts = ip.split('.');
    return `${parts[0]}.${parts[1]}.***.**`;
  }

  private maskUserId(userId: string): string {
    return `***${userId.slice(-4)}`;
  }

  private sendToExternalService(logEntry: LogEntry): void {
    // In production, implement integration with:
    // - Sentry for error tracking
    // - DataDog, New Relic, or CloudWatch for monitoring
    // - Custom analytics service

    if (logEntry.level === 'error' && !this.isDevelopment) {
      // Send critical errors to monitoring service
      // Example: Sentry.captureException(new Error(logEntry.message));
    }
  }
}

// Create singleton instance
export const logger = new Logger();

// Convenience functions for common use cases
export const logError = (message: string, context?: Record<string, any>, error?: Error) => {
  logger.error(message, context, error);
};

export const logWarn = (message: string, context?: Record<string, any>) => {
  logger.warn(message, context);
};

export const logInfo = (message: string, context?: Record<string, any>) => {
  logger.info(message, context);
};

export const logDebug = (message: string, context?: Record<string, any>) => {
  logger.debug(message, context);
};

// Request logging middleware helper
export const createRequestLogger = (requestId: string) => ({
  error: (message: string, context?: Record<string, any>, error?: Error) =>
    logger.error(message, { ...context, requestId }, error),
  warn: (message: string, context?: Record<string, any>) =>
    logger.warn(message, { ...context, requestId }),
  info: (message: string, context?: Record<string, any>) =>
    logger.info(message, { ...context, requestId }),
  debug: (message: string, context?: Record<string, any>) =>
    logger.debug(message, { ...context, requestId })
});

// Performance monitoring helper
export const measurePerformance = async <T>(
  operation: string,
  fn: () => Promise<T> | T,
  context?: Record<string, any>
): Promise<T> => {
  const start = performance.now();

  try {
    const result = await fn();
    const duration = performance.now() - start;

    logger.performance(operation, duration, context);

    return result;
  } catch (error) {
    const duration = performance.now() - start;

    logger.error(`Operation failed: ${operation}`, {
      ...context,
      duration,
      error: error instanceof Error ? error.message : String(error)
    }, error instanceof Error ? error : undefined);

    throw error;
  }
};