# SleekNDChic Backend Implementation Plan

## Overview
RESTful API for SleekNDChic e-commerce platform built with Node.js, Express, TypeScript, Prisma, and PostgreSQL.

## Tech Stack
- **Runtime**: Node.js 20+
- **Framework**: Express.js 4.18+
- **Language**: TypeScript 5.7+
- **ORM**: Prisma 6.0+
- **Database**: PostgreSQL 15+
- **Cache/Sessions**: Redis 7+
- **Validation**: Zod
- **Auth**: JWT (jsonwebtoken)
- **Email**: SendGrid / Nodemailer
- **Payments**: Stripe
- **Queue**: BullMQ (Redis-based)

## Directory Structure

```
apps/api/
├── src/
│   ├── config/              # Configuration files
│   │   ├── database.ts      # Prisma client
│   │   ├── redis.ts         # Redis connection
│   │   ├── stripe.ts        # Stripe configuration
│   │   └── email.ts         # Email service config
│   │
│   ├── modules/             # Feature modules
│   │   ├── auth/            # Authentication
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.routes.ts
│   │   │   └── auth.middleware.ts
│   │   │
│   │   ├── products/        # Products & variants
│   │   │   ├── product.controller.ts
│   │   │   ├── product.service.ts
│   │   │   └── product.routes.ts
│   │   │
│   │   ├── cart/            # Guest cart (Redis)
│   │   │   ├── cart.controller.ts
│   │   │   ├── cart.service.ts
│   │   │   └── cart.routes.ts
│   │   │
│   │   ├── orders/          # Orders
│   │   │   ├── order.controller.ts
│   │   │   ├── order.service.ts
│   │   │   └── order.routes.ts
│   │   │
│   │   ├── shipping/        # Shipping configuration
│   │   │   ├── shipping.controller.ts
│   │   │   ├── shipping.service.ts
│   │   │   └── shipping.routes.ts
│   │   │
│   │   ├── coupons/         # Discount codes
│   │   │   ├── coupon.controller.ts
│   │   │   ├── coupon.service.ts
│   │   │   └── coupon.routes.ts
│   │   │
│   │   ├── content/         # CMS (blog, pages, carousel)
│   │   │   ├── content.controller.ts
│   │   │   ├── content.service.ts
│   │   │   └── content.routes.ts
│   │   │
│   │   └── payments/        # Stripe integration
│   │       ├── payment.controller.ts
│   │       ├── payment.service.ts
│   │       └── payment.routes.ts
│   │
│   ├── shared/              # Shared utilities
│   │   ├── middleware/
│   │   │   ├── errorHandler.ts
│   │   │   ├── rateLimiter.ts
│   │   │   └── validateRequest.ts
│   │   ├── utils/
│   │   │   ├── generateOrderNumber.ts
│   │   │   └── logger.ts
│   │   └── types/
│   │       └── index.ts
│   │
│   ├── jobs/                # Background jobs
│   │   ├── email.queue.ts
│   │   └── notification.worker.ts
│   │
│   └── app.ts               # Express app setup
│   └── server.ts            # Server entry point
│
├── prisma/
│   ├── schema.prisma        # Database schema
│   ├── migrations/          # Database migrations
│   └── seed.ts              # Seed data
│
├── docker-compose.yml       # Dev environment
├── .env.example             # Environment template
├── package.json
├── tsconfig.json
└── Dockerfile
```

## Database Schema (Prisma)

