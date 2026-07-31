import { Await } from "@tanstack/react-router";
import { Clock, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import type {
	getProductPageData,
	getRelatedProducts,
} from "@/features/products/catalog.functions";
import { ProductImageCarousel } from "@/features/products/components/product-image-carousel";
import { ProductInfo } from "@/features/products/components/product-info";
import { RelatedProducts } from "@/features/products/components/related-products";
import { useTranslations } from "@/platform/i18n/paraglide";
import { Link } from "@/platform/tanstack/navigation";

export default function ProductDetailPage({
	data,
	relatedProducts,
	searchParams,
}: {
	data: NonNullable<Awaited<ReturnType<typeof getProductPageData>>>["data"];
	relatedProducts: ReturnType<typeof getRelatedProducts>;
	searchParams: Record<string, string | undefined>;
}) {
	const t = useTranslations("Product");
	const { product, primaryCollection, productForDisplay, currencyCode } = data;

	return (
		<>
			<div className="container mx-auto px-4 py-8 mt-16">
				{/* Breadcrumb Navigation */}
				<Breadcrumb className="mb-6">
					<BreadcrumbList>
						<BreadcrumbItem>
							<BreadcrumbLink render={<Link href="/" />}>
								{t("home")}
							</BreadcrumbLink>
						</BreadcrumbItem>
						{primaryCollection && (
							<>
								<BreadcrumbSeparator />
								<BreadcrumbItem>
									<BreadcrumbLink
										render={
											<Link href={`/collection/${primaryCollection.slug}`} />
										}
									>
										{primaryCollection.name}
									</BreadcrumbLink>
								</BreadcrumbItem>
							</>
						)}
						<BreadcrumbSeparator />
						<BreadcrumbItem>
							<BreadcrumbPage>{product.name}</BreadcrumbPage>
						</BreadcrumbItem>
					</BreadcrumbList>
				</Breadcrumb>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
					{/* Left Column: Image Carousel */}
					<div className="lg:sticky lg:top-20 lg:self-start">
						<ProductImageCarousel images={product.assets} />
					</div>

					{/* Right Column: Product Info */}
					<div>
						<ProductInfo
							product={productForDisplay}
							searchParams={searchParams}
							currencyCode={currencyCode}
						/>
					</div>
				</div>
			</div>

			{/* Shipping & Trust Badges */}
			<section className="py-8 mt-8 border-y border-border/50">
				<div className="container mx-auto px-4">
					<div className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
						<div className="inline-flex items-center gap-2 rounded-full bg-muted/60 px-4 py-2 text-sm font-medium text-muted-foreground">
							<Truck className="h-4 w-4 text-primary" />
							{t("trustBadges.fastShipping")}
						</div>
						<div className="inline-flex items-center gap-2 rounded-full bg-muted/60 px-4 py-2 text-sm font-medium text-muted-foreground">
							<RotateCcw className="h-4 w-4 text-primary" />
							{t("trustBadges.freeReturns")}
						</div>
						<div className="inline-flex items-center gap-2 rounded-full bg-muted/60 px-4 py-2 text-sm font-medium text-muted-foreground">
							<ShieldCheck className="h-4 w-4 text-primary" />
							{t("trustBadges.secureCheckout")}
						</div>
						<div className="inline-flex items-center gap-2 rounded-full bg-muted/60 px-4 py-2 text-sm font-medium text-muted-foreground">
							<Clock className="h-4 w-4 text-primary" />
							{t("trustBadges.guarantee")}
						</div>
					</div>
				</div>
			</section>

			{/* Store FAQ Section */}
			<section className="py-16 bg-muted/30">
				<div className="container mx-auto px-4 max-w-2xl">
					<h2 className="text-2xl font-bold text-center mb-8">
						{t("faq.title")}
					</h2>
					<Accordion className="w-full">
						<AccordionItem value="shipping">
							<AccordionTrigger>{t("faq.shipping.question")}</AccordionTrigger>
							<AccordionContent>{t("faq.shipping.answer")}</AccordionContent>
						</AccordionItem>
						<AccordionItem value="returns">
							<AccordionTrigger>{t("faq.returns.question")}</AccordionTrigger>
							<AccordionContent>{t("faq.returns.answer")}</AccordionContent>
						</AccordionItem>
						<AccordionItem value="tracking">
							<AccordionTrigger>{t("faq.tracking.question")}</AccordionTrigger>
							<AccordionContent>{t("faq.tracking.answer")}</AccordionContent>
						</AccordionItem>
						<AccordionItem value="international">
							<AccordionTrigger>
								{t("faq.international.question")}
							</AccordionTrigger>
							<AccordionContent>
								{t("faq.international.answer")}
							</AccordionContent>
						</AccordionItem>
					</Accordion>
				</div>
			</section>

			<Await promise={relatedProducts} fallback={null}>
				{(products) => <RelatedProducts products={products} />}
			</Await>
		</>
	);
}
