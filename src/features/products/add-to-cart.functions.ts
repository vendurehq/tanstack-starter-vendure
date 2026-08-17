import {m} from '@/paraglide/messages.js';
import {AddToCartMutation} from '@/features/cart/graphql';
import {getActiveCurrencyCodeOnServer} from '@/features/currency/active-currency.server';
import {mutateOnServer} from '@/platform/vendure/api.server';
import {setAuthToken} from '@/platform/vendure/auth-token.server';
import {createServerFn} from '@tanstack/react-start';
import {z} from 'zod';

export const addToCart = createServerFn({method: 'POST'})
  .validator(z.object({variantId: z.string().min(1), quantity: z.number().int().min(1).default(1)}))
  .handler(async ({data}) => {
    const currencyCode = await getActiveCurrencyCodeOnServer();

    try {
        const result = await mutateOnServer(
            AddToCartMutation,
            data,
            {useAuthToken: true, currencyCode},
        );

        if (result.token) setAuthToken(result.token);

        if (result.data.addItemToOrder.__typename === 'Order') {
            return {success: true, order: result.data.addItemToOrder};
        }
        return {success: false, error: result.data.addItemToOrder.message};
    } catch {
        return {success: false, error: m.Errors_failedAddToCart()};
    }
  });
