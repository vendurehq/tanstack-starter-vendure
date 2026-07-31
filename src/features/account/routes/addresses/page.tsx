import type {GetCustomerAddressesQuery} from '@/features/account/graphql';
import type {GetAvailableCountriesQuery} from '@/features/checkout/graphql';
import type {ResultOf} from '@/platform/vendure/graphql';
import { AddressesClient } from './addresses-client';
import {useTranslations} from '@/platform/i18n/paraglide';

export default function AddressesPage({addressesResult, countriesResult}: {
    addressesResult: {data: ResultOf<typeof GetCustomerAddressesQuery>};
    countriesResult: {data: ResultOf<typeof GetAvailableCountriesQuery>};
}) {
    const t = useTranslations('Account');

    const addresses = addressesResult.data.activeCustomer?.addresses || [];
    const countries = countriesResult.data.availableCountries || [];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">{t('addresses')}</h1>
                <p className="text-muted-foreground mt-2">
                    {t('manageAddresses')}
                </p>
            </div>

            <AddressesClient addresses={addresses} countries={countries} />
        </div>
    );
}
