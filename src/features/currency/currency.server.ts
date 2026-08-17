import { getCookie, setCookie } from "@tanstack/react-start/server";

const CURRENCY_COOKIE = "vendure-currency";

export function setCurrencyCookie(currencyCode: string) {
	setCookie(CURRENCY_COOKIE, currencyCode, {
		path: "/",
		maxAge: 60 * 60 * 24 * 365,
		sameSite: "lax",
	});
}

export function getCurrencyCookie() {
	return getCookie(CURRENCY_COOKIE);
}
