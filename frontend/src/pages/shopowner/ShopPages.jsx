// ShopSetup.jsx
import { useState, useEffect } from 'react';
import { Store, Loader } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['Fashion', 'Electronics', 'Home & Garden', 'Sports', 'Beauty', 'Books', 'Toys', 'Food', 'Jewelry', 'Automotive'];

export function ShopSetup() {
  const [shop, setShop] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', category: 'Electronics', phone: '', email: '', address: '' });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/shops/my').then(r => {
      setShop(r.data);
      if (r.data) setForm({ name: r.data.name, description: r.data.description, category: r.data.category, phone: r.data.phone, email: r.data.email, address: r.data.address });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (shop) {
        const { data } = await api.put(`/shops/${shop._id}`, form);
        setShop(data); toast.success('Shop updated!');
      } else {
        const { data } = await api.post('/shops', form);
        setShop(data); toast.success('Shop created! Awaiting admin approval.');
      }
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="card h-64 animate-pulse bg-gray-100" />;

  return (
    <div className="max-w-2xl space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{shop ? 'Shop Settings' : 'Set Up Your Shop'}</h1>
        {shop && <div className={`inline-flex items-center gap-1.5 mt-2 badge ${shop.status === 'approved' ? 'bg-green-100 text-green-700' : shop.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>Status: {shop.status}</div>}
      </div>
      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        {[
          { label: 'Shop Name *', key: 'name', type: 'text' },
          { label: 'Email', key: 'email', type: 'email' },
          { label: 'Phone', key: 'phone', type: 'tel' },
          { label: 'Address', key: 'address', type: 'text' },
        ].map(f => (
          <div key={f.key}>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{f.label}</label>
            <input type={f.type} value={form[f.key]} onChange={e => setForm(x => ({...x, [f.key]: e.target.value}))} className="input" required={f.label.includes('*')} />
          </div>
        ))}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Category *</label>
          <select value={form.category} onChange={e => setForm(x => ({...x, category: e.target.value}))} className="input">
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
          <textarea value={form.description} onChange={e => setForm(x => ({...x, description: e.target.value}))} className="input h-24 resize-none" />
        </div>
        <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
          {saving ? <><Loader size={14} className="animate-spin" />Saving...</> : <><Store size={14} />{shop ? 'Update Shop' : 'Create Shop'}</>}
        </button>
      </form>
    </div>
  );
}

// ShopCoupons.jsx
import { Tag, Plus, Trash2 } from 'lucide-react';

export function ShopCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: '', type: 'percentage', value: '', minOrder: '', maxDiscount: '', expiresAt: '', usageLimit: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/coupons').then(r => setCoupons(r.data || [])).catch(() => {});
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.post('/coupons', form);
      setCoupons(c => [data, ...c]);
      setShowForm(false);
      setForm({ code: '', type: 'percentage', value: '', minOrder: '', maxDiscount: '', expiresAt: '', usageLimit: '' });
      toast.success('Coupon created!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2"><Plus size={16} />New Coupon</button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card p-5 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Code *</label>
              <input value={form.code} onChange={e => setForm(f => ({...f, code: e.target.value.toUpperCase()}))} className="input" placeholder="SUMMER20" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Type</label>
              <select value={form.type} onChange={e => setForm(f => ({...f, type: e.target.value}))} className="input">
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Value *</label>
              <input type="number" value={form.value} onChange={e => setForm(f => ({...f, value: e.target.value}))} className="input" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Min Order (₹)</label>
              <input type="number" value={form.minOrder} onChange={e => setForm(f => ({...f, minOrder: e.target.value}))} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Max Discount (₹)</label>
              <input type="number" value={form.maxDiscount} onChange={e => setForm(f => ({...f, maxDiscount: e.target.value}))} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Usage Limit</label>
              <input type="number" value={form.usageLimit} onChange={e => setForm(f => ({...f, usageLimit: e.target.value}))} className="input" placeholder="Unlimited" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Expires At *</label>
              <input type="date" value={form.expiresAt} onChange={e => setForm(f => ({...f, expiresAt: e.target.value}))} className="input" required />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setShowForm(false)} className="btn-outline flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Creating...' : 'Create Coupon'}</button>
          </div>
        </form>
      )}

      {coupons.length === 0 ? (
        <div className="card p-12 text-center text-gray-400"><Tag size={40} className="mx-auto mb-2 opacity-30" /><p>No coupons yet.</p></div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {coupons.map(c => (
            <div key={c._id} className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-blue-700 text-lg tracking-wider">{c.code}</span>
                <span className={`badge ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{c.isActive ? 'Active' : 'Inactive'}</span>
              </div>
              <p className="text-sm text-gray-700">{c.type === 'percentage' ? `${c.value}% off` : `₹${c.value} off`}{c.minOrder ? ` on orders ₹${c.minOrder}+` : ''}</p>
              <p className="text-xs text-gray-400 mt-1">Expires: {new Date(c.expiresAt).toLocaleDateString()} • Used: {c.usedCount}/{c.usageLimit || '∞'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ShopReturns.jsx
export function ShopReturns() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/shops/my').then(r => {
      if (r.data?._id) return api.get(`/returns/shop/${r.data._id}`);
    }).then(r => setReturns(r?.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const updateReturn = async (id, status, refundAmount) => {
    try {
      await api.put(`/returns/${id}`, { status, refundAmount });
      setReturns(rs => rs.map(r => r._id === id ? { ...r, status } : r));
      toast.success('Return updated!');
    } catch {}
  };

  if (loading) return <div className="space-y-3">{Array(3).fill(0).map((_, i) => <div key={i} className="card h-20 animate-pulse bg-gray-100" />)}</div>;

  return (
    <div className="space-y-5 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900">Return Requests</h1>
      {returns.length === 0 ? (
        <div className="card p-12 text-center text-gray-400"><p>No return requests yet. 🎉</p></div>
      ) : (
        <div className="space-y-4">
          {returns.map(r => (
            <div key={r._id} className="card p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-800">Order #{r.order?._id?.slice(-6).toUpperCase()}</p>
                  <p className="text-sm text-gray-500">By: {r.customer?.name} • {new Date(r.createdAt).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-700 mt-1"><span className="font-medium">Reason:</span> {r.reason}</p>
                </div>
                <span className={`badge shrink-0 ${r.status === 'approved' ? 'bg-green-100 text-green-700' : r.status === 'rejected' ? 'bg-red-100 text-red-700' : r.status === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>{r.status}</span>
              </div>
              {r.status === 'pending' && (
                <div className="flex gap-2 mt-3">
                  <button onClick={() => updateReturn(r._id, 'approved', r.order?.total || 0)} className="px-4 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors">Approve</button>
                  <button onClick={() => updateReturn(r._id, 'rejected', 0)} className="px-4 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors">Reject</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ShopSetup;
