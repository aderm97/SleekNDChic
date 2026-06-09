// Product Types
export interface Product {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  sku: string;
  categoryId: string;
  category?: Category;
  lowStockThreshold: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  images: ProductImage[];
  variants: Variant[];
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  altText?: string;
  displayOrder: number;
}

export interface Variant {
  id: string;
  productId: string;
  size?: string;
  color?: string;
  skuSuffix?: string;
  stockQuantity: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  stockStatus?: 'in_stock' | 'low_stock' | 'out_of_stock';
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// Cart Types
export interface CartItem {
  id: string;
  variantId: string;
  productId: string;
  product: Product;
  variant: Variant;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  discountAmount: number;
  total: number;
}

// Order Types
export interface Order {
  id: string;
  orderNumber: string;
  channel: 'website' | 'pos' | 'social_media';
  customerEmail: string;
  customerPhone?: string;
  shippingAddress: ShippingAddress;
  stateName: string;
  status: OrderStatus;
  subtotal: number;
  tax: number;
  shippingCost: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: 'card' | 'bank_transfer';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentTransactionId?: string;
  needsShippingReview: boolean;
  couponId?: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

export type OrderStatus = 
  | 'pending_payment' 
  | 'processing' 
  | 'shipped' 
  | 'delivered' 
  | 'cancelled';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId: string;
  product: Product;
  variant: Variant;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ShippingAddress {
  state: string;
  city: string;
  street: string;
  zip: string;
  country: string;
}

export interface CreateOrderInput {
  email: string;
  phone?: string;
  address: ShippingAddress;
  paymentMethod: 'card' | 'bank_transfer';
  couponCode?: string;
}

// Shipping Types
export interface StateShipping {
  id: string;
  stateName: string;
  shippingMethod: 'Authorized Car Park' | 'Delivery Company';
  price: number;
  active: boolean;
}

// Coupon Types
export interface Coupon {
  id: string;
  code: string;
  type: 'fixed' | 'percentage';
  value: number;
  minOrderAmount: number;
  usageLimit?: number;
  usedCount: number;
  startsAt?: string;
  endsAt?: string;
  active: boolean;
}

// Content Types
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  contentHtml: string;
  excerpt?: string;
  featuredImageUrl?: string;
  publishedAt?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  contentHtml: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CarouselItem {
  id: string;
  imageUrl: string;
  targetUrl?: string;
  altText?: string;
  displayOrder: number;
  active: boolean;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

// Filter Types
export interface ProductFilters {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}
