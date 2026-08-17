import { createMiddleware } from "@tanstack/react-start";
import { getRequestHeader, getRequestIP } from "@tanstack/react-start/server";

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;

type Bucket = { count: number; resetAt: number };

/** In-memory per-IP counters. Production should also rate-limit at the CDN/proxy. */
const buckets = new Map<string, Bucket>();

function clientIp(): string {
	const forwarded = getRequestIP({ xForwardedFor: true });
	if (forwarded) return forwarded;
	const realIp = getRequestHeader("x-real-ip");
	if (realIp) return realIp;
	return getRequestIP() ?? "unknown";
}

function isRateLimited(key: string): boolean {
	const now = Date.now();
	const bucket = buckets.get(key);
	if (!bucket || now >= bucket.resetAt) {
		buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
		return false;
	}
	bucket.count += 1;
	return bucket.count > MAX_REQUESTS;
}

export const AUTH_RATE_LIMIT_MESSAGE =
	"Too many attempts. Please try again later.";

/**
 * Soft rate-limit for auth mutations (login / register / password reset).
 * Short-circuits the handler with `{ error }` when the limit is exceeded.
 */
export const authRateLimitMiddleware = createMiddleware({
	type: "function",
}).server(async ({ next }) => {
	if (isRateLimited(`auth:${clientIp()}`)) {
		// Return a completed server-fn result without running the handler.
		// (Function middleware may short-circuit with `{ result }` instead of next().)
		return {
			result: { error: AUTH_RATE_LIMIT_MESSAGE },
			context: {},
			sendContext: {},
		} as never;
	}
	return next();
});
