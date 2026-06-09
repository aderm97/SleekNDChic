# SleekNDChic Frontend Implementation Plan

## Project Overview
E-commerce platform for Sleekandchic by Salma - a women's fashion brand with product variants (size/color), dynamic shipping pricing, and multi-channel order capture.

## Tech Stack
- **Framework**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS v4 + Headless UI
- **State Management**: Zustand (client state) + React Query (server state)
- **Routing**: React Router v7
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **HTTP Client**: Axios

## Directory Structure

```
apps/web/
├── src/
│   ├── features/                 # Feature-based modules
│   │   ├── products/             # Product catalog
│   │   │   ├── components/
│   │   │   │   ├── ProductCard.tsx
│   │   │   │   ├── ProductGrid.tsx
│   │   │   │   ├── ProductDetail.tsx
│   │   │   │   ├── ProductCarousel.tsx
│   │   │   │   ├── VariantSelector.tsx
│   │   │   │   └── SizeColorSwatches.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useProducts.ts
│   │   │   │   ├── useProduct.ts
│   │   │   │   └── useCategories.ts
│   │   │   └── types.ts
│   │   │
│   │   ├── cart/                 # Shopping cart
│   │   │   ├── components/
│   │   │   │   ├── CartDrawer.tsx
│   │   │   │   ├── CartItem.tsx
│   │   │   │   ├── CartSummary.tsx
│   │   │   │   └── AddToCartButton.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useCart.ts
│   │   │   └── store/
│   │   │       └── cartStore.ts
│   │   │
│   │   ├── checkout/             # Checkout flow
│   │   │   ├── components/
│   │   │   │   ├── CheckoutForm.tsx
│   │   │   │   ├── ShippingForm.tsx
│   │   │   │   ├── PaymentMethod.tsx
│   │   │   │   ├── OrderSummary.tsx
│   │   │   │   └── StateSelector.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useShipping.ts
│   │   │   │   └── useCheckout.ts
│   │   │   └── types.ts
│   │   │
│   │   ├── orders/               # Order management
│   │   │   ├── components/
│   │   │   │   ├── OrderConfirmation.tsx
│   │   │   │   └── OrderDetails.tsx
│   │   │   └── hooks/
│   │   │       └── useOrder.ts
│   │   │
│   │   └── content/              # CMS content
│   │       ├── components/
│   │       │   ├── Carousel.tsx
│   │       │   ├── BlogPost.tsx
│   │       │   └── StaticPage.tsx
│   │       └── hooks/
│   │           └── useContent.ts
│   │
│   ├── shared/                   # Shared utilities
│   │   ├── components/
│   │   │   ├── ui/               # Base UI components
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Select.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── Loading.tsx
│   │   │   │   ├── ErrorBoundary.tsx
│   │   │   │   └── Toast.tsx
│   │   │   ├── layout/
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   ├── Navigation.tsx
│   │   │   │   ├── MobileMenu.tsx
│   │   │   │   └── Layout.tsx
│   │   │   └── seo/
│   │   │       └── MetaTags.tsx
│   │   ├── hooks/
│   │   │   ├── useLocalStorage.ts
│   │   │   ├── useDebounce.ts
│   │   │   └── useMediaQuery.ts
│   │   ├── lib/
│   │   │   ├── utils.ts
│   │   │   ├── api.ts
│   │   │   └── constants.ts
│   │   └── types/
│   │       └── index.ts
│   │
│   ├── pages/                    # Page components
│   │   ├── Home.tsx
│   │   ├── Shop.tsx
│   │   ├── Product.tsx
│   │   ├── Cart.tsx
│   │   ├── Checkout.tsx
│   │   ├── OrderSuccess.tsx
│   │   ├── Blog.tsx
│   │   ├── BlogPost.tsx
│   │   ├── Page.tsx
│   │   └── NotFound.tsx
│   │
│   ├── routes/
│   │   └── AppRoutes.tsx
│   │
│   ├── styles/
│   │   └── globals.css
│   │
│   ├── App.tsx
│   └── main.tsx
│
├── public/
│   └── images/
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── .env.example
```

## Feature Breakdown

