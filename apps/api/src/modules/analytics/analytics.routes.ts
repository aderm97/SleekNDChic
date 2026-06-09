import { Router } from 'express';
import {
  getRevenueTrends,
  getSalesByCategory,
  getTopProducts,
  getOrderStatusDistribution,
  getPaymentMethodDistribution,
  getDashboardStats,
} from './analytics.controller';
import { authenticate, requireAdmin } from '@/modules/auth/auth.middleware';

const router = Router();

// All analytics routes require admin authentication
router.use(authenticate, requireAdmin);

// Dashboard overview
router.get('/dashboard', getDashboardStats);

// Revenue analytics
router.get('/revenue-trends', getRevenueTrends);

// Sales analytics
router.get('/sales-by-category', getSalesByCategory);

// Product analytics
router.get('/top-products', getTopProducts);

// Order analytics
router.get('/order-status', getOrderStatusDistribution);

// Payment analytics
router.get('/payment-methods', getPaymentMethodDistribution);

export default router;
