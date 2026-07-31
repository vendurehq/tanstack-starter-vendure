import Page from '@/features/orders/routes/page'
import { loadOrderConfirmation } from '@/features/orders/routes/order-confirmation'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/order-confirmation/$code')({ loader: ({params}) => loadOrderConfirmation(params.code), component: OrderRoute })

function OrderRoute() {
  return <Page order={Route.useLoaderData()} />
}
