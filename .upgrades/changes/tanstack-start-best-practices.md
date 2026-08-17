---
type: major
areas:
  - account
  - authentication
  - cart
  - checkout
  - currency
  - orders
  - products
  - platform.tanstack
  - platform.vendure
  - site
  - tooling
---

## Intent

Close the gaps from the TanStack Start best-practices review: make site metadata
safe on the client, fail fast on bad server env, stop leaking backend errors to
users, introduce composable server-function middleware, stream personalized shell
data so the public shell is no longer forced through `no-store`, and tidy
low-severity consistency issues (naming, shared schemas, cookie lifetime, pinned
deps).

## Invariants

- `SITE_NAME` / `SITE_URL` for head tags come from Vite public env
  (`VITE_SITE_NAME` / `VITE_SITE_URL`), so client navigations cannot fall back to
  `Vendure Store` / `https://example.com` after SSR with different values.
- Server boot validates required env via `assertServerEnv()` in `src/server.ts`.
- GraphQL/HTTP failures from Vendure are logged server-side and thrown or returned
  to the client as generic messages only.
- Personalized server functions apply `noStoreMiddleware` (or equivalent
  `Cache-Control: no-store`) instead of hand-calling `disableAuthResponseCaching`
  in each handler.
- Auth mutations (login, register, forgot/reset password) are rate-limited per IP
  in-process; production should still rate-limit at the CDN/proxy.
- Root loader awaits public shell data and defers cart count / customer name as an
  unawaited personalized promise rendered with `<Await>`.
- Auth cookie remains httpOnly / sameSite lax / secure-in-production and now sets
  a one-year `maxAge`.

## Integration guidance

- Rename deploy/local env: `SITE_NAME` → `VITE_SITE_NAME`, `SITE_URL` →
  `VITE_SITE_URL`. Old `SITE_*` / `NEXT_PUBLIC_*` names are no longer read.
- Import shared middleware from `@/platform/middleware` (`noStoreMiddleware`,
  `authRequiredMiddleware`, `authRateLimitMiddleware`) and
  `@/features/currency/storefront-context.middleware` for locale/currency context.
- Shell API split: replace `getShellData` with `getPublicShellData` +
  `getPersonalizedShellData`. Navbar now takes flat public props plus a
  `personalized` promise.
- Renamed server-fn modules (update imports): `logout.functions.ts`,
  `switch-currency.functions.ts`, `add-to-cart.functions.ts`. Dead
  `currency-server.ts` was removed.
- Deleted unused Next-style helpers in `src/config/metadata.ts` and
  `src/platform/tanstack/metadata.ts`. Prefer `storefrontHead` /
  `truncateDescription` / `SITE_*` exports only.
- Auth forms should use the shared schema factories in
  `src/features/authentication/schemas.ts` instead of local Zod copies.
- Revalidation bearer checks use `crypto.timingSafeEqual`; keep
  `REVALIDATION_SECRET` set in environments that call `/api/revalidate`.

## Verification

- `npm run check-types`
- `npm test`
- `npm run upgrade:validate -- --base origin/main`
- Confirm head title/canonical keep configured `VITE_SITE_*` values after a
  client-side navigation.
- Load a public catalog page and confirm the navbar cart/user hydrate via
  suspense without blocking the public shell.
- Trigger a Vendure outage (or bad GraphQL response) and confirm the UI shows a
  generic error, not backend text.
- Hammer login briefly and confirm the soft rate-limit message appears.
