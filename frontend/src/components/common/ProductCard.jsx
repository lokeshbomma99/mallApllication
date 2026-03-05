import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Zap, Eye } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [wishlisted, setWishlisted] = useState(false);
  const [imgError, setImgError] = useState(false);

  const price = product.salePrice || product.price;
  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const discountPct = hasDiscount ? Math.round(((product.price - product.salePrice) / product.price) * 100) : 0;
  const isFlash = product.flashSale?.active;

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login first'); return; }
    try {
      const { data } = await api.post(`/wishlist/toggle/${product._id}`);
      setWishlisted(data.wishlisted);
      toast.success(data.wishlisted ? '❤️ Added to wishlist' : 'Removed from wishlist');
    } catch { toast.error('Failed'); }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (user?.role !== 'customer') { toast.error('Only customers can add to cart'); return; }
    addToCart(product);
  };

  return (
    <Link to={`/product/${product._id}`} className="card product-card group block hover:shadow-md transition-all duration-300 hover:-translate-y-1">
      {/* Image */}
      <div className="relative bg-gray-50 aspect-square overflow-hidden">
        {!imgError && product.images?.[0] ? (
          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={() => setImgError(true)} />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
            <ShoppingCart size={32} className="text-blue-300" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isFlash && <span className="badge bg-red-500 text-white text-xs"><Zap size={10} className="mr-0.5" />FLASH</span>}
          {hasDiscount && <span className="badge bg-green-500 text-white text-xs">-{discountPct}%</span>}
          {product.stock === 0 && <span className="badge bg-gray-500 text-white text-xs">OUT</span>}
        </div>

        {/* Actions overlay */}
        <div className="product-actions absolute bottom-2 left-2 right-2 flex gap-2">
          <button onClick={handleAddToCart} disabled={product.stock === 0}
            className="flex-1 bg-blue-600 text-white text-xs font-semibold py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-1 disabled:bg-gray-300">
            <ShoppingCart size={12} /> Add to Cart
          </button>
        </div>

        {/* Wishlist btn */}
        <button onClick={handleWishlist} className={`absolute top-2 right-2 p-1.5 rounded-full transition-all ${wishlisted ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-500 hover:text-red-500'}`}>
          <Heart size={14} fill={wishlisted ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-xs text-blue-500 font-medium mb-1 truncate">{product.shop?.name || 'SuperMall'}</p>
        <h3 className="text-sm font-semibold text-gray-800 mb-1 line-clamp-2 leading-snug">{product.name}</h3>

        <div className="flex items-center gap-1 mb-2">
          <div className="flex">
            {Array(5).fill(0).map((_, i) => (
              <Star key={i} size={10} className={i < Math.floor(product.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />
            ))}
          </div>
          <span className="text-xs text-gray-400">({product.totalReviews || 0})</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-900">₹{price?.toLocaleString()}</span>
          {hasDiscount && <span className="text-xs text-gray-400 line-through">₹{product.price?.toLocaleString()}</span>}
        </div>

        {product.loyaltyPoints > 0 && (
          <p className="text-xs text-purple-600 mt-1">🎯 Earn {product.loyaltyPoints} pts</p>
        )}
      </div>
    </Link>
  );
}
