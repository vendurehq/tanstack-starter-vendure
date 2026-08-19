import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import Loading from "@/features/account/routes/orders/loading";
import Page from "@/features/account/routes/orders/page";
import { getCustomerOrders } from "@/features/orders/order.functions";
import { m } from "@/paraglide/messages.js";

export const Route = createFileRoute("/account/orders/")({
	head: () => ({ meta: [{ title: m.Account_ordersPageTitle() }] }),
	validateSearch: z.object({
		page: z.coerce.number().int().positive().catch(1),
	}),
	loaderDeps: ({ search: { page } }) => ({ page }),
	loader: ({ deps: { page } }) => getCustomerOrders({ data: { page } }),
	pendingComponent: Loading,
	component: OrdersIndexRoute,
});

function OrdersIndexRoute() {
	return (
		<Page
			ordersData={Route.useLoaderData()}
			currentPage={Route.useSearch().page}
		/>
	);
}
