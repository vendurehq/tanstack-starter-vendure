import { ProductGrid } from "@/features/products/product-grid";
import { FacetFilters } from "@/features/search/facet-filters";
import {
	type CatalogSearchParams,
	getCurrentPage,
} from "@/features/search/search-helpers";
import type { SearchProductsData } from "@/features/search/search-products-data";

interface SearchResultsProps {
	searchParams: CatalogSearchParams;
	productData: SearchProductsData;
}

export function SearchResults({
	searchParams,
	productData,
}: SearchResultsProps) {
	const page = getCurrentPage(searchParams);
	return (
		<div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
			{/* Filters Sidebar */}
			<aside className="lg:col-span-1">
				<FacetFilters productData={productData} />
			</aside>

			{/* Product Grid */}
			<div className="lg:col-span-3">
				<ProductGrid productData={productData} currentPage={page} take={12} />
			</div>
		</div>
	);
}
