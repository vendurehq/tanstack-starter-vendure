import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
	GetActiveOrderQuery,
	SetCurrencyCodeForOrderMutation,
} from "@/features/cart/graphql";
import { setCurrencyCookie } from "@/features/currency/currency.server";
import { mutateOnServer, queryOnServer } from "@/platform/vendure/api.server";
import { setAuthToken } from "@/platform/vendure/auth-token.server";
import { GetActiveChannelQuery } from "@/platform/vendure/channel-graphql";

export const switchCurrency = createServerFn({ method: "POST" })
	.validator(z.object({ currencyCode: z.string().length(3) }))
	.handler(async ({ data }) => {
		const [channelResult, orderResult] = await Promise.all([
			queryOnServer(GetActiveChannelQuery, {}),
			queryOnServer(GetActiveOrderQuery, {}, { useAuthToken: true }),
		]);
		const currencyCode =
			channelResult.data.activeChannel.availableCurrencyCodes.find(
				(code) => code === data.currencyCode,
			);
		if (!currencyCode) {
			throw new Error("Invalid currency code");
		}

		if (
			orderResult.data.activeOrder &&
			orderResult.data.activeOrder.currencyCode !== currencyCode
		) {
			const result = await mutateOnServer(
				SetCurrencyCodeForOrderMutation,
				{ currencyCode },
				{ useAuthToken: true, currencyCode },
			);
			if (result.token) setAuthToken(result.token);
			if (result.data.setCurrencyCodeForOrder.__typename !== "Order") {
				throw new Error("Unable to change cart currency");
			}
		}

		setCurrencyCookie(currencyCode);
		return { success: true };
	});
