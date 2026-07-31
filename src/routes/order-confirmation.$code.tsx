import Page from '@/features/orders/routes/page'
import { getOrderConfirmation } from '@/features/orders/order.functions'
import { createFileRoute } from '@tanstack/react-router'
import { storefrontHead } from '@/platform/tanstack/head'
import { m } from '@/paraglide/messages.js'

export const Route = createFileRoute('/order-confirmation/$code')({
  loader: ({params}) => getOrderConfirmation({data: {code: params.code}}),
  head: ({params}) => storefrontHead({
    title: m.OrderConfirmation_pageTitle(),
    path: `/order-confirmation/${encodeURIComponent(params.code)}`,
    noIndex: true,
  }),
  component: OrderRoute,
})

function OrderRoute() {
  return <Page order={Route.useLoaderData()} />
}
