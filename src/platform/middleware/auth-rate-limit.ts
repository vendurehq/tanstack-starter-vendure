import { createMiddleware } from "@tanstack/react-start";
import {
	getRequestIP,
	setResponseHeader,
	setResponseStatus,
} from "@tanstack/react-start/server";

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;

type Bucket = { count: number; resetAt: number };

/** In-memory per-IP counters. Production should also rate-limit at the CDN/proxy. */
const buckets = new Map<string, Bucket>();
let nextSweepAt = 0;

function clientIp(): string {
	// Use the connection address. Forwarded headers are client-controlled unless
	// the deployment platform replaces them at a trusted proxy boundary.
	return getRequestIP() ?? "unknown";
}

function isRateLimited(key: string): boolean {
	const now = Date.now();
	if (now >= nextSweepAt) {
		for (const [bucketKey, bucket] of buckets) {
			if (now >= bucket.resetAt) buckets.delete(bucketKey);
		}
		nextSweepAt = now + WINDOW_MS;
	}
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
		setResponseStatus(429);
		setResponseHeader("Retry-After", String(WINDOW_MS / 1000));
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
