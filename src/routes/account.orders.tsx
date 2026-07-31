import Loading from '@/features/account/routes/orders/loading'
import Page from '@/features/account/routes/orders/page'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
export const Route = createFileRoute('/account/orders')({ validateSearch: z.object({ page: z.coerce.number().int().positive().catch(1) }), pendingComponent: Loading, component: OrdersRoute })
function OrdersRoute() { return <Page params={Promise.resolve({})} searchParams={Promise.resolve(Route.useSearch())} /> }
