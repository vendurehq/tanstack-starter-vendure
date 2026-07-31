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
