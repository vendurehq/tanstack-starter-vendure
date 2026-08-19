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
import { storefrontContextMiddleware } from "@/features/currency/storefront-context.middleware";
import { noStoreMiddleware } from "@/platform/middleware";
import { queryOnServer } from "@/platform/vendure/api.server";

/**
 * Loads the personalized checkout snapshot in one server-function request.
 * Keeping this orchestration server-side avoids a client-side request waterfall
 * when the route loader runs during navigation.
 */
export const getCheckoutRouteData = createServerFn({ method: "GET" })
	.middleware([noStoreMiddleware, storefrontContextMiddleware])
	.handler(async ({ context }) => {
		const { locale, currencyCode } = context;
		const [
			customerResult,
			orderResult,
			addressesResult,
			countries,
			shippingMethodsResult,
			paymentMethodsResult,
		] = await Promise.all([
			queryOnServer(GetActiveCustomerQuery, {}, { useAuthToken: true }),
			queryOnServer(
				GetActiveOrderForCheckoutQuery,
				{},
				{ useAuthToken: true, currencyCode },
			),
			queryOnServer(GetCustomerAddressesQuery, {}, { useAuthToken: true }),
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
		const isGuest = !customerResult.data.activeCustomer;

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
	});
