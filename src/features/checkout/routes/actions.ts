import {mutateOnServer} from '@/platform/vendure/api.server';
import {setAuthToken} from '@/platform/vendure/auth-token.server';
import {
    SetOrderShippingAddressMutation,
    SetOrderBillingAddressMutation,
    SetOrderShippingMethodMutation,
    AddPaymentToOrderMutation,
    TransitionOrderToStateMutation,
    SetCustomerForOrderMutation,
} from '@/features/checkout/graphql';
import {CreateCustomerAddressMutation} from '@/features/account/graphql';
import {createServerFn} from '@tanstack/react-start';
import {redirect} from '@tanstack/react-router';
import {z} from 'zod';

const addressSchema = z.object({
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

async function transitionOrderToArrangingPayment() {
    const result = await mutateOnServer(
        TransitionOrderToStateMutation,
        {state: 'ArrangingPayment'},
        {useAuthToken: true},
    );
    if (result.token) setAuthToken(result.token);
    if (result.data.transitionOrderToState?.__typename === 'OrderStateTransitionError') {
        const error = result.data.transitionOrderToState;
        throw new Error(`Failed to transition order state: ${error.errorCode} - ${error.message}`);
    }
    // setAuthToken only writes the response cookie; follow-up mutations in the
    // same request must receive the rotated token explicitly.
    return result.token;
}

export const setShippingAddress = createServerFn({method: 'POST'})
    .validator(z.object({shippingAddress: addressSchema, useSameForBilling: z.boolean()}))
    .handler(async ({data}) => {
        const result = await mutateOnServer(
            SetOrderShippingAddressMutation,
            {input: data.shippingAddress},
            {useAuthToken: true},
        );
        if (result.token) setAuthToken(result.token);
        if (result.data.setOrderShippingAddress.__typename !== 'Order') {
            throw new Error('Failed to set shipping address');
        }
        if (data.useSameForBilling) {
            await mutateOnServer(SetOrderBillingAddressMutation, {input: data.shippingAddress}, {useAuthToken: true, token: result.token});
        }
        return {success: true};
    });

export const setShippingMethod = createServerFn({method: 'POST'})
    .validator(z.object({shippingMethodId: z.string().min(1)}))
    .handler(async ({data}) => {
        const result = await mutateOnServer(
            SetOrderShippingMethodMutation,
            {shippingMethodId: [data.shippingMethodId]},
            {useAuthToken: true},
        );
        if (result.token) setAuthToken(result.token);
        if (result.data.setOrderShippingMethod.__typename !== 'Order') {
            throw new Error('Failed to set shipping method');
        }
        return {success: true};
    });

export const createCustomerAddress = createServerFn({method: 'POST'})
    .validator(addressSchema)
    .handler(async ({data}) => {
        const result = await mutateOnServer(CreateCustomerAddressMutation, {input: data}, {useAuthToken: true});
        if (result.token) setAuthToken(result.token);
        if (!result.data.createCustomerAddress) throw new Error('Failed to create customer address');
        return result.data.createCustomerAddress;
    });

export const transitionToArrangingPayment = createServerFn({method: 'POST'})
    .handler(async () => {
        await transitionOrderToArrangingPayment();
        return {success: true};
    });

export const placeOrder = createServerFn({method: 'POST'})
    .validator(z.object({paymentMethodCode: z.string().min(1)}))
    .handler(async ({data}) => {
        const rotatedToken = await transitionOrderToArrangingPayment();
        const metadata: Record<string, unknown> = data.paymentMethodCode === 'standard-payment'
            ? {shouldDecline: false, shouldError: false, shouldErrorOnSettle: false}
            : {};
        const result = await mutateOnServer(
            AddPaymentToOrderMutation,
            {input: {method: data.paymentMethodCode, metadata}},
            {useAuthToken: true, token: rotatedToken},
        );
        if (result.token) setAuthToken(result.token);
        if (result.data.addPaymentToOrder.__typename !== 'Order') {
            const error = result.data.addPaymentToOrder;
            throw new Error(`Failed to place order: ${error.errorCode} - ${error.message}`);
        }
        throw redirect({href: `/order-confirmation/${result.data.addPaymentToOrder.code}`});
    });

export type SetCustomerForOrderResult =
    | {success: true}
    | {success: false; errorCode: 'EMAIL_CONFLICT' | 'GUEST_CHECKOUT_DISABLED' | 'NO_ACTIVE_ORDER' | 'UNKNOWN'; message: string};

export const setCustomerForOrder = createServerFn({method: 'POST'})
    .validator(z.object({
        emailAddress: z.email(),
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        phoneNumber: z.string().optional(),
    }))
    .handler(async ({data}): Promise<SetCustomerForOrderResult> => {
        const result = await mutateOnServer(SetCustomerForOrderMutation, {input: data}, {useAuthToken: true});
        if (result.token) setAuthToken(result.token);
        const response = result.data.setCustomerForOrder;
        switch (response.__typename) {
            case 'Order':
            case 'AlreadyLoggedInError':
                return {success: true};
            case 'EmailAddressConflictError':
                return {success: false, errorCode: 'EMAIL_CONFLICT', message: response.message};
            case 'GuestCheckoutError':
                return {success: false, errorCode: 'GUEST_CHECKOUT_DISABLED', message: response.message};
            case 'NoActiveOrderError':
                return {success: false, errorCode: 'NO_ACTIVE_ORDER', message: response.message};
            default:
                return {success: false, errorCode: 'UNKNOWN', message: 'Unknown error'};
        }
    });
