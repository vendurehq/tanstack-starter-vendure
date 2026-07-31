import Loading from '@/features/search/routes/loading'
import Page from '@/features/search/routes/page'
import { catalogSearchSchema } from '@/platform/tanstack/search'
import { createFileRoute } from '@tanstack/react-router'
import { storefrontHead } from '@/platform/tanstack/head'
import { m } from '@/paraglide/messages.js'

export const Route = createFileRoute('/search')({
  validateSearch: catalogSearchSchema,
  head: () => storefrontHead({title: m.Search_pageTitle(), path: '/search', noIndex: true}),
  pendingComponent: Loading,
  component: SearchRoute,
})

function SearchRoute() {
  return <Page searchParams={Promise.resolve(Route.useSearch())} params={Promise.resolve({})} />
}
