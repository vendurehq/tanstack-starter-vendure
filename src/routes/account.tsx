import Layout from '@/features/account/routes/layout'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { redirect } from '@tanstack/react-router'
import { getAccountSession } from '@/features/account/auth.functions'

export const Route = createFileRoute('/account')({
  beforeLoad: async ({ location }) => {
    const customer = await getAccountSession()
    if (!customer) {
      throw redirect({to: '/sign-in', search: {redirectTo: location.href}})
    }
  },
  head: () => ({meta: [{name: 'robots', content: 'noindex, nofollow'}]}),
  component: AccountRoute,
})
function AccountRoute() { return <Layout><Outlet /></Layout> }
