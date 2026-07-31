import { ProductCarousel } from "@/features/products/components/product-carousel";
import { getRouteLocale } from "@/platform/i18n/server";
import { cachedPublicData } from '@/platform/cache/public-cache';
import { query } from "@/platform/vendure/api";
import {GetCollectionProductsQuery} from '@/features/collections/graphql';
import { readFragment } from "@/platform/vendure/graphql";
import {ProductCardFragment} from '@/features/products/graphql';
import {useTranslations} from '@/platform/i18n/paraglide';

export async function getRelatedProducts(collectionSlug: string, currentProductId: string, currencyCode: string) {
    const locale = await getRouteLocale();
    // The cache key is product-independent, so the current product is filtered
    // out after the cache lookup rather than inside the cached load.
    const items = await cachedPublicData({
        key: `related-products:${collectionSlug}:${locale}:${currencyCode}`,
        tags: [`related-products-${collectionSlug}-${locale}-${currencyCode}`, 'products'],
        ttlMs: 60 * 60 * 1000,
        load: async () => {
            const result = await query(GetCollectionProductsQuery, {
                slug: collectionSlug,
                input: {collectionSlug, take: 13, skip: 0, groupByProduct: true},
            }, {languageCode: locale, currencyCode});
            return result.data.search.items;
        },
    });
    return items
        .filter(item => readFragment(ProductCardFragment, item).productId !== currentProductId)
        .slice(0, 12);
}

export function RelatedProducts({products}: {products: Awaited<ReturnType<typeof getRelatedProducts>>}) {
    const t = useTranslations('Product');

    if (products.length === 0) {
        return null;
    }

    return (
        <ProductCarousel
            title={t('relatedProducts')}
            products={products}
        />
    );
}
