import { createFileRoute } from "@tanstack/react-router";
import { getAddressesPageData } from "@/features/account/routes/addresses/actions";
import Loading from "@/features/account/routes/addresses/loading";
import Page from "@/features/account/routes/addresses/page";
export const Route = createFileRoute("/account/addresses")({
	loader: () => getAddressesPageData(),
	component: AddressesRoute,
	pendingComponent: Loading,
});
function AddressesRoute() {
	return <Page {...Route.useLoaderData()} />;
}
