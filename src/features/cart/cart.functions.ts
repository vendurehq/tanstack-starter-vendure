import {GetActiveOrderQuery} from '@/features/cart/graphql';
import {storefrontContextMiddleware} from '@/features/currency/storefront-context.middleware';
import {noStoreMiddleware} from '@/platform/middleware';
import {queryOnServer} from '@/platform/vendure/api.server';
import {createServerFn} from '@tanstack/react-start';

export const getCartRouteData = createServerFn({method: 'GET'})
    .middleware([noStoreMiddleware, storefrontContextMiddleware])
    .handler(async ({context}) => {
        const result = await queryOnServer(GetActiveOrderQuery, {}, {
            useAuthToken: true,
            languageCode: context.locale,
            currencyCode: context.currencyCode,
        });
        return result.data.activeOrder;
    });
