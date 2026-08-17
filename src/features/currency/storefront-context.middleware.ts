import { createMiddleware } from "@tanstack/react-start";
import { getActiveCurrencyCodeOnServer } from "@/features/currency/active-currency.server";
import { getRouteLocale } from "@/platform/i18n/server";

/** Resolves locale + active currency once and exposes them on handler context. */
export const storefrontContextMiddleware = createMiddleware({
	type: "function",
}).server(async ({ next }) => {
	const [locale, currencyCode] = await Promise.all([
		getRouteLocale(),
		getActiveCurrencyCodeOnServer(),
	]);
	return next({ context: { locale, currencyCode } });
});
