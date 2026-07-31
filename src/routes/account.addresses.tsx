import Loading from '@/features/account/routes/addresses/loading'
import Page from '@/features/account/routes/addresses/page'
import { createFileRoute } from '@tanstack/react-router'
export const Route = createFileRoute('/account/addresses')({ component: Page, pendingComponent: Loading })
