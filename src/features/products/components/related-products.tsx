import { ProductCarousel } from "@/features/products/components/product-carousel";
import type { ProductCardFragment } from "@/features/products/graphql";
import { useTranslations } from "@/platform/i18n/paraglide";
import type { FragmentOf } from "@/platform/vendure/graphql";

export function RelatedProducts({
	products,
	currencyCode,
}: {
	products: Array<FragmentOf<typeof ProductCardFragment>>;
	currencyCode: string;
}) {
	const t = useTranslations("Product");

	if (products.length === 0) {
		return null;
	}

	return (
		<ProductCarousel
			title={t("relatedProducts")}
			products={products}
			currencyCode={currencyCode}
		/>
	);
}
