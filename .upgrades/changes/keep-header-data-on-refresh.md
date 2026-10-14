---
type: patch
areas:
  - site
  - tooling
---

## Intent

Stop the header from flashing its skeletons after a cart or account change. Those changes call `router.invalidate()`, which re-runs the root loader and hands the navbar a new, pending `personalized` promise. Each `<Await>` on that promise suspended back to its fallback, so the cart badge and user menu were swapped for skeletons until the new data arrived. Several changes in a row, such as checkout steps, made the header flicker repeatedly.

## Invariants

- The first page load still streams the personalized header data, with the skeletons as fallbacks while it loads.
- After `router.invalidate()`, the header keeps showing the previous cart count and user state until the new data resolves, then updates in place.
- The cart badge still renders the active order item count, on desktop and in the mobile drawer.

## Integration guidance

`Navbar` now passes `personalized` through React's `useDeferredValue` before rendering it, and hands the deferred promise to both its `<Await>` elements and `MobileNav`.

If you replaced `Navbar`, defer the promise the same way before any `<Await>` that renders it. If you render the root loader's `personalized` promise anywhere else, for example in a custom header or a mini cart, defer it there too, or that component keeps flashing its fallback on every refresh.

## Verification

- Run `npm test`, which checks the deferred-promise contract in `tests/site/navbar-refresh.test.mjs`.
- Add an item to the cart from a product page and confirm the cart badge updates without the header controls turning into skeletons first.
