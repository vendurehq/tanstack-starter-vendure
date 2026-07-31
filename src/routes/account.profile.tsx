import Loading from '@/features/account/routes/profile/loading'
import Page from '@/features/account/routes/profile/page'
import { createFileRoute } from '@tanstack/react-router'
import { getActiveCustomer } from '@/features/account/customer'
export const Route = createFileRoute('/account/profile')({ loader: () => getActiveCustomer(), component: ProfileRoute, pendingComponent: Loading })
function ProfileRoute() { return <Page customer={Route.useLoaderData()} /> }
