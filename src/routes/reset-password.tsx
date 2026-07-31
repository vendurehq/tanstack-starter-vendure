import Page from '@/features/authentication/routes/reset-password/page'
import { tokenSearchSchema } from '@/platform/tanstack/search'
import { createFileRoute } from '@tanstack/react-router'
import { storefrontHead } from '@/platform/tanstack/head'
import { m } from '@/paraglide/messages.js'
export const Route = createFileRoute('/reset-password')({ head: () => storefrontHead({title: m.Auth_resetPasswordPageTitle(), path: '/reset-password', noIndex: true}), validateSearch: tokenSearchSchema, component: ResetRoute })
function ResetRoute() { return <Page token={Route.useSearch().token} /> }
