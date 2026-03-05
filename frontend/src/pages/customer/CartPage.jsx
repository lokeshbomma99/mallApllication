import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function CartPage() {
  const { cartItems, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [couponData, setCouponData] = useState(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const validateCoupon = async () => {
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    try {
      const { data } = await api.post('/coupons/validate', { code: couponCode, total: cartTotal });
      setCouponData(data);
      toast.success(`✅ Coupon applied! You save ₹${data.discount.toFixed(0)}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon');
      setCouponData(null);
    } finally { setValidatingCoupon(false); }
  };

  const discount = couponData?.discount || 0;
  const shipping = cartTotal >= 499 ? 0 : 49;
  const finalTotal = cartTotal - discount + shipping;

  if (cartItems.length === 0) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center animate-fade-in">
      <ShoppingBag size={64} className="mx-auto text-gray-200 mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
      <p className="text-gray-500 mb-6">Looks like you haven't added anything yet.</p>
      <Link to="/shop" className="btn-primary inline-flex items-center gap-2">Start Shopping <ArrowRight size={16} /></Link>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Shopping Cart <span className="text-gray-400 font-normal text-lg">({cartItems.length} items)</span></h1>
        <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1"><Trash2 size={14} /> Clear All</button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map(item => (
            <div key={item.product?._id || item._id} className="card p-4 flex gap-4">
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50 shrink-0">
                {item.product?.images?.[0] ? (
                  <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                ) : <ShoppingBag size={24} className="m-auto mt-6 text-gray-300" />}
              </div>
              <div className="flex-1 min-w-0">
                <Link to={`/product/${item.product?._id}`} className="font-semibold text-gray-800 hover:text-blue-600 line-clamp-2 text-sm">{item.product?.name || 'Product'}</Link>
                <p className="text-blue-600 font-bold mt-1">₹{item.price?.toLocaleString()}</p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <button onClick={() => item.quantity === 1 ? removeFromCart(item.product?._id) : updateQuantity(item.product?._id, item.quantity - 1)} className="px-2 py-1 hover:bg-gray-50 transition-colors"><Minus size={12} /></button>
                    <span className="px-3 py-1 text-sm font-semibold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product?._id, item.quantity + 1)} className="px-2 py-1 hover:bg-gray-50 transition-colors"><Plus size={12} /></button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-900">₹{(item.price * item.quantity)?.toLocaleString()}</span>
                    <button onClick={() => removeFromCart(item.product?._id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          {/* Coupon */}
          <div className="card p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Tag size={16} className="text-blue-600" /> Apply Coupon</h3>
            <div className="flex gap-2">
              <input value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())} className="input text-sm flex-1" placeholder="Enter coupon code" />
              <button onClick={validateCoupon} disabled={validatingCoupon} className="btn-primary px-4 py-2 text-sm">{validatingCoupon ? '...' : 'Apply'}</button>
            </div>
            {couponData && <p className="text-sm text-green-600 mt-2">✅ Saving ₹{couponData.discount.toFixed(0)}</p>}
          </div>

          {/* Summary */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600"><span>Subtotal ({cartItems.length} items)</span><span>₹{cartTotal.toLocaleString()}</span></div>
              {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{discount.toFixed(0)}</span></div>}
              <div className="flex justify-between text-gray-600"><span>Shipping</span><span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
              {shipping > 0 && <p className="text-xs text-gray-400">Add ₹{(499 - cartTotal).toFixed(0)} more for free shipping</p>}
              <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900 text-base">
                <span>Total</span><span>₹{finalTotal.toLocaleString()}</span>
              </div>
            </div>
            <button onClick={() => navigate('/checkout', { state: { discount, couponCode, finalTotal, shipping } })} className="btn-primary w-full mt-4 flex items-center justify-center gap-2">
              Proceed to Checkout <ArrowRight size={16} />
            </button>
            <Link to="/shop" className="btn-outline w-full mt-2 flex items-center justify-center text-sm">Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
