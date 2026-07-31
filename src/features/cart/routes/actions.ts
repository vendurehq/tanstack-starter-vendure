import {mutateOnServer} from '@/platform/vendure/api.server';
import {setAuthToken} from '@/platform/vendure/auth-token.server';
import {RemoveFromCartMutation, AdjustCartItemMutation, ApplyPromotionCodeMutation, RemovePromotionCodeMutation} from '@/features/cart/graphql';
import {getActiveCurrencyCodeOnServer} from '@/features/currency/active-currency.server';
import {createServerFn} from '@tanstack/react-start';
import {z} from 'zod';

export type CartActionResult =
    | {success: true}
    | {success: false; errorCode: string; message: string};

function toCartActionResult(
    result: {__typename: string; errorCode?: string; message?: string},
): CartActionResult {
    if (result.__typename === 'Order') return {success: true};
    return {
        success: false,
        errorCode: result.errorCode ?? 'UNKNOWN',
        message: result.message ?? 'Unknown error',
    };
}

export const removeFromCart = createServerFn({method: 'POST'})
    .validator(z.object({lineId: z.string().min(1)}))
    .handler(async ({data}) => {
        const currencyCode = await getActiveCurrencyCodeOnServer();
        const result = await mutateOnServer(RemoveFromCartMutation, data, {useAuthToken: true, currencyCode});
        if (result.token) setAuthToken(result.token);
        return toCartActionResult(result.data.removeOrderLine);
    });

export const adjustQuantity = createServerFn({method: 'POST'})
    .validator(z.object({lineId: z.string().min(1), quantity: z.number().int().min(1)}))
    .handler(async ({data}) => {
        const currencyCode = await getActiveCurrencyCodeOnServer();
        const result = await mutateOnServer(AdjustCartItemMutation, data, {useAuthToken: true, currencyCode});
        if (result.token) setAuthToken(result.token);
        return toCartActionResult(result.data.adjustOrderLine);
    });

export const applyPromotionCode = createServerFn({method: 'POST'})
    .validator(z.object({code: z.string().trim().min(1)}))
    .handler(async ({data}) => {
        const currencyCode = await getActiveCurrencyCodeOnServer();
        const result = await mutateOnServer(ApplyPromotionCodeMutation, {couponCode: data.code}, {useAuthToken: true, currencyCode});
        if (result.token) setAuthToken(result.token);
        return toCartActionResult(result.data.applyCouponCode);
    });

export const removePromotionCode = createServerFn({method: 'POST'})
    .validator(z.object({code: z.string().trim().min(1)}))
    .handler(async ({data}) => {
        const currencyCode = await getActiveCurrencyCodeOnServer();
        const result = await mutateOnServer(RemovePromotionCodeMutation, {couponCode: data.code}, {useAuthToken: true, currencyCode});
        if (result.token) setAuthToken(result.token);
        return {success: true} as const;
    });
