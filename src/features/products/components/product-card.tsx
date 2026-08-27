import Image from "@/components/storefront-image";
import { Price } from "@/features/pricing/price";
import { ProductCardFragment } from "@/features/products/graphql";
import {
	PRODUCT_CAROUSEL_CARD_SIZES,
	PRODUCT_GRID_CARD_SIZES,
	productCardImageUrl,
	productCardSrcSet,
} from "@/features/products/product-image";
import { useTranslations } from "@/platform/i18n/paraglide";
import { Link } from "@/platform/tanstack/navigation";
import { type FragmentOf, readFragment } from "@/platform/vendure/graphql";

interface ProductCardProps {
	product: FragmentOf<typeof ProductCardFragment>;
	currencyCode: string;
	priority?: boolean;
	/** Selects the `sizes` hint that matches the surrounding layout. */
	layout?: "grid" | "carousel";
}

export function ProductCard({
	product: productProp,
	currencyCode,
	priority,
	layout = "grid",
}: ProductCardProps) {
	const t = useTranslations("Product");
	const product = readFragment(ProductCardFragment, productProp);
	const productImage = product.productAsset?.preview;

	return (
		<Link
			href={`/product/${product.slug}`}
			className="group block bg-card rounded-xl overflow-hidden border border-border hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
		>
			<div className="aspect-square relative bg-muted overflow-hidden">
				{productImage ? (
					<Image
						src={productCardImageUrl(productImage, 800)}
						srcSet={productCardSrcSet(productImage)}
						alt={product.productName}
						fill
						priority={priority}
						className="object-cover group-hover:scale-105 group-hover:opacity-90 transition-all duration-500"
						sizes={
							layout === "carousel"
								? PRODUCT_CAROUSEL_CARD_SIZES
								: PRODUCT_GRID_CARD_SIZES
						}
					/>
				) : (
					<div className="w-full h-full flex items-center justify-center text-muted-foreground">
						{t("noImage")}
					</div>
				)}
			</div>
			<div className="p-4 space-y-2">
				<h3 className="font-medium leading-snug line-clamp-2 group-hover:text-primary transition-colors">
					{product.productName}
				</h3>
				<p className="text-lg font-bold tracking-tight">
					{product.priceWithTax.__typename === "PriceRange" ? (
						product.priceWithTax.min !== product.priceWithTax.max ? (
							<>
								<span className="text-xs font-normal text-muted-foreground mr-1">
									{t("from")}
								</span>
								<Price
									value={product.priceWithTax.min}
									currencyCode={currencyCode}
								/>
							</>
						) : (
							<Price
								value={product.priceWithTax.min}
								currencyCode={currencyCode}
							/>
						)
					) : product.priceWithTax.__typename === "SinglePrice" ? (
						<Price
							value={product.priceWithTax.value}
							currencyCode={currencyCode}
						/>
					) : null}
				</p>
			</div>
		</Link>
	);
}
