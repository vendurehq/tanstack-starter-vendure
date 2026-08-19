---
type: minor
areas:
  - account
  - authentication
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

Prepare the storefront for production launch. Add robots, sitemap, favicon, and
Open Graph support; require an explicit production site URL; and harden account,
authentication, checkout, currency, order, caching, and navigation behavior.

## Invariants

- Production builds require `VITE_SITE_URL`; local development keeps a safe
  fallback.
- `robots.txt`, `sitemap.xml`, canonical metadata, and Open Graph metadata use
  the configured public site URL.
- The sitemap includes localized product and collection URLs and can paginate
  through the complete catalog.
- Logout forwards the active Vendure auth token, and rate-limited authentication
  requests return HTTP 429 with `Retry-After`.
- Unknown account orders return 404, while failures in personalized shell data
  do not prevent the public storefront shell from rendering.
- Active-channel data is cached, and channel or currency changes invalidate the
  shared channel revalidation tag.
- Product and account pagination keeps typed TanStack Router navigation.

## Integration guidance

- Set `VITE_SITE_URL` to the storefront's public origin in every production
  environment. Keep any custom metadata synchronized with
  `src/config/metadata.ts` and the new SEO routes.
- Replace custom static robots or sitemap files with the route handlers only if
  their directives and URL coverage are preserved. Reconcile custom catalog
  filtering with the paginated sitemap query in
  `src/platform/seo/sitemap.server.ts`.
- Preserve the auth token when adapting `logoutAction`, and preserve the 429
  status plus `Retry-After` header in custom rate-limit handling.
- Reapply custom cache invalidation against the global channel tag used by
  currency switching and revalidation.
- `/account/orders` now has separate layout and index route files. Move list-page
  customizations to `src/routes/account/orders.index.tsx`; do not edit the
  generated `src/routeTree.gen.ts` by hand.
- `@tanstack/router-cli` is no longer required because the TanStack Start Vite
  plugin generates the route tree. Keep the devtools Vite plugin first in the
  plugin list when merging custom Vite configuration.
- Product image requests now include resize parameters. Preserve downstream
  image sizing requirements when adapting the product queries and carousel.

## Verification

- `npm run check-types`
- `npm test`
- `npm run lint`
- `npm run build`
- `npm run upgrade:validate -- --base origin/main`
- Verify `/robots.txt`, `/sitemap.xml`, the favicon, canonical URLs, and Open
  Graph previews against the production origin.
- Verify logout, auth throttling, currency switching, account-order 404s, and
  product/account pagination.
