---
type: patch
areas:
  - products
  - tooling
---

## Intent

Stop the product page from flashing its loading skeleton after a cart change. Adding to the cart calls `router.invalidate()`, which re-runs the product route loader and returns a new, pending `relatedProducts` promise. The page awaited it with `<Await fallback={null}>`, but TanStack's `Await` only creates a Suspense boundary when `fallback` is truthy. The pending promise therefore suspended the whole route, and its `pendingComponent` replaced the entire page for as long as the related products took to load.

## Invariants

- A cart change on a product page keeps the page on screen; it never shows the route's loading skeleton.
- The related products section keeps showing the current products until the new ones resolve, then updates in place.
- On first load the related products still stream in after the rest of the page, which renders without waiting for them.

## Integration guidance

The product page now defers `relatedProducts` with React's `useDeferredValue` and wraps its `<Await>` in `<Suspense fallback={null}>`.

If you replaced the product page or its related products section, do the same. Anywhere you render a loader promise with `<Await fallback={null}>`, or with no fallback, wrap it in your own `<Suspense>`: without one, a pending promise suspends up to the nearest route boundary. Defer the promise too if the loader re-runs after mutations, so the section keeps its content instead of disappearing.

## Verification

- Run `npm test`, which checks the boundary and deferred-promise contract in `tests/products/related-products-refresh.test.mjs`.
- Open a product page, add it to the cart, and confirm the page stays on screen while the cart badge updates.
