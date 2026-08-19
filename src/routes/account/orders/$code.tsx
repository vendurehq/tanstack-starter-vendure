import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import Page from "@/features/account/routes/orders/[code]/page";
import { getOrderDetail } from "@/features/orders/order.functions";
import { m } from "@/paraglide/messages.js";
export const Route = createFileRoute("/account/orders/$code")({
	head: ({ params }) => ({
		meta: [{ title: m.Account_order({ code: params.code }) }],
	}),
	validateSearch: z.object({
		page: z.coerce.number().int().positive().catch(1),
	}),
	loader: ({ params }) => getOrderDetail({ data: { code: params.code } }),
	component: OrderDetailRoute,
});
function OrderDetailRoute() {
	return <Page orderData={Route.useLoaderData()} />;
}
