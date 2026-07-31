import Loading from '@/features/products/routes/loading'
import Page, { loadProductPageData } from '@/features/products/routes/page'
import { productSearchSchema } from '@/platform/tanstack/search'
import { createFileRoute, notFound } from '@tanstack/react-router'
import { getProductRouteData } from '@/features/products/catalog.functions'
import { storefrontHead } from '@/platform/tanstack/head'

export const Route = createFileRoute('/product/$slug')({
  validateSearch: productSearchSchema,
  loader: async ({params}) => {
    const [metadata, data] = await Promise.all([
      getProductRouteData({data: {slug: params.slug}}),
      loadProductPageData(params.slug),
    ])
    if (!metadata) throw notFound()
    return {metadata, data}
  },
  staleTime: 30_000,
  head: ({loaderData}) => loaderData ? storefrontHead(loaderData.metadata) : {},
  pendingComponent: Loading,
  component: ProductRoute,
})

function ProductRoute() {
  return <Page data={Route.useLoaderData().data} searchParams={Route.useSearch()} />
}
