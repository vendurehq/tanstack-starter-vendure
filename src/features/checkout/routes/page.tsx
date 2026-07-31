import {useTranslations} from '@/platform/i18n/paraglide';
import CheckoutFlow from './checkout-flow';
import {CheckoutProvider} from './checkout-provider';
import type {getCheckoutRouteData} from '@/features/checkout/checkout.functions';

export default function CheckoutPage({data}: {data: Awaited<ReturnType<typeof getCheckoutRouteData>>}) {
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
