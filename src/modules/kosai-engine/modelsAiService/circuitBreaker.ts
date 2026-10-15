/**
 * KOSAI AI Monopoly - Central Circuit Breaker & Velocity Sentinel
 * KOSUN26 Gate 3: Enforces strict request throttling, in-flight deduplication,
 * and automatic emergency shutdown on hot loops.
 */

export interface CircuitBreakerOptions {
  maxRequestsPerMinute?: number;
  cooldownPeriodMs?: number;
}

export class KosaiCircuitBreaker {
  private static instance: KosaiCircuitBreaker;
  
  // Call history map: Key = `${moduleName}:${tenantId}` -> Array of timestamps (ms)
  private callHistory = new Map<string, number[]>();

  // In-flight promises map for Single-Flight deduplication
  private inFlightRequests = new Map<string, Promise<any>>();

  // In-memory cache for deterministic queries
  private responseCache = new Map<string, { timestamp: number; data: any }>();

  private maxRequestsPerMinute: number;
  private cooldownPeriodMs: number;

  private constructor(options?: CircuitBreakerOptions) {
    this.maxRequestsPerMinute = options?.maxRequestsPerMinute || 6; // Max 6 calls/minute per module
    this.cooldownPeriodMs = options?.cooldownPeriodMs || 60000;      // 1 minute window
  }

  public static getInstance(): KosaiCircuitBreaker {
    if (!KosaiCircuitBreaker.instance) {
      KosaiCircuitBreaker.instance = new KosaiCircuitBreaker();
    }
    return KosaiCircuitBreaker.instance;
  }

  /**
   * Asserts whether a request is allowed to fire.
   * Throws an error immediately if the circuit breaker is tripped.
   */
  public checkLimit(moduleName: string, tenantId: string = '_master'): void {
    const key = `${moduleName.toLowerCase().trim()}:${tenantId.toLowerCase().trim()}`;
    const now = Date.now();
    const history = (this.callHistory.get(key) || []).filter(
      (ts) => now - ts < this.cooldownPeriodMs
    );

    if (history.length >= this.maxRequestsPerMinute) {
      console.error(
        `🚨 [KOSAI Circuit Breaker] TRIPPED! Module "${moduleName}" exceeded ${this.maxRequestsPerMinute} calls in 60s.`
      );
      throw new Error(
        `[KOSAI Circuit Breaker] הופעל מפסק ביטחון למודול ${moduleName}! זוהה קצב חריג של מעל ${this.maxRequestsPerMinute} קריאות לדקה. הקריאות נחסמו להגנה על הטוקנים. נא להמתין דקה.`
      );
    }

    history.push(now);
    this.callHistory.set(key, history);
  }

  /**
   * Retrieves cached data from memory or sessionStorage
   */
  public getFromCache<T>(cacheKey: string): T | null {
    // 1. Check memory cache
    const memory = this.responseCache.get(cacheKey);
    if (memory && Date.now() - memory.timestamp < 24 * 60 * 60 * 1000) {
      return memory.data as T;
    }

    // 2. Check browser sessionStorage
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const stored = window.sessionStorage.getItem(`kosai_cache_${cacheKey}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          this.responseCache.set(cacheKey, { timestamp: Date.now(), data: parsed });
          return parsed as T;
        }
      }
    } catch {}

    return null;
  }

  /**
   * Saves response to memory and sessionStorage cache
   */
  public setInCache<T>(cacheKey: string, data: T): void {
    this.responseCache.set(cacheKey, { timestamp: Date.now(), data });
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.setItem(`kosai_cache_${cacheKey}`, JSON.stringify(data));
      }
    } catch {}
  }

  /**
   * Single-flight deduplication wrapper:
   * If an identical request is already in progress, attaches to existing Promise
   */
  public async executeSingleFlight<T>(
    flightKey: string,
    operation: () => Promise<T>
  ): Promise<T> {
    if (this.inFlightRequests.has(flightKey)) {
      return this.inFlightRequests.get(flightKey)!;
    }

    const promise = operation().finally(() => {
      this.inFlightRequests.delete(flightKey);
    });

    this.inFlightRequests.set(flightKey, promise);
    return promise;
  }

  /**
   * Manual reset for a specific module
   */
  public reset(moduleName?: string): void {
    if (moduleName) {
      for (const key of this.callHistory.keys()) {
        if (key.startsWith(`${moduleName.toLowerCase().trim()}:`)) {
          this.callHistory.delete(key);
        }
      }
    } else {
      this.callHistory.clear();
      this.inFlightRequests.clear();
    }
  }
}

export const kosaiCircuitBreaker = KosaiCircuitBreaker.getInstance();
