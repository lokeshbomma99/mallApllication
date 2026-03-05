import { useState, useEffect } from 'react';
import { Plus, Tag, Trash2, Copy } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function ShopCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ code: '', type: 'percentage', value: '', minOrder: '', maxDiscount: '', expiresAt: '', usageLimit: '' });

  useEffect(() => {
    api.get('/coupons').then(r => setCoupons(r.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.post('/coupons', {
        ...form,
        value: Number(form.value),
        minOrder: form.minOrder ? Number(form.minOrder) : 0,
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
      });
      setCoupons(c => [data, ...c]);
      setShowForm(false);
      setForm({ code: '', type: 'percentage', value: '', minOrder: '', maxDiscount: '', expiresAt: '', usageLimit: '' });
      toast.success('Coupon created!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this coupon?')) return;
    try { await api.delete(`/coupons/${id}`); setCoupons(c => c.filter(x => x._id !== id)); toast.success('Deleted'); }
    catch { toast.error('Failed'); }
  };

  const copyCode = (code) => { navigator.clipboard.writeText(code); toast.success(`Copied: ${code}`); };

  const isExpired = (date) => new Date(date) < new Date();

  if (loading) return <div className="space-y-3">{Array(3).fill(0).map((_, i) => <div key={i} className="card h-24 animate-pulse bg-gray-100" />)}</div>;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coupons & Discounts</h1>
          <p className="text-sm text-gray-500 mt-0.5">{coupons.length} coupons • {coupons.filter(c => c.isActive && !isExpired(c.expiresAt)).length} active</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2"><Plus size={16} />New Coupon</button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card p-5 space-y-4">
          <h3 className="font-semibold text-gray-900">Create Coupon</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Coupon Code *</label>
              <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase().replace(/\s/g, '') }))} className="input font-mono tracking-widest" placeholder="SUMMER20" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Discount Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="input">
                <option value="percentage">Percentage (%) off</option>
                <option value="fixed">Fixed Amount (₹) off</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Discount Value *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{form.type === 'percentage' ? '%' : '₹'}</span>
                <input type="number" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} className="input pl-8" placeholder={form.type === 'percentage' ? '20' : '100'} min="1" max={form.type === 'percentage' ? '99' : undefined} required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Min Order Amount (₹)</label>
              <input type="number" value={form.minOrder} onChange={e => setForm(f => ({ ...f, minOrder: e.target.value }))} className="input" placeholder="0 = no minimum" min="0" />
            </div>
            {form.type === 'percentage' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Max Discount (₹)</label>
                <input type="number" value={form.maxDiscount} onChange={e => setForm(f => ({ ...f, maxDiscount: e.target.value }))} className="input" placeholder="No limit" min="0" />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Usage Limit</label>
              <input type="number" value={form.usageLimit} onChange={e => setForm(f => ({ ...f, usageLimit: e.target.value }))} className="input" placeholder="Unlimited" min="1" />
            </div>
            <div className={form.type === 'percentage' ? '' : 'sm:col-span-2'}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Expiry Date *</label>
              <input type="date" value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))} className="input" min={new Date().toISOString().split('T')[0]} required />
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setShowForm(false)} className="btn-outline flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Creating...' : 'Create Coupon'}</button>
          </div>
        </form>
      )}

      {coupons.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">
          <Tag size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No coupons yet</p>
          <p className="text-sm mt-1">Create a coupon to offer discounts to your customers.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {coupons.map(c => {
            const expired = isExpired(c.expiresAt);
            const usagePercent = c.usageLimit ? (c.usedCount / c.usageLimit) * 100 : 0;
            return (
              <div key={c._id} className={`card p-5 relative overflow-hidden ${expired ? 'opacity-60' : ''}`}>
                {expired && <div className="absolute top-3 right-10 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">Expired</div>}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-blue-700 text-xl tracking-widest font-mono">{c.code}</span>
                      <button onClick={() => copyCode(c.code)} className="p-1 text-gray-400 hover:text-blue-600 transition-colors"><Copy size={12} /></button>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">
                      {c.type === 'percentage' ? `${c.value}% off` : `₹${c.value} off`}
                      {c.minOrder > 0 ? ` on orders ₹${c.minOrder}+` : ''}
                      {c.maxDiscount ? ` (max ₹${c.maxDiscount})` : ''}
                    </p>
                  </div>
                  <button onClick={() => handleDelete(c._id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors shrink-0"><Trash2 size={14} /></button>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                  <span>Expires: {new Date(c.expiresAt).toLocaleDateString()}</span>
                  <span>{c.usedCount} / {c.usageLimit || '∞'} used</span>
                </div>

                {c.usageLimit > 0 && (
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${usagePercent >= 80 ? 'bg-red-400' : 'bg-blue-500'}`} style={{ width: `${Math.min(usagePercent, 100)}%` }} />
                  </div>
                )}

                <span className={`badge text-xs mt-2 ${!expired && c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {!expired && c.isActive ? 'Active' : expired ? 'Expired' : 'Inactive'}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
