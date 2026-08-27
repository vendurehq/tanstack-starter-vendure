---
type: patch
areas:
  - tooling
---

## Intent

Reduce the render-blocking storefront stylesheet without changing component state or animation behavior.

## Invariants

- The root document continues to load one blocking storefront stylesheet so SSR content does not flash without styles.
- Existing component state variants, entrance and exit animations, accordion motion, and hidden scrollbars remain available.
- Production builds continue to remove TanStack Devtools from the client bundle.

## Integration guidance

Keep the local animation utilities and state variants in `src/storefront.css`. Add a local definition and test coverage when custom components use another helper from `tw-animate-css` or `shadcn/tailwind.css`.

## Verification

- Run `npm test` to check the critical CSS contract.
- Run a production build and compare the storefront CSS asset and initial route manifest with the previous release.
