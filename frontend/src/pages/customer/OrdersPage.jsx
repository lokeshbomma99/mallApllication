// ─── Orders Page ─────────────────────────────────────────
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight, Clock, CheckCircle, Truck, XCircle, RefreshCw } from 'lucide-react';
import api from '../../utils/api';

const STATUS_STYLES = {
  placed:      { color: 'bg-blue-100 text-blue-700', icon: <Clock size={12} /> },
  confirmed:   { color: 'bg-indigo-100 text-indigo-700', icon: <CheckCircle size={12} /> },
  processing:  { color: 'bg-yellow-100 text-yellow-700', icon: <RefreshCw size={12} /> },
  shipped:     { color: 'bg-purple-100 text-purple-700', icon: <Truck size={12} /> },
  delivered:   { color: 'bg-green-100 text-green-700', icon: <CheckCircle size={12} /> },
  cancelled:   { color: 'bg-red-100 text-red-700', icon: <XCircle size={12} /> },
  returned:    { color: 'bg-gray-100 text-gray-700', icon: <RefreshCw size={12} /> },
};

export function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    api.get(`/orders/my${filter ? `?status=${filter}` : ''}`).then(r => setOrders(r.data.orders || [])).catch(() => {}).finally(() => setLoading(false));
  }, [filter]);

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-8">{Array(4).fill(0).map((_, i) => <div key={i} className="card h-24 mb-3 animate-pulse bg-gray-100" />)}</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>
      <div className="flex gap-2 mb-6 flex-wrap">
        {['', 'placed', 'shipped', 'delivered', 'cancelled'].map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === s ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'}`}>
            {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <Package size={48} className="mx-auto text-gray-200 mb-3" />
          <p className="text-gray-500">No orders found.</p>
          <Link to="/shop" className="btn-primary mt-4 inline-block">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(o => {
            const style = STATUS_STYLES[o.status] || STATUS_STYLES.placed;
            return (
              <Link key={o._id} to={`/orders/${o._id}`} className="card p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-50 shrink-0">
                  {o.items[0]?.image ? <img src={o.items[0].image} alt="" className="w-full h-full object-cover" /> : <Package size={24} className="m-auto mt-4 text-gray-300" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm">Order #{o._id.slice(-6).toUpperCase()}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{o.items.length} item(s) • {new Date(o.createdAt).toLocaleDateString()}</p>
                  <p className="font-bold text-gray-900 mt-1">₹{o.total?.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`badge flex items-center gap-1 ${style.color}`}>{style.icon}{o.status}</span>
                  <ChevronRight size={16} className="text-gray-400" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Order Detail Page ────────────────────────────────────
export function OrderDetailPage() {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = window.location.pathname.split('/').slice(-1)[0] ? { id: window.location.pathname.split('/').slice(-1)[0] } : {};
  const orderId = window.location.pathname.split('/orders/')[1];

  useEffect(() => {
    if (orderId) api.get(`/orders/${orderId}`).then(r => setOrder(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [orderId]);

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-8"><div className="card h-64 animate-pulse bg-gray-100" /></div>;
  if (!order) return <div className="text-center py-16 text-gray-400">Order not found</div>;

  const STATUS_STEPS = ['placed', 'confirmed', 'processing', 'shipped', 'delivered'];
  const currentStep = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <div className="flex items-center gap-2 mb-6">
        <Link to="/orders" className="text-blue-600 hover:underline text-sm">My Orders</Link>
        <ChevronRight size={14} className="text-gray-400" />
        <span className="text-sm text-gray-800">Order #{order._id.slice(-6).toUpperCase()}</span>
      </div>

      {/* Status tracker */}
      {!['cancelled', 'returned'].includes(order.status) && (
        <div className="card p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-5">Order Status</h3>
          <div className="flex items-center">
            {STATUS_STEPS.map((s, i) => (
              <div key={s} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${i <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                    {i < currentStep ? '✓' : i + 1}
                  </div>
                  <p className="text-xs mt-1 text-center capitalize text-gray-500 w-14">{s}</p>
                </div>
                {i < STATUS_STEPS.length - 1 && <div className={`flex-1 h-0.5 -mt-4 ${i < currentStep ? 'bg-blue-600' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Items Ordered</h3>
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gray-50 overflow-hidden shrink-0">
                    {item.image && <img src={item.image} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{item.name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-sm">₹{(item.price * item.quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Delivery Address</h3>
            <p className="text-sm text-gray-700 font-medium">{order.shippingAddress?.name}</p>
            <p className="text-sm text-gray-600">{order.shippingAddress?.phone}</p>
            <p className="text-sm text-gray-600">{order.shippingAddress?.street}, {order.shippingAddress?.city}</p>
            <p className="text-sm text-gray-600">{order.shippingAddress?.state}, {order.shippingAddress?.country} {order.shippingAddress?.zip}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{order.subtotal?.toLocaleString()}</span></div>
              {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{order.discount}</span></div>}
              <div className="flex justify-between text-gray-600"><span>Shipping</span><span>{order.shippingFee === 0 ? 'FREE' : `₹${order.shippingFee}`}</span></div>
              <div className="border-t pt-2 flex justify-between font-bold text-gray-900"><span>Total</span><span>₹{order.total?.toLocaleString()}</span></div>
            </div>
            <div className="mt-3 pt-3 border-t">
              <p className="text-xs text-gray-500">Payment: <span className="font-medium text-gray-700">Cash on Delivery</span></p>
              {order.loyaltyPointsEarned > 0 && <p className="text-xs text-purple-600 mt-1">🎯 +{order.loyaltyPointsEarned} loyalty points earned</p>}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Status History</h3>
            <div className="space-y-2">
              {order.statusHistory?.map((h, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-gray-700 capitalize">{h.status}</p>
                    {h.note && <p className="text-xs text-gray-400">{h.note}</p>}
                    <p className="text-xs text-gray-400">{new Date(h.updatedAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrdersPage;
