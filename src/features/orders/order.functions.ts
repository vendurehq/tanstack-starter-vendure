import { notFound, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
	GetCustomerOrdersQuery,
	GetOrderDetailQuery,
} from "@/features/account/graphql";
import { GetOrderByCodeQuery } from "@/features/orders/graphql";
import {
	authRequiredMiddleware,
	noStoreMiddleware,
} from "@/platform/middleware";
import { queryOnServer } from "@/platform/vendure/api.server";

export const ORDERS_PER_PAGE = 10;

export const getOrderConfirmation = createServerFn({ method: "GET" })
	.middleware([noStoreMiddleware])
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

export const getCustomerOrders = createServerFn({ method: "GET" })
	.middleware([noStoreMiddleware, authRequiredMiddleware])
	.validator(z.object({ page: z.number().int().positive() }))
	.handler(async ({ data }) => {
		const result = await queryOnServer(
			GetCustomerOrdersQuery,
			{
				options: {
					take: ORDERS_PER_PAGE,
					skip: (data.page - 1) * ORDERS_PER_PAGE,
					filter: { state: { notEq: "AddingItems" } },
				},
			},
			{ useAuthToken: true },
		);
		if (!result.data.activeCustomer) throw redirect({ to: "/sign-in" });
		return result.data.activeCustomer.orders;
	});

export const getOrderDetail = createServerFn({ method: "GET" })
	.middleware([noStoreMiddleware, authRequiredMiddleware])
	.validator(z.object({ code: z.string().trim().min(1).max(128) }))
	.handler(async ({ data }) => {
		const result = await queryOnServer(
			GetOrderDetailQuery,
			{ code: data.code },
			{ useAuthToken: true },
		);
		return { data: result.data };
	});
