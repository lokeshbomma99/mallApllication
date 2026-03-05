import { useState, useEffect } from 'react';
import { Search, Ban, CheckCircle, Users } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [banModal, setBanModal] = useState(null);
  const [banReason, setBanReason] = useState('');

  useEffect(() => {
    api.get(`/users?${roleFilter ? `role=${roleFilter}&` : ''}limit=50`)
      .then(r => { setUsers(r.data.users || []); setTotal(r.data.total || 0); })
      .catch(() => {}).finally(() => setLoading(false));
  }, [roleFilter]);

  const handleBan = async (userId) => {
    try {
      const { data } = await api.put(`/users/${userId}/ban`, { reason: banReason || 'Violated terms of service' });
      setUsers(us => us.map(u => u._id === userId ? data : u));
      setBanModal(null); setBanReason('');
      toast.success('User banned');
    } catch { toast.error('Failed'); }
  };

  const handleUnban = async (userId) => {
    try {
      const { data } = await api.put(`/users/${userId}/unban`);
      setUsers(us => us.map(u => u._id === userId ? data : u));
      toast.success('User unbanned');
    } catch { toast.error('Failed'); }
  };

  const filtered = users.filter(u => u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="space-y-3">{Array(8).fill(0).map((_, i) => <div key={i} className="card h-14 animate-pulse bg-gray-100" />)}</div>;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-500 text-sm mt-0.5">{total} total users</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} className="input pl-9 text-sm" placeholder="Search users..." />
        </div>
        <div className="flex gap-2">
          {['', 'customer', 'shopowner', 'admin'].map(r => (
            <button key={r} onClick={() => setRoleFilter(r)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${roleFilter === r ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'}`}>
              {r === '' ? 'All' : r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>{['User', 'Role', 'Loyalty Pts', 'Joined', 'Status', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(u => (
              <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm shrink-0">{u.name?.charAt(0).toUpperCase()}</div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{u.name}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`badge text-xs ${u.role === 'admin' ? 'bg-red-100 text-red-700' : u.role === 'shopowner' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{u.role}</span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{u.loyaltyPoints || 0}</td>
                <td className="px-4 py-3 text-xs text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  {u.isBanned ? <span className="badge bg-red-100 text-red-700 text-xs">Banned</span> : <span className="badge bg-green-100 text-green-700 text-xs">Active</span>}
                </td>
                <td className="px-4 py-3">
                  {u.role !== 'admin' && (
                    u.isBanned ? (
                      <button onClick={() => handleUnban(u._id)} className="flex items-center gap-1 text-xs text-green-600 hover:text-green-800 font-medium px-2 py-1 bg-green-50 rounded-lg transition-colors">
                        <CheckCircle size={12} /> Unban
                      </button>
                    ) : (
                      <button onClick={() => setBanModal(u)} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 bg-red-50 rounded-lg transition-colors">
                        <Ban size={12} /> Ban
                      </button>
                    )
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-10 text-gray-400"><Users size={32} className="mx-auto mb-2 opacity-30" /><p>No users found.</p></div>
        )}
      </div>

      {/* Ban Modal */}
      {banModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="font-bold text-gray-900 mb-1">Ban User</h3>
            <p className="text-sm text-gray-500 mb-4">You are about to ban <strong>{banModal.name}</strong>.</p>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Reason</label>
            <textarea value={banReason} onChange={e => setBanReason(e.target.value)} className="input h-20 resize-none mb-4" placeholder="Reason for banning..." />
            <div className="flex gap-3">
              <button onClick={() => setBanModal(null)} className="btn-outline flex-1">Cancel</button>
              <button onClick={() => handleBan(banModal._id)} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-xl transition-colors">Confirm Ban</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
