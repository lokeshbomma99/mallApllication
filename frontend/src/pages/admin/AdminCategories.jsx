import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Tag } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', icon: '🛍️', description: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const resetForm = () => { setForm({ name: '', icon: '🛍️', description: '' }); setEditId(null); setShowForm(false); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        const { data } = await api.put(`/categories/${editId}`, form);
        setCategories(cs => cs.map(c => c._id === editId ? data : c));
        toast.success('Category updated!');
      } else {
        const { data } = await api.post('/categories', form);
        setCategories(cs => [...cs, data]);
        toast.success('Category created!');
      }
      resetForm();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleEdit = (cat) => { setEditId(cat._id); setForm({ name: cat.name, icon: cat.icon || '🛍️', description: cat.description || '' }); setShowForm(true); };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    try { await api.delete(`/categories/${id}`); setCategories(cs => cs.filter(c => c._id !== id)); toast.success('Deleted'); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to delete'); }
  };

  const toggleActive = async (cat) => {
    try {
      const { data } = await api.put(`/categories/${cat._id}`, { isActive: !cat.isActive });
      setCategories(cs => cs.map(c => c._id === cat._id ? data : c));
    } catch {}
  };

  if (loading) return <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{Array(8).fill(0).map((_, i) => <div key={i} className="card h-24 animate-pulse bg-gray-100" />)}</div>;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-sm text-gray-500 mt-0.5">{categories.length} categories in your platform</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary flex items-center gap-2"><Plus size={16} />Add Category</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-4">{editId ? 'Edit Category' : 'New Category'}</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Icon (emoji)</label>
              <input value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} className="input text-2xl text-center" maxLength={2} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Name *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input" required placeholder="e.g. Electronics" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="input" placeholder="Short description" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button type="button" onClick={resetForm} className="btn-outline">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : editId ? 'Update Category' : 'Create Category'}</button>
          </div>
        </form>
      )}

      {categories.length === 0 ? (
        <div className="card p-12 text-center text-gray-400"><Tag size={40} className="mx-auto mb-3 opacity-30" /><p>No categories yet. Add one above.</p></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map(cat => (
            <div key={cat._id} className={`card p-4 transition-all ${!cat.isActive ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between mb-2">
                <span className="text-3xl">{cat.icon || '🛍️'}</span>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(cat)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={13} /></button>
                  <button onClick={() => handleDelete(cat._id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={13} /></button>
                </div>
              </div>
              <p className="font-semibold text-gray-800">{cat.name}</p>
              <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{cat.description || '—'}</p>
              <div className="flex items-center justify-between mt-3">
                <span className={`badge text-xs ${cat.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{cat.isActive !== false ? 'Active' : 'Hidden'}</span>
                <button onClick={() => toggleActive(cat)} className="text-xs text-gray-400 hover:text-gray-600 underline">{cat.isActive !== false ? 'Hide' : 'Show'}</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
