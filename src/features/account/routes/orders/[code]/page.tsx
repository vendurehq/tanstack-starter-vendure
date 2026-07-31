import type {GetOrderDetailQuery} from '@/features/account/graphql';
import type {ResultOf} from '@/platform/vendure/graphql';
import {OrderDetail} from './order-detail';

export default function OrderDetailPage({orderData}: {orderData: {data: ResultOf<typeof GetOrderDetailQuery>}}) {
    return <OrderDetail orderData={orderData} />;
}
