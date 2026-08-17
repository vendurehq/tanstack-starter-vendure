---
type: patch
areas:
  - cart
  - collections
  - currency
  - products
  - search
  - site
  - tooling
---

## Intent

Keep catalog and cart prices consistent with the currency selected in the storefront. Product cards now use the request currency rather than the potentially stale currency stored in Vendure search-index results, and switching currency updates an active order before persisting the storefront currency cookie.

## Invariants

- Product-card prices use the currency that scoped the corresponding catalog request and cache entry.
- An active order is moved to the selected currency before the storefront cookie changes; anonymous visitors without an order do not create one during a currency switch.
- The selected currency must be available on the active channel.
- Product pages without a collection resolve related products to an empty result with the same currency context instead of failing during deferred rendering.

## Integration guidance

Pass the request currency alongside product search results and through `ProductGrid`, `ProductCarousel`, and `ProductCard`; do not rely on `SearchResult.currencyCode`, because search-index values may lag behind request context. Keep `SetCurrencyCodeForOrderMutation` registered in `src/config/shop-operations.ts`, preserve auth-token rotation from `mutateOnServer`, and update custom callers of `getRelatedProducts` for its `{ products, currencyCode }` return shape.

## Verification

- Switch currency on search and collection product grids and confirm every displayed price uses the selected symbol and amount.
- Switch currency with an active cart and confirm both cart line prices and totals refresh in the selected currency.
- Load a product with no collection and confirm the product page renders without a related-products error.
- Run `npm test`, `npm run test:e2e`, `npm run lint`, `npm run check-types`, `npm run build`, and `npm run upgrade:validate -- --base origin/main`.
