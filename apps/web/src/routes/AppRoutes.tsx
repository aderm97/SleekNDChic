import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from '@/shared/components/layout';
import { LoadingSpinner } from '@/shared/components/ui';

// Lazy-loaded public pages
const Home = lazy(() => import('@/pages/Home').then(m => ({ default: m.Home })));
const Shop = lazy(() => import('@/pages/Shop').then(m => ({ default: m.Shop })));
const Product = lazy(() => import('@/pages/Product').then(m => ({ default: m.Product })));
const Cart = lazy(() => import('@/pages/Cart').then(m => ({ default: m.Cart })));
const Checkout = lazy(() => import('@/pages/Checkout').then(m => ({ default: m.Checkout })));
const OrderSuccess = lazy(() => import('@/pages/OrderSuccess').then(m => ({ default: m.OrderSuccess })));
const Blog = lazy(() => import('@/pages/Blog').then(m => ({ default: m.Blog })));
const BlogPost = lazy(() => import('@/pages/BlogPost').then(m => ({ default: m.BlogPost })));
const Page = lazy(() => import('@/pages/Page').then(m => ({ default: m.Page })));
const NotFound = lazy(() => import('@/pages/NotFound').then(m => ({ default: m.NotFound })));
const PaymentVerify = lazy(() => import('@/pages/PaymentVerify').then(m => ({ default: m.PaymentVerify })));

// Lazy-loaded admin pages (heavy — charts, tables, etc.)
const AdminLogin = lazy(() => import('@/features/admin/pages/AdminLogin').then(m => ({ default: m.AdminLogin })));
const AdminDashboard = lazy(() => import('@/features/admin/pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminProducts = lazy(() => import('@/features/admin/pages/AdminProducts').then(m => ({ default: m.AdminProducts })));
const AdminOrders = lazy(() => import('@/features/admin/pages/AdminOrders').then(m => ({ default: m.AdminOrders })));
const AdminShipping = lazy(() => import('@/features/admin/pages/AdminShipping').then(m => ({ default: m.AdminShipping })));
const Analytics = lazy(() => import('@/features/admin/pages/Analytics').then(m => ({ default: m.Analytics })));

// Admin layout and guard (small, loaded inline)
const AdminLayoutLazy = lazy(() => import('@/features/admin/components/AdminLayout').then(m => ({ default: m.AdminLayout })));
const ProtectedAdminRouteLazy = lazy(() => import('@/features/admin/components/ProtectedAdminRoute').then(m => ({ default: m.ProtectedAdminRoute })));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <LoadingSpinner size="lg" />
    </div>
  );
}

export function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="shop" element={<Shop />} />
          <Route path="shop/:category" element={<Shop />} />
          <Route path="product/:id" element={<Product />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="order/:orderNumber" element={<OrderSuccess />} />
          <Route path="payment/verify" element={<PaymentVerify />} />
          <Route path="blog" element={<Blog />} />
          <Route path="blog/:slug" element={<BlogPost />} />
          <Route path="page/:slug" element={<Page />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <ProtectedAdminRouteLazy>
              <AdminLayoutLazy />
            </ProtectedAdminRouteLazy>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="orders/:orderNumber" element={<AdminOrders />} />
          <Route path="shipping" element={<AdminShipping />} />
          <Route path="analytics" element={<Analytics />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
