import { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, XCircle, Package } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const STATUS_STYLES = {
  pending:   'bg-yellow-100 text-yellow-700',
  approved:  'bg-green-100 text-green-700',
  rejected:  'bg-red-100 text-red-700',
  completed: 'bg-blue-100 text-blue-700',
};

export default function ShopReturns() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const shopRes = await api.get('/shops/my');
        if (shopRes.data?._id) {
          const res = await api.get(`/returns/shop/${shopRes.data._id}${filter ? `?status=${filter}` : ''}`);
          setReturns(res.data || []);
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, [filter]);

  const updateReturn = async (id, status, refundAmount = 0) => {
    setUpdatingId(id);
    try {
      await api.put(`/returns/${id}`, { status, refundAmount });
      setReturns(rs => rs.map(r => r._id === id ? { ...r, status } : r));
      toast.success(`Return ${status}!`);
    } catch { toast.error('Update failed'); }
    finally { setUpdatingId(null); }
  };

  if (loading) return (
    <div className="space-y-3">{Array(4).fill(0).map((_, i) => <div key={i} className="card h-28 animate-pulse bg-gray-100" />)}</div>
  );

  const filtered = filter ? returns.filter(r => r.status === filter) : returns;

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Return Requests</h1>
        <p className="text-sm text-gray-500 mt-0.5">{returns.length} total returns • {returns.filter(r => r.status === 'pending').length} pending</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['', 'pending', 'approved', 'rejected', 'completed'].map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === s ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'}`}>
            {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            {s === 'pending' && returns.filter(r => r.status === 'pending').length > 0 && (
              <span className="ml-1.5 bg-orange-500 text-white text-xs rounded-full px-1.5">{returns.filter(r => r.status === 'pending').length}</span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">
          <RefreshCw size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">{filter ? `No ${filter} returns` : 'No return requests yet'}</p>
          <p className="text-sm mt-1">Return requests from customers will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(r => (
            <div key={r._id} className="card p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-800">Order #{r.order?._id?.slice(-6).toUpperCase() || 'N/A'}</p>
                    <span className={`badge text-xs ${STATUS_STYLES[r.status] || 'bg-gray-100 text-gray-600'}`}>{r.status}</span>
                  </div>
                  <p className="text-sm text-gray-500">Customer: <strong>{r.customer?.name || 'Unknown'}</strong></p>
                  <p className="text-sm text-gray-500">Requested: {new Date(r.createdAt).toLocaleDateString()}</p>
                </div>
                {r.order?.total && (
                  <div className="text-right shrink-0">
                    <p className="text-sm text-gray-500">Order Total</p>
                    <p className="font-bold text-gray-900">₹{r.order.total.toLocaleString()}</p>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 rounded-xl p-3 mb-3">
                <p className="text-xs font-medium text-gray-500 mb-1">Return Reason:</p>
                <p className="text-sm text-gray-700">{r.reason || 'No reason provided'}</p>
              </div>

              {r.note && (
                <div className="bg-blue-50 rounded-xl p-3 mb-3">
                  <p className="text-xs font-medium text-blue-600 mb-1">Shop Note:</p>
                  <p className="text-sm text-blue-800">{r.note}</p>
                </div>
              )}

              {r.refundAmount > 0 && (
                <p className="text-sm text-green-600 mb-3">Refund Amount: <strong>₹{r.refundAmount.toLocaleString()}</strong></p>
              )}

              {r.status === 'pending' && (
                <div className="flex gap-3">
                  <button
                    onClick={() => updateReturn(r._id, 'approved', r.order?.total || 0)}
                    disabled={updatingId === r._id}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    <CheckCircle size={14} /> Approve & Refund
                  </button>
                  <button
                    onClick={() => updateReturn(r._id, 'rejected', 0)}
                    disabled={updatingId === r._id}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    <XCircle size={14} /> Reject
                  </button>
                </div>
              )}
              {r.status === 'approved' && (
                <button
                  onClick={() => updateReturn(r._id, 'completed', r.refundAmount)}
                  disabled={updatingId === r._id}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-sm font-medium transition-colors"
                >
                  <Package size={14} /> Mark as Completed
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
