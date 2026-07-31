import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { GetOrderByCodeQuery } from "@/features/orders/graphql";
import { queryOnServer } from "@/platform/vendure/api.server";

export const getOrderConfirmation = createServerFn({ method: "GET" })
	.validator(z.object({ code: z.string().trim().min(1).max(128) }))
	.handler(async ({ data }) => {
		const result = await queryOnServer(
			GetOrderByCodeQuery,
			{ code: data.code },
			{ useAuthToken: true },
		);
		const order = result.data.orderByCode;
		if (!order) throw notFound();
		return order;
	});
