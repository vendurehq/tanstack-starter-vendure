import Page from '@/features/authentication/routes/sign-in/page'
import { redirectSearchSchema } from '@/platform/tanstack/search'
import { createFileRoute } from '@tanstack/react-router'
import { storefrontHead } from '@/platform/tanstack/head'
import { m } from '@/paraglide/messages.js'

export const Route = createFileRoute('/sign-in')({ head: () => storefrontHead({title: m.Auth_pageTitle(), path: '/sign-in', noIndex: true}), validateSearch: redirectSearchSchema, component: SignInRoute })
function SignInRoute() { return <Page params={Promise.resolve({})} searchParams={Promise.resolve(Route.useSearch())} /> }
