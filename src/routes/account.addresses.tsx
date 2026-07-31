import Loading from '@/features/account/routes/addresses/loading'
import Page from '@/features/account/routes/addresses/page'
import { createFileRoute } from '@tanstack/react-router'
import { query } from '@/platform/vendure/api'
import { GetCustomerAddressesQuery } from '@/features/account/graphql'
import { GetAvailableCountriesQuery } from '@/features/checkout/graphql'
import { getRouteLocale } from '@/platform/i18n/server'
export const Route = createFileRoute('/account/addresses')({
  loader: async () => {
    const locale = await getRouteLocale()
    const [addressesResult, countriesResult] = await Promise.all([
      query(GetCustomerAddressesQuery, {}, {useAuthToken: true}),
      query(GetAvailableCountriesQuery, {}, {languageCode: locale}),
    ])
    return {addressesResult, countriesResult}
  },
  component: AddressesRoute,
  pendingComponent: Loading,
})
function AddressesRoute() { return <Page {...Route.useLoaderData()} /> }
