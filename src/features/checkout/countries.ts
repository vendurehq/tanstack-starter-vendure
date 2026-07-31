import {cachedPublicData} from '@/platform/cache/public-cache';
import {query} from '@/platform/vendure/api';
import {GetAvailableCountriesQuery} from './graphql';

export async function getAvailableCountriesCached(locale: string) {
    return cachedPublicData({
        key: `countries:${locale}`,
        tags: [`countries-${locale}`],
        ttlMs: 24 * 60 * 60 * 1000,
        load: async () => {
            const result = await query(GetAvailableCountriesQuery, undefined, {languageCode: locale});
            return result.data.availableCountries || [];
        },
    });
}
