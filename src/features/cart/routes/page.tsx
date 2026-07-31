import {Cart} from "@/features/cart/routes/cart";
import {useTranslations} from '@/platform/i18n/paraglide';
import type {ResultOf} from '@/platform/vendure/graphql';
import type {GetActiveOrderQuery} from '@/features/cart/graphql';

export default function CartPage({activeOrder}: {activeOrder: ResultOf<typeof GetActiveOrderQuery>['activeOrder']}) {
    const t = useTranslations('Cart');

    return (
        <div className="container mx-auto px-4 py-20">
            <h1 className="text-3xl font-bold mb-8">{t('title')}</h1>

            <Cart activeOrder={activeOrder}/>
        </div>
    );
}
