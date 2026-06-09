import { Router } from 'express';
import {
  getAdminOrders,
  getAdminOrder,
  updateAdminOrder,
  getAdminOrderStats,
  getAdminShipping,
  updateAdminShipping,
  bulkUpdateAdminShipping,
  getAdminProducts,
  getAdminProduct,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  toggleAdminProduct,
  updateAdminVariant,
} from './admin.controller';
import { authenticate, requireAdmin } from '@/modules/auth/auth.middleware';

const router = Router();

// All admin routes require admin authentication
router.use(authenticate, requireAdmin);

// Order routes
router.get('/orders', getAdminOrders);
router.get('/orders/stats', getAdminOrderStats);
router.get('/orders/:orderNumber', getAdminOrder);
router.patch('/orders/:orderNumber', updateAdminOrder);

// Shipping routes
router.get('/shipping', getAdminShipping);
router.patch('/shipping/bulk', bulkUpdateAdminShipping);
router.patch('/shipping/:id', updateAdminShipping);

// Product routes
router.get('/products', getAdminProducts);
router.post('/products', createAdminProduct);
router.get('/products/:id', getAdminProduct);
router.patch('/products/:id', updateAdminProduct);
router.delete('/products/:id', deleteAdminProduct);
router.patch('/products/:id/toggle', toggleAdminProduct);

// Variant routes
router.patch('/variants/:id', updateAdminVariant);

export default router;
