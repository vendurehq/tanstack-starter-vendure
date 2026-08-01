---
type: major
areas:
  - account
  - authentication
  - cart
  - checkout
  - collections
  - currency
  - orders
  - pricing
  - products
  - search
  - platform.tanstack
  - platform.vendure
  - site
  - tooling
---

## Intent
Fix two storefront bugs and align route data loading with TanStack Start best
practices. Catalog facet filtering silently dropped numeric facet value IDs
because the router's search parser coerces them to numbers, and the navbar cart
count never refreshed after add-to-cart because nothing invalidated the router.
Beyond the fixes, the root shell loader is now cached (30s `staleTime`) with
explicit invalidation after every shell-changing mutation, single-use
verification mutations moved out of route loaders, the generic client-callable
GraphQL proxy was removed in favor of dedicated server functions, and
personalized responses are marked `Cache-Control: no-store`.

## Invariants
- Catalog `facets` search params are always string arrays; numeric values from
  the URL parser are coerced back to strings before validation.
- Route loaders are side-effect free. Single-use token mutations (`/verify`,
  `/account/verify-email`) fire exactly once from the client via dedicated POST
  server functions.
- Every mutation that changes shell state (cart, login, logout, password reset,
  account verification, currency) calls `router.invalidate()` afterwards; the
  root loader relies on this instead of a zero stale time.
- Server functions never return the raw Vendure transport result; loader data
  contains query data only and can never carry a session token.
- Personalized GET server functions respond with `Cache-Control: no-store`.

## Integration guidance
Removed modules that downstream forks may import: `src/platform/vendure/api.ts`
(`query`/`mutate` client proxy), `src/platform/vendure/auth-token.ts`,
`src/features/currency/currency.ts`, `src/features/collections/data.ts`, and
`src/features/account/customer.ts`. Replace client-side `query`/`mutate` calls
with a dedicated `createServerFn` per feature — see `getCustomerOrders` and
`getOrderDetail` in `src/features/orders/order.functions.ts` and
`getAddressesPageData` in `src/features/account/routes/addresses/actions.ts`
for the pattern. `loadEmailVerification` was replaced by the
`verifyEmailUpdateAction` server function. The navigation shim no longer
exports `redirect`, `getPathname`, or `notFound`; use `@tanstack/react-router`
directly. Component contracts changed: `FacetFilters` takes `searchParams`,
`SortDropdown` takes `currentSort`, and `ProductGrid` takes `currentSort`;
catalog search updates go through the new `useCatalogSearchNavigate` hook
instead of hand-built query strings, so facet arrays may appear JSON-encoded in
URLs. All `'use client'` directives were deleted — they are inert in TanStack
Start; drop them from custom components when re-applying patches. The router no
longer sets `defaultPreloadStaleTime: 0`, and the root route caches shell data,
so custom mutations that affect the navbar must call `router.invalidate()`.

## Verification
- `npm run check-types`
- `npm test`
- `npm run lint`
- `npm run build`
- Toggle facets and sorting on a collection page and confirm products filter,
  checkboxes stay checked, and the URL round-trips on reload.
- Add a product to the cart and confirm the navbar badge updates without a
  page reload.
- Sign in, sign out, and complete a password reset, confirming the navbar
  reflects the session immediately each time.
