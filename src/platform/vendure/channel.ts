import {query} from './api';
import {GetActiveChannelQuery} from './channel-graphql';
import {cachedPublicData} from '@/platform/cache/public-cache';

/**
 * Get the active channel with caching enabled.
 * Channel configuration rarely changes, so it is cached for one hour.
 * Channel configuration is language-independent, so no locale is required.
 */
export async function getActiveChannel() {
    return cachedPublicData({
        key: 'channel:active',
        tags: ['channel'],
        ttlMs: 60 * 60 * 1000,
        load: async () => {
            const result = await query(GetActiveChannelQuery);
            return result.data.activeChannel;
        },
    });
}
