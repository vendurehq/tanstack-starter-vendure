/**
 * Log the real error server-side and throw a client-safe Error.
 * Server-function errors serialize across the network — never put internals in the thrown message.
 */
export function logAndThrowPublicError(
	internal: unknown,
	publicMessage = "Something went wrong",
): never {
	console.error(internal);
	throw new Error(publicMessage);
}
