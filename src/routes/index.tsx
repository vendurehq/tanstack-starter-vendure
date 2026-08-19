import { createFileRoute } from "@tanstack/react-router";
import { ProductCardFragment } from "@/features/products/graphql";
import { m } from "@/paraglide/messages.js";
import { storefrontHead } from "@/platform/tanstack/head";
import { readFragment } from "@/platform/vendure/graphql";
import { getHomeData } from "@/site/home/home.functions";
import Home from "@/site/home/page";

function getAssetOrigin(preview?: string) {
	if (!preview) return undefined;
	try {
		return new URL(preview).origin;
	} catch {
		return undefined;
	}
}

export const Route = createFileRoute("/")({
	loader: () => getHomeData(),
	staleTime: 30_000,
	head: ({ loaderData }) => {
		const head = storefrontHead({
			title: m.Home_pageTitle(),
			description: m.Home_description(),
		});
		const firstProduct = loaderData?.products[0];
		const preview = firstProduct
			? readFragment(ProductCardFragment, firstProduct).productAsset?.preview
			: undefined;
		const assetOrigin = getAssetOrigin(preview);

		return {
			...head,
			links: [
				...head.links,
				...(assetOrigin
					? [{ rel: "preconnect", href: assetOrigin }]
					: []),
			],
		};
	},
	component: HomeRoute,
});

function HomeRoute() {
	const { products, currencyCode } = Route.useLoaderData();
	return <Home products={products} currencyCode={currencyCode} />;
}
