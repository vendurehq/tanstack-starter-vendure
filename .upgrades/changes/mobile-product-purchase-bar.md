---
type: minor
areas:
  - products
---

## Intent

Keep the add-to-cart action reachable on small screens while the customer configures a product. Below the `lg` breakpoint the product page pins a purchase bar to the viewport bottom that shows the price and the chosen options next to the action.

## Invariants

- Only one purchase action is interactive per breakpoint. The inline action stays hidden below `lg`, and the purchase bar stays hidden from `lg` upwards.
- Both actions share one handler, one disabled state, and one label, so the select-options, out-of-stock, pending, added, and error behavior is identical.
- An add-to-cart request in flight rejects further taps.
- No variant is selected automatically. A valid option code in the URL selects its option, and a configurable product otherwise waits for the customer.
- The desktop layout and the inline desktop action are unchanged.

## Integration guidance

The purchase bar renders inside `ProductInfo` and the product page reserves its height plus `env(safe-area-inset-bottom)` as bottom padding. A storefront that replaces the product page must keep that reserved space, or the bar covers the page content. A storefront that changes the bar height must change the reserved padding by the same amount.

## Verification

- Run the storefront checks: `npm test`, `npm run check-types`, and `npm run check`.
- Open a configurable product below 1024 px, confirm that the bar states the price and the chosen options, and that the action follows the selection state.
- Confirm at 1024 px and above that the inline action is the only purchase action.
