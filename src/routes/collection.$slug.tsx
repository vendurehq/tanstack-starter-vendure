import Loading from '@/features/collections/routes/loading'
import Page from '@/features/collections/routes/page'
import { catalogSearchSchema } from '@/platform/tanstack/search'
import { createFileRoute, notFound } from '@tanstack/react-router'
import { getCollectionRouteData } from '@/features/products/catalog.functions'
import { storefrontHead } from '@/platform/tanstack/head'

export const Route = createFileRoute('/collection/$slug')({
  validateSearch: catalogSearchSchema,
  loader: async ({params}) => {
    const collection = await getCollectionRouteData({data: {slug: params.slug}})
    if (!collection) throw notFound()
    return collection
  },
  staleTime: 30_000,
  head: ({loaderData}) => loaderData ? storefrontHead(loaderData) : {},
  pendingComponent: Loading,
  component: CollectionRoute,
})

function CollectionRoute() {
  return <Page params={Promise.resolve(Route.useParams())} searchParams={Promise.resolve(Route.useSearch())} />
}
