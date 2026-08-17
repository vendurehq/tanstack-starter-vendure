import { createMiddleware } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";

/** Prevents shared caches from storing personalized server-fn responses. */
export const noStoreMiddleware = createMiddleware({ type: "function" }).server(
	async ({ next }) => {
		setResponseHeader("Cache-Control", "no-store");
		return next();
	},
);
