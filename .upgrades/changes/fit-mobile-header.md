---
type: minor
areas:
  - site
  - tooling
---

## Intent

Keep the storefront header usable in mobile portrait. The header put the menu, logo, language, currency, theme, cart and account controls in one row, so the row overflowed below the `md` breakpoint and pushed the cart out of view.

## Invariants

- The mobile header shows the menu trigger, the logo and the cart, and fits a 320 CSS pixel viewport without overlap.
- The cart badge still renders the active order item count.
- The desktop header keeps the same controls in the same order.
- Language and currency stay identifiable by their ISO code. A currency symbol alone is never the only label.
- Header and drawer controls keep a 44 by 44 CSS pixel touch target below `md`.

## Integration guidance

`MobileNav` now needs `availableCurrencyCodes`, `activeCurrencyCode` and the `personalized` promise, because the drawer owns the language, currency, theme and sign in / sign out controls below `md`. Pass them from your header if you replaced `Navbar`.

If you replaced `MobileNav`, move those controls into your own drawer, or keep them in the header only above `md`. If you replaced the header controls, hide them below `md` instead of relying on flex wrapping.

`LoginButton` now calls an incoming `onClick` before its own handler. A wrapper that renders it, such as a menu item or a sheet close, keeps its handler. Remove any local workaround that re-added that behavior.

Theme labels moved from hardcoded English into the `Navigation` message catalog as `themeLight`, `themeDark`, `themeSystem` and `switchTheme`. Add these keys to every locale catalog you maintain.

## Verification

- Run `npm test`, which covers the header responsive and touch-target contract in `tests/site/issue-20-mobile-header.test.mjs`.
- Run `npm run check-types`.
- Open the storefront at a 320 pixel viewport and confirm that the menu, logo and cart fit one row, and that the drawer switches language, currency and theme.
