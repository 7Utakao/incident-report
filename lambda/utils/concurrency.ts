// Concurrency control with semaphore and queue
export interface ConcurrencyOptions {
  maxConcurrent?: number;
  queueTimeout?: number;
  queueMaxSize?: number;
}

interface QueueItem<T> {
  operation: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
  timestamp: number;
}

export class ConcurrencyLimiter {
  private maxConcurrent: number;
  private queueTimeout: number;
  private queueMaxSize: number;
  private running: number = 0;
  private queue: QueueItem<any>[] = [];

  constructor(options: ConcurrencyOptions = {}) {
    this.maxConcurrent = options.maxConcurrent || 3;
    this.queueTimeout = options.queueTimeout || 30000; // 30 seconds
    this.queueMaxSize = options.queueMaxSize || 100;
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      // Check if queue is full
      if (this.queue.length >= this.queueMaxSize) {
        reject(new Error('Queue is full. Service overloaded.'));
        return;
      }

      const queueItem: QueueItem<T> = {
        operation,
        resolve,
        reject,
        timestamp: Date.now(),
      };

      this.queue.push(queueItem);
      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    // Clean up expired items
    this.cleanupExpiredItems();

    // Process items if we have capacity
    while (this.running < this.maxConcurrent && this.queue.length > 0) {
      const item = this.queue.shift();
      if (!item) break;

      // Check if item has expired
      if (Date.now() - item.timestamp > this.queueTimeout) {
        item.reject(new Error('Request timeout in queue'));
        continue;
      }

      this.running++;
      this.executeItem(item);
    }
  }

  private async executeItem<T>(item: QueueItem<T>): Promise<void> {
    try {
      const result = await item.operation();
      item.resolve(result);
    } catch (error) {
      item.reject(error as Error);
    } finally {
      this.running--;
      // Process next items in queue
      setImmediate(() => this.processQueue());
    }
  }

  private cleanupExpiredItems(): void {
    const now = Date.now();
    const originalLength = this.queue.length;

    this.queue = this.queue.filter((item) => {
      const isExpired = now - item.timestamp > this.queueTimeout;
      if (isExpired) {
        item.reject(new Error('Request timeout in queue'));
      }
      return !isExpired;
    });

    if (this.queue.length < originalLength) {
      console.log(`Cleaned up ${originalLength - this.queue.length} expired queue items`);
    }
  }

  // Get current status
  getStatus() {
    return {
      running: this.running,
      queued: this.queue.length,
      maxConcurrent: this.maxConcurrent,
      isOverloaded: this.queue.length >= this.queueMaxSize * 0.9, // 90% threshold
    };
  }

  // Check if service is overloaded
  isOverloaded(): boolean {
    return this.queue.length >= this.queueMaxSize * 0.9;
  }
}

// Global instance for AI operations
export const aiConcurrencyLimiter = new ConcurrencyLimiter({
  maxConcurrent: parseInt(process.env.AI_MAX_CONCURRENT || '5'), // 3から5に増加
  queueTimeout: parseInt(process.env.AI_QUEUE_TIMEOUT || '45000'), // 30秒から45秒に増加
  queueMaxSize: parseInt(process.env.AI_QUEUE_MAX_SIZE || '150'), // 100から150に増加
});

// Helper function to execute with concurrency control
export async function withConcurrencyControl<T>(
  operation: () => Promise<T>,
  limiter: ConcurrencyLimiter = aiConcurrencyLimiter,
): Promise<T> {
  // Check if overloaded before queuing
  if (limiter.isOverloaded()) {
    const error = new Error('Service temporarily overloaded. Please retry later.') as any;
    error.statusCode = 503;
    error.retryAfter = 2;
    throw error;
  }

  return limiter.execute(operation);
}
