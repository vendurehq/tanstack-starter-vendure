import Loading from '@/features/account/routes/profile/loading'
import Page from '@/features/account/routes/profile/page'
import { createFileRoute } from '@tanstack/react-router'
export const Route = createFileRoute('/account/profile')({ component: Page, pendingComponent: Loading })
