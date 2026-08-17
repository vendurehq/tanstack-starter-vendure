import { z } from "zod";

const envSchema = z.object({
	VENDURE_SHOP_API_URL: z
		.string()
		.min(1, "VENDURE_SHOP_API_URL is required")
		.url(),
	VENDURE_CHANNEL_TOKEN: z.string().default("__default_channel__"),
	VENDURE_AUTH_TOKEN_COOKIE: z.string().default("vendure-auth-token"),
	VENDURE_AUTH_TOKEN_HEADER: z.string().default("vendure-auth-token"),
	VENDURE_CHANNEL_TOKEN_HEADER: z.string().default("vendure-token"),
	NODE_ENV: z
		.enum(["development", "production", "test"])
		.default("development"),
	REVALIDATION_SECRET: z.string().min(1).optional(),
});

export type ServerEnv = z.infer<typeof envSchema>;

function parseEnv(): ServerEnv {
	const result = envSchema.safeParse(process.env);
	if (!result.success) {
		const details = result.error.issues
			.map((issue) => `${issue.path.join(".") || "env"}: ${issue.message}`)
			.join("; ");
		throw new Error(`Invalid environment configuration: ${details}`);
	}
	return result.data;
}

/**
 * Fail-fast at server startup. Import and call from `src/server.ts`.
 * Reads are lazy via `env` so unit tests can set `process.env` before access.
 */
export function assertServerEnv(): ServerEnv {
	return parseEnv();
}

/**
 * Validated server env. Re-parses `process.env` on each property access so tests
 * (and runtime overrides) stay correct without a stale module cache.
 */
export const env: ServerEnv = new Proxy({} as ServerEnv, {
	get(_target, prop: string | symbol) {
		if (typeof prop !== "string") return undefined;
		return parseEnv()[prop as keyof ServerEnv];
	},
});
