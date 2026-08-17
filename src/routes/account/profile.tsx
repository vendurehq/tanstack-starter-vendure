import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import Loading from "@/features/account/routes/profile/loading";
import Page from "@/features/account/routes/profile/page";

const accountRoute = getRouteApi("/account");

export const Route = createFileRoute("/account/profile")({
	component: ProfileRoute,
	pendingComponent: Loading,
});

function ProfileRoute() {
	const { customer } = accountRoute.useLoaderData();
	return <Page customer={customer} />;
}
