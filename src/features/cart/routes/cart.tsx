import {CartItems} from "@/features/cart/routes/cart-items";
import {OrderSummary} from "@/features/cart/routes/order-summary";
import {PromotionCode} from "@/features/cart/routes/promotion-code";
import type {GetActiveOrderQuery} from '@/features/cart/graphql';
import type {ResultOf} from '@/platform/vendure/graphql';

export function Cart({activeOrder}: {activeOrder: ResultOf<typeof GetActiveOrderQuery>['activeOrder']}) {
    if (!activeOrder || activeOrder.lines.length === 0) {
        return <CartItems activeOrder={null}/>;
    }

    return (
        <div className="grid lg:grid-cols-3 gap-8">
            <CartItems activeOrder={activeOrder}/>

            <div className="lg:col-span-1">
                <OrderSummary activeOrder={activeOrder}/>
                <PromotionCode activeOrder={activeOrder}/>
            </div>
        </div>
    )
}
