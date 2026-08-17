# TanStack Start Best-Practices Review

Review of the whole storefront against the [tanstack-start best-practices skill](https://github.com/DeckardGer/tanstack-agent-skills/blob/main/skills/tanstack-start/SKILL.md) (all 13 rule files were fetched and used as the reference). Installed `@tanstack/react-start` version at review time: **1.168.34**.

**Overall:** the app follows the skill's core patterns unusually well — server functions with Zod validation everywhere, `beforeLoad` route protection, httpOnly auth cookies, a GraphQL operation allowlist, `.functions.ts` / `.server.ts` file separation enforced by an architecture test, and deferred streaming on the product page. The findings below are the gaps, ordered by severity.

---

## High

### H1. Server-only env vars read in isomorphic code — client gets wrong `SITE_NAME` / `SITE_URL`

**Rule:** `env-functions`, `ssr-hydration-safety`
**Where:** `src/config/metadata.ts:3-4`

```ts
export const SITE_NAME = process.env.SITE_NAME || process.env.NEXT_PUBLIC_SITE_NAME || 'Vendure Store';
export const SITE_URL = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';
```

`config/metadata.ts` is imported by `src/platform/tanstack/head.ts` and `src/routes/__root.tsx`, and route `head()` functions execute on **both** server and client (on every client-side navigation). In the client bundle `process.env` is not populated with server env, so when `SITE_NAME`/`SITE_URL` are configured:

- Server-rendered title/canonical/og tags use the configured values.
- After hydration / on client navigation, head tags are recomputed with the fallbacks (`Vendure Store`, `https://example.com`).

The e2e suite runs against `npm run dev` without these vars set, so this divergence is never exercised.

**Fix options:**
- Use Vite public env (`VITE_SITE_NAME` via `import.meta.env`) for values needed in head functions, or
- Load them once server-side (root loader / router context) and read them from loader data in `head()`.
- Drop the `NEXT_PUBLIC_*` fallbacks once the compatibility window ends — they are Next.js leftovers.

---

## Medium

### M1. Raw internal error messages are shown to users

**Rule:** `err-server-errors` ("log full errors server-side, sanitize for client")
**Where:**
- `src/routes/__root.tsx:72` — `StorefrontError` renders `{error.message}` directly.
- `src/platform/vendure/api.server.ts` — throws `Error(result.errors.map(e => e.message).join(', '))`, `'VENDURE_SHOP_API_URL environment variable is not set'`, `HTTP error! status: ...`.
- `src/features/checkout/routes/actions.ts` — throws errors embedding Vendure `errorCode` and `message` (e.g. `Failed to transition order state: ${error.errorCode} - ${error.message}`).

Server-function errors serialize across the network boundary, so backend GraphQL error text and configuration errors end up rendered in the root error component. The auth actions do this right (catch → return translated, generic `{ error }`); loaders and checkout actions do not.

**Fix:** render a generic translated message in `StorefrontError` (log `error` instead of displaying it), and/or wrap `executeVendureRequest` failures in a sanitized error type before they leave the server.

### M2. No middleware — cross-cutting concerns hand-repeated in every server function

**Rule:** `mw-request-middleware`, `mw-function-middleware`, `sec-auth-middleware`
**Where:** all `*.functions.ts` / `actions.ts` files; `createMiddleware` appears nowhere in `src/`.

- `disableAuthResponseCaching()` is manually called at the top of 15 handlers; forgetting it in a new personalized function is a silent cache-safety bug.
- Auth gating is repeated ad hoc: `if (!getAuthToken()) throw redirect({ to: "/sign-in" })` (`src/features/orders/order.functions.ts:35,55`), `if (!getAuthToken()) return null` (`auth.functions.ts:16`), plus the `authenticatedOperations` backstop in `api.server.ts`.
- Locale + currency resolution (`getLocale()` + `await getActiveCurrencyCodeOnServer()`) is re-derived in nearly every handler.

**Fix:** create composable server-function middleware, e.g. `noStoreMiddleware`, `authRequiredMiddleware` (throws redirect, passes token via context), and a `storefrontContextMiddleware` providing `{ locale, currencyCode }`. This is exactly the skill's canonical middleware use case.

### M3. Root loader blocks every page render and disables all HTTP caching

**Rule:** `ssr-prerender` / caching, `ssr-streaming`
**Where:** `src/routes/__root.tsx:24-28`, `src/site/shell.functions.ts`

`getShellData` runs in the root loader for every SSR request: 5 Vendure calls (channel, collections, active customer, active order, currency), two of them authenticated, and it sets `Cache-Control: no-store` — so **every HTML response in the app is uncacheable** (CDN and browser), and TTFB for public catalog pages is coupled to the slowest of those calls. The 30s `staleTime` only helps client-side navigations; the in-process `cachedPublicData` only covers the collections call. There is also no prerender config — every route is per-request SSR.

This is a deliberate, documented trade-off (comment at `__root.tsx:25-27`), but it caps performance:

- **Fix (incremental):** defer the personalized part — return cart count / customer name as an unawaited promise (streamed, rendered behind `<Await>`), keeping the public shell synchronous and cacheable.
- **Fix (bigger):** fetch personalization client-side after hydration (or in a layout below root), then public pages can send `Cache-Control: public, s-maxage=...` and product/collection pages become CDN/ISR-cacheable per the skill's hybrid pattern.

### M4. Duplicate Vendure requests within a single server request

**Rule:** `mw-context-flow` (derive once, pass via context)
**Where:** `src/features/currency/active-currency.server.ts:8`, `src/site/shell.functions.ts:18`

For visitors without a currency cookie, `getActiveCurrencyCodeOnServer()` issues `GetActiveChannelQuery`. `getShellData` fires that same query in parallel with `getActiveCurrencyCodeOnServer()`, so first-time visitors trigger two identical channel queries per request; `getCheckoutRouteData` and every catalog function repeat the lookup again in their own request cycles. There is no request-scoped memoization.

**Fix:** request-scoped cache (e.g. `AsyncLocalStorage`/context via middleware, or reuse the shell's channel result) so channel/currency is resolved once per request.

### M5. No startup validation of environment configuration

**Rule:** `env-functions`
**Where:** `process.env` read ad hoc in `src/platform/vendure/api.server.ts:53-58`, `src/platform/revalidation/handler.ts:25`, `src/platform/vendure/auth-token.server.ts:4`, `src/config/metadata.ts:3-4`

Required vars fail at request time, not boot: a missing `VENDURE_SHOP_API_URL` throws on the first page view (message shown to the user, see M1); a missing `REVALIDATION_SECRET` returns 500s from the webhook endpoint. A misconfigured `SITE_URL` silently emits `https://example.com` canonicals into production SEO tags.

**Fix:** a single `env.server.ts` with a Zod schema validated once at startup (fail fast), imported everywhere else.

### M6. No rate limiting on authentication endpoints

**Rule:** `sf-input-validation` context ("consider rate limiting for mutation endpoints"), `sec-*`
**Where:** `loginAction`, `registerAction`, `forgot-password` / `reset-password` actions

Every `createServerFn` is a publicly reachable HTTP endpoint. Login and password-reset functions have no throttling, making credential stuffing / reset-email flooding cheap. Vendure applies its own protections upstream, and this is often solved at the edge — but the starter itself ships nothing and doesn't document the expectation.

**Fix:** add rate-limit middleware (per-IP) for auth mutations, or document that deployments must provide it at the proxy/CDN layer.

---

## Low

### L1. Dead, publicly exposed server function

**Where:** `src/features/currency/currency-server.ts`

`getActiveCurrencyCode` is defined but never imported anywhere. Every `createServerFn` becomes a live RPC endpoint in the build, so unused ones are pure attack/maintenance surface. Remove it (and see L2 for the file naming).

### L2. Currency module naming is confusing and off-convention

**Rule:** `file-separation`
**Where:** `src/features/currency/` — `active-currency.server.ts`, `currency.server.ts`, `currency-server.ts`

Three near-identically named files with three different roles. `currency-server.ts` contains a server *function* but follows neither the `.functions.ts` convention (used by 20+ other files) nor `.server.ts`. `switch-currency.ts` also holds a server function without the `.functions.ts` suffix (as does `products/add-to-cart.ts` and `authentication/logout.ts`). Consistency here is what makes the boundary tests and the convention trustworthy.

### L3. Login form duplicates the shared validation schema

**Rule:** `file-shared-validation`
**Where:** `src/features/authentication/routes/sign-in/login-form.tsx:22` vs `src/features/authentication/schemas.ts`

The form defines a local `loginSchema` while the server action validates with the shared `loginInputSchema`. The duplicates can drift (they already differ: `.trim()` on the server only), and the client copy hardcodes English error strings while the rest of the app uses paraglide messages. Reuse `loginInputSchema` (minus `redirectTo`) with i18n error maps. The registration/reset forms are worth the same check.

### L4. Auth cookie has no `maxAge`

**Rule:** `auth-session-management`
**Where:** `src/platform/vendure/auth-token.server.ts` (`setAuthToken`)

`httpOnly`, `sameSite: 'lax'`, `secure` in production are all correct. But without `maxAge`/`expires` it is a browser-session cookie: customers are logged out (and lose guest carts) whenever the browser fully closes, even though the Vendure session token is longer-lived. If that's intentional, document it; otherwise set a `maxAge` aligned with Vendure's session duration.

### L5. `/account` guard issues an uncached RPC on every navigation

**Rule:** `auth-route-protection` (pattern is correct; cost is the issue)
**Where:** `src/routes/account.tsx` `beforeLoad`

`beforeLoad` runs on every navigation within the `/account` tree, and `getAccountSession` does a full `GetActiveCustomerQuery` round trip each time (it doesn't respect `staleTime`). Fine at this scale; consider caching the session in router context or memoizing per-request if account grows.

### L6. Revalidation token compared with `!==`

**Where:** `src/platform/revalidation/handler.ts:27`

The bearer-secret check uses plain string comparison, which is theoretically timing-observable. Use `crypto.timingSafeEqual` on equal-length buffers. (Nit — the endpoint is otherwise well built: required secret, tag allowlist, per-request cap, structured 207 results.)

### L7. Unused Next.js leftovers

**Where:** `src/config/metadata.ts` (`buildCanonicalUrl`, `buildOgImages`, `noIndexRobots`), `src/platform/tanstack/metadata.ts` (`Metadata`, `Viewport` types), `NEXT_PUBLIC_*` env fallbacks

These mirror the Next.js Metadata API and are referenced nowhere. Dead weight in a TanStack Start codebase; remove once the stated one-release compatibility window closes.

### L8. TanStack packages pinned to `latest`

**Where:** `package.json` — `@tanstack/react-router`, `@tanstack/react-start`, devtools packages

`"latest"` makes builds non-reproducible and lets breaking upstream releases land silently (Start is still moving fast — e.g. the `inputValidator` → `validator` rename). The lockfile protects local installs but not fresh clones running `npm update` or template consumers. Pin to a caret range.

---

## What the app gets right (verified against the rules)

| Rule | Status | Evidence |
|------|--------|----------|
| `sf-create-server-fn` | ✅ | All data loading/mutations go through `createServerFn`; loaders call server functions, no client `fetch` to internal endpoints. |
| `sf-input-validation` | ✅ | Every input-taking server function chains `.validator(zod schema)` (current API — `inputValidator` is the deprecated name in 1.168). Checked all 23 files defining server functions. |
| `sf-method-selection` | ✅ | Reads are GET, mutations are POST throughout. |
| `sec-validate-inputs` | ✅ | Search params validated via `validateSearch` + Zod (`catalogSearchSchema`, `redirectSearchSchema`, `tokenSearchSchema`). |
| `sec-sensitive-data` | ✅ | GraphQL operation allowlist in `api.server.ts` blocks attacker-crafted selection sets — beyond what the skill asks for. `search.functions.ts` deliberately strips the raw result to avoid leaking session tokens. |
| Open-redirect protection | ✅ | `safeInternalRedirect` applied both at the search-schema layer and inside `loginAction`. |
| `auth-route-protection` | ✅ | `/account` uses `beforeLoad` + `redirect` with `redirectTo` preservation; context extended with `customer`; `noindex` on protected pages. |
| `auth-cookie-security` | ✅ | httpOnly / sameSite lax / secure-in-prod (see L4 for `maxAge`). Token rotation from Vendure response headers is handled, including the tricky same-request rotation in checkout. |
| `api-routes` | ✅ | `/api/revalidate` is a proper server-route handler (`server.handlers.POST`), not a misused server function. |
| `ssr-streaming` | ✅ | Product page defers `relatedProducts` as an unawaited loader promise rendered via `<Await>`. |
| `ssr-hydration-safety` | ✅ | Theme handled via `ScriptOnce` + `suppressHydrationWarning`; `window`/`matchMedia`/`localStorage` only inside effects; no `Date.now()`/`Math.random()` in render paths. (Exception: H1.) |
| `err-not-found` | ✅ | `notFound()` thrown from loaders for missing products/collections; root `notFoundComponent` provided. |
| `err-redirects` | ✅ | Server functions throw `redirect()` for auth/checkout-state flow control (`logoutAction`, `getCheckoutRouteData`, `placeOrder`), with `isRedirect` re-thrown in catch blocks. |
| `file-separation` / `file-functions-file` | ✅ | `.server.ts` / `.functions.ts` conventions in place and **enforced by `tests/architecture/boundaries.test.mjs`** — stronger than the skill requires (see L2 for stragglers). |
| Devtools in production | ✅ | `@tanstack/devtools-vite` plugin removes devtools code on build (`removeDevtoolsOnBuild` defaults to true) — the unconditional `<TanStackDevtools>` in `__root.tsx` is safe. |
| Loader caching | ✅ | Sensible `staleTime` on root/catalog routes with documented invalidation via `router.invalidate()` after mutations. |
| `pendingComponent` | ✅ | Provided on all slow routes (cart, checkout, product, collection, search). |

---

## Suggested priority

1. **H1** (config/env in isomorphic code) — silently breaks SEO metadata for any configured deployment.
2. **M1** (error message leakage) — user-facing and trivial to hit (stop a Vendure instance and watch the message).
3. **M2 + M4** (middleware + request-scoped context) — one refactor solves both and shrinks every server function.
4. **M5** (startup env validation) — small, high leverage.
5. **M3** — biggest performance win, but an architectural decision for the template.
6. Low findings opportunistically.
