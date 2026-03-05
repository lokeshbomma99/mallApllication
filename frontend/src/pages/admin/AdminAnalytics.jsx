import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, Users, ShoppingBag, Store } from 'lucide-react';
import api from '../../utils/api';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];

export default function AdminAnalytics() {
  const [stats, setStats] = useState(null);
  const [revenue, setRevenue] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  const [topShops, setTopShops] = useState([]);
  const [userGrowth, setUserGrowth] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, revenueRes, catRes, shopsRes, growthRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/revenue'),
          api.get('/admin/category-stats'),
          api.get('/admin/top-shops'),
          api.get('/admin/user-growth'),
        ]);
        setStats(statsRes.data);
        setRevenue(revenueRes.data);
        setCategoryStats(catRes.data);
        setTopShops(shopsRes.data);
        setUserGrowth(growthRes.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{Array(4).fill(0).map((_, i) => <div key={i} className="card h-28 bg-gray-100" />)}</div>
      {Array(3).fill(0).map((_, i) => <div key={i} className="card h-56 bg-gray-100" />)}
    </div>
  );

  const noData = (msg) => (
    <div className="h-40 flex items-center justify-center text-sm text-gray-400 text-center">{msg}</div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Analytics</h1>
        <p className="text-xs text-gray-400 mt-1">All data pulled live from your database</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: `₹${((stats?.totalRevenue || 0) / 1000).toFixed(1)}K`, icon: TrendingUp, color: 'text-blue-600 bg-blue-50', growth: stats?.growth?.orders },
          { label: 'Total Orders', value: (stats?.totalOrders || 0).toLocaleString(), icon: ShoppingBag, color: 'text-green-600 bg-green-50', growth: stats?.growth?.orders },
          { label: 'Active Shops', value: (stats?.totalShops || 0).toLocaleString(), icon: Store, color: 'text-orange-500 bg-orange-50' },
          { label: 'Total Users', value: (stats?.totalUsers || 0).toLocaleString(), icon: Users, color: 'text-purple-600 bg-purple-50', growth: stats?.growth?.users },
        ].map(s => (
          <div key={s.label} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2.5 rounded-xl ${s.color.split(' ')[1]}`}><s.icon size={18} className={s.color.split(' ')[0]} /></div>
              {s.growth !== undefined && <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${Number(s.growth) >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>{Number(s.growth) >= 0 ? '+' : ''}{s.growth}% this month</span>}
            </div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-sm text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="card p-5">
        <h3 className="font-semibold text-gray-900 mb-1">Monthly Revenue & Orders</h3>
        <p className="text-xs text-gray-400 mb-4">Last 6 months — from orders collection</p>
        {revenue.length === 0 ? noData('No orders yet. Revenue chart will appear once orders are placed.') : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={revenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}K`} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v, name) => [name === 'revenue' ? `₹${v.toLocaleString()}` : v, name === 'revenue' ? 'Revenue' : 'Orders']} />
              <Bar yAxisId="left" dataKey="revenue" fill="#2563eb" radius={[4, 4, 0, 0]} name="revenue" />
              <Bar yAxisId="right" dataKey="orders" fill="#10b981" radius={[4, 4, 0, 0]} name="orders" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Category Sales */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-1">Sales by Category</h3>
          <p className="text-xs text-gray-400 mb-4">Units sold per category</p>
          {categoryStats.length === 0 ? noData('No sales data yet.') : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={categoryStats} dataKey="value" cx="50%" cy="50%" outerRadius={70} labelLine={false}>
                    {categoryStats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v, name, props) => [v + ' units', props.payload.name]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-1 mt-2">
                {categoryStats.slice(0, 6).map((c, i) => (
                  <div key={c.name} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-xs text-gray-600 truncate">{c.name}</span>
                    <span className="text-xs font-medium text-gray-800 ml-auto">{c.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Top Shops */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-1">Top Shops by Revenue</h3>
          <p className="text-xs text-gray-400 mb-4">Based on completed orders</p>
          {topShops.length === 0 ? noData('No shop revenue data yet.') : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topShops} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}K`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
                <Tooltip formatter={v => [`₹${v.toLocaleString()}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#2563eb" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* User Growth */}
      <div className="card p-5">
        <h3 className="font-semibold text-gray-900 mb-1">New User Registrations</h3>
        <p className="text-xs text-gray-400 mb-4">Last 30 days</p>
        {userGrowth.length === 0 ? noData('No new users registered in last 30 days.') : (
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={userGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip formatter={v => [v, 'New Users']} />
              <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
