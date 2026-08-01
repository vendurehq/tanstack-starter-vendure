import { createFileRoute } from "@tanstack/react-router";
import Page from "@/features/account/routes/orders/[code]/page";
import { getOrderDetail } from "@/features/orders/order.functions";
export const Route = createFileRoute("/account/orders/$code")({
	loader: ({ params }) => getOrderDetail({ data: { code: params.code } }),
	component: OrderDetailRoute,
});
function OrderDetailRoute() {
	return <Page orderData={Route.useLoaderData()} />;
}
