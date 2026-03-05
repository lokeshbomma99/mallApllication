import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Minus, Plus, Zap, Shield, Truck, RefreshCw, ChevronRight, GitCompare } from 'lucide-react';
import api from '../../utils/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import ProductCard from '../../components/common/ProductCard';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [prodRes, revRes, recRes] = await Promise.all([
          api.get(`/products/${id}`),
          api.get(`/reviews/product/${id}`),
          api.get(`/products/${id}/recommendations`),
        ]);
        setProduct(prodRes.data);
        setReviews(revRes.data);
        setRecommendations(recRes.data);
        if (user) api.post(`/products/${id}/view`).catch(() => {});
      } catch { navigate('/shop'); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  const handleWishlist = async () => {
    if (!user) { toast.error('Please login first'); return; }
    try {
      const { data } = await api.post(`/wishlist/toggle/${id}`);
      setWishlisted(data.wishlisted);
      toast.success(data.wishlisted ? '❤️ Added to wishlist' : 'Removed from wishlist');
    } catch {}
  };

  const handleAddToCart = () => {
    if (user?.role !== 'customer') { toast.error('Only customers can add to cart'); return; }
    for (let i = 0; i < quantity; i++) addToCart(product);
  };

  const handleCompare = () => {
    const stored = JSON.parse(localStorage.getItem('compareList') || '[]');
    if (stored.find(p => p._id === product._id)) { toast.error('Already in compare list'); return; }
    if (stored.length >= 4) { toast.error('Max 4 products'); return; }
    stored.push({ _id: product._id, name: product.name, price: product.price, salePrice: product.salePrice, image: product.images?.[0], category: product.category, rating: product.rating });
    localStorage.setItem('compareList', JSON.stringify(stored));
    toast.success('Added to compare!');
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Login to review'); return; }
    setSubmittingReview(true);
    try {
      const { data } = await api.post('/reviews', { product: id, shop: product.shop._id, ...reviewForm });
      setReviews(r => [{ ...data, customer: { name: user.name } }, ...r]);
      setReviewForm({ rating: 5, comment: '' });
      toast.success('Review submitted!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSubmittingReview(false); }
  };

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-10">
      <div className="aspect-square bg-gray-100 rounded-2xl animate-pulse" />
      <div className="space-y-4">{Array(6).fill(0).map((_, i) => <div key={i} className="h-6 bg-gray-100 rounded animate-pulse" />)}</div>
    </div>
  );

  if (!product) return null;

  const price = product.salePrice || product.price;
  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const discountPct = hasDiscount ? Math.round(((product.price - product.salePrice) / product.price) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-blue-600">Home</Link><ChevronRight size={14} />
        <Link to="/shop" className="hover:text-blue-600">Shop</Link><ChevronRight size={14} />
        <span className="text-gray-800 truncate max-w-xs">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-10 mb-12">
        {/* Images */}
        <div>
          <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 mb-3">
            {product.images?.[selectedImage] ? (
              <img src={product.images[selectedImage]} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center"><ShoppingCart size={64} className="text-gray-200" /></div>
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setSelectedImage(i)} className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${selectedImage === i ? 'border-blue-600' : 'border-gray-200'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="flex items-start justify-between gap-4 mb-2">
            <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
            <div className="flex gap-2 shrink-0">
              <button onClick={handleWishlist} className={`p-2.5 rounded-xl border transition-all ${wishlisted ? 'bg-red-50 border-red-200 text-red-500' : 'border-gray-200 text-gray-400 hover:text-red-500'}`}>
                <Heart size={18} fill={wishlisted ? 'currentColor' : 'none'} />
              </button>
              <button onClick={handleCompare} title="Compare" className="p-2.5 rounded-xl border border-gray-200 text-gray-400 hover:text-blue-600 transition-all">
                <GitCompare size={18} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-3">
            <div className="flex">{Array(5).fill(0).map((_, i) => <Star key={i} size={14} className={i < Math.floor(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />)}</div>
            <span className="text-sm font-semibold">{product.rating}</span>
            <span className="text-sm text-gray-400">({reviews.length} reviews) • {product.sold} sold</span>
          </div>

          {product.flashSale?.active && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-3 flex items-center gap-2">
              <Zap size={14} className="text-red-500" /><span className="text-red-600 font-semibold text-sm">⚡ Flash Sale Active!</span>
            </div>
          )}

          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl font-bold text-gray-900">₹{price?.toLocaleString()}</span>
            {hasDiscount && <><span className="text-lg text-gray-400 line-through">₹{product.price?.toLocaleString()}</span><span className="badge bg-green-100 text-green-700 font-bold">{discountPct}% OFF</span></>}
          </div>

          {product.loyaltyPoints > 0 && <p className="text-sm text-purple-600 mb-4">🎯 Earn <strong>{product.loyaltyPoints} loyalty points</strong></p>}

          <div className="flex items-center gap-4 mb-5">
            <span className="text-sm font-medium text-gray-700">Qty:</span>
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-3 py-2 hover:bg-gray-50"><Minus size={14} /></button>
              <span className="px-4 py-2 font-semibold min-w-[3rem] text-center">{quantity}</span>
              <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} className="px-3 py-2 hover:bg-gray-50"><Plus size={14} /></button>
            </div>
            <span className="text-sm text-gray-400">{product.stock} available</span>
          </div>

          <div className="flex gap-3 mb-5">
            <button onClick={handleAddToCart} disabled={product.stock === 0} className="flex-1 btn-secondary flex items-center justify-center gap-2 disabled:opacity-40">
              <ShoppingCart size={16} /> Add to Cart
            </button>
            <button onClick={() => { handleAddToCart(); navigate('/cart'); }} disabled={product.stock === 0} className="flex-1 btn-primary disabled:opacity-40">
              Buy Now
            </button>
          </div>

          <div className="flex gap-2 mb-5">
            <span className="text-sm text-gray-500">Share:</span>
            <button onClick={() => { window.open(`https://wa.me/?text=${encodeURIComponent(product.name + ' ' + window.location.href)}`); }} className="text-xs bg-green-50 text-green-600 px-3 py-1.5 rounded-lg font-medium hover:bg-green-100 transition-colors">WhatsApp</button>
            <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }} className="text-xs bg-gray-50 text-gray-600 px-3 py-1.5 rounded-lg font-medium hover:bg-gray-100 transition-colors">Copy Link</button>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-100">
            {[{ icon: <Truck size={14} className="text-blue-600" />, t: 'Free Delivery', s: '₹499+' },
              { icon: <Shield size={14} className="text-green-600" />, t: 'Secure Pay', s: 'Safe & encrypted' },
              { icon: <RefreshCw size={14} className="text-orange-500" />, t: 'Easy Return', s: '7-day policy' }].map(b => (
              <div key={b.t} className="flex flex-col items-center p-2 bg-gray-50 rounded-xl text-center">
                {b.icon}<p className="text-xs font-semibold text-gray-700 mt-1">{b.t}</p><p className="text-xs text-gray-400">{b.s}</p>
              </div>
            ))}
          </div>

          {product.shop && (
            <div className="mt-4 flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold">{product.shop.name?.charAt(0)}</div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">{product.shop.name}</p>
                <div className="flex items-center gap-1"><Star size={10} className="text-yellow-400 fill-yellow-400" /><span className="text-xs text-gray-500">{product.shop.rating}</span></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-10">
        <div className="flex gap-1 border-b border-gray-200 mb-6">
          {['description', 'reviews', 'specs'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm font-medium capitalize border-b-2 -mb-px transition-colors ${activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {tab === 'reviews' ? `Reviews (${reviews.length})` : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'description' && <p className="text-gray-600 leading-relaxed">{product.description || 'No description.'}</p>}

        {activeTab === 'specs' && (
          <div className="grid sm:grid-cols-2 gap-3">
            {[{ key: 'Category', value: product.category }, { key: 'SKU', value: product.sku || 'N/A' }, { key: 'Stock', value: product.stock }, { key: 'Total Sold', value: product.sold }].map(s => (
              <div key={s.key} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <span className="text-sm font-medium text-gray-500 w-32 shrink-0">{s.key}</span>
                <span className="text-sm text-gray-800">{s.value}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-5">
            {user?.role === 'customer' && (
              <form onSubmit={submitReview} className="card p-5">
                <h4 className="font-semibold text-gray-900 mb-3">Write a Review</h4>
                <div className="flex gap-1 mb-3">
                  {[1,2,3,4,5].map(s => (
                    <button key={s} type="button" onClick={() => setReviewForm(f => ({...f, rating: s}))}>
                      <Star size={24} className={s <= reviewForm.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />
                    </button>
                  ))}
                </div>
                <textarea value={reviewForm.comment} onChange={e => setReviewForm(f => ({...f, comment: e.target.value}))} className="input mb-3 h-24 resize-none" placeholder="Your experience..." required />
                <button type="submit" disabled={submittingReview} className="btn-primary px-5 py-2">{submittingReview ? 'Submitting...' : 'Submit Review'}</button>
              </form>
            )}
            {reviews.length === 0 ? <p className="text-center text-gray-400 py-8">No reviews yet.</p> : reviews.map(r => (
              <div key={r._id} className="card p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm">{r.customer?.name?.charAt(0)}</div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{r.customer?.name}</p>
                    <div className="flex">{Array(5).fill(0).map((_, i) => <Star key={i} size={11} className={i < r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />)}</div>
                  </div>
                  <span className="text-xs text-gray-400 ml-auto">{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-gray-600">{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {recommendations.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">You May Also Like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {recommendations.slice(0, 6).map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
