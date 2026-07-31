import {query} from '@/platform/vendure/api';
import {GetTopCollectionsQuery} from './graphql';
import {cachedPublicData} from '@/platform/cache/public-cache';

export async function getTopCollections(locale: string) {
    return cachedPublicData({
        key: `collections:top:${locale}`,
        tags: [`collections-${locale}`],
        ttlMs: 5 * 60 * 1000,
        load: async () => {
            const result = await query(GetTopCollectionsQuery, undefined, {languageCode: locale});
            return result.data.collections.items;
        },
    });
}
