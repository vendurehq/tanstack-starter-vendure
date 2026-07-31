import {ProductCarousel} from "@/features/products/components/product-carousel";
import { Link } from '@/platform/tanstack/navigation';
import {ArrowRight} from "lucide-react";
import {useTranslations} from '@/platform/i18n/paraglide';
import type {FragmentOf} from '@/platform/vendure/graphql';
import type {ProductCardFragment} from '@/features/products/graphql';

export function FeaturedProducts({products}: {products: Array<FragmentOf<typeof ProductCardFragment>>}) {
    const t = useTranslations('Product');
    return (
        <div>
            <ProductCarousel
                title={t('featuredProducts')}
                products={products}
            />
            <div className="container mx-auto px-4 -mt-6 mb-8">
                <div className="flex justify-center">
                    <Link
                        href="/search"
                        className="group inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline underline-offset-4 transition-colors"
                    >
                        {t('viewAllProducts')}
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                </div>
            </div>
        </div>
    )
}
