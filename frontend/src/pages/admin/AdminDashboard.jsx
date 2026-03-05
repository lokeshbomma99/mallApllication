import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Store, ShoppingBag, TrendingUp, CheckCircle, XCircle, Package, Star, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../../utils/api';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [revenue, setRevenue] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  const [pendingShops, setPendingShops] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, revenueRes, catRes, shopsRes, usersRes, ordersRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/revenue'),
          api.get('/admin/category-stats'),
          api.get('/shops?status=pending&limit=5'),
          api.get('/users?limit=6'),
          api.get('/admin/recent-orders'),
        ]);
        setStats(statsRes.data);
        setRevenue(revenueRes.data);
        setCategoryStats(catRes.data);
        setPendingShops(shopsRes.data.shops || []);
        setRecentUsers(usersRes.data.users || []);
        setRecentOrders(ordersRes.data || []);
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally { setLoading(false); }
    };
    load();
  }, []);

  const handleApprove = async (shopId) => {
    try {
      await api.put(`/shops/${shopId}/approve`);
      setPendingShops(s => s.filter(x => x._id !== shopId));
      setStats(s => s ? { ...s, pendingShops: s.pendingShops - 1 } : s);
    } catch {}
  };

  const handleReject = async (shopId) => {
    try {
      await api.put(`/shops/${shopId}/reject`, { reason: 'Does not meet requirements' });
      setPendingShops(s => s.filter(x => x._id !== shopId));
    } catch {}
  };

  if (loading) return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{Array(4).fill(0).map((_, i) => <div key={i} className="card h-28 bg-gray-100" />)}</div>
      <div className="grid lg:grid-cols-3 gap-6"><div className="card h-64 bg-gray-100 lg:col-span-2" /><div className="card h-64 bg-gray-100" /></div>
    </div>
  );

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers?.toLocaleString() || '0', icon: Users, color: 'text-blue-600 bg-blue-50', growth: stats?.growth?.users, sub: 'registered users' },
    { label: 'Active Shops', value: stats?.totalShops?.toLocaleString() || '0', icon: Store, color: 'text-green-600 bg-green-50', sub: `${stats?.pendingShops || 0} pending` },
    { label: 'Total Orders', value: stats?.totalOrders?.toLocaleString() || '0', icon: ShoppingBag, color: 'text-orange-500 bg-orange-50', growth: stats?.growth?.orders, sub: 'all time' },
    { label: 'Total Revenue', value: `₹${((stats?.totalRevenue || 0) / 1000).toFixed(1)}K`, icon: TrendingUp, color: 'text-purple-600 bg-purple-50', sub: 'platform revenue' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Live platform overview — all data from your database</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(s => (
          <div key={s.label} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2.5 rounded-xl ${s.color.split(' ')[1]}`}>
                <s.icon size={20} className={s.color.split(' ')[0]} />
              </div>
              {s.growth !== undefined && (
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${Number(s.growth) >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                  {Number(s.growth) >= 0 ? '+' : ''}{s.growth}%
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="card p-5 lg:col-span-2">
          <h3 className="font-semibold text-gray-900 mb-1">Revenue & Orders — Last 6 Months</h3>
          <p className="text-xs text-gray-400 mb-4">Real data from your orders collection</p>
          {revenue.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-gray-400 text-sm">No order data yet. Place some orders to see the chart.</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={revenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(v, name) => [name === 'revenue' ? `₹${v.toLocaleString()}` : v, name === 'revenue' ? 'Revenue' : 'Orders']} />
                <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 4 }} name="revenue" />
                <Line type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} name="orders" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-1">Sales by Category</h3>
          <p className="text-xs text-gray-400 mb-4">Based on actual orders</p>
          {categoryStats.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-gray-400 text-sm text-center">No sales data yet.</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie data={categoryStats} dataKey="value" cx="50%" cy="50%" outerRadius={60} labelLine={false}>
                    {categoryStats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v, name, props) => [v, props.payload.name]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1 mt-2">
                {categoryStats.slice(0, 5).map((c, i) => (
                  <div key={c.name} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-xs text-gray-600 flex-1 truncate">{c.name}</span>
                    <span className="text-xs font-medium text-gray-800">{c.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Pending Shops */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Pending Approvals</h3>
            {pendingShops.length > 0 && <span className="badge bg-orange-100 text-orange-700">{pendingShops.length}</span>}
          </div>
          {pendingShops.length === 0 ? (
            <div className="text-center py-6 text-gray-400">
              <CheckCircle size={32} className="mx-auto mb-2 text-green-400" />
              <p className="text-sm">All caught up!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingShops.map(shop => (
                <div key={shop._id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-800 truncate">{shop.name}</p>
                    <p className="text-xs text-gray-500">{shop.category}</p>
                  </div>
                  <button onClick={() => handleApprove(shop._id)} className="p-1.5 bg-green-100 text-green-600 hover:bg-green-200 rounded-lg transition-colors"><CheckCircle size={13} /></button>
                  <button onClick={() => handleReject(shop._id)} className="p-1.5 bg-red-100 text-red-500 hover:bg-red-200 rounded-lg transition-colors"><XCircle size={13} /></button>
                </div>
              ))}
              <Link to="/admin/shops" className="text-xs text-blue-600 hover:underline block text-center mt-2">View all shops →</Link>
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Recent Orders</h3>
            <Link to="/admin/analytics" className="text-xs text-blue-600 hover:underline">View all</Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="text-center py-6 text-gray-400"><ShoppingBag size={32} className="mx-auto mb-2 opacity-30" /><p className="text-sm">No orders yet</p></div>
          ) : (
            <div className="space-y-3">
              {recentOrders.slice(0, 5).map(o => (
                <div key={o._id} className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center shrink-0"><ShoppingBag size={12} className="text-blue-600" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800">#{o._id.slice(-6).toUpperCase()}</p>
                    <p className="text-xs text-gray-400 truncate">{o.customer?.name}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-gray-900">₹{o.total?.toLocaleString()}</p>
                    <span className={`text-xs ${o.status === 'delivered' ? 'text-green-500' : o.status === 'cancelled' ? 'text-red-400' : 'text-blue-500'}`}>{o.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Users */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Recent Users</h3>
            <Link to="/admin/users" className="text-xs text-blue-600 hover:underline">View all</Link>
          </div>
          {recentUsers.length === 0 ? (
            <div className="text-center py-6 text-gray-400"><Users size={32} className="mx-auto mb-2 opacity-30" /><p className="text-sm">No users yet</p></div>
          ) : (
            <div className="space-y-2">
              {recentUsers.map(u => (
                <div key={u._id} className="flex items-center gap-2 p-1.5">
                  <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-xs shrink-0">{u.name?.charAt(0).toUpperCase()}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate">{u.name}</p>
                    <p className="text-xs text-gray-400 truncate">{u.email}</p>
                  </div>
                  <span className={`badge text-xs ${u.role === 'admin' ? 'bg-red-100 text-red-700' : u.role === 'shopowner' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{u.role}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
