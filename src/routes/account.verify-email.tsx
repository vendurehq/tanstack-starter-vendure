import Page, { loadEmailVerification } from '@/features/account/routes/verify-email/page'
import { tokenSearchSchema } from '@/platform/tanstack/search'
import { createFileRoute } from '@tanstack/react-router'
export const Route = createFileRoute('/account/verify-email')({
  validateSearch: tokenSearchSchema,
  loaderDeps: ({search: {token}}) => ({token}),
  loader: ({deps}) => loadEmailVerification(deps.token),
  component: VerifyEmailRoute,
})
function VerifyEmailRoute() { return <Page result={Route.useLoaderData()} /> }
