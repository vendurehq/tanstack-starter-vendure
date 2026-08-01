import { AddressesClient } from './addresses-client';
import type {getAddressesPageData} from './actions';
import {useTranslations} from '@/platform/i18n/paraglide';

export default function AddressesPage({addresses, countries}: Awaited<ReturnType<typeof getAddressesPageData>>) {
    const t = useTranslations('Account');

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
