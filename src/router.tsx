import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import '@tanstack/react-start'
import { routeTree } from './routeTree.gen'
import { deLocalizeUrl, localizeUrl } from './paraglide/runtime'

export function getRouter() {
  const router = createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
    rewrite: {
      input: ({ url }) => deLocalizeUrl(url),
      output: ({ url }) => localizeUrl(url),
    },
  })

  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
