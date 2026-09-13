// Simple in-memory rate limiter suitable for a single-instance deployment.
// For multi-instance production deployments, replace with a Redis-backed limiter.

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number; retryAfterMs: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfterMs: 0 };
  }

  if (bucket.count >= limit) {
    return { allowed: false, remaining: 0, retryAfterMs: bucket.resetAt - now };
  }

  bucket.count += 1;
  return { allowed: true, remaining: limit - bucket.count, retryAfterMs: 0 };
}

// Checks whether a key is currently blocked WITHOUT consuming an attempt —
// use this to gate a request, then call recordAttempt() only when the
// request actually represents the thing you want to throttle (e.g. a failed
// login), so successful/legitimate requests never eat into the budget.
export function isRateLimited(
  key: string,
  limit: number
): { blocked: boolean; retryAfterMs: number } {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) return { blocked: false, retryAfterMs: 0 };
  if (bucket.count >= limit) return { blocked: true, retryAfterMs: bucket.resetAt - now };
  return { blocked: false, retryAfterMs: 0 };
}

export function recordAttempt(key: string, windowMs: number): void {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }
  bucket.count += 1;
}

export function clientIpFromRequest(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  // No reverse proxy in front of this instance (e.g. plain `next dev`/`next start`
  // with no load balancer): every client collapses into this one shared bucket.
  // Callers that rely on this fallback (like login) only count failed attempts
  // toward the limit, so legitimate traffic sharing the bucket isn't punished.
  return "unknown";
}
