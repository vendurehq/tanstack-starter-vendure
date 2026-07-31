import Page from '@/features/account/routes/verify-email/page'
import { tokenSearchSchema } from '@/platform/tanstack/search'
import { createFileRoute } from '@tanstack/react-router'
export const Route = createFileRoute('/account/verify-email')({ validateSearch: tokenSearchSchema, component: VerifyEmailRoute })
function VerifyEmailRoute() { return <Page params={Promise.resolve({})} searchParams={Promise.resolve(Route.useSearch())} /> }
