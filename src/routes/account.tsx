import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getAccountSession } from "@/features/account/auth.functions";
import Layout from "@/features/account/routes/layout";

export const Route = createFileRoute("/account")({
	beforeLoad: async ({ location }) => {
		const customer = await getAccountSession();
		if (!customer) {
			throw redirect({
				to: "/sign-in",
				search: { redirectTo: location.href },
			});
		}

		return { customer };
	},
	head: () => ({
		meta: [{ name: "robots", content: "noindex, nofollow" }],
	}),
	component: AccountRoute,
});
function AccountRoute() {
	return (
		<Layout>
			<Outlet />
		</Layout>
	);
}
