import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { MapPin, Package, CheckCircle, Loader } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { discount = 0, couponCode = '', finalTotal = cartTotal, shipping = 0 } = location.state || {};

  const [step, setStep] = useState(1);
  const [placing, setPlacing] = useState(false);
  const [address, setAddress] = useState({
    name: user?.name || '', phone: user?.phone || '',
    street: '', city: '', state: '', country: 'India', zip: '',
  });

  const handlePlaceOrder = async () => {
    setPlacing(true);
    try {
      const items = cartItems.map(i => ({
        product: i.product?._id, shop: i.product?.shop || i.shop,
        name: i.product?.name || 'Product', image: i.product?.images?.[0] || '',
        price: i.price, quantity: i.quantity,
      }));
      const { data } = await api.post('/orders', {
        items, shippingAddress: address, paymentMethod: 'cod',
        couponCode, discount, subtotal: cartTotal, shippingFee: shipping, total: finalTotal,
      });
      await clearCart();
      setStep(3);
      setTimeout(() => navigate(`/orders/${data._id}`), 2500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order failed');
    } finally { setPlacing(false); }
  };

  const steps = [{ n: 1, label: 'Address' }, { n: 2, label: 'Review' }, { n: 3, label: 'Confirm' }];

  if (step === 3) return (
    <div className="max-w-md mx-auto px-4 py-20 text-center animate-fade-in">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle size={40} className="text-green-500" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed! 🎉</h2>
      <p className="text-gray-500 mb-4">Thank you for your order. You'll receive a confirmation shortly.</p>
      <p className="text-sm text-gray-400">Redirecting to order details...</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

      {/* Steps */}
      <div className="flex items-center mb-8">
        {steps.map((s, i) => (
          <div key={s.n} className="flex items-center flex-1 last:flex-none">
            <div className={`flex items-center gap-2 ${step >= s.n ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= s.n ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>{s.n}</div>
              <span className="text-sm font-medium hidden sm:block">{s.label}</span>
            </div>
            {i < steps.length - 1 && <div className={`flex-1 h-0.5 mx-3 ${step > s.n ? 'bg-blue-600' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {step === 1 && (
            <div className="card p-6">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><MapPin size={18} className="text-blue-600" /> Shipping Address</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { label: 'Full Name', key: 'name', type: 'text', full: false },
                  { label: 'Phone Number', key: 'phone', type: 'tel', full: false },
                  { label: 'Street Address', key: 'street', type: 'text', full: true },
                  { label: 'City', key: 'city', type: 'text', full: false },
                  { label: 'State', key: 'state', type: 'text', full: false },
                  { label: 'Country', key: 'country', type: 'text', full: false },
                  { label: 'ZIP / Postal Code', key: 'zip', type: 'text', full: false },
                ].map(f => (
                  <div key={f.key} className={f.full ? 'sm:col-span-2' : ''}>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{f.label}</label>
                    <input type={f.type} value={address[f.key]} onChange={e => setAddress(a => ({...a, [f.key]: e.target.value}))} className="input" required />
                  </div>
                ))}
              </div>
              <button onClick={() => {
                if (!address.name || !address.phone || !address.street || !address.city || !address.zip) { toast.error('Please fill all fields'); return; }
                setStep(2);
              }} className="btn-primary mt-5 w-full">Continue to Review</button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="card p-5">
                <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Package size={18} className="text-blue-600" /> Order Items</h2>
                <div className="space-y-3">
                  {cartItems.map(item => (
                    <div key={item.product?._id} className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-50 shrink-0">
                        {item.product?.images?.[0] && <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{item.product?.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-gray-900 text-sm">₹{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-5">
                <h2 className="font-semibold text-gray-900 mb-3">Delivery Address</h2>
                <p className="text-sm text-gray-600">{address.name} • {address.phone}</p>
                <p className="text-sm text-gray-600">{address.street}, {address.city}, {address.state} {address.zip}</p>
                <button onClick={() => setStep(1)} className="text-xs text-blue-600 mt-1 hover:underline">Change</button>
              </div>

              <div className="card p-5">
                <h2 className="font-semibold text-gray-900 mb-2">Payment Method</h2>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border-2 border-blue-200">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">💵</div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Cash on Delivery</p>
                    <p className="text-xs text-gray-500">Pay when you receive your order</p>
                  </div>
                  <div className="ml-auto w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                </div>
              </div>

              <button onClick={handlePlaceOrder} disabled={placing} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
                {placing ? <><Loader size={16} className="animate-spin" /> Placing Order...</> : '🛍️ Place Order'}
              </button>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="card p-5 h-fit">
          <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{cartTotal.toLocaleString()}</span></div>
            {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{discount.toFixed(0)}</span></div>}
            <div className="flex justify-between text-gray-600"><span>Shipping</span><span className={shipping === 0 ? 'text-green-600' : ''}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
            <div className="border-t pt-2 flex justify-between font-bold text-gray-900 text-base"><span>Total</span><span>₹{finalTotal.toLocaleString()}</span></div>
          </div>
          {couponCode && <p className="text-xs text-green-600 mt-2">✅ Coupon "{couponCode}" applied</p>}
        </div>
      </div>
    </div>
  );
}
