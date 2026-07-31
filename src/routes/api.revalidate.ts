import { handleRevalidation } from '@/platform/revalidation/handler'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/revalidate')({
  server: { handlers: { POST: ({ request }) => handleRevalidation(request) } },
})
