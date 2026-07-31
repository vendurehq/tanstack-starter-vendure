import Loading from '@/features/checkout/routes/loading'
import Page from '@/features/checkout/routes/page'
import { createFileRoute } from '@tanstack/react-router'
import { storefrontHead } from '@/platform/tanstack/head'
import { m } from '@/paraglide/messages.js'

export const Route = createFileRoute('/checkout')({ head: () => storefrontHead({title: m.Checkout_pageTitle(), path: '/checkout', noIndex: true}), component: Page, pendingComponent: Loading })
