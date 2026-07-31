import Loading from '@/features/products/routes/loading'
import Page from '@/features/products/routes/page'
import { productSearchSchema } from '@/platform/tanstack/search'
import { createFileRoute, notFound } from '@tanstack/react-router'
import { getProductRouteData } from '@/features/products/catalog.functions'
import { storefrontHead } from '@/platform/tanstack/head'

export const Route = createFileRoute('/product/$slug')({
  validateSearch: productSearchSchema,
  loader: async ({params}) => {
    const product = await getProductRouteData({data: {slug: params.slug}})
    if (!product) throw notFound()
    return product
  },
  staleTime: 30_000,
  head: ({loaderData}) => loaderData ? storefrontHead(loaderData) : {},
  pendingComponent: Loading,
  component: ProductRoute,
})

function ProductRoute() {
  return <Page params={Promise.resolve(Route.useParams())} searchParams={Promise.resolve(Route.useSearch())} />
}
