import Loading from '@/features/checkout/routes/loading'
import Page, { loadCheckoutData } from '@/features/checkout/routes/page'
import { createFileRoute } from '@tanstack/react-router'
import { storefrontHead } from '@/platform/tanstack/head'
import { m } from '@/paraglide/messages.js'

export const Route = createFileRoute('/checkout')({ loader: () => loadCheckoutData(), head: () => storefrontHead({title: m.Checkout_pageTitle(), path: '/checkout', noIndex: true}), component: CheckoutRoute, pendingComponent: Loading })
function CheckoutRoute() { return <Page data={Route.useLoaderData()} /> }
