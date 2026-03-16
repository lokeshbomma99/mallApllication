import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import {
  ShoppingBag, Heart, Search, User, Menu, X, ChevronDown,
  Bell, LogOut, Settings, Package, Home, Grid3X3, Zap, Globe,
  GitCompare
} from 'lucide-react';
import api from '../../utils/api';

export default function CustomerLayout() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [compareCount, setCompareCount] = useState(
    () => JSON.parse(localStorage.getItem('compareList') || '[]').length
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (user) {
      api.get('/notifications').then(r => setNotifications(r.data)).catch(() => {});
    }
  }, [user]);

  // Sync compareCount when localStorage changes (e.g. from ProductDetailPage)
  useEffect(() => {
    const syncCount = () => {
      setCompareCount(JSON.parse(localStorage.getItem('compareList') || '[]').length);
    };
    window.addEventListener('storage', syncCount);
    return () => window.removeEventListener('storage', syncCount);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('lang', lang);
    document.dir = lang === 'ar' ? 'rtl' : 'ltr';
    setLangOpen(false);
  };

  const langs = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'ar', label: 'العربية', flag: '🇸🇦' },
    { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
    { code: 'gu', label: 'ગુજરાતી', flag: '🏳️' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-blue-700 text-white text-xs py-1.5 text-center">
        🎉 Free shipping on orders above ₹499 &nbsp;|&nbsp; Use code <strong>SUPERMALL10</strong> for 10% off
      </div>

      {/* Navbar */}
      <header className={`sticky top-0 z-50 bg-white transition-shadow duration-200 ${scrolled ? 'shadow-md' : 'shadow-sm border-b border-gray-100'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-4 h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
                <ShoppingBag size={20} className="text-white" />
              </div>
              <span className="font-bold text-xl text-blue-700 hidden sm:block">SuperMall</span>
            </Link>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-2 hidden md:flex">
              <div className="relative w-full">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={t('search')}
                  className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </form>

            {/* Nav links */}
            <nav className="hidden lg:flex items-center gap-1">
              <Link to="/" className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'}`}>
                {t('home')}
              </Link>
              <Link to="/shop" className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/shop' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'}`}>
                {t('shop')}
              </Link>
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-2 ml-auto">
              {/* Language */}
              <div className="relative">
                <button onClick={() => setLangOpen(!langOpen)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors">
                  <Globe size={20} />
                </button>
                {langOpen && (
                  <div className="absolute right-0 top-full mt-2 w-44 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden animate-fade-in">
                    {langs.map(l => (
                      <button key={l.code} onClick={() => changeLanguage(l.code)} className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-blue-50 hover:text-blue-700 transition-colors ${i18n.language === l.code ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}`}>
                        <span>{l.flag}</span> {l.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Wishlist */}
              {user?.role === 'customer' && (
                <Link to="/wishlist" className="p-2 text-gray-500 hover:text-red-500 hover:bg-gray-50 rounded-lg transition-colors">
                  <Heart size={20} />
                </Link>
              )}

              {/* Compare */}
              {user?.role === 'customer' && (
                <Link to="/compare" title="Compare products" className="relative p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors">
                  <GitCompare size={20} />
                  {compareCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                      {compareCount}
                    </span>
                  )}
                </Link>
              )}

              {/* Notifications */}
              {user && (
                <div className="relative">
                  <button onClick={() => setNotifOpen(!notifOpen)} className="relative p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors">
                    <Bell size={20} />
                    {unreadCount > 0 && <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{unreadCount}</span>}
                  </button>
                  {notifOpen && (
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-100 rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto animate-fade-in">
                      <div className="p-3 border-b border-gray-100 flex items-center justify-between">
                        <span className="font-semibold text-sm">Notifications</span>
                        {unreadCount > 0 && <button className="text-xs text-blue-600 hover:underline" onClick={() => api.put('/notifications/read-all').then(() => setNotifications(n => n.map(x => ({...x, read: true}))))}>Mark all read</button>}
                      </div>
                      {notifications.length === 0 ? (
                        <p className="p-4 text-sm text-gray-500 text-center">No notifications</p>
                      ) : (
                        notifications.slice(0, 10).map(n => (
                          <div key={n._id} className={`p-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!n.read ? 'bg-blue-50/40' : ''}`}>
                            <p className="text-sm font-medium text-gray-800">{n.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Cart */}
              {user?.role === 'customer' && (
                <Link to="/cart" className="relative p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors">
                  <ShoppingBag size={20} />
                  {cartCount > 0 && <span className="absolute top-1 right-1 w-4 h-4 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">{cartCount}</span>}
                </Link>
              )}

              {/* Profile */}
              {user ? (
                <div className="relative">
                  <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-700 hidden sm:block">{user.name?.split(' ')[0]}</span>
                    <ChevronDown size={14} className="text-gray-400" />
                  </button>
                  {profileOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden animate-fade-in">
                      <div className="p-3 border-b border-gray-100">
                        <p className="font-semibold text-sm text-gray-800">{user.name}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                        <span className="badge bg-blue-100 text-blue-700 mt-1">{user.role}</span>
                      </div>
                      {user.role === 'customer' && <>
                        <Link to="/profile" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors" onClick={() => setProfileOpen(false)}><User size={15} /> Profile</Link>
                        <Link to="/orders" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors" onClick={() => setProfileOpen(false)}><Package size={15} /> My Orders</Link>
                        <Link to="/wishlist" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors" onClick={() => setProfileOpen(false)}><Heart size={15} /> Wishlist</Link>
                        <Link to="/compare" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors" onClick={() => setProfileOpen(false)}><GitCompare size={15} /> Compare</Link>
                      </>}
                      {user.role === 'shopowner' && <Link to="/shop-owner" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors" onClick={() => setProfileOpen(false)}><Grid3X3 size={15} /> My Shop</Link>}
                      {user.role === 'admin' && <Link to="/admin" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors" onClick={() => setProfileOpen(false)}><Settings size={15} /> Admin Panel</Link>}
                      <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100"><LogOut size={15} /> {t('logout')}</button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login" className="btn-outline text-sm px-4 py-2">{t('login')}</Link>
                  <Link to="/register" className="btn-primary text-sm px-4 py-2">{t('register')}</Link>
                </div>
              )}

              {/* Mobile menu */}
              <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100">
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile search */}
          <div className="md:hidden pb-3">
            <form onSubmit={handleSearch} className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={t('search')} className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </form>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 px-4 py-3 space-y-1 bg-white animate-slide-up">
            {[
              { to: '/', label: t('home') },
              { to: '/shop', label: t('shop') },
              { to: '/compare', label: 'Compare' },
            ].map(l => (
              <Link key={l.to} to={l.to} onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700 font-medium">{l.label}</Link>
            ))}
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="animate-fade-in">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-blue-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <ShoppingBag size={16} className="text-white" />
              </div>
              <span className="font-bold text-lg">SuperMall</span>
            </div>
            <p className="text-blue-200 text-sm">Your ultimate shopping destination with thousands of stores and millions of products.</p>
          </div>
          {[
            { title: 'Shopping', links: ['All Products', 'Flash Sales', 'New Arrivals', 'Best Sellers'] },
            { title: 'Account', links: ['Login', 'Register', 'My Orders', 'Wishlist'] },
            { title: 'Support', links: ['Help Center', 'Returns', 'Track Order', 'Contact Us'] },
          ].map(col => (
            <div key={col.title}>
              <h4 className="font-semibold mb-3">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map(l => <li key={l}><a href="#" className="text-blue-200 text-sm hover:text-white transition-colors">{l}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-blue-800 px-4 sm:px-6 py-4 text-center text-blue-300 text-xs">
          © 2024 SuperMall. All rights reserved. | Built with ❤️ using MERN Stack
        </div>
      </footer>
    </div>
  );
}
