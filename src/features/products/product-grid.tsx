import type { SearchProductsData } from "@/features/search/search-products-data";
import { SortDropdown } from "@/features/search/sort-dropdown";
import { useTranslations } from "@/platform/i18n/paraglide";
import type { CatalogSort } from "@/platform/tanstack/search";
import { readFragment } from "@/platform/vendure/graphql";
import { Pagination } from "./components/pagination";
import { ProductCard } from "./components/product-card";
import { ProductCardFragment } from "./graphql";

interface ProductGridProps {
	productData: SearchProductsData;
	currentPage: number;
	currentSort: CatalogSort;
	take: number;
}

export function ProductGrid({
	productData,
	currentPage,
	currentSort,
	take,
}: ProductGridProps) {
	const t = useTranslations("Product");
	const searchResult = productData.data.search;
	const totalPages = Math.ceil(searchResult.totalItems / take);

	if (!searchResult.items.length) {
		return (
			<div className="text-center py-12">
				<p className="text-muted-foreground">{t("noProductsFound")}</p>
			</div>
		);
	}

	return (
		<div className="space-y-8">
			<div className="flex items-center justify-between">
				<p className="text-sm text-muted-foreground">
					{t("productCount", { count: searchResult.totalItems })}
				</p>
				<SortDropdown currentSort={currentSort} />
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
				{searchResult.items.map((product) => (
					<ProductCard
						key={readFragment(ProductCardFragment, product).productId}
						product={product}
					/>
				))}
			</div>

			{totalPages > 1 && (
				<Pagination currentPage={currentPage} totalPages={totalPages} />
			)}
		</div>
	);
}
