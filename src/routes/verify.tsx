import Page from '@/features/authentication/routes/verify/page'
import { tokenSearchSchema } from '@/platform/tanstack/search'
import { createFileRoute } from '@tanstack/react-router'
export const Route = createFileRoute('/verify')({ validateSearch: tokenSearchSchema, component: VerifyRoute })
function VerifyRoute() { return <Page params={Promise.resolve({})} searchParams={Promise.resolve(Route.useSearch())} /> }
