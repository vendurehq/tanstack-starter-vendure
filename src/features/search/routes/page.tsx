import { SearchResults } from "@/features/search/routes/search-results";
import { SearchTerm } from "@/features/search/routes/search-term";
import type { CatalogSearchParams } from "@/features/search/search-helpers";
import type { SearchProductsData } from "@/features/search/search-products-data";

interface SearchPageProps {
	searchParams: CatalogSearchParams;
	productData: SearchProductsData;
}

export default function SearchPage({
	searchParams,
	productData,
}: SearchPageProps) {
	return (
		<div className="container mx-auto px-4 py-8 mt-16">
			<SearchTerm searchParams={searchParams} />
			<SearchResults searchParams={searchParams} productData={productData} />
		</div>
	);
}
