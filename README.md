# Nexgear — High-Performance Mechanical Hardware E-Commerce Platform

[![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?style=flat&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-2.x-764ABC?style=flat&logo=redux&logoColor=white)](https://redux-toolkit.js.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-ioredis-DC382D?style=flat&logo=redis&logoColor=white)](https://redis.io/)
[![Razorpay](https://img.shields.io/badge/Razorpay-Payments-02042B?style=flat&logo=razorpay&logoColor=3395FF)](https://razorpay.com/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

Nexgear is an enterprise-grade full-stack e-commerce platform purpose-built for specialized mechanical instruments, custom hardware, and studio equipment. Built with a focus on Software Development Engineer (SDE) design patterns, the platform implements robust inventory synchronization, dynamic multi-stage MongoDB aggregations, cryptographic payment workflows, distributed cache invalidation, and strict role-based access control.

---

## 📑 Table of Contents
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Key Engineering Concepts & SDE Patterns](#-key-engineering-concepts--sde-patterns)
  - [1. Amazon-Grade Real-Time Cart & Inventory Engine](#1-amazon-grade-real-time-cart--inventory-engine)
  - [2. Multi-Stage MongoDB Aggregation Pipeline](#2-multi-stage-mongodb-aggregation-pipeline)
  - [3. Cryptographic Payment Verification (Razorpay)](#3-cryptographic-payment-verification-razorpay)
  - [4. Stateless Auth, RBAC & Google OAuth 2.0](#4-stateless-auth-rbac--google-oauth-20)
  - [5. Distributed Token Blacklisting with Redis](#5-distributed-token-blacklisting-with-redis)
  - [6. Data Access Object (DAO) Pattern](#6-data-access-object-dao-pattern)
- [System Architecture Flow](#-system-architecture-flow)
- [Database Schema & Data Models](#-database-schema--data-models)
- [API Reference](#-api-reference)
- [Frontend State Management (Redux Toolkit)](#-frontend-state-management-redux-toolkit)
- [Local Setup & Installation](#-local-setup--installation)
- [Environment Configuration](#-environment-configuration)
- [Production & Deployment Readiness Audit](#-production--deployment-readiness-audit)

---

## 🛠 Architecture & Tech Stack

```
                          ┌───────────────────────────┐
                          │   React 19 + Redux Store  │
                          │   Vite + SCSS Design Sys  │
                          └─────────────┬─────────────┘
                                        │ HTTPS / JSON / Cookies
                                        ▼
                          ┌───────────────────────────┐
                          │   Express 5 API Gateway   │
                          │  (Auth, RBAC, Validators) │
                          └──────┬──────┬──────┬──────┘
                                 │      │      │
            ┌────────────────────┘      │      └────────────────────┐
            ▼                           ▼                           ▼
   ┌──────────────────┐       ┌──────────────────┐        ┌──────────────────┐
   │  MongoDB Atlas   │       │  Redis (ioredis) │        │ Cloud Services   │
   │ Aggregations/DAO │       │ Token Blacklist  │        │ Razorpay/ImageKit│
   └──────────────────┘       └──────────────────┘        └──────────────────┘
```

### Backend
- **Runtime:** Node.js (ES Modules)
- **Framework:** Express.js v5.2
- **Database:** MongoDB via Mongoose v9
- **Caching & Revocation:** Redis via `ioredis`
- **Authentication:** JWT (JSON Web Tokens), Passport.js Google OAuth 2.0, bcryptjs
- **Payment Gateway:** Razorpay Node SDK with HMAC-SHA256 signature verification
- **Asset Storage:** ImageKit Node SDK with Multer Memory Storage
- **Validation:** `express-validator`

### Frontend
- **Framework:** React 19 with Vite 7
- **State Management:** Redux Toolkit (`@reduxjs/toolkit` v2) + `react-redux`
- **Routing:** React Router DOM v7 (Guest & Protected Route Guards)
- **Styling:** Modular SASS / SCSS with custom design tokens, mixins, and responsive layout
- **HTTP Client:** Axios with `withCredentials: true`

---

## 💡 Key Engineering Concepts & SDE Patterns

### 1. Amazon-Grade Real-Time Cart & Inventory Engine
- **Variant-Aware SKU Management:** Each product supports multiple variants with separate SKUs, attribute matrices (finish, size, material), individual pricing, and stock limits.
- **Strict Concurrency & Stock Validation:** Before adding or incrementing quantities, the backend validates available inventory using atomic queries. Adding items exceeding stock is rejected with granular messaging (`"Only X items left in stock"`).
- **Snapshot Pricing:** Upon adding an item to the cart, the unit price snapshot is captured to prevent race conditions from downstream price changes.
- **Zero-Quantity Eviction:** Automatically transitions from decrementing `$inc: -1` to atomic array removal (`$pull`) when an item reaches quantity zero.
- **Transactional Post-Payment Cleanup:** Upon verified payment confirmation, user cart items are atomically purged.

### 2. Multi-Stage MongoDB Aggregation Pipeline
Instead of loading full document trees into application memory and computing totals in Node.js, Nexgear offloads calculation directly to the database engine using an optimized 8-stage aggregation pipeline:

```javascript
db.getCollection('carts').aggregate([
  { $match: { user: userObjectId } },
  { $unwind: { path: '$items' } },
  {
    $lookup: {
      from: 'products',
      localField: 'items.product',
      foreignField: '_id',
      as: 'items.product'
    }
  },
  { $unwind: { path: '$items.product' } },
  { $unwind: { path: '$items.product.variants' } },
  {
    $match: {
      $expr: {
        $eq: ['$items.variant', '$items.product.variants._id']
      }
    }
  },
  {
    $addFields: {
      itemPrice: {
        price: {
          $multiply: ['$items.quantity', '$items.product.variants.price.amount']
        },
        currency: '$items.product.variants.price.currency'
      }
    }
  },
  {
    $group: {
      _id: '$_id',
      totalPrice: { $sum: '$itemPrice.price' },
      currency: { $first: '$itemPrice.currency' },
      items: { $push: '$items' }
    }
  }
]);
```

**Benefits:**
- Eliminates floating-point JavaScript precision errors.
- Minimizes network payload by filtering and unwinding on the database server.
- Computes aggregate cart total and item sub-totals in a single atomic pass.

### 3. Cryptographic Payment Verification (Razorpay)
- **Order Generation:** Calculates server-side cart amount and initiates a Razorpay Order ID denominated in smallest currency units (paise).
- **HMAC-SHA256 Signature Verification:** Prevents MITM attacks and client spoofing by recalculating the cryptographic signature using the secret key:
  $$\text{ExpectedSignature} = \text{HMAC-SHA256}(\text{order\_id} \parallel "|" \parallel \text{payment\_id}, \text{RAZORPAY\_KEY\_SECRET})$$
- **Payment Ledgering:** Maintains an immutable payment audit trail model tracking order state (`pending` $\rightarrow$ `paid` or `failed`), Razorpay IDs, and item snapshots.

### 4. Stateless Auth, RBAC & Google OAuth 2.0
- **Role-Based Access Control (RBAC):** Distinct `buyer` and `seller` personas.
  - Sellers have privileged access to product catalog creation, variant configuration, and image uploads.
  - Buyers have access to personal carts, checkout orders, and profile endpoints.
- **Sessionless Security:** Credentials stored in `httpOnly`, `secure` cookies to eliminate XSS token theft vectors.
- **Dual Authentication Strategies:** Custom local credentials (bcrypt with salt rounds) and Google OAuth 2.0 single-sign-on using Passport.js.

### 5. Distributed Token Blacklisting with Redis
- **Immediate JWT Invalidation:** Traditional JWTs cannot be revoked until expiry. Nexgear integrates Redis caching to blacklist tokens upon logout.
- **Memory-Efficient TTL:** Revoked tokens are saved with a 24-hour Time-To-Live (`EX 86400`), preventing unbound memory usage in Redis.
- **Rapid Lookup:** Sub-millisecond $O(1)$ key checks in memory during authentication checks.

### 6. Data Access Object (DAO) Pattern
Database querying logic is cleanly decoupled from business logic and controllers:
- `src/dao/cart.dao.js`: Encapsulates cart aggregation queries.
- `src/dao/product.dao.js`: Encapsulates variant stock resolution logic (`stockOfVariant`).
- Controllers focus strictly on HTTP request/response lifecycles, status codes, and input parsing.

---

## 🔄 System Architecture Flow

```
[Buyer / Client]
       │
       ├─► 1. POST /api/cart/add/:productId/:variantId
       │      └─► Validates Stock via DAO ──► Atomic $inc into Cart
       │
       ├─► 2. GET /api/cart
       │      └─► Runs 8-Stage MongoDB Pipeline ──► Returns Calculated Cart
       │
       ├─► 3. POST /api/cart/payment/create/order
       │      └─► Creates Razorpay Order ──► Creates "pending" Payment Record
       │
       ├─► 4. Razorpay Modal Checkout (Frontend)
       │      └─► Collects payment details & returns signature
       │
       └─► 5. POST /api/cart/payment/verify/order
              └─► Cryptographic HMAC Check ──► Status: "paid" ──► Clears Cart
```

---

## 🗄 Database Schema & Data Models

| Collection | Key Fields | Description |
|---|---|---|
| **`users`** | `email`, `password`, `fullname`, `role` (`buyer`/`seller`), `googleId`, `contact` | User credentials and RBAC identity |
| **`products`** | `title`, `description`, `price`, `images`, `seller`, `variants` (array) | Base product catalog with embedded variant subdocuments |
| **`carts`** | `user`, `items: [{ product, variant, quantity, price }]` | Active shopping carts per user |
| **`payments`** | `user`, `razorpay: { orderId, paymentId, signature }`, `price`, `orderItems`, `status` | Immutable transaction ledger |

---

## 📡 API Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new buyer or seller account |
| `POST` | `/api/auth/login` | Public | Authenticate user, checks blacklist, sets cookie |
| `GET` | `/api/auth/me` | Authenticated | Retrieve authenticated user profile |
| `POST` | `/api/auth/logout` | Authenticated | Blacklists JWT in Redis and clears cookie |
| `GET` | `/api/auth/google` | Public | Initiates Google OAuth consent screen |
| `GET` | `/api/auth/google/callback`| Public | Google OAuth callback handler |

### Cart & Checkout (`/api/cart`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/cart/` | Authenticated | Fetch aggregated cart with dynamic total |
| `POST` | `/api/cart/add/:productId/:variantId` | Authenticated | Add item or increment variant stock-checked |
| `POST` | `/api/cart/quantity/increment/:productId/:variantId` | Authenticated | Increment quantity with live stock guard |
| `POST` | `/api/cart/quantity/decrement/:productId/:variantId` | Authenticated | Decrement quantity or remove if reaching 0 |
| `POST` | `/api/cart/payment/create/order` | Authenticated | Generate Razorpay order for current cart |
| `POST` | `/api/cart/payment/verify/order` | Authenticated | Verify HMAC signature and commit purchase |

### Products (`/api/products`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/products` | Public | List all available store products |
| `GET` | `/api/products/details/:id` | Public | Get detailed product specifications and variants |
| `POST` | `/api/products` | Seller Only | Create base product with multi-part images (ImageKit) |
| `GET` | `/api/products/seller` | Seller Only | Retrieve all products belonging to authenticated seller |
| `POST` | `/api/products/:productId/variants` | Seller Only | Append variant configuration to existing product |

---

## 🎨 Frontend State Management (Redux Toolkit)

The frontend uses slice-based domain modularity:

```
Frontend/src/
├── app/
│   ├── app.store.js            # Redux store combining auth, cart, product slices
│   ├── app.routes.jsx           # Central route tree with route guards
│   └── App.scss                 # Global CSS variables & typography tokens
├── features/
│   ├── auth/                    # Auth slice, hooks (useAuth), login & registration
│   ├── cart/                    # Cart slice, hooks (useCart), Razorpay checkout modal
│   └── Product/                 # Product slice, hooks (useProduct), catalog & dashboard
```

- **Protected Routes (`ProtectedRoute.jsx`):** Guarantees private access to cart and checkout for logged-in buyers.
- **Guest Routes (`GuestRoute.jsx`):** Prevents authenticated users from accessing login/register views.
- **Custom Hooks (`useCart`, `useAuth`, `useProduct`):** Abstracts Redux dispatchers and selectors behind ergonomic React hooks.

---

## 💻 Local Setup & Installation

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB instance (local or Atlas URI)
- Redis instance (local or Redis Cloud / Upstash)
- Razorpay test account
- ImageKit account (for media storage)
- Google Cloud Console OAuth 2.0 Web Client credentials

### 1. Clone the Repository
```bash
git clone https://github.com/dibyo20/Nexgear.git
cd Nexgear
```

### 2. Backend Setup
```bash
cd Backend
npm install
```
Create a `.env` file inside `Backend/`:
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/nexgear?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
RAZORPAY_KEY_ID=rzp_test_xxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
REDIS_URI=redis://default:your_redis_password@your-redis-host:6379
```
Start backend:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../Frontend
npm install
```
Create a `.env` file inside `Frontend/`:
```env
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxx
# Leave blank in development to leverage Vite proxy (/api -> localhost:5000)
# Set to your production backend URL (e.g. https://your-backend.onrender.com) in production
VITE_API_URL=
```
Start frontend:
```bash
npm run dev
```
Visit `http://localhost:5173` in your browser.

---

## 🚀 Production & Deployment Readiness Audit

The platform is fully architected and hardened for production deployment (e.g., Frontend on **Vercel / Netlify** and Backend on **Render / AWS / Railway**). The following critical production configurations are implemented across the codebase:

### ✅ Production Best Practices Implemented:

1. **CORS & Proxy Trust Configuration:**
   - Mounted in `Backend/src/app.js`:
     ```javascript
     app.set("trust proxy", true);
     app.use(cors({
         origin: ["http://localhost:5173", config.FRONTEND_URL].filter(Boolean),
         credentials: true,
     }));
     ```

2. **Frontend Dynamic Axios Base URL:**
   - In `Frontend/src/features/*/service/*.api.js` and `GoogleButton.jsx`, endpoints dynamically resolve the API base URL:
     ```javascript
     const API_BASE = import.meta.env.VITE_API_URL || '';
     baseURL: `${API_BASE}/api/auth`
     ```
   - In local development, leaving `VITE_API_URL` empty automatically leverages Vite's dev proxy. In production, set `VITE_API_URL=https://your-backend-domain.com`.

3. **Cross-Site Cookie Security:**
   - In `Backend/src/controllers/auth.controller.js`, auth tokens sent via cookies use:
     ```javascript
     res.cookie("token", token, {
         httpOnly: true,
         secure: config.NODE_ENV === "production",
         sameSite: config.NODE_ENV === "production" ? "none" : "lax",
     });
     ```
   - Cookie clearing upon logout also adheres to this policy so cookies are properly cleared across origins.

4. **Dynamic OAuth Redirect URIs:**
   - Google OAuth callback and failure handlers in `Backend/src/controllers/auth.controller.js` and `Backend/src/routes/auth.routes.js` dynamically redirect to `config.FRONTEND_URL`:
     ```javascript
     const redirectUrl = config.FRONTEND_URL ? `${config.FRONTEND_URL}/` : "http://localhost:5173/";
     res.redirect(redirectUrl);
     ```

5. **Token Blacklist Check in Middleware:**
   - Both `authenticateUser` and `authenticateSeller` in `Backend/src/middlewares/auth.middleware.js` check Redis before verifying JWT signatures:
     ```javascript
     const isBlacklisted = await redis.get(`blacklist:${token}`);
     if (isBlacklisted) {
         return res.status(401).json({ message: "Unauthorized (Token is blacklisted)" });
     }
     ```
   - Enforces immediate revocation of JWTs across all protected API routes upon logout.

---

## 📄 License
This project is open-source and available under the [ISC License](LICENSE).
