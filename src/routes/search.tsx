import { createFileRoute } from "@tanstack/react-router";
import { getActiveCurrencyCode } from "@/features/currency/currency-server";
import { SearchProductsQuery } from "@/features/search/graphql";
import Loading from "@/features/search/routes/loading";
import Page from "@/features/search/routes/page";
import { buildSearchInput } from "@/features/search/search-helpers";
import { m } from "@/paraglide/messages.js";
import { getRouteLocale } from "@/platform/i18n/server";
import { storefrontHead } from "@/platform/tanstack/head";
import { catalogSearchSchema } from "@/platform/tanstack/search";
import { query } from "@/platform/vendure/api";

export const Route = createFileRoute("/search")({
	validateSearch: catalogSearchSchema,
	loaderDeps: ({ search: { q, page, sort, facets } }) => ({
		q,
		page,
		sort,
		facets,
	}),
	loader: async ({ deps }) => {
		const locale = await getRouteLocale();
		const currencyCode = await getActiveCurrencyCode();
		return query(
			SearchProductsQuery,
			{ input: buildSearchInput({ searchParams: deps }) },
			{ languageCode: locale, currencyCode },
		);
	},
	head: () =>
		storefrontHead({
			title: m.Search_pageTitle(),
			path: "/search",
			noIndex: true,
		}),
	pendingComponent: Loading,
	component: SearchRoute,
});

function SearchRoute() {
	return (
		<Page
			searchParams={Route.useSearch()}
			productData={Route.useLoaderData()}
		/>
	);
}
