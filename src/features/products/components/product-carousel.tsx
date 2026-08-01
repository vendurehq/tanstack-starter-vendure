import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
import { ProductCard } from "@/features/products/components/product-card";
import { ProductCardFragment } from "@/features/products/graphql";
import { type FragmentOf, readFragment } from "@/platform/vendure/graphql";

interface ProductCarouselClientProps {
	title: string;
	products: Array<FragmentOf<typeof ProductCardFragment>>;
}

export function ProductCarousel({
	title,
	products,
}: ProductCarouselClientProps) {
	return (
		<section className="py-12 md:py-16">
			<div className="container mx-auto px-4">
				<h2 className="text-3xl md:text-4xl font-bold mb-8">{title}</h2>
				<Carousel
					opts={{
						align: "start",
						loop: true,
					}}
					className="w-full"
				>
					<CarouselContent className="-ml-2 md:-ml-4">
						{products.map((product) => (
							<CarouselItem
								key={readFragment(ProductCardFragment, product).productId}
								className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
							>
								<ProductCard product={product} />
							</CarouselItem>
						))}
					</CarouselContent>
					<CarouselPrevious className="hidden md:flex" />
					<CarouselNext className="hidden md:flex" />
				</Carousel>
			</div>
		</section>
	);
}
