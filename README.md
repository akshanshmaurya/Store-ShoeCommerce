# VELOCE Footwear — Storefront Application

The high-performance, customer-facing e-commerce storefront for **VELOCE Atelier Footwear**, delivering an editorial luxury shopping experience with bespoke sizing, carbon propulsion marathon racers, and stateful commerce features.

---

## 1. Current Phase & Capabilities

**Status**: Phase 5 Complete (Cart & Wishlist Foundation)

- 🎨 **Phase 1 — Design System**: Locked design tokens (`#0A0A0A` charcoal bg, `#141414` surface, `#C9A96E` warm gold accent), typography scale, fluid spacing, responsive layout grid, and accessible components.
- 👟 **Phase 2 — Product Catalog & Sizing Curves**: Conceptual Product vs SKU-level `ProductVariant` domain model, 14 mock luxury models with real image assets, 3:4 zoom gallery, color/size variant selector, and exact integer minor-unit pricing.
- 👤 **Phase 3 — Customer Authentication & Account**: Salted cryptographic `scrypt` password hashing, signed `HttpOnly` JWT sessions (`veloce_session`), Edge Middleware route guard, sign-in, registration, password recovery, and protected `/account` dashboard.
- 🔍 **Phase 4 — Product Discovery, Search & Dynamic Multi-Filtering**: Full-text partial keyword search, instant autocomplete suggestions modal (`/api/catalog/suggestions`), desktop filter sidebar, mobile slide-over drawer, active filter chips, dynamic facet counts, sorting, pagination, and bidirectional URL query sync (`/shop`, `/shop/[category]`, `/shop/collections/[collection]`, `/search`).
- 🛍️ **Phase 5 — Stateful Shopping Bag & Wishlist**: Variant-level line item deduplication, stepper quantity controls, slide-over `CartDrawer`, dedicated `/cart` and `/wishlist` pages, interactive wishlist heart toggles, and isolated `StorageAdapter` (`veloce_cart_v1`, `veloce_wishlist_v1`).

---

## 2. Technology Stack

- **Framework**: [Next.js 14+ (App Router)](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + Custom Design Tokens
- **Icons**: [Lucide React](https://lucide.dev/)
- **Session Security**: Cryptographic `scrypt` & signed `HttpOnly` JWTs

---

## 3. Getting Started & Development

### Prerequisites
- **Node.js**: `>= 18.17.0` (Recommended: Node 20 LTS or Node 24)
- **npm**: `>= 9.0.0`

### Installation
```bash
npm install
```

### Environment Configuration
```bash
cp .env.example .env.local
```

### Development Server
```bash
npm run dev        # Starts server on http://localhost:3000
```

### Type Checking & Linting
```bash
npm run type-check # TypeScript validation
npm run lint       # ESLint validation
```

### Production Build
```bash
npm run build      # Optimized production build
npm run start      # Run production server
```

---

## 4. Key Application Routes

- 🏠 **Homepage**: [`/`](http://localhost:3000)
- 🛍️ **Catalog Browser**: [`/shop`](http://localhost:3000/shop)
- 🏷️ **Categories**: [`/shop/marathon-racing`](http://localhost:3000/shop/marathon-racing), [`/shop/bespoke-sneakers`](http://localhost:3000/shop/bespoke-sneakers), [`/shop/heritage-boots`](http://localhost:3000/shop/heritage-boots)
- 🌟 **Collections**: [`/shop/collections/carbon-propulsion`](http://localhost:3000/shop/collections/carbon-propulsion), [`/shop/collections/new-arrivals`](http://localhost:3000/shop/collections/new-arrivals)
- 🔍 **Search**: [`/search`](http://localhost:3000/search)
- 👟 **Product Detail**: [`/product/[slug]`](http://localhost:3000/product/veloce-apex-carbon-01)
- 🛒 **Shopping Bag**: [`/cart`](http://localhost:3000/cart)
- 💖 **Curated Wishlist**: [`/wishlist`](http://localhost:3000/wishlist)
- 🔑 **Customer Login**: [`/login`](http://localhost:3000/login) *(Demo account: `demo@veloce.com` / `VelocePass123!`)*
- 📝 **Registration**: [`/register`](http://localhost:3000/register)
- 👤 **Protected Account**: [`/account`](http://localhost:3000/account)

---

## 5. Architectural Principles

1. **Variant-Level Commerce**: Inventory and cart line items are tracked strictly at the purchasable SKU/variant level, never at the conceptual shoe product level.
2. **Server-Authoritative Pricing**: All monetary values are handled as integer minor units (e.g. `24900` = $249.00). Client cart calculations are informational estimates; final authoritative totals, tax, and shipping are computed on the server.
3. **Clean Storage Abstraction**: Client persistence is encapsulated behind `StorageAdapter` with schema versioning to enable future drop-in database synchronization without UI modifications.
4. **Complete Application Isolation**: This repository is completely independent of the warehouse and analytics applications, with its own deployment lifecycle, dependencies, and configuration.