### Core Entities
```prisma
// User (Admin/Staff only)
model User {
  id            String    @id @default(uuid())
  email         String    @unique
  passwordHash  String
  fullName      String?
  role          Role      @default(STAFF)
  active        Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  sessions      Session[]
}

enum Role {
  ADMIN
  STAFF
}

// Categories
model Category {
  id        String    @id @default(uuid())
  name      String
  slug      String    @unique
  active    Boolean   @default(true)
  products  Product[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

// Products
model Product {
  id                String          @id @default(uuid())
  name              String
  description       String?
  basePrice         Decimal         @db.Decimal(10, 2)
  sku               String          @unique
  categoryId        String?
  category          Category?       @relation(fields: [categoryId], references: [id])
  lowStockThreshold Int             @default(5)
  active            Boolean         @default(true)
  images            ProductImage[]
  variants          Variant[]
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt
}

model ProductImage {
  id            String   @id @default(uuid())
  productId     String
  product       Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  url           String
  altText       String?
  displayOrder  Int      @default(0)
}

model Variant {
  id            String             @id @default(uuid())
  productId     String
  product       Product            @relation(fields: [productId], references: [id], onDelete: Cascade)
  size          String?
  color         String?
  skuSuffix     String?
  stockQuantity Int                @default(0)
  active        Boolean            @default(true)
  orderItems    OrderItem[]
  createdAt     DateTime           @default(now())
  updatedAt     DateTime           @updatedAt
  
  @@unique([productId, size, color])
}

// Shipping Configuration
model StateShipping {
  id             String          @id @default(uuid())
  stateName      String
  shippingMethod ShippingMethod
  price          Decimal         @db.Decimal(10, 2)
  active         Boolean         @default(true)
  
  @@unique([stateName, shippingMethod])
}

enum ShippingMethod {
  AUTHORIZED_CAR_PARK
  DELIVERY_COMPANY
}

// Coupons
model Coupon {
  id             String         @id @default(uuid())
  code           String         @unique
  type           CouponType
  value          Decimal        @db.Decimal(10, 2)
  minOrderAmount Decimal        @default(0) @db.Decimal(10, 2)
  usageLimit     Int?
  usedCount      Int            @default(0)
  startsAt       DateTime?
  endsAt         DateTime?
  active         Boolean        @default(true)
  orders         Order[]
  usages         CouponUsage[]
  createdAt      DateTime       @default(now())
}

enum CouponType {
  FIXED
  PERCENTAGE
}

model CouponUsage {
  id        String   @id @default(uuid())
  couponId  String
  coupon    Coupon   @relation(fields: [couponId], references: [id])
  orderId   String
  order     Order    @relation(fields: [orderId], references: [id])
  usedAt    DateTime @default(now())
  
  @@unique([couponId, orderId])
}

// Orders
model Order {
  id                    String        @id @default(uuid())
  orderNumber           String        @unique
  channel               OrderChannel  @default(WEBSITE)
  
  // Customer Info
  customerEmail         String
  customerPhone         String?
  shippingAddress       Json
  stateName             String?
  
  // Financials
  status                OrderStatus   @default(PENDING_PAYMENT)
  subtotal              Decimal       @db.Decimal(10, 2)
  tax                   Decimal       @default(0) @db.Decimal(10, 2)
  shippingCost          Decimal       @default(0) @db.Decimal(10, 2)
  discountAmount        Decimal       @default(0) @db.Decimal(10, 2)
  totalAmount           Decimal       @db.Decimal(10, 2)
  
  // Payment
  paymentMethod         PaymentMethod
  paymentStatus         PaymentStatus @default(PENDING)
  paymentTransactionId  String?
  
  // Flags
  needsShippingReview   Boolean       @default(false)
  couponId              String?
  coupon                Coupon?       @relation(fields: [couponId], references: [id])
  
  // Relations
  items                 OrderItem[]
  couponUsages          CouponUsage[]
  
  createdAt             DateTime      @default(now())
  updatedAt             DateTime      @updatedAt
}

enum OrderChannel {
  WEBSITE
  POS
  SOCIAL_MEDIA
}

enum OrderStatus {
  PENDING_PAYMENT
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
}

enum PaymentMethod {
  CARD
  BANK_TRANSFER
}

enum PaymentStatus {
  PENDING
  PAID
  FAILED
  REFUNDED
}

model OrderItem {
  id          String   @id @default(uuid())
  orderId     String
  order       Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId   String
  variantId   String
  variant     Variant  @relation(fields: [variantId], references: [id])
  quantity    Int
  unitPrice   Decimal  @db.Decimal(10, 2)
  totalPrice  Decimal  @db.Decimal(10, 2)
}

// CMS
model BlogPost {
  id               String    @id @default(uuid())
  title            String
  slug             String    @unique
  contentHtml      String
  excerpt          String?
  featuredImageUrl String?
  publishedAt      DateTime?
  active           Boolean   @default(true)
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
}

model Page {
  id          String   @id @default(uuid())
  title       String
  slug        String   @unique
  contentHtml String
  active      Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model CarouselItem {
  id            String   @id @default(uuid())
  imageUrl      String
  targetUrl     String?
  altText       String?
  displayOrder  Int      @default(0)
  active        Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

## API Endpoints

### Public Endpoints
```
GET    /api/v1/products              // List products with filters
GET    /api/v1/products/:id          // Get product detail
GET    /api/v1/categories            // List categories
POST   /api/v1/cart/items            // Add to cart (session-based)
GET    /api/v1/cart                  // Get cart
PUT    /api/v1/cart/items/:id        // Update cart item
DELETE /api/v1/cart/items/:id        // Remove from cart
POST   /api/v1/orders                // Create order
GET    /api/v1/orders/:orderNumber   // Get order by number
GET    /api/v1/shipping/states       // Get shipping states
POST   /api/v1/payments/stripe/webhook // Stripe webhook
GET    /api/v1/blog/posts            // List blog posts
GET    /api/v1/blog/posts/:slug      // Get blog post
GET    /api/v1/content/pages/:slug   // Get static page
GET    /api/v1/carousel              // Get carousel items
```

### Admin Endpoints (Require Auth)
```
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout

