import {mutateOnServer} from '@/platform/vendure/api.server';
import {setAuthToken} from '@/platform/vendure/auth-token.server';
import {RemoveFromCartMutation, AdjustCartItemMutation, ApplyPromotionCodeMutation, RemovePromotionCodeMutation} from '@/features/cart/graphql';
import {getActiveCurrencyCodeOnServer} from '@/features/currency/active-currency.server';
import {createServerFn} from '@tanstack/react-start';
import {z} from 'zod';

export const removeFromCart = createServerFn({method: 'POST'})
    .validator(z.object({lineId: z.string().min(1)}))
    .handler(async ({data}) => {
        const currencyCode = await getActiveCurrencyCodeOnServer();
        const result = await mutateOnServer(RemoveFromCartMutation, data, {useAuthToken: true, currencyCode});
        if (result.token) setAuthToken(result.token);
        return {success: true};
    });

export const adjustQuantity = createServerFn({method: 'POST'})
    .validator(z.object({lineId: z.string().min(1), quantity: z.number().int().min(1)}))
    .handler(async ({data}) => {
        const currencyCode = await getActiveCurrencyCodeOnServer();
        const result = await mutateOnServer(AdjustCartItemMutation, data, {useAuthToken: true, currencyCode});
        if (result.token) setAuthToken(result.token);
        return {success: true};
    });

export const applyPromotionCode = createServerFn({method: 'POST'})
    .validator(z.object({code: z.string().trim().min(1)}))
    .handler(async ({data}) => {
        const currencyCode = await getActiveCurrencyCodeOnServer();
        const result = await mutateOnServer(ApplyPromotionCodeMutation, {couponCode: data.code}, {useAuthToken: true, currencyCode});
        if (result.token) setAuthToken(result.token);
        return {success: true};
    });

export const removePromotionCode = createServerFn({method: 'POST'})
    .validator(z.object({code: z.string().trim().min(1)}))
    .handler(async ({data}) => {
        const currencyCode = await getActiveCurrencyCodeOnServer();
        const result = await mutateOnServer(RemovePromotionCodeMutation, {couponCode: data.code}, {useAuthToken: true, currencyCode});
        if (result.token) setAuthToken(result.token);
        return {success: true};
    });
