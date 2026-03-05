import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, ArrowRight, Star, ShoppingBag, TrendingUp, Shield, Truck, RefreshCw } from 'lucide-react';
import api from '../../utils/api';
import ProductCard from '../../components/common/ProductCard';
import FlashSaleTimer from '../../components/common/FlashSaleTimer';

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [flashProducts, setFlashProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [platformStats, setPlatformStats] = useState({ totalShops: 0, totalProducts: 0, totalUsers: 0 });
  const [loading, setLoading] = useState(true);
  const [currentBanner, setCurrentBanner] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [cats, flash, featured, bans, stats] = await Promise.all([
          api.get('/categories'),
          api.get('/products?flashSale=true&limit=8'),
          api.get('/products?sort=popular&limit=12'),
          api.get('/banners'),
          api.get('/admin/stats').catch(() => ({ data: {} })),
        ]);
        setCategories(cats.data);
        setFlashProducts(flash.data.products || []);
        setFeaturedProducts(featured.data.products || []);
        setBanners(bans.data);
        setPlatformStats(stats.data || {});
      } catch {} finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  useEffect(() => {
    if (banners.length > 1) {
      const timer = setInterval(() => setCurrentBanner(c => (c + 1) % banners.length), 5000);
      return () => clearInterval(timer);
    }
  }, [banners]);

  const defaultCategories = [
    { name: 'Fashion', icon: '👗', color: 'bg-pink-50 border-pink-100' },
    { name: 'Electronics', icon: '📱', color: 'bg-blue-50 border-blue-100' },
    { name: 'Home & Garden', icon: '🏠', color: 'bg-green-50 border-green-100' },
    { name: 'Sports', icon: '⚽', color: 'bg-orange-50 border-orange-100' },
    { name: 'Beauty', icon: '💄', color: 'bg-purple-50 border-purple-100' },
    { name: 'Books', icon: '📚', color: 'bg-yellow-50 border-yellow-100' },
    { name: 'Toys', icon: '🧸', color: 'bg-red-50 border-red-100' },
    { name: 'Food', icon: '🍕', color: 'bg-emerald-50 border-emerald-100' },
  ];

  const displayCats = categories.length > 0 ? categories : defaultCategories;

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-700 via-blue-600 to-blue-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-20 w-96 h-96 bg-blue-300 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-up">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-1.5 rounded-full text-sm font-medium mb-6">
                <Zap size={14} className="text-yellow-300" /> Flash Sale Active — Up to 70% Off!
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Shop Everything<br />
                <span className="text-yellow-300">At One Place</span>
              </h1>
              <p className="text-blue-100 text-lg mb-8 max-w-md">
                Discover thousands of products from hundreds of verified shops. Fashion, Electronics, Food & more.
              </p>
              <div className="flex flex-wrap gap-4">
                <button onClick={() => navigate('/shop')} className="bg-white text-blue-700 font-bold px-8 py-3 rounded-xl hover:bg-blue-50 transition-all shadow-lg flex items-center gap-2">
                  Shop Now <ArrowRight size={18} />
                </button>
                <button onClick={() => navigate('/register')} className="bg-white/20 backdrop-blur border border-white/30 text-white font-semibold px-8 py-3 rounded-xl hover:bg-white/30 transition-all">
                  Sell With Us
                </button>
              </div>
              <div className="flex items-center gap-6 mt-10">
                {[
                  { n: platformStats.totalShops > 0 ? `${platformStats.totalShops}+` : '—', label: 'Shops' },
                  { n: platformStats.totalProducts > 0 ? `${platformStats.totalProducts}+` : '—', label: 'Products' },
                  { n: platformStats.totalUsers > 0 ? `${platformStats.totalUsers}+` : '—', label: 'Customers' },
                ].map(s => (
                  <div key={s.label}>
                    <p className="text-2xl font-bold">{s.n}</p>
                    <p className="text-blue-200 text-sm">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="hidden md:flex justify-center">
              <div className="relative">
                <div className="w-72 h-72 bg-white/10 backdrop-blur rounded-3xl flex items-center justify-center border border-white/20">
                  <ShoppingBag size={100} className="text-white/60" />
                </div>
                {[{ icon: '📦', text: 'Fast Delivery', pos: '-top-4 -left-8' }, { icon: '⭐', text: '4.9 Rating', pos: '-bottom-4 -right-8' }, { icon: '🔒', text: 'Secure Pay', pos: 'top-1/2 -right-12' }].map(badge => (
                  <div key={badge.text} className={`absolute ${badge.pos} bg-white rounded-xl px-3 py-2 shadow-lg flex items-center gap-2`}>
                    <span>{badge.icon}</span>
                    <span className="text-xs font-semibold text-gray-700">{badge.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: <Truck size={20} className="text-blue-600" />, title: 'Free Shipping', sub: 'On orders above ₹499' },
              { icon: <Shield size={20} className="text-green-600" />, title: 'Secure Payment', sub: '100% safe & secure' },
              { icon: <RefreshCw size={20} className="text-orange-500" />, title: 'Easy Returns', sub: '7-day return policy' },
              { icon: <Star size={20} className="text-yellow-500" />, title: 'Top Rated', sub: 'Verified shop owners' },
            ].map(f => (
              <div key={f.title} className="flex items-center gap-3 py-2">
                <div className="p-2 bg-gray-50 rounded-lg">{f.icon}</div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{f.title}</p>
                  <p className="text-xs text-gray-500">{f.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Shop by Category</h2>
          <Link to="/shop" className="text-blue-600 text-sm font-medium hover:underline flex items-center gap-1">View all <ArrowRight size={14} /></Link>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-3">
          {displayCats.slice(0, 8).map((cat, i) => (
            <Link key={cat._id || i} to={`/shop?category=${cat.name}`} className={`flex flex-col items-center gap-2 p-3 rounded-2xl border ${cat.color || 'bg-blue-50 border-blue-100'} hover:shadow-md transition-all hover:-translate-y-1 group`}>
              <span className="text-2xl md:text-3xl">{cat.icon || '🛍️'}</span>
              <span className="text-xs font-medium text-gray-700 text-center">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Flash Sale */}
      {flashProducts.length > 0 && (
        <section className="bg-gradient-to-r from-red-50 to-orange-50 py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-red-500 text-white px-3 py-1.5 rounded-lg flex items-center gap-2 font-bold text-sm">
                  <Zap size={14} /> FLASH SALE
                </div>
                <FlashSaleTimer endsAt={new Date(Date.now() + 3 * 60 * 60 * 1000)} />
              </div>
              <Link to="/shop?flashSale=true" className="text-red-600 text-sm font-medium hover:underline flex items-center gap-1">See all <ArrowRight size={14} /></Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
              {flashProducts.slice(0, 8).map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Trending Products</h2>
            <p className="text-gray-500 text-sm mt-1">Most loved by our customers</p>
          </div>
          <Link to="/shop?sort=popular" className="text-blue-600 text-sm font-medium hover:underline flex items-center gap-1">View all <ArrowRight size={14} /></Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array(12).fill(0).map((_, i) => <div key={i} className="card h-64 animate-pulse bg-gray-100" />)}
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {featuredProducts.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <ShoppingBag size={48} className="mx-auto mb-3 opacity-30" />
            <p>Products coming soon! Be the first to sell on SuperMall.</p>
            <Link to="/register" className="btn-primary mt-4 inline-block">Start Selling</Link>
          </div>
        )}
      </section>

      {/* CTA Banner */}
      <section className="bg-blue-700 text-white py-16 mx-4 sm:mx-6 rounded-3xl mb-10 max-w-7xl mx-auto">
        <div className="text-center px-4">
          <TrendingUp size={40} className="mx-auto mb-4 text-blue-200" />
          <h2 className="text-3xl font-bold mb-3">Start Your Own Shop</h2>
          <p className="text-blue-200 mb-6 max-w-md mx-auto">Join {platformStats.totalShops > 0 ? `${platformStats.totalShops}+` : 'thousands of'} shop owners on SuperMall. Zero setup fee. Start selling in minutes.</p>
          <Link to="/register" className="bg-white text-blue-700 font-bold px-8 py-3 rounded-xl inline-flex items-center gap-2 hover:bg-blue-50 transition-all">
            Open Your Shop <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
