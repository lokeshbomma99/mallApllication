import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Phone, MapPin, Star, Save, Loader } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '', phone: user?.phone || '',
    address: { street: user?.address?.street || '', city: user?.address?.city || '', state: user?.address?.state || '', country: user?.address?.country || 'India', zip: user?.address?.zip || '' },
    language: user?.language || 'en',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/auth/profile', form);
      updateUser(data);
      toast.success('Profile updated!');
    } catch { toast.error('Update failed'); }
    finally { setSaving(false); }
  };

  const langs = [{ code: 'en', label: '🇬🇧 English' }, { code: 'ar', label: '🇸🇦 Arabic' }, { code: 'hi', label: '🇮🇳 Hindi' }, { code: 'gu', label: '🏳️ Gujarati' }];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Side card */}
        <div className="space-y-4">
          <div className="card p-6 text-center">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-3">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <h3 className="font-bold text-gray-900">{user?.name}</h3>
            <p className="text-gray-500 text-sm">{user?.email}</p>
            <span className="badge bg-blue-100 text-blue-700 mt-2 capitalize">{user?.role}</span>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Star size={16} className="text-yellow-400" /> Loyalty Points</h3>
            <p className="text-3xl font-bold text-blue-600">{user?.loyaltyPoints || 0}</p>
            <p className="text-xs text-gray-400 mt-1">Points earned from purchases</p>
            <div className="mt-3 p-2 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-600">💡 Every ₹10 spent = 1 point</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="md:col-span-2">
          <form onSubmit={handleSave} className="card p-6 space-y-5">
            <h3 className="font-semibold text-gray-900">Personal Information</h3>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} className="input pl-9" placeholder="Your name" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input value={user?.email} disabled className="input pl-9 bg-gray-50 cursor-not-allowed" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} className="input pl-9" placeholder="+91 XXXXX XXXXX" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Language</label>
                <select value={form.language} onChange={e => setForm(f => ({...f, language: e.target.value}))} className="input">
                  {langs.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                </select>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2"><MapPin size={14} className="text-blue-600" /> Address</h4>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { label: 'Street', key: 'street', full: true },
                  { label: 'City', key: 'city' },
                  { label: 'State', key: 'state' },
                  { label: 'Country', key: 'country' },
                  { label: 'ZIP Code', key: 'zip' },
                ].map(f => (
                  <div key={f.key} className={f.full ? 'sm:col-span-2' : ''}>
                    <label className="block text-xs font-medium text-gray-500 mb-1">{f.label}</label>
                    <input value={form.address[f.key]} onChange={e => setForm(f2 => ({...f2, address: {...f2.address, [f.key]: e.target.value}}))} className="input text-sm" />
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
              {saving ? <><Loader size={14} className="animate-spin" /> Saving...</> : <><Save size={14} /> Save Changes</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
