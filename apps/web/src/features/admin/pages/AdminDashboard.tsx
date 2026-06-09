import {
  Package,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useAdminOrders } from '../hooks/useAdminOrders';
import { useAdminProducts } from '../hooks/useAdminProducts';
import { LoadingSpinner } from '@/shared/components/ui/Loading';
import { Link } from 'react-router-dom';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ElementType;
  href?: string;
}

function StatCard({ title, value, change, changeType = 'neutral', icon: Icon, href }: StatCardProps) {
  const changeColors = {
    positive: 'text-green-600 bg-green-50',
    negative: 'text-red-600 bg-red-50',
    neutral: 'text-gray-600 bg-gray-50',
  };

  const content = (
    <>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className="p-3 bg-[#C08081]/10 rounded-lg">
          <Icon className="w-6 h-6 text-[#C08081]" />
        </div>
      </div>
      {change && (
        <div className={`mt-4 inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm ${changeColors[changeType]}`}>
          {changeType === 'positive' && <ArrowUpRight size={16} />}
          {changeType === 'negative' && <ArrowDownRight size={16} />}
          <span>{change}</span>
        </div>
      )}
    </>
  );

  const className = "bg-white rounded-xl p-6 shadow-sm border border-gray-100";

  if (href) {
    return (
      <Link to={href} className={`${className} hover:shadow-md transition-shadow block`}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}

export function AdminDashboard() {
  const { useOrderStats } = useAdminOrders();
  const { useProducts } = useAdminProducts();
  
  const { data: stats, isLoading: statsLoading } = useOrderStats();
  const { data: productsData, isLoading: productsLoading } = useProducts(1, 100);

  // Calculate low stock products
  const lowStockProducts = productsData?.products?.filter((p: any) => {
    const totalStock = p.variants?.reduce((sum: number, v: any) => sum + v.stockQuantity, 0) || 0;
    return totalStock <= (p.lowStockThreshold || 5);
  }) || [];

  // Calculate recent orders (last 7 days)
  const recentOrders = stats?.recentOrders || [];

  if (statsLoading || productsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of your store performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`₦${(stats?.totalRevenue || 0).toLocaleString()}`}
          change="+12.5%"
          changeType="positive"
          icon={TrendingUp}
        />
        <StatCard
          title="Total Orders"
          value={stats?.totalOrders || 0}
          change="+8.2%"
          changeType="positive"
          icon={ShoppingBag}
          href="/admin/orders"
        />
        <StatCard
          title="Products"
          value={productsData?.total || 0}
          icon={Package}
          href="/admin/products"
        />
        <StatCard
          title="Low Stock Alerts"
          value={lowStockProducts.length}
          change={lowStockProducts.length > 0 ? 'Needs attention' : undefined}
          changeType={lowStockProducts.length > 0 ? 'negative' : 'positive'}
          icon={AlertTriangle}
          href="/admin/products"
        />
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
          <Link 
            to="/admin/orders" 
            className="text-[#C08081] hover:text-[#a66a6b] text-sm font-medium"
          >
            View all →
          </Link>
        </div>
        
        {recentOrders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No recent orders
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentOrders.slice(0, 5).map((order: any) => (
              <div key={order.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <p className="font-medium text-gray-900">{order.orderNumber}</p>
                  <p className="text-sm text-gray-500">{order.customerEmail}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">₦{order.totalAmount.toLocaleString()}</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                    ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' : ''}
                    ${order.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800' : ''}
                    ${order.status === 'PENDING_PAYMENT' ? 'bg-yellow-100 text-yellow-800' : ''}
                    ${order.status === 'SHIPPED' ? 'bg-purple-100 text-purple-800' : ''}
                  `}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Low Stock Products */}
      {lowStockProducts.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Low Stock Alerts</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {lowStockProducts.slice(0, 5).map((product: any) => (
              <div key={product.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  {product.images?.[0] && (
                    <img 
                      src={product.images[0].url} 
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-red-600 font-medium">
                    {product.variants?.reduce((sum: number, v: any) => sum + v.stockQuantity, 0) || 0} in stock
                  </p>
                  <p className="text-xs text-gray-500">Threshold: {product.lowStockThreshold || 5}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
