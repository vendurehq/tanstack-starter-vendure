# TanStack Start Vendure Starter

A localized React 19 storefront for Vendure, built with TanStack Start, TanStack Router, Vite, Nitro, gql.tada, Paraglide, Tailwind CSS, and Biome.

## Getting started

```bash
cp .env.example .env
npm install
npm run generate
npm run dev
```

Set `VENDURE_SHOP_API_URL` to a Vendure Shop API. The storefront is available at `/en` and `/de`; `/` selects and redirects to the preferred supported locale.

## Commands

```bash
npm run generate       # Paraglide messages and TanStack route tree
npm run check-types    # generation plus TypeScript
npm test               # architecture, i18n, cache, and upgrade tests
npm run lint           # Biome lint
npm run build          # production Nitro build
```

Run the production server with `node .output/server/index.mjs`. See [docs/architecture.md](docs/architecture.md) for ownership and server-boundary conventions and [CONTRIBUTING.md](CONTRIBUTING.md) for the upgrade workflow.
