// Retry utility with exponential backoff and jitter
export interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  jitterFactor?: number;
}

export interface RetryableError extends Error {
  retryable?: boolean;
  statusCode?: number;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 5,
  baseDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  backoffFactor: 2,
  jitterFactor: 0.1,
};

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const config = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      // Check if error is retryable
      if (!isRetryableError(error as RetryableError)) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === config.maxRetries) {
        break;
      }

      // Calculate delay with exponential backoff and jitter
      const delay = calculateDelay(attempt, config);
      console.log(`Retry attempt ${attempt + 1}/${config.maxRetries} after ${delay}ms`);

      await sleep(delay);
    }
  }

  throw lastError || new Error('Retry failed with unknown error');
}

function isRetryableError(error: RetryableError): boolean {
  // Explicitly marked as retryable
  if (error.retryable === true) {
    return true;
  }

  // Explicitly marked as non-retryable
  if (error.retryable === false) {
    return false;
  }

  // Check status codes for retryable errors
  if (error.statusCode) {
    // 5xx server errors are generally retryable
    if (error.statusCode >= 500 && error.statusCode < 600) {
      return true;
    }

    // 429 Too Many Requests is retryable
    if (error.statusCode === 429) {
      return true;
    }

    // 408 Request Timeout is retryable
    if (error.statusCode === 408) {
      return true;
    }
  }

  // Check error messages for common retryable patterns
  const message = error.message.toLowerCase();
  const retryablePatterns = [
    'timeout',
    'connection',
    'network',
    'throttl',
    'rate limit',
    'overload',
    'busy',
    'unavailable',
  ];

  return retryablePatterns.some((pattern) => message.includes(pattern));
}

function calculateDelay(attempt: number, config: Required<RetryOptions>): number {
  // Exponential backoff: baseDelay * (backoffFactor ^ attempt)
  const exponentialDelay = config.baseDelay * Math.pow(config.backoffFactor, attempt);

  // Apply jitter to avoid thundering herd
  const jitter = exponentialDelay * config.jitterFactor * Math.random();
  const delayWithJitter = exponentialDelay + jitter;

  // Cap at maxDelay
  return Math.min(delayWithJitter, config.maxDelay);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Helper to create retryable errors
export function createRetryableError(message: string, statusCode?: number): RetryableError {
  const error = new Error(message) as RetryableError;
  error.retryable = true;
  error.statusCode = statusCode;
  return error;
}

// Helper to create non-retryable errors
export function createNonRetryableError(message: string, statusCode?: number): RetryableError {
  const error = new Error(message) as RetryableError;
  error.retryable = false;
  error.statusCode = statusCode;
  return error;
}
