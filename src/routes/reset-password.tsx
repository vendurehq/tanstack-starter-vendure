import Page from '@/features/authentication/routes/reset-password/page'
import { tokenSearchSchema } from '@/platform/tanstack/search'
import { createFileRoute } from '@tanstack/react-router'
export const Route = createFileRoute('/reset-password')({ validateSearch: tokenSearchSchema, component: ResetRoute })
function ResetRoute() { return <Page params={Promise.resolve({})} searchParams={Promise.resolve(Route.useSearch())} /> }