GET    /api/v1/dashboard/summary     // KPIs

// Products CRUD
GET    /api/v1/admin/products
POST   /api/v1/admin/products
PUT    /api/v1/admin/products/:id
DELETE /api/v1/admin/products/:id

// Orders
GET    /api/v1/admin/orders
GET    /api/v1/admin/orders/:id
PUT    /api/v1/admin/orders/:id/status
POST   /api/v1/admin/orders/manual   // Manual order creation

// Shipping config
GET    /api/v1/admin/shipping
POST   /api/v1/admin/shipping
PUT    /api/v1/admin/shipping/:id

// Coupons
GET    /api/v1/admin/coupons
POST   /api/v1/admin/coupons
PUT    /api/v1/admin/coupons/:id

// Content
GET    /api/v1/admin/blog-posts
POST   /api/v1/admin/blog-posts
PUT    /api/v1/admin/blog-posts/:id

GET    /api/v1/admin/pages
POST   /api/v1/admin/pages
PUT    /api/v1/admin/pages/:id

GET    /api/v1/admin/carousel
POST   /api/v1/admin/carousel
PUT    /api/v1/admin/carousel/:id
```

## Implementation Phases

### Phase 1: Foundation
1. Project setup (Express + TypeScript)
2. Prisma schema and migrations
3. Docker Compose (Postgres + Redis)
4. Database connection setup

### Phase 2: Core Features
1. Authentication (JWT)
2. Product API
3. Cart API (Redis-based)
4. Shipping API

### Phase 3: Orders & Payments
1. Order creation flow
2. Stripe integration
3. Webhook handlers
4. Coupon validation

### Phase 4: Admin & CMS
1. Admin authentication
2. Product management
3. Order management
4. Content management

### Phase 5: Background Jobs
1. Email queue (BullMQ)
2. Notification workers
3. Order confirmation emails

## Environment Variables
```
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/sleekndchic?schema=public"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Email
SENDGRID_API_KEY="SG.xxx"
FROM_EMAIL="noreply@sleekndchic.com"

# App
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

## Security Measures
1. Helmet.js for security headers
2. CORS configuration
3. Rate limiting (express-rate-limit)
4. Input validation (Zod)
5. SQL injection protection (Prisma)
6. XSS protection
7. CSRF tokens for admin

## Next Steps
1. Initialize Express project
2. Set up Prisma schema
3. Configure Docker Compose
4. Implement authentication
5. Build product API
