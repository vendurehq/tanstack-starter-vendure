---
type: patch
areas:
  - platform.i18n
  - tooling
---

## Intent

Load the inlang plugins from pinned jsDelivr URLs so message compilation does not depend on where `node_modules` is installed. `@vendure/create` scaffolds the storefront into an npm workspace, which hoists dependencies to the workspace root. The local `./node_modules/@inlang/...` paths then failed to load, Paraglide compiled no messages, and every page returned a 500.

## Invariants

- `project.inlang/settings.json` loads `@inlang/plugin-icu1@1.1.0` and `@inlang/plugin-m-function-matcher@2.2.12`.
- `npm run generate:i18n` fails when Paraglide compiles no messages.

## Integration guidance

Replace the two `modules` entries in `project.inlang/settings.json` with the pinned URLs and remove the `@inlang/plugin-icu1` and `@inlang/plugin-m-function-matcher` devDependencies. The first compile needs network access to `cdn.jsdelivr.net`. Inlang caches the modules in `project.inlang/cache/`.

## Verification

- Run `npm run generate:i18n` and confirm `src/paraglide/messages/_index.js` exports messages.
- Run the i18n tests.
