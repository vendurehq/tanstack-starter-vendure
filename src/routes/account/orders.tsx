import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";
import { GetCustomerOrdersQuery } from "@/features/account/graphql";
import Loading from "@/features/account/routes/orders/loading";
import Page from "@/features/account/routes/orders/page";
import { query } from "@/platform/vendure/api";

const ITEMS_PER_PAGE = 10;
export const Route = createFileRoute("/account/orders")({
	validateSearch: z.object({
		page: z.coerce.number().int().positive().catch(1),
	}),
	loaderDeps: ({ search: { page } }) => ({ page }),
	loader: async ({ deps: { page } }) => {
		const result = await query(
			GetCustomerOrdersQuery,
			{
				options: {
					take: ITEMS_PER_PAGE,
					skip: (page - 1) * ITEMS_PER_PAGE,
					filter: { state: { notEq: "AddingItems" } },
				},
			},
			{ useAuthToken: true },
		);
		if (!result.data.activeCustomer) throw redirect({ to: "/sign-in" });
		return result.data.activeCustomer.orders;
	},
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
