import { createFileRoute } from "@tanstack/react-router";
import Loading from "@/features/search/routes/loading";
import Page from "@/features/search/routes/page";
import { getSearchPageData } from "@/features/search/search.functions";
import { m } from "@/paraglide/messages.js";
import { storefrontHead } from "@/platform/tanstack/head";
import { catalogSearchSchema } from "@/platform/tanstack/search";

export const Route = createFileRoute("/search")({
	validateSearch: catalogSearchSchema,
	loaderDeps: ({ search: { q, page, sort, facets } }) => ({
		q,
		page,
		sort,
		facets,
	}),
	loader: ({ deps }) => getSearchPageData({ data: deps }),
	staleTime: 30_000,
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
