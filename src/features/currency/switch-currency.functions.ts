import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { setCurrencyCookie } from "@/features/currency/currency.server";
import { queryOnServer } from "@/platform/vendure/api.server";
import { GetActiveChannelQuery } from "@/platform/vendure/channel-graphql";

export const switchCurrency = createServerFn({ method: "POST" })
	.validator(z.object({ currencyCode: z.string().length(3) }))
	.handler(async ({ data }) => {
		const result = await queryOnServer(GetActiveChannelQuery, {});
		if (
			!(result.data.activeChannel.availableCurrencyCodes as string[]).includes(
				data.currencyCode,
			)
		) {
			throw new Error("Invalid currency code");
		}
		setCurrencyCookie(data.currencyCode);
		return { success: true };
	});
