import { useState, useEffect } from 'react';
import { Store, Loader, Clock, CheckCircle, XCircle } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['Fashion', 'Electronics', 'Home & Garden', 'Sports', 'Beauty', 'Books', 'Toys', 'Food', 'Jewelry', 'Automotive'];

export default function ShopSetup() {
  const [shop, setShop] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', category: 'Electronics', phone: '', email: '', address: '' });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/shops/my')
      .then(r => {
        if (r.data) {
          setShop(r.data);
          setForm({
            name: r.data.name || '',
            description: r.data.description || '',
            category: r.data.category || 'Electronics',
            phone: r.data.phone || '',
            email: r.data.email || '',
            address: r.data.address || '',
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (shop) {
        const { data } = await api.put(`/shops/${shop._id}`, form);
        setShop(data);
        toast.success('Shop settings updated!');
      } else {
        const { data } = await api.post('/shops', form);
        setShop(data);
        toast.success('Shop created! Awaiting admin approval.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="max-w-2xl space-y-4"><div className="card h-64 animate-pulse bg-gray-100" /></div>;

  return (
    <div className="max-w-2xl space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{shop ? 'Shop Settings' : 'Set Up Your Shop'}</h1>
        <p className="text-sm text-gray-500 mt-1">{shop ? 'Update your shop information' : 'Fill in the details to create your shop on SuperMall'}</p>
      </div>

      {/* Status Banner */}
      {shop && (
        <div className={`flex items-center gap-3 p-4 rounded-2xl border ${
          shop.status === 'approved' ? 'bg-green-50 border-green-200' :
          shop.status === 'pending' ? 'bg-yellow-50 border-yellow-200' :
          shop.status === 'rejected' ? 'bg-red-50 border-red-200' :
          'bg-gray-50 border-gray-200'
        }`}>
          {shop.status === 'approved' && <CheckCircle size={20} className="text-green-600 shrink-0" />}
          {shop.status === 'pending' && <Clock size={20} className="text-yellow-600 shrink-0" />}
          {shop.status === 'rejected' && <XCircle size={20} className="text-red-600 shrink-0" />}
          <div>
            <p className={`font-semibold text-sm ${
              shop.status === 'approved' ? 'text-green-800' :
              shop.status === 'pending' ? 'text-yellow-800' : 'text-red-800'
            }`}>
              Shop {shop.status === 'approved' ? 'is Live!' : shop.status === 'pending' ? 'Under Review' : 'Rejected'}
            </p>
            <p className={`text-xs mt-0.5 ${
              shop.status === 'approved' ? 'text-green-600' :
              shop.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {shop.status === 'approved' && 'Your shop is visible to all customers.'}
              {shop.status === 'pending' && 'Admin will review your shop shortly.'}
              {shop.status === 'rejected' && (shop.rejectionReason || 'Please update your details and resubmit.')}
            </p>
          </div>
        </div>
      )}

      {/* Stats if approved */}
      {shop?.status === 'approved' && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Rating', value: shop.rating ? `${shop.rating} ★` : 'No ratings' },
            { label: 'Total Sales', value: shop.totalSales?.toLocaleString() || '0' },
            { label: 'Revenue', value: `₹${(shop.totalRevenue || 0).toLocaleString()}` },
          ].map(s => (
            <div key={s.label} className="card p-4 text-center">
              <p className="text-lg font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <h3 className="font-semibold text-gray-900 border-b border-gray-100 pb-3">Shop Information</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Shop Name *</label>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input" placeholder="My Awesome Store" required />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Category *</label>
          <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input">
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="input h-24 resize-none" placeholder="Tell customers about your shop..." />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="input" placeholder="shop@email.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
            <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="input" placeholder="+91 XXXXX XXXXX" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
          <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className="input" placeholder="Shop address or city" />
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
          {saving ? <><Loader size={16} className="animate-spin" />Saving...</> : <><Store size={16} />{shop ? 'Update Shop' : 'Create Shop & Submit for Approval'}</>}
        </button>
      </form>
    </div>
  );
}
