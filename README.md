# Voltex — Hydrogen Storefront

A custom Shopify headless storefront built with **Hydrogen**, **React Router v7**, and **Tailwind CSS v4**. Voltex is a premium e-commerce theme with a refined editorial aesthetic, full i18n support, and a performant server-rendered architecture.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Shopify Hydrogen](https://shopify.dev/custom-storefronts/hydrogen) 2026.4 |
| Routing | [React Router v7](https://reactrouter.com/) (file-based, `($locale)` prefix) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) |
| UI primitives | [Radix UI](https://www.radix-ui.com/) (Dialog, ScrollArea, Tooltip) |
| Icons | [Lucide React](https://lucide.dev/) |
| Carousels | [Swiper](https://swiperjs.com/) |
| CMS / Theme | [Weaverse Hydrogen](https://weaverse.io/) |
| Runtime | [Oxygen](https://shopify.dev/custom-storefronts/oxygen) (Shopify edge hosting) |
| Language | TypeScript |

---

## Features

- **Product pages** — variants, images, add-to-cart with optimistic UI
- **Collections** — paginated grid with image cards
- **Search** — full-text and predictive search routed through `/search`
- **Blog** — multi-blog support with article listing and detail pages
- **Cart** — slide-in drawer with live item count badge
- **Account** — login, profile, orders, and address management via Customer Account API
- **Policies** — auto-populated from Shopify admin (privacy, refunds, shipping, etc.)
- **i18n** — locale-prefixed routing (`/en`, `/fr`, etc.) via `($locale)` segments
- **SEO** — per-route `meta` exports with title and description
- **Sitemap** — auto-generated XML sitemap at `/sitemap.xml`
- **Robots.txt** — configurable at `/robots.txt`

---

## Project Structure

```
app/
├── components/        # Shared UI components (Header, Footer, Cart, etc.)
├── lib/               # Utilities (search helpers, redirect, etc.)
├── routes/            # File-based routes (all prefixed with ($locale))
│   ├── _index         # Homepage
│   ├── collections.*  # Collection list + detail
│   ├── products.*     # Product detail
│   ├── blogs.*        # Blog list, article list, article detail
│   ├── search         # Search page (full-text + predictive)
│   ├── cart           # Cart page
│   ├── account.*      # Customer account (login, orders, profile, addresses)
│   └── policies.*     # Shop policies
└── styles/
    ├── app.css        # Global layout and component styles
    ├── reset.css      # CSS reset
    └── tailwind.css   # Tailwind entry point
```

---

## Getting Started

**Requirements:** Node.js `^22` or `^24`

### 1. Install dependencies

```bash
npm install
```

### 2. Link to a Shopify store

```bash
npx shopify hydrogen link
```

### 3. Pull environment variables

```bash
npx shopify hydrogen env pull
```

### 4. Start the dev server

```bash
npm run dev
```

The store will be available at `http://localhost:3000`.

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start dev server with codegen watch |
| `npm run build` | Production build with codegen |
| `npm run preview` | Preview the production build locally |
| `npm run codegen` | Regenerate Storefront API types |
| `npm run typecheck` | TypeScript check (no emit) |
| `npm run lint` | ESLint across the project |

---

## Deployment

Voltex is designed to deploy to **Shopify Oxygen** (zero-config edge hosting):

```bash
npx shopify hydrogen deploy
```

Alternatively, build the project and deploy the output to any Node.js-compatible edge runtime.

---

## Customer Account API

To enable the `/account` section locally:

1. Follow [Shopify's setup guide](https://shopify.dev/docs/custom-storefronts/building-with-the-customer-account-api/hydrogen#step-1-set-up-a-public-domain-for-local-development) to configure a public tunnel (e.g. ngrok).
2. Add the tunnel URL as an allowed redirect URI in your Shopify app settings.
3. Set `PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID` and related env vars in `.env`.

---

## Internationalization

Routes are wrapped in a `($locale)` optional segment. The locale is resolved in [app/routes/($locale).tsx](app/routes/($locale).tsx) and injected into all Storefront API queries via `@inContext(country: $country, language: $language)`.

To add a new market, configure it in Shopify Markets and the routing will pick it up automatically.
