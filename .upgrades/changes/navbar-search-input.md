---
type: patch
areas:
  - site
  - platform.tanstack
  - tooling
---

## Intent

Keep the desktop navbar search input editable after hydration by returning a stable
`URLSearchParams` object from the TanStack navigation adapter until the URL search
string actually changes.

## Invariants

- The navbar search value continues to initialize from the current `q` parameter.
- Navigating to a different query still updates the navbar search value.
- Local keystrokes are not overwritten by an unchanged URL search string.

## Integration guidance

Downstream storefronts that retain `useSearchParams` in
`src/platform/tanstack/navigation.tsx` should memoize the `URLSearchParams` instance
by `state.location.searchStr`. Preserve custom navbar behavior while ensuring effects
that depend on the returned object only run when the URL search string changes.

## Verification

- Hydrate `/search?q=shoe`, replace the navbar value with `boot`, and confirm the new
  value remains editable instead of resetting to `shoe`.
- Run `npm run test:e2e` and `npm run check-types`.
