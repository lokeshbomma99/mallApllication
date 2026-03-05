import { useState, useEffect } from 'react';
import { Plus, Trash2, Image, Eye, EyeOff } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminBanners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', subtitle: '', image: '', link: '', position: 'hero' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/banners').then(r => setBanners(r.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.post('/banners', { ...form, isActive: true });
      setBanners(bs => [data, ...bs]);
      setShowForm(false);
      setForm({ title: '', subtitle: '', image: '', link: '', position: 'hero' });
      toast.success('Banner created!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this banner?')) return;
    try { await api.delete(`/banners/${id}`); setBanners(bs => bs.filter(b => b._id !== id)); toast.success('Deleted'); }
    catch { toast.error('Failed to delete'); }
  };

  const toggleActive = async (banner) => {
    try {
      const { data } = await api.put(`/banners/${banner._id}`, { isActive: !banner.isActive });
      setBanners(bs => bs.map(b => b._id === banner._id ? data : b));
      toast.success(data.isActive ? 'Banner activated' : 'Banner hidden');
    } catch {}
  };

  if (loading) return <div className="space-y-3">{Array(3).fill(0).map((_, i) => <div key={i} className="card h-28 animate-pulse bg-gray-100" />)}</div>;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Banners</h1>
          <p className="text-sm text-gray-500 mt-0.5">{banners.length} banners • {banners.filter(b => b.isActive).length} active</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2"><Plus size={16} />Add Banner</button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">New Banner</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Title *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="input" placeholder="Mega Sale Up to 70% Off" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Subtitle</label>
              <input value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} className="input" placeholder="Limited time offer" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Image URL *</label>
              <input value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} className="input" placeholder="https://images.unsplash.com/..." required />
              {form.image && <img src={form.image} alt="preview" className="mt-2 h-24 w-full object-cover rounded-xl" onError={e => e.target.style.display = 'none'} />}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Link URL</label>
              <input value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))} className="input" placeholder="/shop?category=Fashion" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Position</label>
              <select value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))} className="input">
                <option value="hero">Hero (Top slider)</option>
                <option value="middle">Middle section</option>
                <option value="bottom">Bottom section</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Creating...' : 'Create Banner'}</button>
          </div>
        </form>
      )}

      {banners.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">
          <Image size={40} className="mx-auto mb-3 opacity-30" />
          <p>No banners yet. Add one to show on the homepage.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {['hero', 'middle', 'bottom'].map(pos => {
            const posBanners = banners.filter(b => b.position === pos);
            if (posBanners.length === 0) return null;
            return (
              <div key={pos}>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">{pos} banners</h3>
                <div className="space-y-3">
                  {posBanners.map(b => (
                    <div key={b._id} className={`card p-4 flex items-center gap-4 transition-opacity ${!b.isActive ? 'opacity-50' : ''}`}>
                      <div className="w-32 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                        {b.image ? <img src={b.image} alt={b.title} className="w-full h-full object-cover" onError={e => e.target.style.display = 'none'} /> : <Image size={24} className="m-auto mt-6 text-gray-300" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800">{b.title}</p>
                        {b.subtitle && <p className="text-sm text-gray-500">{b.subtitle}</p>}
                        {b.link && <p className="text-xs text-blue-500 mt-1 truncate">→ {b.link}</p>}
                        <span className={`badge text-xs mt-1 ${b.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{b.isActive ? 'Visible' : 'Hidden'}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => toggleActive(b)} className={`p-2 rounded-xl transition-colors ${b.isActive ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`} title={b.isActive ? 'Hide banner' : 'Show banner'}>
                          {b.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                        <button onClick={() => handleDelete(b._id)} className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
