export interface SearchInputParams {
	term?: string;
	collectionSlug?: string;
	take: number;
	skip: number;
	groupByProduct: boolean;
	sort: { name?: "ASC" | "DESC"; price?: "ASC" | "DESC" };
	facetValueFilters?: Array<{ and: string }>;
}

export interface CatalogSearchParams {
	q?: string;
	page?: string | number;
	sort?: string;
	facets?: string | string[];
}

interface BuildSearchInputOptions {
	searchParams: CatalogSearchParams;
	collectionSlug?: string;
}

export function buildSearchInput({
	searchParams,
	collectionSlug,
}: BuildSearchInputOptions): SearchInputParams {
	const page = Number(searchParams.page) || 1;
	const take = 12;
	const skip = (page - 1) * take;
	const sort = (searchParams.sort as string) || "name-asc";
	const searchTerm = searchParams.q as string;

	// Extract facet value IDs from search params
	const facetValueIds = searchParams.facets
		? Array.isArray(searchParams.facets)
			? searchParams.facets
			: [searchParams.facets]
		: [];

	// Map sort parameter to Vendure SearchResultSortParameter
	const sortMapping: Record<
		string,
		{ name?: "ASC" | "DESC"; price?: "ASC" | "DESC" }
	> = {
		"name-asc": { name: "ASC" },
		"name-desc": { name: "DESC" },
		"price-asc": { price: "ASC" },
		"price-desc": { price: "DESC" },
	};

	return {
		...(searchTerm && { term: searchTerm }),
		...(collectionSlug && { collectionSlug }),
		take,
		skip,
		groupByProduct: true,
		sort: sortMapping[sort] || sortMapping["name-asc"],
		...(facetValueIds.length > 0 && {
			facetValueFilters: facetValueIds.map((id) => ({ and: id })),
		}),
	};
}

export function getCurrentPage(searchParams: CatalogSearchParams): number {
	return Number(searchParams.page) || 1;
}
