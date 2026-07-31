import handler from '@tanstack/react-start/server-entry'
import { paraglideMiddleware } from './paraglide/server.js'

export default {
  async fetch(request: Request): Promise<Response> {
    if (new URL(request.url).pathname.startsWith('/api/')) return handler.fetch(request)
    return paraglideMiddleware(request, () => handler.fetch(request))
  },
}
