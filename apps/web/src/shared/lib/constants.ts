export const APP_NAME = import.meta.env.VITE_APP_NAME || 'SleekNDChic';
export const APP_URL = import.meta.env.VITE_APP_URL || 'http://localhost:5173';

export const DEFAULT_PAGE_SIZE = 24;

export const ORDER_STATUSES = {
  PENDING_PAYMENT: 'pending_payment',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

export const PAYMENT_METHODS = {
  CARD: 'card',
  BANK_TRANSFER: 'bank_transfer',
} as const;

export const SHIPPING_METHODS = {
  AUTHORIZED_CAR_PARK: 'Authorized Car Park',
  DELIVERY_COMPANY: 'Delivery Company',
} as const;

export const NAV_LINKS = [
  { name: 'Home', href: '/' },
  { name: 'Shop', href: '/shop' },
  { name: 'Blog', href: '/blog' },
  { name: 'About', href: '/page/about' },
  { name: 'Contact', href: '/page/contact' },
] as const;

export const BREAKPOINTS = {
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;
