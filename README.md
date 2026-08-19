# Storefront — VELOCE Footwear Platform

Customer-facing e-commerce application for the **VELOCE Footwear Commerce Platform**.

---

## 1. Architectural Role & Boundary

```text
Storefront Client / Pages (React Server & Client Components)
                  │
                  ▼
HTTP API Route Handlers (src/app/api/checkout/*, src/app/api/orders/*, src/app/api/cart/*, src/app/api/auth/*)
                  │
                  ▼
Session Resolver & Services (CheckoutService, OrderService, CartService, WishlistService, AuthService)
                  │
                  ▼
Server Repositories (OrderRepository, InventoryReservationRepository, CartRepository, CustomerRepository, ProductRepository)
                  │
                  ▼
MongoDB Connection Layer (src/server/db/mongodb.ts)
                  │
                  ▼
Shared MongoDB Cluster (Single Source of Truth)
```

- **Domain Ownership**: Customer browsing, search, discovery, catalog navigation, customer identity, authenticated account dashboard, address book, persistent shopping bag, wishlist, express checkout, server-side pricing, atomic inventory reservation, and customer order management.
- **Independence**: Fully independent repository, zero shared workspaces, zero cross-application source imports.
- **Security Invariant**: Frontends never connect directly to MongoDB from the browser. Passwords hashed using `crypto.scrypt`. Administrative fields (`costPrice`, `passwordHash`, reset tokens, supplier data, warehouse internal IDs) are strictly excluded from public responses.
- **Pricing & Cart Non-Authority**: Checkout **NEVER** trusts client-supplied prices, subtotals, or taxes. Prices are re-fetched from the authoritative catalog; subtotals and taxes (8%) are computed server-side in integer minor units.
- **Atomic Stock Reservation**: Stock reservations are executed atomically using conditional `$gte` updates on `available` stock before creating the order record. If any item is unavailable, partial reservations are automatically rolled back.
- **Idempotency**: All checkout submissions accept or generate an `idempotencyKey` preventing duplicate orders on network retries.

---

## 2. API Endpoints Reference

All API routes return standard JSON envelopes (`{ success: true, data: T, meta?: Record<string, unknown> }` or `{ success: false, error: { code, message } }`).

### Checkout & Orders API (`/api/checkout/`, `/api/orders/`)
| Method | Endpoint | Description | Request Body / Parameters |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/checkout` | Process authenticated checkout, reserve inventory, create order, and clear cart | `shippingAddressId`, `billingAddressId?`, `idempotencyKey?`, `notes?` |
| `GET` | `/api/orders` | List authenticated customer order history (sorted newest first) | None (reads session) |
| `GET` | `/api/orders/:orderNumber` | Retrieve detailed order breakdown (scoped to owner; 404 for others) | `orderNumber` in URL path |
| `POST` | `/api/orders/:orderNumber/cancel` | Cancel pending order and release reserved inventory | `reason?` in request body |

### Persistent Cart API (`/api/cart/`)
| Method | Endpoint | Description | Request Body / Parameters |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/cart` | Retrieve active cart for current authenticated customer or guest | None |
| `DELETE` | `/api/cart` | Clear all items from active cart | None |
| `POST` | `/api/cart/items` | Add product variant to active cart (deduplicates & merges quantity) | `variantId`, `productId?`, `quantity?` (1-10) |
| `PATCH` | `/api/cart/items/:variantId` | Update quantity of a variant line item | `quantity` (1-10) |
| `DELETE` | `/api/cart/items/:variantId` | Remove variant line item from active cart | None (variantId in path) |
| `POST` | `/api/cart/merge` | Merge guest cart items into authenticated customer cart | `guestId?` |

### Persistent Wishlist API (`/api/wishlist/`)
| Method | Endpoint | Description | Request Body / Parameters |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/wishlist` | Retrieve authenticated customer wishlist (401 if unauthenticated) | None |
| `DELETE` | `/api/wishlist` | Clear all items from authenticated customer wishlist | None |
| `POST` | `/api/wishlist/items` | Add product to customer wishlist (deduplicated by productId) | `productId`, `variantId?` |
| `DELETE` | `/api/wishlist/items/:productId` | Remove product from customer wishlist | None (productId in path) |

### Authentication API (`/api/auth/`)
| Method | Endpoint | Description | Request Body / Parameters |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register customer with scrypt hash and set session cookie | `email`, `password`, `firstName`, `lastName`, `phone?`, `marketingOptIn?` |
| `POST` | `/api/auth/login` | Authenticate customer with email/password and set cookie | `email`, `password` |
| `POST` | `/api/auth/logout` | Invalidate and clear `veloce_session` cookie | None |
| `GET` | `/api/auth/me` | Fetch authenticated customer profile | None (reads HttpOnly session cookie) |
| `POST` | `/api/auth/forgot-password` | Request password reset token (rate-limited, safe generic response) | `email` |
| `POST` | `/api/auth/reset-password` | Update password using short-lived reset token | `token`, `newPassword` |
| `POST` | `/api/auth/verify-email` | Confirm email verification token | `token` |

### Customer Account & Address API (`/api/account/`)
| Method | Endpoint | Description | Request Body / Parameters |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/account/profile` | Get customer profile details | None (reads session) |
| `PATCH` | `/api/account/profile` | Update customer name, phone, bespoke sizing preferences | `firstName?`, `lastName?`, `phone?`, `preferredSizeSystem?`, `preferredSizeValue?` |
| `GET` | `/api/account/addresses` | List saved delivery addresses for authenticated customer | None (reads session) |
| `POST` | `/api/account/addresses` | Create new delivery address | `recipientName`, `phone?`, `line1`, `line2?`, `city`, `state`, `postalCode`, `country`, `isDefault?` |
| `PATCH` | `/api/account/addresses/:id` | Update customer's saved address | Address fields (scoped to owner) |
| `DELETE` | `/api/account/addresses/:id` | Delete customer's saved address | None (scoped to owner) |
| `POST` | `/api/account/addresses/:id/default` | Set address as default delivery destination | None (scoped to owner) |

### Products & Taxonomy API (`/api/`)
| Method | Endpoint | Description | Query Parameters |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | Query products with multi-filtering, search, sorting & pagination | `search`, `category`, `collection`, `brand`, `gender`, `size`, `color`, `minPrice`, `maxPrice`, `sort`, `page`, `limit` |
| `GET` | `/api/products/:slug` | Get full product detail by slug with sizing & colorway matrix | None (slug in URL path) |
| `GET` | `/api/categories` & `/:slug` | List all active categories or get single category | `slug` in path |
| `GET` | `/api/collections` & `/:slug` | List all active collections or get single collection | `slug` in path |
| `GET` | `/api/brands` & `/:slug` | List all active brands or get single brand | `slug` in path |
| `GET` | `/api/catalog/suggestions` | Instant autocomplete search suggestions | `q` (query string), `limit` (max suggestions) |

---

## 3. Development Commands

```bash
# Install dependencies
npm install

# Start development server (http://localhost:3000)
npm run dev

# Run automated API & component test suite (58 tests)
npm test

# Type-check TypeScript
npm run type-check

# Run linter
npm run lint

# Compile production build
npm run build
```

---

## 4. Environment Variables

Create `.env.local` using `.env.example`:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/veloce_ecommerce
MONGODB_DATABASE_NAME=veloce_ecommerce
AUTH_SECRET=veloce-storefront-auth-jwt-secret-key-2026
NODE_ENV=development
```
