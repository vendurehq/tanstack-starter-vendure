---
type: patch
areas:
  - platform.tanstack
  - tooling
---

## Intent

Preserve the viewport when product variant selection updates URL search parameters.

## Invariants

- Variant selection continues to push its search parameters into browser history.
- Normal navigation continues to reset the viewport to the top.
- Browser back and forward navigation continues to restore saved scroll positions.

## Integration guidance

Forward the compatibility router's `scroll` option to TanStack Router as `resetScroll`. Keep global scroll restoration enabled and preserve downstream navigation behavior that does not pass this option.

## Verification

- Run the focused navigation adapter test.
- Run the storefront test suite and type checks.
