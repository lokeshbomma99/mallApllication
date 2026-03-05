import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingBag, TrendingUp, Star, ArrowRight, Clock, CheckCircle, Truck } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function ShopDashboard() {
  const { user } = useAuth();
  const [shop, setShop] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const shopRes = await api.get('/shops/my');
        setShop(shopRes.data);
        if (shopRes.data?._id) {
          const [analyticsRes, ordersRes] = await Promise.all([
            api.get(`/orders/analytics/${shopRes.data._id}`),
            api.get(`/orders/shop/${shopRes.data._id}?limit=5`),
          ]);
          setAnalytics(analyticsRes.data);
          setRecentOrders(ordersRes.data.orders || []);
        }
      } catch {} finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <div className="space-y-4">{Array(4).fill(0).map((_, i) => <div key={i} className="card h-24 animate-pulse bg-gray-100" />)}</div>;

  if (!shop) return (
    <div className="text-center py-16">
      <ShoppingBag size={48} className="mx-auto text-gray-200 mb-3" />
      <h2 className="text-xl font-bold text-gray-900 mb-2">No shop yet</h2>
      <p className="text-gray-500 mb-4">Set up your shop to start selling on SuperMall.</p>
      <Link to="/shop-owner/setup" className="btn-primary">Set Up My Shop</Link>
    </div>
  );

  if (shop.status === 'pending') return (
    <div className="text-center py-16">
      <Clock size={48} className="mx-auto text-yellow-400 mb-3" />
      <h2 className="text-xl font-bold text-gray-900 mb-2">Shop Under Review</h2>
      <p className="text-gray-500">Your shop <strong>{shop.name}</strong> is being reviewed by our team. We'll notify you once approved.</p>
    </div>
  );

  const statCards = [
    { label: 'Total Revenue', value: `₹${(analytics?.summary?.totalRevenue || 0).toLocaleString()}`, icon: TrendingUp, color: 'text-blue-600 bg-blue-50' },
    { label: 'Total Orders', value: analytics?.summary?.totalOrders || 0, icon: ShoppingBag, color: 'text-green-600 bg-green-50' },
    { label: 'Top Products', value: analytics?.topProducts?.length || 0, icon: Package, color: 'text-orange-500 bg-orange-50' },
    { label: 'Shop Rating', value: shop.rating || 'N/A', icon: Star, color: 'text-yellow-500 bg-yellow-50' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
        <p className="text-gray-500 text-sm mt-1">Here's what's happening with <strong>{shop.name}</strong></p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(s => (
          <div key={s.label} className="card p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color.split(' ')[1]}`}>
              <s.icon size={20} className={s.color.split(' ')[0]} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Recent Orders</h3>
            <Link to="/shop-owner/orders" className="text-xs text-blue-600 hover:underline flex items-center gap-1">View all <ArrowRight size={12} /></Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map(o => (
                <div key={o._id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center"><ShoppingBag size={14} className="text-blue-600" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">#{o._id.slice(-6).toUpperCase()}</p>
                    <p className="text-xs text-gray-400">{o.customer?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">₹{o.total?.toLocaleString()}</p>
                    <span className={`text-xs font-medium ${o.status === 'delivered' ? 'text-green-600' : o.status === 'cancelled' ? 'text-red-500' : 'text-blue-600'}`}>{o.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Top Products</h3>
            <Link to="/shop-owner/products" className="text-xs text-blue-600 hover:underline flex items-center gap-1">Manage <ArrowRight size={12} /></Link>
          </div>
          {!analytics?.topProducts?.length ? (
            <p className="text-gray-400 text-sm text-center py-6">No sales data yet</p>
          ) : (
            <div className="space-y-3">
              {analytics.topProducts.map((p, i) => (
                <div key={p._id} className="flex items-center gap-3">
                  <span className="text-lg font-bold text-gray-200 w-5">#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.totalSold} sold</p>
                  </div>
                  <span className="text-sm font-bold text-blue-600">₹{p.revenue?.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { to: '/shop-owner/products', icon: '📦', label: 'Add Product' },
          { to: '/shop-owner/orders', icon: '🛍️', label: 'View Orders' },
          { to: '/shop-owner/coupons', icon: '🏷️', label: 'Create Coupon' },
          { to: '/shop-owner/analytics', icon: '📊', label: 'Analytics' },
        ].map(a => (
          <Link key={a.to} to={a.to} className="card p-4 text-center hover:shadow-md transition-shadow hover:-translate-y-0.5 transition-transform">
            <span className="text-2xl">{a.icon}</span>
            <p className="text-sm font-medium text-gray-700 mt-1">{a.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
