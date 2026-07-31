import {getCurrencyCookie} from './currency.server';
import {queryOnServer} from '@/platform/vendure/api.server';
import {GetActiveChannelQuery} from '@/platform/vendure/channel-graphql';

export async function getActiveCurrencyCodeOnServer() {
    const cookieValue = getCurrencyCookie();
    if (cookieValue) return cookieValue;
    const result = await queryOnServer(GetActiveChannelQuery, {});
    return result.data.activeChannel.defaultCurrencyCode;
}
