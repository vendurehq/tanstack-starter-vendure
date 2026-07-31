import {getActiveCurrencyCode} from '@/features/currency/currency-server';
import {getRouteLocale} from '@/platform/i18n/server';
import {useTranslations} from '@/platform/i18n/paraglide';
import {query} from '@/platform/vendure/api';
import {GetActiveOrderForCheckoutQuery, GetEligiblePaymentMethodsQuery, GetEligibleShippingMethodsQuery} from '@/features/checkout/graphql';
import {GetCustomerAddressesQuery} from '@/features/account/graphql';
import {redirect} from '@tanstack/react-router';
import CheckoutFlow from './checkout-flow';
import {CheckoutProvider} from './checkout-provider';
import {getActiveCustomer} from '@/features/account/customer';
import {getAvailableCountriesCached} from '@/features/checkout/countries';

export async function loadCheckoutData() {
    const locale = await getRouteLocale();
    const currencyCode = await getActiveCurrencyCode();
    const customer = await getActiveCustomer();
    const isGuest = !customer;

    const [orderRes, addressesRes, countries, shippingMethodsRes, paymentMethodsRes] =
        await Promise.all([
            query(GetActiveOrderForCheckoutQuery, {}, {useAuthToken: true, currencyCode}),
            isGuest
                ? Promise.resolve({ data: { activeCustomer: null } })
                : query(GetCustomerAddressesQuery, {}, {useAuthToken: true}),
            getAvailableCountriesCached(locale),
            query(GetEligibleShippingMethodsQuery, {}, {useAuthToken: true, currencyCode}),
            query(GetEligiblePaymentMethodsQuery, {}, {useAuthToken: true, currencyCode}),
        ]);

    const activeOrder = orderRes.data.activeOrder;

    if (!activeOrder || activeOrder.lines.length === 0) {
        throw redirect({to: '/cart'});
    }

    if (activeOrder.state !== 'AddingItems' && activeOrder.state !== 'ArrangingPayment') {
        throw redirect({to: '/order-confirmation/$code', params: {code: activeOrder.code}});
    }

    const addresses = addressesRes.data.activeCustomer?.addresses || [];
    const shippingMethods = shippingMethodsRes.data.eligibleShippingMethods || [];
    const paymentMethods =
        paymentMethodsRes.data.eligiblePaymentMethods?.filter((m) => m.isEligible) || [];

    return {activeOrder, addresses, countries, shippingMethods, paymentMethods, isGuest};
}

export default function CheckoutPage({data}: {data: Awaited<ReturnType<typeof loadCheckoutData>>}) {
    const t = useTranslations('Checkout');
    const {activeOrder, addresses, countries, shippingMethods, paymentMethods, isGuest} = data;
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">{t('pageTitle')}</h1>
            <CheckoutProvider
                order={activeOrder}
                addresses={addresses}
                countries={countries}
                shippingMethods={shippingMethods}
                paymentMethods={paymentMethods}
                isGuest={isGuest}
            >
                <CheckoutFlow/>
            </CheckoutProvider>
        </div>
    );
}
