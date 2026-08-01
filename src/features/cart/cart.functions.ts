import {GetActiveOrderQuery} from '@/features/cart/graphql';
import {getActiveCurrencyCodeOnServer} from '@/features/currency/active-currency.server';
import {getLocale} from '@/paraglide/runtime';
import {queryOnServer} from '@/platform/vendure/api.server';
import {disableAuthResponseCaching} from '@/platform/vendure/auth-token.server';
import {createServerFn} from '@tanstack/react-start';

export const getCartRouteData = createServerFn({method: 'GET'}).handler(async () => {
    disableAuthResponseCaching();
    const result = await queryOnServer(GetActiveOrderQuery, {}, {
        useAuthToken: true,
        languageCode: getLocale(),
        currencyCode: await getActiveCurrencyCodeOnServer(),
    });
    return result.data.activeOrder;
});
