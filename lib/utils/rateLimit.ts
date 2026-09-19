import "server-only";
import type { NextRequest } from "next/server";

export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return "unknown";
}

// In-memory, per-process rate limiter. Good enough for a single small
// deployment — not distributed-safe, but keeps abuse (promo/order guessing)
// in check without an external service.
export function createRateLimiter(limit: number, windowMs: number) {
  const log = new Map<string, { count: number; windowStart: number }>();

  return function isRateLimited(key: string): boolean {
    const now = Date.now();
    const entry = log.get(key);
    if (!entry || now - entry.windowStart > windowMs) {
      log.set(key, { count: 1, windowStart: now });
      return false;
    }
    entry.count += 1;
    return entry.count > limit;
  };
}
