---
type: patch
areas:
  - products
  - site
  - tooling
---

## Intent

Improve storefront paint times and reduce product image transfer sizes.

## Invariants

- Product cards continue to display the configured Vendure preview asset.
- The first featured product image loads with high priority, and other product images load lazily.
- Storefront metadata and alternate-language links remain unchanged.

## Integration guidance

Preserve custom hero content while removing entrance effects that hide above-the-fold text. Keep responsive product image variants compatible with the configured Vendure asset transformation strategy. Retain the asset-origin preconnect when assets use a separate host.

## Verification

- Run the storefront checks and production build.
- Audit the home page with Lighthouse and confirm that preconnect and next-generation image checks pass.
