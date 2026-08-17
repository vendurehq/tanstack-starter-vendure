import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { CreateCustomerAddressMutation } from "@/features/account/graphql";
import {
	AddPaymentToOrderMutation,
	SetCustomerForOrderMutation,
	SetOrderBillingAddressMutation,
	SetOrderShippingAddressMutation,
	SetOrderShippingMethodMutation,
	TransitionOrderToStateMutation,
} from "@/features/checkout/graphql";
import { noStoreMiddleware } from "@/platform/middleware";
import { mutateOnServer } from "@/platform/vendure/api.server";
import { setAuthToken } from "@/platform/vendure/auth-token.server";

const addressSchema = z.object({
	fullName: z.string().min(1),
	streetLine1: z.string().min(1),
	streetLine2: z.string().optional(),
	city: z.string().min(1),
	province: z.string(),
	postalCode: z.string().min(1),
	countryCode: z.string().length(2),
	phoneNumber: z.string(),
	company: z.string().optional(),
});

async function transitionOrderToArrangingPayment() {
	const result = await mutateOnServer(
		TransitionOrderToStateMutation,
		{ state: "ArrangingPayment" },
		{ useAuthToken: true },
	);
	if (result.token) setAuthToken(result.token);
	if (
		result.data.transitionOrderToState?.__typename ===
		"OrderStateTransitionError"
	) {
		const error = result.data.transitionOrderToState;
		console.error(
			"Failed to transition order state",
			error.errorCode,
			error.message,
		);
		throw new Error("Failed to transition order state");
	}
	// setAuthToken only writes the response cookie; follow-up mutations in the
	// same request must receive the rotated token explicitly.
	return result.token;
}

export const setShippingAddress = createServerFn({ method: "POST" })
	.middleware([noStoreMiddleware])
	.validator(
		z.object({
			shippingAddress: addressSchema,
			useSameForBilling: z.boolean(),
		}),
	)
	.handler(async ({ data }) => {
		const result = await mutateOnServer(
			SetOrderShippingAddressMutation,
			{ input: data.shippingAddress },
			{ useAuthToken: true },
		);
		if (result.token) setAuthToken(result.token);
		if (result.data.setOrderShippingAddress.__typename !== "Order") {
			throw new Error("Failed to set shipping address");
		}
		if (data.useSameForBilling) {
			await mutateOnServer(
				SetOrderBillingAddressMutation,
				{ input: data.shippingAddress },
				{ useAuthToken: true, token: result.token },
			);
		}
		return { success: true };
	});

export const setShippingMethod = createServerFn({ method: "POST" })
	.middleware([noStoreMiddleware])
	.validator(z.object({ shippingMethodId: z.string().min(1) }))
	.handler(async ({ data }) => {
		const result = await mutateOnServer(
			SetOrderShippingMethodMutation,
			{ shippingMethodId: [data.shippingMethodId] },
			{ useAuthToken: true },
		);
		if (result.token) setAuthToken(result.token);
		if (result.data.setOrderShippingMethod.__typename !== "Order") {
			throw new Error("Failed to set shipping method");
		}
		return { success: true };
	});

export const createCustomerAddress = createServerFn({ method: "POST" })
	.middleware([noStoreMiddleware])
	.validator(addressSchema)
	.handler(async ({ data }) => {
		const result = await mutateOnServer(
			CreateCustomerAddressMutation,
			{ input: data },
			{ useAuthToken: true },
		);
		if (result.token) setAuthToken(result.token);
		if (!result.data.createCustomerAddress)
			throw new Error("Failed to create customer address");
		return result.data.createCustomerAddress;
	});

export const transitionToArrangingPayment = createServerFn({ method: "POST" })
	.middleware([noStoreMiddleware])
	.handler(async () => {
		await transitionOrderToArrangingPayment();
		return { success: true };
	});

export const placeOrder = createServerFn({ method: "POST" })
	.middleware([noStoreMiddleware])
	.validator(z.object({ paymentMethodCode: z.string().min(1) }))
	.handler(async ({ data }) => {
		const rotatedToken = await transitionOrderToArrangingPayment();
		const metadata: Record<string, unknown> =
			data.paymentMethodCode === "standard-payment"
				? {
						shouldDecline: false,
						shouldError: false,
						shouldErrorOnSettle: false,
					}
				: {};
		const result = await mutateOnServer(
			AddPaymentToOrderMutation,
			{ input: { method: data.paymentMethodCode, metadata } },
			{ useAuthToken: true, token: rotatedToken },
		);
		if (result.token) setAuthToken(result.token);
		if (result.data.addPaymentToOrder.__typename !== "Order") {
			const error = result.data.addPaymentToOrder;
			console.error("Failed to place order", error.errorCode, error.message);
			throw new Error("Failed to place order");
		}
		throw redirect({
			to: "/order-confirmation/$code",
			params: { code: result.data.addPaymentToOrder.code },
		});
	});

export type SetCustomerForOrderResult =
	| { success: true }
	| {
			success: false;
			errorCode:
				| "EMAIL_CONFLICT"
				| "GUEST_CHECKOUT_DISABLED"
				| "NO_ACTIVE_ORDER"
				| "UNKNOWN";
			message: string;
	  };

export const setCustomerForOrder = createServerFn({ method: "POST" })
	.middleware([noStoreMiddleware])
	.validator(
		z.object({
			emailAddress: z.email(),
			firstName: z.string().min(1),
			lastName: z.string().min(1),
			phoneNumber: z.string().optional(),
		}),
	)
	.handler(async ({ data }): Promise<SetCustomerForOrderResult> => {
		const result = await mutateOnServer(
			SetCustomerForOrderMutation,
			{ input: data },
			{ useAuthToken: true },
		);
		if (result.token) setAuthToken(result.token);
		const response = result.data.setCustomerForOrder;
		switch (response.__typename) {
			case "Order":
			case "AlreadyLoggedInError":
				return { success: true };
			case "EmailAddressConflictError":
				console.error("setCustomerForOrder conflict", response.message);
				return {
					success: false,
					errorCode: "EMAIL_CONFLICT",
					message: "An account with this email already exists",
				};
			case "GuestCheckoutError":
				console.error(
					"setCustomerForOrder guest checkout disabled",
					response.message,
				);
				return {
					success: false,
					errorCode: "GUEST_CHECKOUT_DISABLED",
					message: "Guest checkout is not available",
				};
			case "NoActiveOrderError":
				console.error("setCustomerForOrder no active order", response.message);
				return {
					success: false,
					errorCode: "NO_ACTIVE_ORDER",
					message: "No active order found",
				};
			default:
				return {
					success: false,
					errorCode: "UNKNOWN",
					message: "Unable to continue checkout",
				};
		}
	});
