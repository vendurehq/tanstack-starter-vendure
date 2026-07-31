import {readFragment} from '@/platform/vendure/graphql';
import {query} from '@/platform/vendure/api';
import {ActiveCustomerFragment, GetActiveCustomerQuery} from './graphql';

export const getActiveCustomer = async () => {
    const result = await query(GetActiveCustomerQuery, undefined, {useAuthToken: true});
    return readFragment(ActiveCustomerFragment, result.data.activeCustomer);
};
