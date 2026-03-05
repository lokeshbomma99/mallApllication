import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Package, ShoppingBag, BarChart3, Tag, RefreshCw, Store, LogOut, Menu, ChevronRight } from 'lucide-react';

const navItems = [
  { to: '/shop-owner', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/shop-owner/products', label: 'Products', icon: Package },
  { to: '/shop-owner/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/shop-owner/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/shop-owner/coupons', label: 'Coupons', icon: Tag },
  { to: '/shop-owner/returns', label: 'Returns', icon: RefreshCw },
  { to: '/shop-owner/setup', label: 'Shop Settings', icon: Store },
];

export default function ShopOwnerLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (item) => item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className={`bg-white border-r border-gray-100 flex flex-col transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'} shrink-0 sticky top-0 h-screen`}>
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          {!collapsed && (
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Store size={16} className="text-white" />
              </div>
              <span className="font-bold text-blue-700 text-sm">Shop Owner</span>
            </Link>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 ml-auto">
            {collapsed ? <ChevronRight size={16} /> : <Menu size={16} />}
          </button>
        </div>

        {!collapsed && (
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800 truncate">{user?.name}</p>
                <span className="badge bg-green-100 text-green-700 text-xs">Shop Owner</span>
              </div>
            </div>
          </div>
        )}

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <Link key={item.to} to={item.to}
              className={`sidebar-link ${isActive(item) ? 'active' : ''} ${collapsed ? 'justify-center px-2' : ''}`}>
              <item.icon size={18} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-100">
          <button onClick={() => { logout(); navigate('/'); }}
            className={`sidebar-link w-full text-red-500 hover:bg-red-50 hover:text-red-600 ${collapsed ? 'justify-center px-2' : ''}`}>
            <LogOut size={18} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-100 px-6 h-14 flex items-center justify-between sticky top-0 z-30">
          <h1 className="font-semibold text-gray-800">
            {navItems.find(n => isActive(n))?.label || 'Shop Panel'}
          </h1>
          <Link to="/" className="text-xs text-blue-600 hover:underline">View Mall</Link>
        </header>
        <main className="flex-1 p-6 overflow-auto animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
