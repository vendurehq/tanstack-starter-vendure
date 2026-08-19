import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import Loading from "@/features/account/routes/profile/loading";
import Page from "@/features/account/routes/profile/page";
import { m } from "@/paraglide/messages.js";

const accountRoute = getRouteApi("/account");

export const Route = createFileRoute("/account/profile")({
	head: () => ({ meta: [{ title: m.Account_profilePageTitle() }] }),
	component: ProfileRoute,
	pendingComponent: Loading,
});

function ProfileRoute() {
	const { customer } = accountRoute.useRouteContext();
	return <Page customer={customer} />;
}
