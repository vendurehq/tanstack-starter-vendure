import { createServerFn } from "@tanstack/react-start";
import {
	ActiveCustomerFragment,
	GetActiveCustomerQuery,
} from "@/features/account/graphql";
import { GetActiveOrderQuery } from "@/features/cart/graphql";
import { GetTopCollectionsQuery } from "@/features/collections/graphql";
import { getCurrencyCookie } from "@/features/currency/currency.server";
import { getLocale } from "@/paraglide/runtime";
import { cachedPublicData } from "@/platform/cache/public-cache";
import { noStoreMiddleware } from "@/platform/middleware";
import { queryOnServer } from "@/platform/vendure/api.server";
import { getActiveChannel } from "@/platform/vendure/channel";
import { readFragment } from "@/platform/vendure/graphql";

/** Public shell with internally cached catalog/channel data and request currency. */
export const getPublicShellData = createServerFn({ method: "GET" }).handler(
	async () => {
		const locale = getLocale();
		const currencyCookie = getCurrencyCookie();
		const [channel, collections] = await Promise.all([
			getActiveChannel(),
			cachedPublicData({
				key: `collections:top:${locale}`,
				tags: [`collections-${locale}`],
				ttlMs: 5 * 60 * 1000,
				load: async () =>
					(
						await queryOnServer(
							GetTopCollectionsQuery,
							{},
							{ languageCode: locale },
						)
					).data.collections.items,
			}),
		]);
		return {
			collections,
			availableCurrencyCodes: channel.availableCurrencyCodes,
			activeCurrencyCode: currencyCookie ?? channel.defaultCurrencyCode,
		};
	},
);

/** Personalized shell — cart count + customer name; must not be cached. */
export const getPersonalizedShellData = createServerFn({ method: "GET" })
	.middleware([noStoreMiddleware])
	.handler(async () => {
		const [customerResult, orderResult] = await Promise.all([
			queryOnServer(GetActiveCustomerQuery, {}, { useAuthToken: true }),
			queryOnServer(GetActiveOrderQuery, {}, { useAuthToken: true }),
		]);
		const customer = readFragment(
			ActiveCustomerFragment,
			customerResult.data.activeCustomer,
		);
		return {
			cartItemCount: orderResult.data.activeOrder?.totalQuantity ?? 0,
			customerFirstName: customer?.firstName ?? null,
		};
	});
