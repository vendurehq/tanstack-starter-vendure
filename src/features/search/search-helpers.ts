import type { CatalogSearch, CatalogSort } from "@/platform/tanstack/search";

export interface SearchInputParams {
	term?: string;
	collectionSlug?: string;
	take: number;
	skip: number;
	groupByProduct: boolean;
	sort: { name?: "ASC" | "DESC"; price?: "ASC" | "DESC" };
	facetValueFilters?: Array<{ and: string }>;
}

export type CatalogSearchParams = CatalogSearch;

interface BuildSearchInputOptions {
	searchParams: CatalogSearchParams;
	collectionSlug?: string;
}

export function buildSearchInput({
	searchParams,
	collectionSlug,
}: BuildSearchInputOptions): SearchInputParams {
	const take = 12;
	const skip = (searchParams.page - 1) * take;

	// Map sort parameter to Vendure SearchResultSortParameter
	const sortMapping = {
		"name-asc": { name: "ASC" },
		"name-desc": { name: "DESC" },
		"price-asc": { price: "ASC" },
		"price-desc": { price: "DESC" },
	} satisfies Record<
		CatalogSort,
		{ name?: "ASC" | "DESC"; price?: "ASC" | "DESC" }
	>;

	return {
		...(searchParams.q && { term: searchParams.q }),
		...(collectionSlug && { collectionSlug }),
		take,
		skip,
		groupByProduct: true,
		sort: sortMapping[searchParams.sort],
		...(searchParams.facets.length > 0 && {
			facetValueFilters: searchParams.facets.map((id) => ({ and: id })),
		}),
	};
}

export function getCurrentPage(searchParams: CatalogSearchParams): number {
	return searchParams.page;
}
