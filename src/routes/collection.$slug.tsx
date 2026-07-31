import { createFileRoute, notFound } from "@tanstack/react-router";
import Loading from "@/features/collections/routes/loading";
import Page from "@/features/collections/routes/page";
import { getActiveCurrencyCode } from "@/features/currency/currency-server";
import { getCollectionRouteData } from "@/features/products/catalog.functions";
import { SearchProductsQuery } from "@/features/search/graphql";
import { buildSearchInput } from "@/features/search/search-helpers";
import { getRouteLocale } from "@/platform/i18n/server";
import { storefrontHead } from "@/platform/tanstack/head";
import { catalogSearchSchema } from "@/platform/tanstack/search";
import { query } from "@/platform/vendure/api";

export const Route = createFileRoute("/collection/$slug")({
	validateSearch: catalogSearchSchema,
	loaderDeps: ({ search: { q, page, sort, facets } }) => ({
		q,
		page,
		sort,
		facets,
	}),
	loader: async ({ params, deps }) => {
		const [metadata, currencyCode] = await Promise.all([
			getCollectionRouteData({ data: { slug: params.slug } }),
			getActiveCurrencyCode(),
		]);
		if (!metadata) throw notFound();
		const locale = await getRouteLocale();
		const productData = await query(
			SearchProductsQuery,
			{
				input: buildSearchInput({
					searchParams: deps,
					collectionSlug: params.slug,
				}),
			},
			{ languageCode: locale, currencyCode },
		);
		return { metadata, productData };
	},
	staleTime: 30_000,
	head: ({ loaderData }) =>
		loaderData ? storefrontHead(loaderData.metadata) : {},
	pendingComponent: Loading,
	component: CollectionRoute,
});

function CollectionRoute() {
	const { metadata, productData } = Route.useLoaderData();
	return (
		<Page
			searchParams={Route.useSearch()}
			collectionName={metadata.title}
			productData={productData}
		/>
	);
}
