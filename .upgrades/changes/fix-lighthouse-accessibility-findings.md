---
type: patch
areas:
  - account
  - site
  - tooling
---

## Intent

Give every storefront page one `main` landmark and make the footer link to vendure.io distinguishable from the links that go home. Lighthouse reported both problems.

## Invariants

- The root shell renders exactly one `main` element, and it contains only the routed page content. The navbar, the footer, and the toaster stay outside it.
- No page or layout renders a second `main` element.
- Site chrome links with the same accessible name go to the same destination.
- The visible footer copy does not change. Only the accessible name of the vendure.io logo link changes.

## Integration guidance

Downstream forks that added a `main` element in a page or a layout must change it to a `div`, because the root shell now supplies the landmark. The account layout shows this change. Forks that style the routed content through direct body children must move that style to the new `main` wrapper. Keep the accessible name of each logo link aligned with its destination when you replace the logos.

## Verification

- Run `npm test`, which includes the landmark and link-name checks in `tests/a11y/issue-23.test.mjs`.
- Audit a storefront page and an account page with Lighthouse and confirm that the main landmark and identical-links checks pass.
