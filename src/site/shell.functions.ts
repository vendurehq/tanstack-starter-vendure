import {GetActiveCustomerQuery, ActiveCustomerFragment} from '@/features/account/graphql';
import {GetActiveOrderQuery} from '@/features/cart/graphql';
import {GetTopCollectionsQuery} from '@/features/collections/graphql';
import {getActiveCurrencyCodeOnServer} from '@/features/currency/active-currency.server';
import {cachedPublicData} from '@/platform/cache/public-cache';
import {getLocale} from '@/paraglide/runtime';
import {queryOnServer} from '@/platform/vendure/api.server';
import {GetActiveChannelQuery} from '@/platform/vendure/channel-graphql';
import {readFragment} from '@/platform/vendure/graphql';
import {disableAuthResponseCaching} from '@/platform/vendure/auth-token.server';
import {createServerFn} from '@tanstack/react-start';

export const getShellData = createServerFn({method: 'GET'}).handler(async () => {
    // Contains customer name and cart count, so shared caches must not store it
    disableAuthResponseCaching();
    const locale = getLocale();
    const [channelResult, collections, customerResult, orderResult, activeCurrencyCode] = await Promise.all([
        queryOnServer(GetActiveChannelQuery, {}),
        cachedPublicData({
            key: `collections:top:${locale}`,
            tags: [`collections-${locale}`],
            ttlMs: 5 * 60 * 1000,
            load: async () => (await queryOnServer(GetTopCollectionsQuery, {}, {languageCode: locale})).data.collections.items,
        }),
        queryOnServer(GetActiveCustomerQuery, {}, {useAuthToken: true}),
        queryOnServer(GetActiveOrderQuery, {}, {useAuthToken: true}),
        getActiveCurrencyCodeOnServer(),
    ]);
    const customer = readFragment(ActiveCustomerFragment, customerResult.data.activeCustomer);
    return {
        collections,
        availableCurrencyCodes: channelResult.data.activeChannel.availableCurrencyCodes,
        activeCurrencyCode,
        cartItemCount: orderResult.data.activeOrder?.totalQuantity ?? 0,
        customerFirstName: customer?.firstName ?? null,
    };
});
