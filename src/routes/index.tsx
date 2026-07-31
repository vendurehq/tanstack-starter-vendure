import { createFileRoute } from "@tanstack/react-router";
import { m } from "@/paraglide/messages.js";
import { storefrontHead } from "@/platform/tanstack/head";
import { getHomeData } from "@/site/home/home.functions";
import Home from "@/site/home/page";

export const Route = createFileRoute("/")({
	loader: () => getHomeData(),
	staleTime: 30_000,
	head: () =>
		storefrontHead({
			title: m.Home_pageTitle(),
			description: m.Home_description(),
		}),
	component: HomeRoute,
});

function HomeRoute() {
	return <Home products={Route.useLoaderData().products} />;
}
