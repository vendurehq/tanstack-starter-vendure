import Page from '@/features/authentication/routes/register/page'
import { redirectSearchSchema } from '@/platform/tanstack/search'
import { createFileRoute } from '@tanstack/react-router'
import { storefrontHead } from '@/platform/tanstack/head'
import { m } from '@/paraglide/messages.js'

export const Route = createFileRoute('/register')({ head: () => storefrontHead({title: m.Auth_createAccount(), path: '/register', noIndex: true}), validateSearch: redirectSearchSchema, component: RegisterRoute })
function RegisterRoute() { return <Page redirectTo={Route.useSearch().redirectTo} /> }
