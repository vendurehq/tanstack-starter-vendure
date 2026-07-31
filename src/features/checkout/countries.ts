import {cachedPublicData} from '@/platform/cache/public-cache';
import {queryOnServer} from '@/platform/vendure/api.server';
import {GetAvailableCountriesQuery} from './graphql';

export async function getAvailableCountriesCached(locale: string) {
    return cachedPublicData({
        key: `countries:${locale}`,
        tags: [`countries-${locale}`],
        ttlMs: 24 * 60 * 60 * 1000,
        load: async () => {
            const result = await queryOnServer(GetAvailableCountriesQuery, {}, {languageCode: locale});
            return result.data.availableCountries || [];
        },
    });
}
