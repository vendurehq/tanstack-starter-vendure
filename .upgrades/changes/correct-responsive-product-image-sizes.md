---
type: patch
areas:
  - products
  - tooling
---

## Intent

Stop product images from downloading candidates that are much wider than the box they render in. The shared `sizes` hint approximated the catalog layout with `25vw`, which ignores the capped page container, the filter sidebar, and the grid gaps, so desktop browsers selected a candidate about twice as wide as needed. Detail thumbnails requested a fixed 320-pixel source with no `srcset` at all.

## Invariants

- Product cards, the product hero image, and the detail thumbnails still resolve their source from the configured Vendure preview asset and the same transformation parameters.
- Card candidates stay WebP at quality 75; detail candidates keep the previous square crop transform.
- High-density displays still receive a candidate that covers their device pixel ratio, up to the same 800-pixel card ceiling as before.

## Integration guidance

`ProductCard` now takes a `layout` prop (`"grid"` or `"carousel"`, defaulting to `"grid"`) that selects the matching `sizes` hint. Pass `layout="carousel"` when the card sits in a slide track. Candidate ladders and `sizes` strings live in `src/features/products/product-image.ts`; they encode the Tailwind container, breakpoints, and gaps of the shipped layouts. If you change the catalog grid, the carousel slide widths, or the detail column split, update the constants in that module so the hints keep matching the rendered widths.

## Verification

- Run the storefront checks, the test suite, and the production build.
- Confirm with a browser network panel that a 1350-pixel-wide desktop viewport requests the 320-pixel card candidate and a 412-pixel mobile viewport at 1.75x requests the 720-pixel candidate.
