import Page from '@/features/authentication/routes/verify-pending/page'
import { redirectSearchSchema } from '@/platform/tanstack/search'
import { createFileRoute } from '@tanstack/react-router'
export const Route = createFileRoute('/verify-pending')({ validateSearch: redirectSearchSchema, component: VerifyPendingRoute })
function VerifyPendingRoute() { return <Page params={Promise.resolve({})} searchParams={Promise.resolve(Route.useSearch())} /> }
