---
type: patch
areas:
  - products
---

## Intent

Make catalog pagination easier to discover by showing a localized page-status label and clear Previous and Next controls instead of icon-only buttons.

## Invariants

- Catalog pagination preserves the current search filters and sorting when changing page.
- The first and last page remain reachable, while long page lists stay compact.
- Disabled boundary controls cannot be activated.

## Integration guidance

The catalog pagination component now uses the shared pagination primitives and Product message catalog. If you replaced the component, preserve the page-status label, the visible navigation labels on desktop, and the `page` search parameter when adapting the change.

## Verification

- Run `npm test` to verify page-list boundaries and compact ellipsis behavior.
- Run `npm run check-types` to regenerate and validate the translated Product messages.
