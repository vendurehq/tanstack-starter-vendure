import { createFileRoute } from "@tanstack/react-router";
import { getAddressesPageData } from "@/features/account/routes/addresses/actions";
import Loading from "@/features/account/routes/addresses/loading";
import Page from "@/features/account/routes/addresses/page";
import { m } from "@/paraglide/messages.js";
export const Route = createFileRoute("/account/addresses")({
	head: () => ({ meta: [{ title: m.Account_addressesPageTitle() }] }),
	loader: () => getAddressesPageData(),
	component: AddressesRoute,
	pendingComponent: Loading,
});
function AddressesRoute() {
	return <Page {...Route.useLoaderData()} />;
}
