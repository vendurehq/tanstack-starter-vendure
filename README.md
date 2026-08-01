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
  Use as a foundation to build upon, take inspiration from, or learn the ergonomics of the Vendure Shop API.
</p>
<h4 align="center">
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

## Getting Started

First, configure the storefront and run the development server:

```bash
cp .env.example .env
npm install
npm run generate
npm run dev
```

Set `VENDURE_SHOP_API_URL` in `.env` to a Vendure Shop API. Open [http://localhost:3000](http://localhost:3000) in your browser; the storefront is available at `/en` and `/de`, and `/` redirects to the preferred supported locale.

Customize the storefront from `src/features`, `src/site`, and `src/storefront.css`. See [Architecture](docs/architecture.md) for ownership and server-boundary conventions and [Contributing](CONTRIBUTING.md) for the upstream upgrade workflow.

## Commands

```bash
npm run generate       # Generate Paraglide messages and the TanStack route tree
npm run check-types    # Run generation and TypeScript checks
npm test               # Run architecture, i18n, cache, and upgrade tests
npm run lint           # Run Biome lint
npm run build          # Create a production Nitro build
```

Run the production server with `node .output/server/index.mjs`.

## Learn More

To learn more about TanStack Start and Vendure, take a look at the following resources:

- [TanStack Start Documentation](https://tanstack.com/start/latest/docs/framework/react/overview) - learn about TanStack Start features and APIs.
- [TanStack Router Documentation](https://tanstack.com/router/latest/docs/framework/react/overview) - learn about type-safe routing and data loading.
- [Vendure Documentation](https://docs.vendure.io) - learn about Vendure and its Shop API.

You can check out the [TanStack Start GitHub repository](https://github.com/TanStack/router/tree/main/packages/react-start) and the [Vendure GitHub repository](https://github.com/vendure-ecommerce/vendure). Feedback and contributions are welcome!
