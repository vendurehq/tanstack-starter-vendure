import {mutateOnServer, queryOnServer} from '@/platform/vendure/api.server';
import {requireAuthToken} from '@/platform/vendure/auth-token.server';
import {
    CreateCustomerAddressMutation,
    GetCustomerAddressesQuery,
    UpdateCustomerAddressMutation,
    DeleteCustomerAddressMutation,
} from '@/features/account/graphql';
import {GetAvailableCountriesQuery} from '@/features/checkout/graphql';
import {storefrontContextMiddleware} from '@/features/currency/storefront-context.middleware';
import {authRequiredMiddleware, noStoreMiddleware} from '@/platform/middleware';
import {createServerFn} from '@tanstack/react-start';
import {z} from 'zod';

export const getAddressesPageData = createServerFn({method: 'GET'})
    .middleware([noStoreMiddleware, authRequiredMiddleware, storefrontContextMiddleware])
    .handler(async ({context}) => {
        const [addressesResult, countriesResult] = await Promise.all([
            queryOnServer(GetCustomerAddressesQuery, {}, {useAuthToken: true}),
            queryOnServer(GetAvailableCountriesQuery, {}, {languageCode: context.locale}),
        ]);
        return {
            addresses: addressesResult.data.activeCustomer?.addresses ?? [],
            countries: countriesResult.data.availableCountries ?? [],
        };
    });

const addressSchema = z.object({
    id: z.string().optional(),
    fullName: z.string().min(1),
    streetLine1: z.string().min(1),
    streetLine2: z.string().optional(),
    city: z.string().min(1),
    province: z.string(),
    postalCode: z.string().min(1),
    countryCode: z.string().length(2),
    phoneNumber: z.string(),
    company: z.string().optional(),
});

export const createAddress = createServerFn({method: 'POST'})
    .validator(addressSchema.omit({id: true}))
    .handler(async ({data}) => {
        requireAuthToken();
        const result = await mutateOnServer(CreateCustomerAddressMutation, {input: data}, {useAuthToken: true});
        if (!result.data.createCustomerAddress) throw new Error('Failed to create address');
        return result.data.createCustomerAddress;
    });

export const updateAddress = createServerFn({method: 'POST'})
    .validator(addressSchema.extend({id: z.string().min(1)}))
    .handler(async ({data}) => {
        requireAuthToken();
        const result = await mutateOnServer(UpdateCustomerAddressMutation, {input: data}, {useAuthToken: true});
        if (!result.data.updateCustomerAddress) throw new Error('Failed to update address');
        return result.data.updateCustomerAddress;
    });

export const deleteAddress = createServerFn({method: 'POST'})
    .validator(z.object({id: z.string().min(1)}))
    .handler(async ({data}) => {
        requireAuthToken();
        const result = await mutateOnServer(DeleteCustomerAddressMutation, data, {useAuthToken: true});
        if (!result.data.deleteCustomerAddress.success) throw new Error('Failed to delete address');
        return result.data.deleteCustomerAddress;
    });

export const setDefaultShippingAddress = createServerFn({method: 'POST'})
    .validator(z.object({id: z.string().min(1)}))
    .handler(async ({data}) => {
        requireAuthToken();
        const result = await mutateOnServer(
            UpdateCustomerAddressMutation,
            {input: {id: data.id, defaultShippingAddress: true}},
            {useAuthToken: true},
        );
        if (!result.data.updateCustomerAddress) throw new Error('Failed to set default address');
        return result.data.updateCustomerAddress;
    });

export const setDefaultBillingAddress = createServerFn({method: 'POST'})
    .validator(z.object({id: z.string().min(1)}))
    .handler(async ({data}) => {
        requireAuthToken();
        const result = await mutateOnServer(
            UpdateCustomerAddressMutation,
            {input: {id: data.id, defaultBillingAddress: true}},
            {useAuthToken: true},
        );
        if (!result.data.updateCustomerAddress) throw new Error('Failed to set default address');
        return result.data.updateCustomerAddress;
    });
