import Page from '@/features/orders/routes/page'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/order-confirmation/$code')({ component: OrderRoute })

function OrderRoute() {
  return <Page params={Promise.resolve(Route.useParams())} searchParams={Promise.resolve({})} />
}
