interface LogContext {
  [key: string]: any;
}

interface Logger {
  error(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  debug(message: string, context?: LogContext): void;
}

class CloudWatchLogger implements Logger {
  private formatLog(level: string, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...(context && { context }),
    };
    return JSON.stringify(logEntry);
  }

  error(message: string, context?: LogContext): void {
    // AWS Lambda automatically sends stdout/stderr to CloudWatch Logs
    process.stderr.write(this.formatLog('ERROR', message, context) + '\n');
  }

  warn(message: string, context?: LogContext): void {
    process.stdout.write(this.formatLog('WARN', message, context) + '\n');
  }

  info(message: string, context?: LogContext): void {
    process.stdout.write(this.formatLog('INFO', message, context) + '\n');
  }

  debug(message: string, context?: LogContext): void {
    // Only log debug messages in development
    if (process.env.NODE_ENV !== 'production') {
      process.stdout.write(this.formatLog('DEBUG', message, context) + '\n');
    }
  }
}

// Export singleton instance
export const logger: Logger = new CloudWatchLogger();
