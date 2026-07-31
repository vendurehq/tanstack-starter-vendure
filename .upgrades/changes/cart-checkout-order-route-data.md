---
type: minor
areas:
  - cart
  - checkout
  - orders
  - platform.vendure
  - site
  - tooling
---

## Intent

Load the cart, checkout, and order-confirmation routes through dedicated server functions so a client-side navigation resolves each route in one request instead of a per-query waterfall, and surface expected cart mutation failures in the UI instead of discarding them.

## Invariants

- Checkout still redirects to `/cart` for an empty order, and to `/order-confirmation/$code` once the order has left `AddingItems` or `ArrangingPayment`.
- Order confirmation still resolves to the not-found route for an unknown or inaccessible order code.
- Cart mutations still refresh the route once the mutation resolves; an expected Vendure `ErrorResult` no longer reaches a route error boundary.
- Every Vendure document reached from a server function stays registered in `src/config/shop-operations.ts`; unregistered documents are rejected by the operation allowlist.

## Integration guidance

`loadCheckoutData` moved from `src/features/checkout/routes/page.tsx` to `getCheckoutRouteData` in `src/features/checkout/checkout.functions.ts`, and `loadOrderConfirmation` moved from `src/features/orders/routes/order-confirmation.tsx` to `getOrderConfirmation` in `src/features/orders/order.functions.ts`. The `GetOrderByCode` document moved to `src/features/orders/graphql.ts` and is now registered as a shop operation, which it previously was not. Re-apply customized loader logic inside those server functions rather than in the route components, and register any locally added document in `src/config/shop-operations.ts`. Cart server functions now return `CartActionResult` (`{success: true} | {success: false, errorCode, message}`) instead of always returning `{success: true}`, so custom cart UI must branch on `result.success` and render the message. Links in these routes use typed `@tanstack/react-router` `to`, `params`, and `search` props instead of the `href` wrapper exported from `@/platform/tanstack/navigation`.

## Verification

- `npm run check-types`
- `npm test`
- Adjust and remove a cart line, then apply a valid and an invalid coupon code; the invalid code renders an inline message instead of replacing the page with the error boundary.
- Complete a guest checkout and reload the resulting `/order-confirmation/<code>` page.
