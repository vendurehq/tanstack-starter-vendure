// In-process cache: each server instance holds its own entries, and
// /api/revalidate only clears the instance that receives the webhook. On
// multi-instance or serverless deployments, rely on the TTLs for freshness or
// replace this with a shared store (e.g. Redis / Nitro storage).
interface CacheEntry<T> {
	value: T;
	expiresAt: number;
	tags: Set<string>;
}

const entries = new Map<string, CacheEntry<unknown>>();

export async function cachedPublicData<T>(options: {
	key: string;
	tags: string[];
	ttlMs: number;
	load: () => Promise<T>;
}): Promise<T> {
	const current = entries.get(options.key) as CacheEntry<T> | undefined;
	if (current && current.expiresAt > Date.now()) return current.value;
	const value = await options.load();
	entries.set(options.key, {
		value,
		expiresAt: Date.now() + options.ttlMs,
		tags: new Set(options.tags),
	});
	return value;
}

export function invalidatePublicTag(tag: string) {
	let invalidated = 0;
	for (const [key, entry] of entries) {
		if (!entry.tags.has(tag)) continue;
		entries.delete(key);
		invalidated += 1;
	}
	return invalidated;
}

export function clearPublicCache() {
	entries.clear();
}
