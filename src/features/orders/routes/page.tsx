import {OrderConfirmation} from './order-confirmation';
import type {getOrderConfirmation} from '@/features/orders/order.functions';

export default function OrderConfirmationPage({order}: {order: Awaited<ReturnType<typeof getOrderConfirmation>>}) {
    return <OrderConfirmation order={order} />;
}
