import Page from '@/features/account/routes/orders/[code]/page'
import { createFileRoute } from '@tanstack/react-router'
export const Route = createFileRoute('/account/orders/$code')({ component: OrderDetailRoute })
function OrderDetailRoute() { return <Page params={Promise.resolve(Route.useParams())} searchParams={Promise.resolve({})} /> }
