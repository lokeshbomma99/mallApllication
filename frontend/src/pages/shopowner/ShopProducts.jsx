import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Package, Search, Zap } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['Fashion', 'Electronics', 'Home & Garden', 'Sports', 'Beauty', 'Books', 'Toys', 'Food', 'Jewelry', 'Automotive'];
const EMPTY_FORM = { name: '', description: '', price: '', salePrice: '', category: 'Electronics', stock: '', sku: '', tags: '', images: '', loyaltyPoints: 0, 'flashSale.active': false, 'flashSale.discount': 0 };

export default function ShopProducts() {
  const [products, setProducts] = useState([]);
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const shopRes = await api.get('/shops/my');
        setShop(shopRes.data);
        if (shopRes.data?._id) {
          const res = await api.get(`/products?shop=${shopRes.data._id}&limit=50`);
          setProducts(res.data.products || []);
        }
      } catch {} finally { setLoading(false); }
    };
    load();
  }, []);

  const openAdd = () => { setEditProduct(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (p) => {
    setEditProduct(p);
    setForm({ name: p.name, description: p.description, price: p.price, salePrice: p.salePrice || '', category: p.category, stock: p.stock, sku: p.sku || '', tags: p.tags?.join(', ') || '', images: p.images?.join(', ') || '', loyaltyPoints: p.loyaltyPoints || 0, 'flashSale.active': p.flashSale?.active || false, 'flashSale.discount': p.flashSale?.discount || 0 });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form, price: Number(form.price), salePrice: form.salePrice ? Number(form.salePrice) : null,
        stock: Number(form.stock), loyaltyPoints: Number(form.loyaltyPoints),
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        images: form.images.split(',').map(i => i.trim()).filter(Boolean),
        shopId: shop._id,
        flashSale: { active: form['flashSale.active'], discount: Number(form['flashSale.discount']), endsAt: form['flashSale.active'] ? new Date(Date.now() + 3 * 60 * 60 * 1000) : null },
      };
      if (editProduct) {
        const { data } = await api.put(`/products/${editProduct._id}`, payload);
        setProducts(ps => ps.map(p => p._id === editProduct._id ? data : p));
        toast.success('Product updated!');
      } else {
        const { data } = await api.post('/products', payload);
        setProducts(ps => [data, ...ps]);
        toast.success('Product added!');
      }
      setShowModal(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try { await api.delete(`/products/${id}`); setProducts(ps => ps.filter(p => p._id !== id)); toast.success('Deleted'); } catch {}
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="space-y-3">{Array(5).fill(0).map((_, i) => <div key={i} className="card h-16 animate-pulse bg-gray-100" />)}</div>;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">{products.length} products in your shop</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2"><Plus size={16} /> Add Product</button>
      </div>

      {!shop ? (
        <div className="card p-8 text-center text-gray-400">Please set up your shop first.</div>
      ) : (
        <>
          <div className="relative max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} className="input pl-9 text-sm" placeholder="Search products..." />
          </div>

          {filtered.length === 0 ? (
            <div className="card p-12 text-center text-gray-400">
              <Package size={40} className="mx-auto mb-3 opacity-30" />
              <p>No products yet. Click "Add Product" to get started.</p>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(p => (
                    <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                            {p.images?.[0] && <img src={p.images[0]} alt="" className="w-full h-full object-cover" />}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800 line-clamp-1">{p.name}</p>
                            {p.flashSale?.active && <span className="text-xs text-red-500 flex items-center gap-0.5"><Zap size={10} />Flash</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{p.category}</td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold text-gray-900">₹{(p.salePrice || p.price)?.toLocaleString()}</p>
                        {p.salePrice && <p className="text-xs text-gray-400 line-through">₹{p.price?.toLocaleString()}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${p.stock > 10 ? 'bg-green-100 text-green-700' : p.stock > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{p.stock}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{p.isActive ? 'Active' : 'Inactive'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(p)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={14} /></button>
                          <button onClick={() => handleDelete(p._id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-lg">{editProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Name *</label>
                  <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} className="input" required />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} className="input h-20 resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Price (₹) *</label>
                  <input type="number" value={form.price} onChange={e => setForm(f => ({...f, price: e.target.value}))} className="input" required min="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Sale Price (₹)</label>
                  <input type="number" value={form.salePrice} onChange={e => setForm(f => ({...f, salePrice: e.target.value}))} className="input" min="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Category *</label>
                  <select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))} className="input">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Stock *</label>
                  <input type="number" value={form.stock} onChange={e => setForm(f => ({...f, stock: e.target.value}))} className="input" required min="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">SKU</label>
                  <input value={form.sku} onChange={e => setForm(f => ({...f, sku: e.target.value}))} className="input" placeholder="Optional" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Loyalty Points</label>
                  <input type="number" value={form.loyaltyPoints} onChange={e => setForm(f => ({...f, loyaltyPoints: e.target.value}))} className="input" min="0" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Image URLs (comma separated)</label>
                  <input value={form.images} onChange={e => setForm(f => ({...f, images: e.target.value}))} className="input" placeholder="https://..." />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Tags (comma separated)</label>
                  <input value={form.tags} onChange={e => setForm(f => ({...f, tags: e.target.value}))} className="input" placeholder="electronics, gadgets, ..." />
                </div>
                <div className="sm:col-span-2 flex items-center gap-4 p-3 bg-red-50 rounded-xl">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form['flashSale.active']} onChange={e => setForm(f => ({...f, 'flashSale.active': e.target.checked}))} className="rounded text-red-500" />
                    <span className="text-sm font-medium text-red-700 flex items-center gap-1"><Zap size={14} /> Enable Flash Sale</span>
                  </label>
                  {form['flashSale.active'] && (
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-red-600">Discount %:</label>
                      <input type="number" value={form['flashSale.discount']} onChange={e => setForm(f => ({...f, 'flashSale.discount': e.target.value}))} className="input w-20 py-1 text-sm" min="1" max="99" />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-outline flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : editProduct ? 'Update Product' : 'Add Product'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
