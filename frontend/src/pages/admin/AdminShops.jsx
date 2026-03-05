import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Store, Search } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminShops() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [search, setSearch] = useState('');
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get(`/shops?status=${statusFilter}&limit=50`).then(r => setShops(r.data.shops || [])).catch(() => {}).finally(() => setLoading(false));
  }, [statusFilter]);

  const handleApprove = async (shopId) => {
    try {
      await api.put(`/shops/${shopId}/approve`);
      setShops(ss => ss.filter(s => s._id !== shopId));
      toast.success('Shop approved! Owner notified.');
    } catch { toast.error('Failed'); }
  };

  const handleReject = async () => {
    try {
      await api.put(`/shops/${rejectModal._id}/reject`, { reason: rejectReason });
      setShops(ss => ss.filter(s => s._id !== rejectModal._id));
      setRejectModal(null); setRejectReason('');
      toast.success('Shop rejected.');
    } catch { toast.error('Failed'); }
  };

  const filtered = shops.filter(s => s.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-5 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900">Shop Management</h1>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} className="input pl-9 text-sm" placeholder="Search shops..." />
        </div>
        <div className="flex gap-2">
          {['pending', 'approved', 'rejected', 'suspended'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${statusFilter === s ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'}`}>{s}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{Array(6).fill(0).map((_, i) => <div key={i} className="card h-40 animate-pulse bg-gray-100" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center text-gray-400"><Store size={40} className="mx-auto mb-2 opacity-30" /><p>No shops with status "{statusFilter}"</p></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(shop => (
            <div key={shop._id} className="card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                  {shop.logo ? <img src={shop.logo} alt="" className="w-full h-full rounded-xl object-cover" /> : <Store size={20} className="text-blue-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate">{shop.name}</p>
                  <p className="text-xs text-gray-500">{shop.category}</p>
                </div>
                <span className={`badge text-xs shrink-0 ${shop.status === 'approved' ? 'bg-green-100 text-green-700' : shop.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{shop.status}</span>
              </div>
              <p className="text-xs text-gray-500 line-clamp-2 mb-3">{shop.description || 'No description.'}</p>
              <p className="text-xs text-gray-400 mb-3">Created: {new Date(shop.createdAt).toLocaleDateString()}</p>

              {shop.status === 'pending' && (
                <div className="flex gap-2">
                  <button onClick={() => handleApprove(shop._id)} className="flex-1 flex items-center justify-center gap-1 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-xl text-sm font-medium transition-colors">
                    <CheckCircle size={14} /> Approve
                  </button>
                  <button onClick={() => setRejectModal(shop)} className="flex-1 flex items-center justify-center gap-1 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-sm font-medium transition-colors">
                    <XCircle size={14} /> Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="font-bold text-gray-900 mb-1">Reject Shop</h3>
            <p className="text-sm text-gray-500 mb-4">Rejecting <strong>{rejectModal.name}</strong></p>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Reason *</label>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} className="input h-20 resize-none mb-4" placeholder="Reason for rejection..." required />
            <div className="flex gap-3">
              <button onClick={() => setRejectModal(null)} className="btn-outline flex-1">Cancel</button>
              <button onClick={handleReject} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-xl transition-colors">Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
