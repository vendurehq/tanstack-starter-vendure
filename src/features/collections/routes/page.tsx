import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ProductGrid } from "@/features/products/product-grid";
import { FacetFilters } from "@/features/search/facet-filters";
import {
	type CatalogSearchParams,
	getCurrentPage,
} from "@/features/search/search-helpers";
import type { SearchProductsData } from "@/features/search/search-products-data";
import { useTranslations } from "@/platform/i18n/paraglide";
import { Link } from "@/platform/tanstack/navigation";

interface CollectionPageProps {
	searchParams: CatalogSearchParams;
	collectionName: string;
	productData: SearchProductsData;
}

export default function CollectionPage({
	searchParams,
	collectionName,
	productData,
}: CollectionPageProps) {
	const t = useTranslations("Collection");
	const page = getCurrentPage(searchParams);

	return (
		<div className="container mx-auto px-4 py-8 mt-16">
			{/* Breadcrumbs */}
			<Breadcrumb className="mb-6">
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink render={<Link href="/" />}>
							{t("home")}
						</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbPage>{collectionName}</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>

			{/* Collection Header */}
			<div className="mb-8">
				<h1 className="text-3xl font-bold tracking-tight">{collectionName}</h1>
			</div>

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
		</div>
	);
}
