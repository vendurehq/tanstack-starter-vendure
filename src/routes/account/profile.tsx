import { createFileRoute } from "@tanstack/react-router";
import Loading from "@/features/account/routes/profile/loading";
import Page from "@/features/account/routes/profile/page";

export const Route = createFileRoute("/account/profile")({
	loader: ({ context }) => context.customer,
	component: ProfileRoute,
	pendingComponent: Loading,
});

function ProfileRoute() {
	return <Page customer={Route.useLoaderData()} />;
}