### 1. Project Setup
**Files to create:**
- `package.json` - Dependencies
- `vite.config.ts` - Vite configuration with path aliases
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.ts` - Tailwind with custom colors (muted rose #C08081, charcoal #333)
- `src/styles/globals.css` - Global styles + Tailwind directives

**Dependencies:**
```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^7.0.0",
    "@tanstack/react-query": "^5.0.0",
    "zustand": "^5.0.0",
    "axios": "^1.7.0",
    "zod": "^3.23.0",
    "react-hook-form": "^7.53.0",
    "@hookform/resolvers": "^3.9.0",
    "lucide-react": "^0.460.0",
    "@headlessui/react": "^2.2.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.5.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "typescript": "^5.6.0",
    "vite": "^6.0.0",
    "tailwindcss": "^4.0.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  }
}
```

### 2. Shared UI Components
**Components:**
- `Button.tsx` - Primary (rose), secondary (charcoal), ghost variants
- `Input.tsx` - Text input with label, error state
- `Select.tsx` - Dropdown with custom styling
- `Modal.tsx` - Dialog for confirmations/quick views
- `Loading.tsx` - Skeleton loaders and spinners
- `Toast.tsx` - Notification system

### 3. Layout Components
**Components:**
- `Header.tsx` - Logo left, nav center, cart icon right
- `Footer.tsx` - Links, newsletter, social
- `Navigation.tsx` - Desktop nav (Home, Shop, Blog, About, Contact)
- `MobileMenu.tsx` - Hamburger menu for mobile
- `Layout.tsx` - Page wrapper with header/footer

### 4. Product Catalog Features
**Components:**
- `ProductCard.tsx` - Image, name, price, quick add
- `ProductGrid.tsx` - Responsive grid (2/3/4 columns)
- `ProductDetail.tsx` - Full product page
- `ProductCarousel.tsx` - Image gallery with thumbnails
- `VariantSelector.tsx` - Size/color selection
- `SizeColorSwatches.tsx` - Visual variant selection

**Hooks:**
- `useProducts.ts` - Fetch product list with filters
- `useProduct.ts` - Fetch single product
- `useCategories.ts` - Fetch categories

### 5. Shopping Cart Features
**Components:**
- `CartDrawer.tsx` - Slide-out cart panel
- `CartItem.tsx` - Item row with qty controls
- `CartSummary.tsx` - Subtotal, shipping, total
- `AddToCartButton.tsx` - Add to cart with variant validation

**Store:**
- `cartStore.ts` - Zustand store with localStorage persistence

### 6. Checkout Flow
**Components:**
- `CheckoutForm.tsx` - Multi-step checkout wrapper
- `ShippingForm.tsx` - Email, phone, address fields
- `StateSelector.tsx` - State dropdown with "Other" option
- `PaymentMethod.tsx` - Card (Stripe Elements) / Bank transfer
- `OrderSummary.tsx` - Final order review

**Hooks:**
- `useShipping.ts` - Fetch shipping rates by state
- `useCheckout.ts` - Create order, handle payment

### 7. Order Management
**Components:**
- `OrderConfirmation.tsx` - Thank you page with order number
- `OrderDetails.tsx` - Order lookup by order number

### 8. CMS Content
**Components:**
- `Carousel.tsx` - Hero banner carousel
- `BlogPost.tsx` - Blog post display
- `StaticPage.tsx` - Dynamic page renderer

## API Integration

### React Query Keys
```typescript
const queryKeys = {
  products: ['products'],
  product: (id: string) => ['product', id],
  categories: ['categories'],
  cart: ['cart'],
  shipping: ['shipping'],
  order: (number: string) => ['order', number],
  carousel: ['carousel'],
  blog: ['blog'],
  page: (slug: string) => ['page', slug],
};
```

### Base API Client
```typescript
// src/shared/lib/api.ts
import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for session cookie
api.interceptors.request.use((config) => {
  // Session cookie is automatically sent
  return config;
});
```

## Styling Guidelines

### Color Palette
- Primary: `#C08081` (muted rose/burgundy)
- Secondary: `#F5F5F5` (soft grey)
- Accent: `#333333` (dark charcoal)
- Background: `#FFFFFF` (white)
- Text Primary: `#1a1a1a`
- Text Secondary: `#666666`

### Typography
- Headings: `font-serif` (Playfair Display)
- Body: `font-sans` (Inter)

### Breakpoints
- Mobile: < 480px (1 column)
- Tablet: 480-768px (2 columns)
- Desktop: > 768px (3-4 columns)

### Spacing
- Section padding: `py-16 md:py-24`
- Container max-width: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- Card gap: `gap-6 md:gap-8`

## State Management

### Cart Store (Zustand)
```typescript
interface CartState {
  items: CartItem[];
  isOpen: boolean;
  
  // Actions
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  
  // Computed
  totalItems: number;
  subtotal: number;
}
```

## Pages

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Home | Hero carousel, featured products |
| `/shop` | Shop | Product grid with filters |
| `/shop/:category` | Shop | Filtered by category |
| `/product/:id` | Product | Product detail page |
| `/cart` | Cart | Full cart page |
| `/checkout` | Checkout | Multi-step checkout |
| `/order/:orderNumber` | OrderSuccess | Confirmation/lookup |
| `/blog` | Blog | Blog post list |
| `/blog/:slug` | BlogPost | Single blog post |
| `/page/:slug` | Page | Static pages |

## Implementation Phases

### Phase 1: Foundation
1. Project setup (Vite + dependencies)
2. Base UI components
3. Layout components
4. Routing setup

### Phase 2: Product Catalog
1. Product list page
2. Product detail page
3. Category filtering
4. Search functionality

### Phase 3: Cart & Checkout
1. Cart store with persistence
2. Cart drawer component
3. Checkout form
4. Shipping calculation

### Phase 4: Order & Content
1. Order confirmation
2. Order lookup
3. Carousel component
4. Blog/pages integration

### Phase 5: Polish
1. Responsive testing
2. Loading states
3. Error handling
4. Performance optimization

## Environment Variables
```
VITE_API_URL=http://localhost:3000/api/v1
VITE_STRIPE_PUBLIC_KEY=pk_test_...
VITE_APP_NAME=SleekNDChic
VITE_APP_URL=http://localhost:5173
```
