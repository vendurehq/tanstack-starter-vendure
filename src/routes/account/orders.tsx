import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { getCustomerOrders } from "@/features/orders/order.functions";
import Loading from "@/features/account/routes/orders/loading";
import Page from "@/features/account/routes/orders/page";

export const Route = createFileRoute("/account/orders")({
	validateSearch: z.object({
		page: z.coerce.number().int().positive().catch(1),
	}),
	loaderDeps: ({ search: { page } }) => ({ page }),
	loader: ({ deps: { page } }) => getCustomerOrders({ data: { page } }),
	pendingComponent: Loading,
	component: OrdersRoute,
});
function OrdersRoute() {
	return (
		<Page
			ordersData={Route.useLoaderData()}
			currentPage={Route.useSearch().page}
		/>
	);
}
