import { createFileRoute, notFound } from "@tanstack/react-router";
import {
	getProductPageData,
	getRelatedProducts,
} from "@/features/products/catalog.functions";
import Loading from "@/features/products/routes/loading";
import Page from "@/features/products/routes/page";
import { storefrontHead } from "@/platform/tanstack/head";
import { productSearchSchema } from "@/platform/tanstack/search";

export const Route = createFileRoute("/product/$slug")({
	validateSearch: productSearchSchema,
	loader: async ({ params }) => {
		const data = await getProductPageData({ data: { slug: params.slug } });
		if (!data) throw notFound();
		const { product, primaryCollection } = data.data;
		const relatedProducts = primaryCollection
			? getRelatedProducts({
					data: {
						collectionSlug: primaryCollection.slug,
						currentProductId: product.id,
					},
				})
			: Promise.resolve([]);
		return { ...data, relatedProducts };
	},
	staleTime: 30_000,
	head: ({ loaderData }) =>
		loaderData ? storefrontHead(loaderData.metadata) : {},
	pendingComponent: Loading,
	component: ProductRoute,
});

function ProductRoute() {
	return <Page {...Route.useLoaderData()} searchParams={Route.useSearch()} />;
}
