import {GetActiveCustomerQuery} from '@/features/account/graphql';
import {queryOnServer} from '@/platform/vendure/api.server';
import {getAuthToken} from '@/platform/vendure/auth-token.server';
import {createServerFn} from '@tanstack/react-start';

export const getAccountSession = createServerFn({method: 'GET'}).handler(async () => {
    if (!getAuthToken()) return null;
    const result = await queryOnServer(GetActiveCustomerQuery, {}, {useAuthToken: true});
    return result.data.activeCustomer ? {authenticated: true} : null;
});
