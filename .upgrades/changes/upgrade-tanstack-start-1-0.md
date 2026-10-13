---
type: minor
areas:
  - site
  - tooling
---

## Intent

Move to the stable TanStack Start 1.0 release (`@tanstack/react-start` 1.169) and the matching Router and Devtools packages. Router now types `ErrorComponentProps.error` as `unknown`, so the root error component takes `ErrorComponentProps` instead of declaring `{ error: Error }`.

## Invariants

- The root route still renders the storefront error page and logs the error.
- Auth server functions still return the rate-limit message with a 429 status after ten attempts per minute.
- Production builds still use Vite 8 and `nitro()` from `nitro/vite`.

## Integration guidance

Update `@tanstack/react-start`, `@tanstack/react-router`, `@tanstack/react-router-devtools`, `@tanstack/react-devtools` and `@tanstack/devtools-vite` to the versions in `package.json`, then reinstall.

Type custom `errorComponent` props as `ErrorComponentProps` from `@tanstack/react-router`, and narrow `error` before reading its fields.

If you added your own Start code, follow [Migrate from the Release Candidate](https://tanstack.com/start/latest/docs/framework/react/migrate-from-release-candidate). The changes most likely to affect a storefront:

- `.inputValidator()` is removed. Use `.validator()`.
- `useSession` is removed. Use a session library and set cookies with `setCookie`.
- `setResponseHeader('set-cookie', ...)` now replaces every outgoing cookie. Use `setCookie` or `appendResponseHeader('set-cookie', cookie)` to add one.
- Response helpers such as `setResponseStatus` override the status of a response you return.
- A custom server entry must catch errors inside `createServerEntry` and return `handleStartError(error)` or rethrow.

## Verification

- Run `npm run check-types`, `npm test` and `npm run build`.
- Run `npm run test:e2e`.
- Submit the sign-in form eleven times within a minute and confirm the rate-limit message appears.
