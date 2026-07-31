import {GetProductDetailQuery} from '@/features/products/graphql';
import {GetCollectionProductsQuery} from '@/features/collections/graphql';
import {getActiveCurrencyCodeOnServer} from '@/features/currency/active-currency.server';
import {cachedPublicData} from '@/platform/cache/public-cache';
import {getLocale} from '@/paraglide/runtime';
import {queryOnServer} from '@/platform/vendure/api.server';
import {truncateDescription} from '@/config/metadata';
import {createServerFn} from '@tanstack/react-start';
import {z} from 'zod';

export const getProductRouteData = createServerFn({method: 'GET'})
    .validator(z.object({slug: z.string().min(1)}))
    .handler(async ({data}) => {
        const locale = getLocale();
        const currency = await getActiveCurrencyCodeOnServer();
        return cachedPublicData({
            key: `product:route:${data.slug}:${locale}:${currency}`,
            tags: [`product-${data.slug}-${locale}-${currency}`],
            ttlMs: 30_000,
            load: async () => {
                const result = await queryOnServer(GetProductDetailQuery, {slug: data.slug}, {
                    languageCode: locale,
                    currencyCode: currency,
                });
                const product = result.data.product;
                if (!product) return null;
                return {
                    title: product.name,
                    description: truncateDescription(product.description),
                    path: `/product/${product.slug}`,
                    image: product.assets?.[0]?.preview ?? null,
                };
            },
        });
    });

export const getCollectionRouteData = createServerFn({method: 'GET'})
    .validator(z.object({slug: z.string().min(1)}))
    .handler(async ({data}) => {
        const locale = getLocale();
        return cachedPublicData({
            key: `collection:route:${data.slug}:${locale}`,
            tags: [`collection-meta-${data.slug}-${locale}`],
            ttlMs: 30_000,
            load: async () => {
                const result = await queryOnServer(GetCollectionProductsQuery, {
                    slug: data.slug,
                    input: {take: 0, collectionSlug: data.slug, groupByProduct: true},
                }, {languageCode: locale});
                const collection = result.data.collection;
                if (!collection) return null;
                return {
                    title: collection.name,
                    description: truncateDescription(collection.description),
                    path: `/collection/${collection.slug}`,
                    image: collection.featuredAsset?.preview ?? null,
                };
            },
        });
    });
