import { BadgeCheck, Tag, Zap } from "lucide-react";
import { FeaturedProducts } from "@/features/products/featured-products";
import type { ProductCardFragment } from "@/features/products/graphql";
import { useTranslations } from "@/platform/i18n/paraglide";
import type { FragmentOf } from "@/platform/vendure/graphql";
import { HeroSection } from "@/site/home/hero-section";

const featureKeys = [
	{ icon: BadgeCheck, key: "highQuality" },
	{ icon: Tag, key: "bestPrices" },
	{ icon: Zap, key: "fastDelivery" },
] as const;

export default function Home({
	products,
	currencyCode,
}: {
	products: Array<FragmentOf<typeof ProductCardFragment>>;
	currencyCode: string;
}) {
	const t = useTranslations("Home");

	return (
		<div className="min-h-screen">
			<HeroSection />
			<FeaturedProducts products={products} currencyCode={currencyCode} />

			<section className="py-16 md:py-24 bg-muted/30">
				<div className="container mx-auto px-4">
					<h2 className="text-2xl md:text-3xl font-bold tracking-tight text-center mb-12">
						{t("whyShopWithUs")}
					</h2>
					<div className="grid md:grid-cols-3 gap-8">
						{featureKeys.map((feature) => (
							<div
								key={feature.key}
								className="group relative text-center space-y-4 rounded-xl border border-transparent bg-card p-8 transition-all duration-300 hover:border-border hover:shadow-lg hover:-translate-y-1"
							>
								<div className="w-14 h-14 mx-auto bg-primary/10 rounded-full flex items-center justify-center transition-colors duration-300 group-hover:bg-primary/20">
									<feature.icon className="size-6 text-primary" />
								</div>
								<h3 className="text-xl font-semibold">
									{t(`features.${feature.key}.title`)}
								</h3>
								<p className="text-muted-foreground leading-relaxed">
									{t(`features.${feature.key}.description`)}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>
		</div>
	);
}
