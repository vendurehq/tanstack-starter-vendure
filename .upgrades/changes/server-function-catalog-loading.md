---
type: major
areas:
  - collections
  - products
  - search
  - site
  - platform.tanstack
  - platform.vendure
  - tooling
---

## Intent
Catalog route loaders no longer query Vendure inline. The home, search, collection, and product routes call `createServerFn` handlers (`getHomeData`, `getSearchPageData`, `getCollectionPageData`, `getProductPageData`, `getRelatedProducts`), so catalog fetching runs on the server for both the initial render and client-side navigations. The collection route resolves its metadata and product search in a single new `GetCollectionPage` operation instead of two round trips, and related products stream in through a deferred loader promise rendered with `<Await>` rather than blocking the product page.

## Invariants
- Every document sent through `queryOnServer` must be registered in `registerShopOperations`; the transport rejects unregistered operations by name.
- Catalog search params are validated exclusively by `catalogSearchSchema`. `sort` is constrained to `name-asc`, `name-desc`, `price-asc`, `price-desc` and falls back to `name-asc`; `page` falls back to `1`; `q` is trimmed to `undefined` when blank; `facets` are trimmed and deduplicated.
- Cache keys and tags for catalog data stay scoped by locale and currency, so revalidation continues to expand `product-*` and `related-products-*` tags across both dimensions.
- Product card keys derive from `productId`, which requires callers to keep passing `groupByProduct: true` in their search input.

## Integration guidance
Removed exports that downstream forks may call: `loadProductPageData` and the `getRelatedProducts` helper (both from `src/features/products/routes/page.tsx` and `components/related-products.tsx`), plus `getProductRouteData` and `getCollectionRouteData` from `src/features/products/catalog.functions.ts`. Replace them with the server functions in `src/features/products/catalog.functions.ts` and `src/features/collections/catalog.functions.ts`; `RelatedProducts` now takes plain `ProductCardFragment` items and the route owns the deferred promise. `CatalogSearchParams` is now an alias of the schema-derived `CatalogSearch`, so `page`, `sort`, and `facets` are always present and typed — code that passed loose string params to `buildSearchInput` or `getCurrentPage` must parse through `catalogSearchSchema` first. If you added catalog GraphQL documents, register them in `src/config/shop-operations.ts`. The `collection-meta-*` revalidation rule was dropped because nothing writes that cache tag any more; remove any webhook that posts it. Separately, the CI workflow now runs `npm run generate` after `npm ci`: `src/paraglide/` is gitignored, and `npm run test:e2e` starts a dev server that imports `./paraglide/server.js` before any other step generates it. Forks with their own pipeline need the same generate step ahead of any command that boots the app.

## Verification
- `npm run check-types`
- `npm test`
- `npm run lint`
- `npm run build`
- Load a collection page with `?sort=`, `?page=`, and repeated `?facets=` params and confirm filtering, sorting, and pagination still apply.
- Load a product page and confirm the related-products carousel appears after the main content streams in.
