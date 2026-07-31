---
type: minor
areas:
  - account
  - tooling
---
## Intent

Restructure the account section for simpler routing and fewer duplicate requests. The flat `src/routes/account.*.tsx` files moved into a `src/routes/account/` directory. The `/account` route's `beforeLoad` now stores the active customer (returned by `getAccountSession`) in router context so child routes such as `/account/profile` reuse it instead of fetching the customer again. Account navigation and order links use the typed `@tanstack/react-router` `Link` with `activeProps`/`inactiveProps`, and the orders list `page` search param is preserved when opening an order detail and navigating back.

## Invariants

- Public URLs are unchanged: `/account`, `/account/orders`, `/account/orders/$code`, `/account/addresses`, `/account/profile`, `/account/verify-email`.
- Unauthenticated visitors are still redirected to `/sign-in` with a `redirectTo` search param from the `/account` `beforeLoad`.
- `getAccountSession` now returns the `ActiveCustomerFragment` (or `null`) instead of `{authenticated: true} | null`; a `null` result still means "not signed in".
- After a successful profile update, the edit form calls `router.invalidate()` so the customer cached in route context is refetched; any mutation that changes customer data must keep invalidating the router.

## Integration guidance

- Move customizations made to the old flat route files (`src/routes/account.orders.tsx`, `account.orders.$code.tsx`, `account.addresses.tsx`, `account.profile.tsx`, `account.verify-email.tsx`) into the matching files under `src/routes/account/`; loader and search-param logic is otherwise unchanged.
- `AccountNavLinks` no longer accepts an `items` prop; the nav entries live in `navItems` inside `src/features/account/components/account-nav-links.tsx`. Re-apply custom nav entries there.
- Child routes that need the signed-in customer should read it from `context.customer` (populated by `src/routes/account.tsx`) instead of calling a customer query.
- If downstream code calls `getAccountSession`, update it for the new return shape (customer fragment instead of `{authenticated: true}`).
- `src/routeTree.gen.ts` is generated; re-run route generation rather than merging it by hand.

## Verification

- `npx tsc --noEmit` passes.
- Sign in, open `/account/profile`, change the first name, switch to `/account/orders` and back: the updated name is shown.
- On `/account/orders?page=2`, open an order and use "Back to orders": the list returns to page 2.
- Sign out and request `/account/orders`: redirected to `/sign-in` with `redirectTo` set.
