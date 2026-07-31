import { createFileRoute } from "@tanstack/react-router";
import { GetOrderDetailQuery } from "@/features/account/graphql";
import Page from "@/features/account/routes/orders/[code]/page";
import { query } from "@/platform/vendure/api";
export const Route = createFileRoute("/account/orders/$code")({
	loader: ({ params }) =>
		query(GetOrderDetailQuery, { code: params.code }, { useAuthToken: true }),
	component: OrderDetailRoute,
});
function OrderDetailRoute() {
	return <Page orderData={Route.useLoaderData()} />;
}
