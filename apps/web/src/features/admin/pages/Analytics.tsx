import { useState } from 'react';
import { Calendar, TrendingUp, Package, Users, CreditCard } from 'lucide-react';
import { useAdminAnalytics, type DateRange } from '../hooks/useAdminAnalytics';
import { RevenueChart, CategoryChart, StatusChart } from '../components/analytics';
import { LoadingSpinner } from '@/shared/components/ui/Loading';

export function Analytics() {
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    };
  });

  const { 
    useDashboardStats, 
    useRevenueTrends, 
    useSalesByCategory,
    useTopProducts,
    useOrderStatusDistribution,
    usePaymentMethodDistribution,
  } = useAdminAnalytics();

  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: revenueData, isLoading: revenueLoading } = useRevenueTrends(dateRange);
  const { data: categoryData, isLoading: categoryLoading } = useSalesByCategory(dateRange);
  const { data: topProducts, isLoading: productsLoading } = useTopProducts(5, dateRange);
  const { data: statusData, isLoading: statusLoading } = useOrderStatusDistribution(dateRange);
  const { data: paymentData, isLoading: paymentLoading } = usePaymentMethodDistribution(dateRange);

  const isLoading = statsLoading || revenueLoading || categoryLoading || 
                    productsLoading || statusLoading || paymentLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const formatCurrency = (value: number) => `₦${value.toLocaleString()}`;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">Detailed insights into your store performance</p>
        </div>
        
        {/* Date Range Filter */}
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200">
          <Calendar className="w-4 h-4 text-gray-400" />
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
            className="text-sm border-none focus:ring-0 p-0"
          />
          <span className="text-gray-400">-</span>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
            className="text-sm border-none focus:ring-0 p-0"
          />
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#C08081]/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-[#C08081]" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(stats?.totalRevenue || 0)}</p>
              <p className={`text-xs ${(stats?.revenueChange || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {(stats?.revenueChange || 0) >= 0 ? '+' : ''}{stats?.revenueChange || 0}% vs last period
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-xl font-bold text-gray-900">{stats?.totalOrders || 0}</p>
              <p className="text-xs text-gray-500">{stats?.pendingOrders || 0} pending</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Unique Customers</p>
              <p className="text-xl font-bold text-gray-900">{stats?.uniqueCustomers || 0}</p>
              <p className="text-xs text-gray-500">In selected period</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-50 rounded-lg">
              <CreditCard className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Today's Orders</p>
              <p className="text-xl font-bold text-gray-900">{stats?.todayOrders || 0}</p>
              <p className="text-xs text-gray-500">New orders today</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
          {revenueData && <RevenueChart data={revenueData} />}
        </div>

        {/* Sales by Category */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales by Category</h3>
          {categoryData && <CategoryChart data={categoryData} />}
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status</h3>
          {statusData && <StatusChart data={statusData} />}
        </div>
      </div>

      {/* Top Products Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Top Selling Products</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity Sold
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Sales
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {topProducts?.map((product, index) => (
                <tr key={product.productId} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400 font-medium w-6">#{index + 1}</span>
                      {product.image && (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      )}
                      <span className="font-medium text-gray-900">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-gray-600">
                    {product.totalQuantity}
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-gray-900">
                    {formatCurrency(product.totalSales)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {paymentData?.map((method) => (
              <div key={method.method} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    method.method === 'CARD' ? 'bg-blue-500' : 'bg-green-500'
                  }`} />
                  <span className="text-gray-700">
                    {method.method === 'CARD' ? 'Card Payment' : 'Bank Transfer'}
                  </span>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{formatCurrency(method.revenue)}</p>
                  <p className="text-sm text-gray-500">{method.count} orders</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
