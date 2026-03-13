/**
 * CarbonX — Debounce & Rate Limiting Utilities
 * Task 6.1: 500ms debounce for energy calculations
 * Task 6.2: 5-second rate limiting for notifications
 */

// ─── Debounce (Task 6.1) ──────────────────────────────────────────────────────

/**
 * Creates a debounced version of a function that delays execution until
 * `delayMs` milliseconds have passed since the last call.
 *
 * Used for energy calculations — prevents excessive recalculation during
 * rapid data input changes. Default: 500ms as per tasks.md spec.
 *
 * @param fn - Function to debounce
 * @param delayMs - Delay in milliseconds (default: 500)
 */
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
    fn: T,
    delayMs = 500
): (...args: Parameters<T>) => void {
    let timerId: ReturnType<typeof setTimeout> | null = null;

    const debouncedFn = (...args: Parameters<T>): void => {
        if (timerId !== null) {
            clearTimeout(timerId);
        }
        timerId = setTimeout(() => {
            fn(...args);
            timerId = null;
        }, delayMs);
    };

    /** Cancel any pending invocation */
    debouncedFn.cancel = () => {
        if (timerId !== null) {
            clearTimeout(timerId);
            timerId = null;
        }
    };

    return debouncedFn;
}

/**
 * Async-aware debounce — returns a Promise that resolves with the function result
 * after the debounce delay.
 *
 * @param fn - Async function to debounce
 * @param delayMs - Delay in milliseconds (default: 500)
 */
export function debounceAsync<T extends (...args: Parameters<T>) => Promise<ReturnType<T>>>(
    fn: T,
    delayMs = 500
): (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>> {
    let timerId: ReturnType<typeof setTimeout> | null = null;
    let resolve: ((value: Awaited<ReturnType<T>>) => void) | null = null;
    let reject: ((reason?: unknown) => void) | null = null;

    return (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
        if (timerId !== null) {
            clearTimeout(timerId);
        }
        // Reject previous pending promise
        if (reject) {
            reject(new Error('Debounced: superseded by newer call'));
        }

        return new Promise((res, rej) => {
            resolve = res;
            reject = rej;
            timerId = setTimeout(async () => {
                try {
                    const result = await fn(...args);
                    resolve?.(result as Awaited<ReturnType<T>>);
                } catch (err) {
                    reject?.(err);
                } finally {
                    timerId = null;
                    resolve = null;
                    reject = null;
                }
            }, delayMs);
        });
    };
}

// ─── Rate Limiter (Task 6.2) ──────────────────────────────────────────────────

/**
 * Creates a rate limiter that enforces a minimum cooldown between successive
 * calls. Used for notification system to prevent alert spam.
 *
 * Default: 5000ms cooldown as per tasks.md spec.
 * Critical alerts can bypass the cooldown via `forceCritical` flag.
 */
export class RateLimiter {
    private lastCallTimes: Map<string, number> = new Map();
    private readonly cooldownMs: number;

    /**
     * @param cooldownMs - Minimum time between calls (default: 5000ms = 5 seconds)
     */
    constructor(cooldownMs = 5000) {
        this.cooldownMs = cooldownMs;
    }

    /**
     * Check if a call identified by `key` is allowed given the cooldown.
     *
     * @param key - Unique identifier for this rate-limited action (e.g. gatewayId)
     * @param forceCritical - If true, bypasses cooldown (for critical alerts)
     * @returns true if the call is allowed, false if rate limited
     */
    isAllowed(key: string, forceCritical = false): boolean {
        if (forceCritical) {
            this.lastCallTimes.set(key, Date.now());
            return true;
        }

        const lastCall = this.lastCallTimes.get(key);
        const now = Date.now();

        if (lastCall === undefined || now - lastCall >= this.cooldownMs) {
            this.lastCallTimes.set(key, now);
            return true;
        }

        return false;
    }

    /**
     * Get remaining cooldown time in ms for a given key.
     * Returns 0 if the key is not rate limited.
     */
    getRemainingCooldown(key: string): number {
        const lastCall = this.lastCallTimes.get(key);
        if (lastCall === undefined) return 0;

        const elapsed = Date.now() - lastCall;
        return Math.max(0, this.cooldownMs - elapsed);
    }

    /**
     * Manually reset the rate limit for a specific key.
     */
    reset(key: string): void {
        this.lastCallTimes.delete(key);
    }

    /**
     * Reset all rate limits.
     */
    resetAll(): void {
        this.lastCallTimes.clear();
    }
}

// ─── Pre-built instances ──────────────────────────────────────────────────────

/** Singleton rate limiter for the notification system (3s cooldown for simulation) */
export const notificationRateLimiter = new RateLimiter(3000);

/** Singleton rate limiter for energy calculation triggers (500ms debounce
 *  is handled differently — use debounce() for calculations, not this) */
export const energyUpdateRateLimiter = new RateLimiter(1000);
