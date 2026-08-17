import {
	deleteCookie,
	getCookie,
	setCookie,
	setResponseHeader,
} from "@tanstack/react-start/server";
import { env } from "../env.server.ts";

function authTokenCookie() {
	return env.VENDURE_AUTH_TOKEN_COOKIE;
}

export function disableAuthResponseCaching() {
	setResponseHeader("Cache-Control", "no-store");
}

export function setAuthToken(token: string) {
	setCookie(authTokenCookie(), token, {
		httpOnly: true,
		sameSite: "lax",
		secure: env.NODE_ENV === "production",
		path: "/",
		maxAge: 60 * 60 * 24 * 365,
	});
}

export function getAuthToken() {
	return getCookie(authTokenCookie());
}

export function requireAuthToken() {
	const token = getAuthToken();
	if (!token) throw new Error("Authentication required");
	return token;
}

export function removeAuthToken() {
	deleteCookie(authTokenCookie(), { path: "/" });
}
