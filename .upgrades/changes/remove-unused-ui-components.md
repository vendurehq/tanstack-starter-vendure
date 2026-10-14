---
type: minor
areas:
  - site
  - tooling
---

## Intent

Remove the shadcn/ui components that no storefront code uses, together with the dependencies and theme tokens only they needed. The starter shipped the full component set, so `recharts`, `vaul`, `react-resizable-panels`, `react-day-picker`, `input-otp` and `date-fns` were installed for components nothing renders.

Besides trimming the install, this fixes a conflict in the `@vendure/create` monorepo template, where the storefront and the Vendure Dashboard share one npm workspace. The storefront's unused `recharts@3` was hoisted to the workspace root and pushed the Dashboard's `recharts@2` into nested copies, which the Dashboard's Vite dev server does not pre-bundle. The Dashboard then failed to load in development with `lodash/get.js does not provide an export named 'default'`.

Removed from `src/components/ui/`: `aspect-ratio`, `avatar`, `button-group`, `calendar`, `chart`, `combobox`, `context-menu`, `direction`, `drawer`, `empty`, `hover-card`, `input-otp`, `item`, `kbd`, `menubar`, `native-select`, `progress`, `resizable`, `scroll-area`, `sidebar`, `slider`, `switch`, `tabs`, `toggle`, `toggle-group` and `tooltip`. Also removed: the `use-mobile` hook, which only `sidebar` used, and the `--sidebar-*` and `--chart-*` theme tokens in `src/storefront.css`.

## Invariants

- Every page renders and behaves as before: none of the removed components, hooks or tokens was used by storefront code.
- The remaining components in `src/components/ui/` are unchanged.

## Integration guidance

These files are your own copies. Before deleting each one, search your code for imports of it. Keep any component you use, along with the dependencies it imports and, for `sidebar` and `chart`, their theme tokens. Delete the rest and uninstall each dependency once nothing imports it.

To add a removed component back later, use the shadcn CLI, for example `npx shadcn@latest add tooltip`, which also installs its dependencies.

If your storefront shares an npm workspace with the Vendure Dashboard and you keep `chart`, the Dashboard dev server can still fail to load. Either align both on the same `recharts` major, or pre-bundle the Dashboard's copy in the server's Vite config with `optimizeDeps.include: ['@vendure/dashboard > recharts', '@vendure-io/ui > recharts']`.

## Verification

- Run `npm run check-types`, `npm run lint`, `npm test` and `npm run build`; none references a removed file.
- Run `npm ls recharts vaul react-resizable-panels react-day-picker input-otp date-fns` and confirm that none of them is installed for the storefront.
- Open the home, collection, product, cart and checkout pages and confirm they render as before.
