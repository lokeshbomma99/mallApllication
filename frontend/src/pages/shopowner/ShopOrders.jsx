// ShopOrders.jsx
import { useState, useEffect } from 'react';
import { ShoppingBag } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export function ShopOrders() {
  const [orders, setOrders] = useState([]);
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const load = async () => {
      const shopRes = await api.get('/shops/my');
      setShop(shopRes.data);
      if (shopRes.data?._id) {
        const res = await api.get(`/orders/shop/${shopRes.data._id}${filter ? `?status=${filter}` : ''}`);
        setOrders(res.data.orders || []);
      }
      setLoading(false);
    };
    load().catch(() => setLoading(false));
  }, [filter]);

  const updateStatus = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status, note: `Updated by shop owner` });
      setOrders(os => os.map(o => o._id === orderId ? { ...o, status } : o));
      toast.success(`Order marked as ${status}`);
    } catch { toast.error('Update failed'); }
  };

  if (loading) return <div className="space-y-3">{Array(5).fill(0).map((_, i) => <div key={i} className="card h-20 animate-pulse bg-gray-100" />)}</div>;

  return (
    <div className="space-y-5 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
      <div className="flex gap-2 flex-wrap">
        {['', 'placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === s ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'}`}>
            {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>
      {orders.length === 0 ? (
        <div className="card p-12 text-center text-gray-400"><ShoppingBag size={40} className="mx-auto mb-2 opacity-30" /><p>No orders found.</p></div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{['Order', 'Customer', 'Items', 'Total', 'Status', 'Update'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map(o => (
                <tr key={o._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="text-sm font-semibold text-gray-800">#{o._id.slice(-6).toUpperCase()}</p>
                    <p className="text-xs text-gray-400">{new Date(o.createdAt).toLocaleDateString()}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{o.customer?.name || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{o.items?.length} item(s)</td>
                  <td className="px-4 py-3 text-sm font-bold text-gray-900">₹{o.total?.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`badge text-xs ${o.status === 'delivered' ? 'bg-green-100 text-green-700' : o.status === 'cancelled' ? 'bg-red-100 text-red-700' : o.status === 'shipped' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{o.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    {!['delivered', 'cancelled', 'returned'].includes(o.status) && (
                      <select onChange={e => e.target.value && updateStatus(o._id, e.target.value)} defaultValue="" className="input text-xs py-1 w-32">
                        <option value="">Update...</option>
                        {['confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].filter(s => s !== o.status).map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                      </select>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ShopOrders;
