import Page from '@/features/authentication/routes/verify-pending/page'
import { redirectSearchSchema } from '@/platform/tanstack/search'
import { createFileRoute } from '@tanstack/react-router'
import { storefrontHead } from '@/platform/tanstack/head'
import { m } from '@/paraglide/messages.js'
export const Route = createFileRoute('/verify-pending')({ head: () => storefrontHead({title: m.Verify_pending_pageTitle(), path: '/verify-pending', noIndex: true}), validateSearch: redirectSearchSchema, component: VerifyPendingRoute })
function VerifyPendingRoute() { return <Page redirectTo={Route.useSearch().redirectTo} /> }
