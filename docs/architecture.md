# Storefront architecture

The storefront is source-distributed: developers own every human-authored file. The module layout gives commerce capabilities clear ownership while keeping framework concerns explicit.

```text
src/
  routes/        TanStack Router route definitions and data orchestration
  config/        Store-wide configuration
  features/      Vertical commerce capabilities
  platform/      TanStack Start, localization, caching, and Vendure mechanics
  site/          Store composition, navigation, and branding
  components/ui  Generic design primitives
```

Route files validate params/search, compose server functions in loaders, define head behavior, and delegate rendering to feature modules. Server-only operations and commerce rules remain behind feature or platform APIs. Feature modules colocate GraphQL documents, validated server functions, views, and source catalogs. Features may depend on shared platform/config modules but not on `site/` or another feature's internal `components/` and `routes/` folders.

## Server and GraphQL boundaries

Human-authored gql.tada documents stay with the owning feature. Generated schema types remain in `src/graphql-env.d.ts`; transport and request-specific cookie/environment handling live in `.server.ts` modules under `platform/vendure`.

Route reads use GET server functions because loaders are isomorphic. Mutations use Zod-validated POST server functions and call server-only Vendure helpers. Authenticated account functions verify the HttpOnly token at the endpoint, independently of navigation guards.

## Localization

English and German source catalogs remain colocated with their owner. Message IDs are globally unique and compiled by Paraglide. Its request middleware isolates SSR locale state and its URL strategy exposes `/en/...` and `/de/...` while TanStack Router works with one type-safe route tree.

## Generated files

`src/routeTree.gen.ts` and `src/paraglide/` are generated and must not be edited. Run `npm run generate` after changing routes or catalogs.
