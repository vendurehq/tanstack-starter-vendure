---
type: minor
areas:
  - authentication
  - platform.i18n
  - platform.tanstack
  - platform.vendure
  - tooling
---

## Intent
Harden the authentication routes against redirect, caching and account-enumeration
weaknesses, and move their input validation into one shared module so the server
functions and the forms agree on a single contract.

## Invariants
- `redirectTo` never leaves the origin: `redirectSearchSchema` and `tokenSearchSchema`
  both run the value through `safeInternalRedirect` and drop anything external.
- Every auth server function responds with `Cache-Control: no-store`.
- `requestPasswordResetAction` returns the same result for every address, so it cannot
  be used to probe which accounts exist.
- Sign-in, register, reset-password and verify keep returning `{error}` for handled
  failures rather than throwing, and thrown redirects still propagate.

## Integration guidance
Three changes need attention in a customized storefront:

- `requestPasswordResetAction` now returns only `{success: true}`. Any caller reading
  `result.error` from it will always see `undefined`; delete that branch, as the
  forgot-password form does.
- `Errors_failedPasswordReset` and `Errors_emailPasswordRequired` were removed from
  `src/platform/i18n/messages/{en,de}.json`. Re-add them locally if your own code still
  references them.
- Auth input validation moved to `src/features/authentication/schemas.ts`. Registration
  and password reset now require at least 8 characters server-side, and optional profile
  fields are trimmed and coerced to `undefined` when blank. Point custom auth forms at
  those schemas instead of redefining them inline.

Link markup in the auth routes moved from the `@/platform/tanstack/navigation` wrapper to
typed TanStack `Link`s, rendered through `Button`'s `render` prop where a link previously
wrapped a button. The wrapper is unchanged and still used elsewhere, so this is opt-in for
other areas.

## Verification
- `npm run check-types`
- `npm run lint`
- `npm test` — covers both redirect search schemas rejecting `//evil.example`
