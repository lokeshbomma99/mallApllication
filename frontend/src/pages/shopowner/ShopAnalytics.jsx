import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Package, ShoppingBag, Star, DollarSign } from 'lucide-react';
import api from '../../utils/api';

export default function ShopAnalytics() {
  const [shop, setShop] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const shopRes = await api.get('/shops/my');
        setShop(shopRes.data);
        if (shopRes.data?._id) {
          const res = await api.get(`/orders/analytics/${shopRes.data._id}`);
          setAnalytics(res.data);
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{Array(4).fill(0).map((_, i) => <div key={i} className="card h-28 bg-gray-100" />)}</div>
      {Array(2).fill(0).map((_, i) => <div key={i} className="card h-56 bg-gray-100" />)}
    </div>
  );

  if (!shop) return (
    <div className="card p-12 text-center text-gray-400">
      <TrendingUp size={40} className="mx-auto mb-3 opacity-30" />
      <p>Set up your shop first to view analytics.</p>
    </div>
  );

  const revenueData = analytics?.recentOrders?.map(r => ({
    date: r._id?.slice(5) || r._id,
    revenue: Math.round(r.revenue || 0),
    orders: r.count || 0,
  })) || [];

  const avgOrderValue = analytics?.summary?.totalOrders
    ? Math.round(analytics.summary.totalRevenue / analytics.summary.totalOrders)
    : 0;

  const noData = (msg) => (
    <div className="h-40 flex items-center justify-center text-sm text-gray-400 text-center px-4">{msg}</div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Shop Analytics</h1>
        <p className="text-sm text-gray-500 mt-0.5">Real-time data for <strong>{shop.name}</strong></p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: `₹${(analytics?.summary?.totalRevenue || 0).toLocaleString()}`, icon: TrendingUp, color: 'text-blue-600 bg-blue-50' },
          { label: 'Total Orders', value: (analytics?.summary?.totalOrders || 0).toLocaleString(), icon: ShoppingBag, color: 'text-green-600 bg-green-50' },
          { label: 'Avg Order Value', value: avgOrderValue ? `₹${avgOrderValue.toLocaleString()}` : '—', icon: DollarSign, color: 'text-orange-500 bg-orange-50' },
          { label: 'Shop Rating', value: shop.rating ? `${shop.rating} ★` : 'No ratings', icon: Star, color: 'text-yellow-500 bg-yellow-50' },
        ].map(s => (
          <div key={s.label} className="card p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color.split(' ')[1]}`}>
              <s.icon size={18} className={s.color.split(' ')[0]} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Revenue Over Time */}
      <div className="card p-5">
        <h3 className="font-semibold text-gray-900 mb-1">Revenue & Orders — Last 30 Days</h3>
        <p className="text-xs text-gray-400 mb-4">From your shop's orders only</p>
        {revenueData.length === 0
          ? noData('No orders yet. Revenue chart will appear once customers place orders.')
          : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}K`} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v, name) => [name === 'revenue' ? `₹${v.toLocaleString()}` : v, name === 'revenue' ? 'Revenue' : 'Orders']} />
                <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3 }} name="revenue" />
                <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={2} dot={{ r: 2 }} name="orders" />
              </LineChart>
            </ResponsiveContainer>
          )}
      </div>

      {/* Top Products */}
      <div className="card p-5">
        <h3 className="font-semibold text-gray-900 mb-1">Top Products by Sales</h3>
        <p className="text-xs text-gray-400 mb-4">Your best selling products</p>
        {!analytics?.topProducts?.length
          ? noData('No product sales yet.')
          : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={analytics.topProducts} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={130} />
                  <Tooltip formatter={(v, name) => [name === 'totalSold' ? `${v} units` : `₹${v.toLocaleString()}`, name === 'totalSold' ? 'Units Sold' : 'Revenue']} />
                  <Bar dataKey="totalSold" fill="#2563eb" radius={[0, 4, 4, 0]} name="totalSold" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {analytics.topProducts.map((p, i) => (
                  <div key={p._id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-xl">
                    <span className="text-sm font-bold text-gray-300 w-5">#{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.totalSold} units sold</p>
                    </div>
                    <span className="text-sm font-bold text-blue-600">₹{(p.revenue || 0).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </>
          )}
      </div>
    </div>
  );
}
