import {OrderConfirmation, type loadOrderConfirmation} from './order-confirmation';

export default function OrderConfirmationPage({order}: {order: Awaited<ReturnType<typeof loadOrderConfirmation>>}) {
    return <OrderConfirmation order={order} />;
}
