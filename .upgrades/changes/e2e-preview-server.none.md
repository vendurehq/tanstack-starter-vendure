# No downstream impact

## Reason

Runs Playwright against the built preview server to avoid Vite development dependency-optimization races in CI. This changes test infrastructure only and does not alter storefront source, runtime behavior, generated-code inputs, or the downstream upgrade process.
