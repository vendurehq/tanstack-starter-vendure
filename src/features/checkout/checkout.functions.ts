import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import {
	GetActiveCustomerQuery,
	GetCustomerAddressesQuery,
} from "@/features/account/graphql";
import { getAvailableCountriesCached } from "@/features/checkout/countries";
import {
	GetActiveOrderForCheckoutQuery,
	GetEligiblePaymentMethodsQuery,
	GetEligibleShippingMethodsQuery,
} from "@/features/checkout/graphql";
import { getActiveCurrencyCodeOnServer } from "@/features/currency/active-currency.server";
import { getRouteLocale } from "@/platform/i18n/server";
import { queryOnServer } from "@/platform/vendure/api.server";
import { disableAuthResponseCaching } from "@/platform/vendure/auth-token.server";

/**
 * Loads the personalized checkout snapshot in one server-function request.
 * Keeping this orchestration server-side avoids a client-side request waterfall
 * when the route loader runs during navigation.
 */
export const getCheckoutRouteData = createServerFn({ method: "GET" }).handler(
	async () => {
		disableAuthResponseCaching();
		const [locale, currencyCode, customerResult] = await Promise.all([
			getRouteLocale(),
			getActiveCurrencyCodeOnServer(),
			queryOnServer(GetActiveCustomerQuery, {}, { useAuthToken: true }),
		]);
		const isGuest = !customerResult.data.activeCustomer;

		const [
			orderResult,
			addressesResult,
			countries,
			shippingMethodsResult,
			paymentMethodsResult,
		] = await Promise.all([
			queryOnServer(
				GetActiveOrderForCheckoutQuery,
				{},
				{ useAuthToken: true, currencyCode },
			),
			isGuest
				? Promise.resolve({ data: { activeCustomer: null } })
				: queryOnServer(GetCustomerAddressesQuery, {}, { useAuthToken: true }),
			getAvailableCountriesCached(locale),
			queryOnServer(
				GetEligibleShippingMethodsQuery,
				{},
				{ useAuthToken: true, currencyCode },
			),
			queryOnServer(
				GetEligiblePaymentMethodsQuery,
				{},
				{ useAuthToken: true, currencyCode },
			),
		]);

		const activeOrder = orderResult.data.activeOrder;
		if (!activeOrder || activeOrder.lines.length === 0) {
			throw redirect({ to: "/cart" });
		}
		if (
			activeOrder.state !== "AddingItems" &&
			activeOrder.state !== "ArrangingPayment"
		) {
			throw redirect({
				to: "/order-confirmation/$code",
				params: { code: activeOrder.code },
			});
		}

		return {
			activeOrder,
			addresses: addressesResult.data.activeCustomer?.addresses ?? [],
			countries,
			shippingMethods: shippingMethodsResult.data.eligibleShippingMethods ?? [],
			paymentMethods:
				paymentMethodsResult.data.eligiblePaymentMethods?.filter(
					(method) => method.isEligible,
				) ?? [],
			isGuest,
		};
	},
);
