import Page from '@/features/authentication/routes/verify/page'
import { tokenSearchSchema } from '@/platform/tanstack/search'
import { createFileRoute } from '@tanstack/react-router'
import { verifyAccountAction } from '@/features/authentication/routes/verify/actions'
import { storefrontHead } from '@/platform/tanstack/head'
import { m } from '@/paraglide/messages.js'
import { Spinner } from '@/components/ui/spinner'
export const Route = createFileRoute('/verify')({
  head: () => storefrontHead({title: m.Verify_pageTitle(), path: '/verify', noIndex: true}),
  validateSearch: tokenSearchSchema,
  loaderDeps: ({search: {token}}) => ({token}),
  loader: ({deps}) => deps.token ? verifyAccountAction({data: {token: deps.token}}) : null,
  staleTime: Infinity,
  pendingComponent: VerifyPending,
  component: VerifyRoute,
})
function VerifyRoute() { return <Page token={Route.useSearch().token} result={Route.useLoaderData()} /> }
function VerifyPending() { return <div className="flex min-h-[60vh] items-center justify-center"><Spinner className="size-6" /></div> }
