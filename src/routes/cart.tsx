import Loading from '@/features/cart/routes/loading'
import Page from '@/features/cart/routes/page'
import { createFileRoute } from '@tanstack/react-router'
import { storefrontHead } from '@/platform/tanstack/head'
import { m } from '@/paraglide/messages.js'
import { getCartRouteData } from '@/features/cart/cart.functions'

export const Route = createFileRoute('/cart')({
  loader: () => getCartRouteData(),
  head: () => storefrontHead({title: m.Cart_title(), path: '/cart', noIndex: true}),
  component: CartRoute,
  pendingComponent: Loading,
})
function CartRoute() { return <Page activeOrder={Route.useLoaderData()} /> }
