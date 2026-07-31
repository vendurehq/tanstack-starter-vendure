import {GetCollectionProductsQuery} from '@/features/collections/graphql';
import {getActiveCurrencyCodeOnServer} from '@/features/currency/active-currency.server';
import {cachedPublicData} from '@/platform/cache/public-cache';
import {getLocale} from '@/paraglide/runtime';
import {queryOnServer} from '@/platform/vendure/api.server';
import {createServerFn} from '@tanstack/react-start';

export const getHomeData = createServerFn({method: 'GET'}).handler(async () => {
    const locale = getLocale();
    const currency = await getActiveCurrencyCodeOnServer();
    return cachedPublicData({
        key: `featured:electronics:${locale}:${currency}`,
        tags: [`featured-${locale}-${currency}`],
        ttlMs: 30_000,
        load: async () => {
            const result = await queryOnServer(GetCollectionProductsQuery, {
                slug: 'electronics',
                input: {collectionSlug: 'electronics', take: 12, skip: 0, groupByProduct: true},
            }, {languageCode: locale, currencyCode: currency});
            return {products: result.data.search.items};
        },
    });
});
