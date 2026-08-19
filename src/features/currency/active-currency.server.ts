import { getRequest } from "@tanstack/react-start/server";
import { getActiveChannel } from "@/platform/vendure/channel";
import { getCurrencyCookie } from "./currency.server";

/** Request-scoped memo for the channel default currency (cookie-miss path). */
const channelCurrencyByRequest = new WeakMap<Request, Promise<string>>();

async function resolveChannelDefaultCurrency(): Promise<string> {
	return (await getActiveChannel()).defaultCurrencyCode;
}

/**
 * Active storefront currency for the current request.
 * Cookie wins; otherwise the channel default is fetched once per Request.
 */
export async function getActiveCurrencyCodeOnServer() {
	const cookieValue = getCurrencyCookie();
	if (cookieValue) return cookieValue;

	try {
		const request = getRequest();
		let pending = channelCurrencyByRequest.get(request);
		if (!pending) {
			pending = resolveChannelDefaultCurrency();
			channelCurrencyByRequest.set(request, pending);
		}
		return pending;
	} catch {
		return resolveChannelDefaultCurrency();
	}
}
