import Page from '@/features/account/routes/orders/[code]/page'
import { createFileRoute } from '@tanstack/react-router'
import { query } from '@/platform/vendure/api'
import { GetOrderDetailQuery } from '@/features/account/graphql'
export const Route = createFileRoute('/account/orders/$code')({
  loader: ({params}) => query(GetOrderDetailQuery, {code: params.code}, {useAuthToken: true}),
  component: OrderDetailRoute,
})
function OrderDetailRoute() { return <Page orderData={Route.useLoaderData()} /> }
