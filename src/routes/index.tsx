import Home from '@/site/home/page'
import { createFileRoute } from '@tanstack/react-router'
import { storefrontHead } from '@/platform/tanstack/head'
import { m } from '@/paraglide/messages.js'
import { getHomeData } from '@/site/home/home.functions'

export const Route = createFileRoute('/')({
  loader: () => getHomeData(),
  head: () => storefrontHead({title: m.Home_pageTitle(), description: m.Home_description()}),
  component: HomeRoute,
})

function HomeRoute() { return <Home products={Route.useLoaderData().products} /> }
