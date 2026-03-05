// AdminAnalytics.jsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const mockData = {
  monthly: [
    { month: 'Aug', revenue: 45000, orders: 120 }, { month: 'Sep', revenue: 52000, orders: 145 },
    { month: 'Oct', revenue: 48000, orders: 132 }, { month: 'Nov', revenue: 71000, orders: 198 },
    { month: 'Dec', revenue: 95000, orders: 267 }, { month: 'Jan', revenue: 82000, orders: 231 },
  ],
  categories: [
    { name: 'Fashion', value: 35 }, { name: 'Electronics', value: 25 },
    { name: 'Food', value: 18 }, { name: 'Sports', value: 12 }, { name: 'Others', value: 10 },
  ],
  topShops: [
    { name: 'TechZone Store', revenue: 125000 }, { name: 'Fashion Hub', revenue: 98000 },
    { name: 'HomeDecor Plus', revenue: 76000 }, { name: 'Sports Arena', revenue: 65000 }, { name: 'Beauty Bliss', revenue: 54000 },
  ],
};

export function AdminAnalytics() {
  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900">Platform Analytics</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: '₹8.2L', change: '+18%', color: 'bg-blue-50 text-blue-600' },
          { label: 'Total Orders', value: '1,247', change: '+23%', color: 'bg-green-50 text-green-600' },
          { label: 'Active Shops', value: '48', change: '+8%', color: 'bg-orange-50 text-orange-600' },
          { label: 'New Users', value: '392', change: '+12%', color: 'bg-purple-50 text-purple-600' },
        ].map(s => (
          <div key={s.label} className="card p-5">
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
            <span className={`badge mt-2 text-xs ${s.color}`}>{s.change} this month</span>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="card p-5 lg:col-span-2">
          <h3 className="font-semibold text-gray-900 mb-4">Monthly Revenue & Orders</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={mockData.monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar yAxisId="left" dataKey="revenue" fill="#2563eb" radius={[4,4,0,0]} name="Revenue" />
              <Bar yAxisId="right" dataKey="orders" fill="#10b981" radius={[4,4,0,0]} name="Orders" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Sales by Category</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={mockData.categories} dataKey="value" cx="50%" cy="50%" outerRadius={60} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={9}>
                {mockData.categories.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Top Shops by Revenue</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={mockData.topShops} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} />
            <Tooltip formatter={v => [`₹${v.toLocaleString()}`, 'Revenue']} />
            <Bar dataKey="revenue" fill="#2563eb" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// AdminCategories.jsx
import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', icon: '🛍️', description: '' });
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { api.get('/categories').then(r => setCategories(r.data || [])).catch(() => {}); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        const { data } = await api.put(`/categories/${editId}`, form);
        setCategories(cs => cs.map(c => c._id === editId ? data : c));
        toast.success('Updated!');
      } else {
        const { data } = await api.post('/categories', form);
        setCategories(cs => [...cs, data]);
        toast.success('Category created!');
      }
      setShowForm(false); setEditId(null); setForm({ name: '', icon: '🛍️', description: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete category?')) return;
    try { await api.delete(`/categories/${id}`); setCategories(cs => cs.filter(c => c._id !== id)); toast.success('Deleted'); } catch {}
  };

  const openEdit = (cat) => { setEditId(cat._id); setForm({ name: cat.name, icon: cat.icon, description: cat.description }); setShowForm(true); };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ name: '', icon: '🛍️', description: '' }); }} className="btn-primary flex items-center gap-2"><Plus size={16} />Add Category</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-5 grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Icon (emoji)</label>
            <input value={form.icon} onChange={e => setForm(f => ({...f, icon: e.target.value}))} className="input text-2xl" maxLength={2} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Name *</label>
            <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} className="input" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <input value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} className="input" />
          </div>
          <div className="sm:col-span-3 flex gap-3">
            <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className="btn-outline">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : editId ? 'Update' : 'Create'}</button>
          </div>
        </form>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {categories.map(cat => (
          <div key={cat._id} className="card p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
            <span className="text-3xl">{cat.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800">{cat.name}</p>
              <p className="text-xs text-gray-400 truncate">{cat.description}</p>
            </div>
            <div className="flex gap-1">
              <button onClick={() => openEdit(cat)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit2 size={13} /></button>
              <button onClick={() => handleDelete(cat._id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={13} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// AdminBanners.jsx
export function AdminBanners() {
  const [banners, setBanners] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', subtitle: '', image: '', link: '', position: 'hero' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { api.get('/banners').then(r => setBanners(r.data || [])).catch(() => {}); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.post('/banners', form);
      setBanners(bs => [data, ...bs]);
      setShowForm(false); setForm({ title: '', subtitle: '', image: '', link: '', position: 'hero' });
      toast.success('Banner created!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete banner?')) return;
    try { await api.delete(`/banners/${id}`); setBanners(bs => bs.filter(b => b._id !== id)); toast.success('Deleted'); } catch {}
  };

  const toggleActive = async (banner) => {
    try {
      const { data } = await api.put(`/banners/${banner._id}`, { isActive: !banner.isActive });
      setBanners(bs => bs.map(b => b._id === banner._id ? data : b));
    } catch {}
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Banners</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2"><Plus size={16} />Add Banner</button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card p-5 grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Title *</label>
            <input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} className="input" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Subtitle</label>
            <input value={form.subtitle} onChange={e => setForm(f => ({...f, subtitle: e.target.value}))} className="input" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Image URL *</label>
            <input value={form.image} onChange={e => setForm(f => ({...f, image: e.target.value}))} className="input" placeholder="https://..." required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Link URL</label>
            <input value={form.link} onChange={e => setForm(f => ({...f, link: e.target.value}))} className="input" placeholder="/shop?category=..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Position</label>
            <select value={form.position} onChange={e => setForm(f => ({...f, position: e.target.value}))} className="input">
              <option value="hero">Hero</option><option value="middle">Middle</option><option value="bottom">Bottom</option>
            </select>
          </div>
          <div className="sm:col-span-2 flex gap-3">
            <button type="button" onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Creating...' : 'Create Banner'}</button>
          </div>
        </form>
      )}

      {banners.length === 0 ? (
        <div className="card p-12 text-center text-gray-400"><p>No banners yet.</p></div>
      ) : (
        <div className="space-y-4">
          {banners.map(b => (
            <div key={b._id} className="card p-4 flex items-center gap-4">
              <div className="w-24 h-14 rounded-lg overflow-hidden bg-gray-50 shrink-0">
                {b.image && <img src={b.image} alt={b.title} className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800">{b.title}</p>
                <p className="text-xs text-gray-500">{b.subtitle}</p>
                <span className="badge bg-gray-100 text-gray-600 text-xs mt-1">{b.position}</span>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => toggleActive(b)} className={`w-10 h-6 rounded-full transition-colors ${b.isActive ? 'bg-green-400' : 'bg-gray-200'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mx-1 ${b.isActive ? 'translate-x-4' : ''}`} />
                </button>
                <button onClick={() => handleDelete(b._id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminAnalytics;
