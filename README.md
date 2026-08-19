<p align="center">
  <a href="https://vendure.io">
    <img alt="Vendure logo" height="60" width="auto" src="https://a.storyblok.com/f/328257/699x480/8dbb4c7a3c/logo-icon.png/m/0x80">
  </a>
</p>
<h1 align="center">
  Vendure TanStack Start Storefront Starter
</h1>
<h3 align="center">
  A TanStack Start storefront starter for Vendure headless commerce
</h3>
<p align="center">
  A source-owned, customizable storefront with a managed path for adopting upstream releases.
</p>
<h4 align="center">
  <a href="https://tanstack.vendure.io">Demo</a> |
  <a href="https://docs.vendure.io">Documentation</a> |
  <a href="https://vendure.io">Website</a>
</h4>

## Features

**Authentication & Accounts**

- Customer registration with email verification
- Login/logout with session management
- Password reset & change password
- Email address updates with verification

**Customer Account**

- Profile management (name, email, password)
- Address management (create, update, delete, set default)
- Order history with pagination & detailed order views

**Product Browsing**

- Collections & featured products
- Product detail pages with variants & galleries
- Full-text search with faceted filtering
- Pagination & sorting

**Shopping Cart**

- Add/remove items, adjust quantities
- Promotion code support
- Real-time cart updates with totals

**Checkout**

- Multi-step flow: shipping address, delivery method, payment, review
- Saved address selection
- Shipping method selection
- Payment integration

**Order Management**

- Order confirmation page
- Order tracking with status
- Detailed order information

**Internationalization**

- Multi-language support via Paraglide (English & German out of the box)
- Multi-currency support with persistent currency selection
- Locale-aware price formatting

**Built to Customize and Upgrade**

- Developer-owned source with no locked or generated application layer
- Feature-oriented modules with enforced dependency boundaries
- Colocated GraphQL operations and translations
- Structured release manifests for reconciling upstream changes with local customizations

## Getting Started

You need a running Vendure server with its Shop API available. Copy the example environment, point `VENDURE_SHOP_API_URL` at that API, install dependencies, generate derived files, and start the storefront:

```bash
cp .env.example .env
npm install
npm run generate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. The storefront is available at `/en` and `/de`, and `/` redirects to the preferred supported locale.

The environment template also documents optional channel, metadata, authentication header, and cache revalidation settings.

## Architecture

Every human-authored storefront file is yours to change. The source is organized to keep those changes local and make future upgrades easier to reconcile:

```text
src/
  routes/        TanStack Router route definitions and data orchestration
  config/        Store-wide configuration
  features/      Vertical commerce capabilities
  platform/      TanStack Start, localization, caching, and Vendure integrations
  site/          Store-specific composition, navigation, and branding
  components/ui  Generic design primitives
```

Keep `src/routes` files thin and put substantial behavior in the module that owns it. A feature exposes other modules through top-level files; its `components/` and `routes/` directories are private implementation details.

Read the [architecture guide](./docs/architecture.md) before adding a capability.

## Upgrading

Tagged releases include structured integration intent so a human or coding agent can adopt upstream changes without silently overwriting storefront customizations.

After creating a storefront from an immutable release tag, record its exact upstream provenance once:

```bash
npm run upgrade:init
git add .vendure/storefront.json
git commit -m "chore: initialize storefront provenance"
```

To prepare a later upgrade on a clean, dedicated branch:

```bash
npm run upgrade:prepare -- 1.1.0
```

The command creates a gitignored integration workspace containing the old and new upstream snapshots, release guidance, and a report template. Reconcile the changes, then follow the generated brief to verify and finalize the upgrade.

See the [upgrade guide](./docs/upgrades.md) for the complete managed upgrade, legacy onboarding, and release-authoring workflows.

## Development

Run the same checks used by CI before submitting a change:

```bash
npm run upgrade:validate
npm test
npm run test:e2e
npm run lint
npm run check-types
npm run build
```

Downstream-impacting pull requests require an upgrade note or an explicit exemption. See [CONTRIBUTING.md](./CONTRIBUTING.md) for the contribution workflow.

## Commands

```bash
npm run generate       # Generate Paraglide messages
npm run check-types    # Run generation and TypeScript checks
npm test               # Run architecture, i18n, cache, and upgrade tests
npm run test:e2e       # Run Playwright end-to-end tests
npm run lint           # Run Biome lint
npm run build          # Create a production Nitro build
```

TanStack Start generates `src/routeTree.gen.ts` through its Vite plugin during
development and production builds. The committed file lets type checks run
without a second route generator that can drift from TanStack Start.

Run the production server with `node .output/server/index.mjs`.

## Learn More

To learn more about TanStack Start and Vendure, take a look at the following resources:

- [TanStack Start Documentation](https://tanstack.com/start/latest/docs/framework/react/overview) - learn about TanStack Start features and APIs.
- [TanStack Router Documentation](https://tanstack.com/router/latest/docs/framework/react/overview) - learn about type-safe routing and data loading.
- [Vendure Documentation](https://docs.vendure.io) - learn about Vendure and its Shop API.

You can check out the [TanStack Start GitHub repository](https://github.com/TanStack/router/tree/main/packages/react-start) and the [Vendure GitHub repository](https://github.com/vendure-ecommerce/vendure). Feedback and contributions are welcome!
