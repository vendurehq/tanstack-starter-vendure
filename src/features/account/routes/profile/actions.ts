import {mutateOnServer} from '@/platform/vendure/api.server';
import {requireAuthToken} from '@/platform/vendure/auth-token.server';
import {
    UpdateCustomerPasswordMutation,
    UpdateCustomerMutation,
    RequestUpdateCustomerEmailAddressMutation,
} from '@/features/account/graphql';
import {m} from '@/paraglide/messages.js';
import {createServerFn} from '@tanstack/react-start';
import {z} from 'zod';

export const updatePasswordAction = createServerFn({method: 'POST'})
    .validator(z.object({
        currentPassword: z.string().min(1),
        newPassword: z.string().min(1),
        confirmPassword: z.string().min(1),
    }))
    .handler(async ({data}) => {
        requireAuthToken();
        if (data.newPassword !== data.confirmPassword) return {error: m.Errors_passwordsMismatch()};
        if (data.currentPassword === data.newPassword) return {error: m.Errors_newPasswordMustDiffer()};
        try {
            const result = await mutateOnServer(UpdateCustomerPasswordMutation, {
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
            }, {useAuthToken: true});
            const updateResult = result.data.updateCustomerPassword;
            return updateResult.__typename === 'Success' ? {success: true} : {error: updateResult.message};
        } catch {
            return {error: m.Errors_unexpectedError()};
        }
    });

export const updateCustomerAction = createServerFn({method: 'POST'})
    .validator(z.object({firstName: z.string().min(1), lastName: z.string().min(1)}))
    .handler(async ({data}) => {
        requireAuthToken();
        try {
            const result = await mutateOnServer(UpdateCustomerMutation, {input: data}, {useAuthToken: true});
            return result.data.updateCustomer?.id
                ? {success: true}
                : {error: m.Errors_failedUpdateCustomer()};
        } catch {
            return {error: m.Errors_unexpectedError()};
        }
    });

export const requestEmailUpdateAction = createServerFn({method: 'POST'})
    .validator(z.object({password: z.string().min(1), newEmailAddress: z.email()}))
    .handler(async ({data}) => {
        requireAuthToken();
        try {
            const result = await mutateOnServer(RequestUpdateCustomerEmailAddressMutation, data, {useAuthToken: true});
            const updateResult = result.data.requestUpdateCustomerEmailAddress;
            return updateResult.__typename === 'Success' ? {success: true} : {error: updateResult.message};
        } catch {
            return {error: m.Errors_unexpectedError()};
        }
    });
