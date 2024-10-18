// src/utils/rateLimiter.ts

class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  private maxAttempts: number = 5;
  private timeWindow: number = 60000; // 1 minute

  attempt(key: string): boolean {
    const now = Date.now();
    const userAttempts = this.attempts.get(key) || [];

    // Remove attempts outside the time window
    const recentAttempts = userAttempts.filter(
      (time) => now - time < this.timeWindow
    );

    if (recentAttempts.length >= this.maxAttempts) {
      return false;
    }

    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);
    return true;
  }
}

export const rateLimiter = new RateLimiter();
