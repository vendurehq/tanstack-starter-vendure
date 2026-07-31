import Image from "@/components/storefront-image";
import { Price } from "@/features/pricing/price";
import { ProductCardFragment } from "@/features/products/graphql";
import { useTranslations } from "@/platform/i18n/paraglide";
import { Link } from "@/platform/tanstack/navigation";
import { type FragmentOf, readFragment } from "@/platform/vendure/graphql";

interface ProductCardProps {
	product: FragmentOf<typeof ProductCardFragment>;
}

export function ProductCard({ product: productProp }: ProductCardProps) {
	const t = useTranslations("Product");
	const product = readFragment(ProductCardFragment, productProp);

	return (
		<Link
			href={`/product/${product.slug}`}
			className="group block bg-card rounded-xl overflow-hidden border border-border hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
		>
			<div className="aspect-square relative bg-muted overflow-hidden">
				{product.productAsset ? (
					<Image
						src={product.productAsset.preview}
						alt={product.productName}
						fill
						className="object-cover group-hover:scale-105 group-hover:opacity-90 transition-all duration-500"
						sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
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
									currencyCode={product.currencyCode}
								/>
							</>
						) : (
							<Price
								value={product.priceWithTax.min}
								currencyCode={product.currencyCode}
							/>
						)
					) : product.priceWithTax.__typename === "SinglePrice" ? (
						<Price
							value={product.priceWithTax.value}
							currencyCode={product.currencyCode}
						/>
					) : null}
				</p>
			</div>
		</Link>
	);
}
