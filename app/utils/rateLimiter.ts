interface RateLimitData {
  count: number;
  timestamp: number;
}

class RateLimiter {
  private static instance: RateLimiter;
  private store: Map<string, RateLimitData>;
  private readonly MAX_REQUESTS = 3;
  private readonly WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

  private constructor() {
    this.store = new Map();
  }

  public static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  public isRateLimited(ip: string): { limited: boolean; remaining: number } {
    const now = Date.now();
    const data = this.store.get(ip);

    if (!data) {
      this.store.set(ip, { count: 1, timestamp: now });
      return { limited: false, remaining: this.MAX_REQUESTS - 1 };
    }

    // Reset if window has passed
    if (now - data.timestamp > this.WINDOW_MS) {
      this.store.set(ip, { count: 1, timestamp: now });
      return { limited: false, remaining: this.MAX_REQUESTS - 1 };
    }

    // Check if user has exceeded limit
    if (data.count >= this.MAX_REQUESTS) {
      return { limited: true, remaining: 0 };
    }

    // Increment count
    data.count++;
    return { limited: false, remaining: this.MAX_REQUESTS - data.count };
  }
}

export const rateLimiter = RateLimiter.getInstance(); 