import Page from '@/features/authentication/routes/verify/page'
import { tokenSearchSchema } from '@/platform/tanstack/search'
import { createFileRoute } from '@tanstack/react-router'
import { verifyAccountAction } from '@/features/authentication/routes/verify/actions'
export const Route = createFileRoute('/verify')({
  validateSearch: tokenSearchSchema,
  loaderDeps: ({search: {token}}) => ({token}),
  loader: ({deps}) => deps.token ? verifyAccountAction({data: {token: deps.token}}) : null,
  component: VerifyRoute,
})
function VerifyRoute() { return <Page token={Route.useSearch().token} result={Route.useLoaderData()} /> }
