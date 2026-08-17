---
type: patch
areas:
  - site
  - tooling
---

## Intent

Use the official TanStack logo in the footer's powered-by row instead of a text
label, while preserving the existing link to TanStack Start and dark-mode support.

## Invariants

- The footer continues to identify both Vendure and TanStack Start as the storefront's foundations.
- The TanStack logo remains accessible through descriptive alternative text.
- The logo remains legible in both light and dark themes.

## Integration guidance

Downstream storefronts that retain the powered-by row should copy
`public/tanstack-stacked-black.svg` and replace the TanStack Start text in
`src/site/footer.tsx` with the image. Preserve any custom footer layout or branding,
the link to `https://tanstack.com/start`, the `TanStack Start` alternative text,
and the dark-mode inversion class when adopting the upstream change.

## Verification

- View the footer in light and dark themes and confirm the TanStack logo is legible.
- Confirm the logo link opens `https://tanstack.com/start`.
- Run `npm run lint`, `npm run check-types`, and `npm run upgrade:validate -- --base origin/main`.
