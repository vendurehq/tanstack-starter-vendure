import { redirect } from "@tanstack/react-router";
import { createMiddleware } from "@tanstack/react-start";
import { getAuthToken } from "@/platform/vendure/auth-token.server";

/** Requires an auth cookie; redirects to sign-in and passes the token via context. */
export const authRequiredMiddleware = createMiddleware({
	type: "function",
}).server(async ({ next }) => {
	const authToken = getAuthToken();
	if (!authToken) {
		throw redirect({ to: "/sign-in" });
	}
	return next({ context: { authToken } });
});
