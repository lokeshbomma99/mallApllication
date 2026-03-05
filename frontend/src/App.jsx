import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Auth
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Customer
import CustomerLayout from './components/customer/CustomerLayout';
import HomePage from './pages/customer/HomePage';
import ShopPage from './pages/customer/ShopPage';
import ProductDetailPage from './pages/customer/ProductDetailPage';
import CartPage from './pages/customer/CartPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import WishlistPage from './pages/customer/WishlistPage';
import OrdersPage from './pages/customer/OrdersPage';
import OrderDetailPage from './pages/customer/OrderDetailPage';
import ProfilePage from './pages/customer/ProfilePage';
import SearchPage from './pages/customer/SearchPage';
import ComparePage from './pages/customer/ComparePage';

// Shop Owner
import ShopOwnerLayout from './components/shopowner/ShopOwnerLayout';
import ShopDashboard from './pages/shopowner/ShopDashboard';
import ShopProducts from './pages/shopowner/ShopProducts';
import ShopOrders from './pages/shopowner/ShopOrders';
import ShopAnalytics from './pages/shopowner/ShopAnalytics';
import ShopSetup from './pages/shopowner/ShopSetup';
import ShopCoupons from './pages/shopowner/ShopCoupons';
import ShopReturns from './pages/shopowner/ShopReturns';

// Admin
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminShops from './pages/admin/AdminShops';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminCategories from './pages/admin/AdminCategories';
import AdminBanners from './pages/admin/AdminBanners';

const ProtectedRoute = ({ children, roles }) => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/" replace />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Auth */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Customer */}
      <Route path="/" element={<CustomerLayout />}>
        <Route index element={<HomePage />} />
        <Route path="shop" element={<ShopPage />} />
        <Route path="product/:id" element={<ProductDetailPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="compare" element={<ComparePage />} />
        <Route path="cart" element={<ProtectedRoute roles={['customer']}><CartPage /></ProtectedRoute>} />
        <Route path="checkout" element={<ProtectedRoute roles={['customer']}><CheckoutPage /></ProtectedRoute>} />
        <Route path="wishlist" element={<ProtectedRoute roles={['customer']}><WishlistPage /></ProtectedRoute>} />
        <Route path="orders" element={<ProtectedRoute roles={['customer']}><OrdersPage /></ProtectedRoute>} />
        <Route path="orders/:id" element={<ProtectedRoute roles={['customer']}><OrderDetailPage /></ProtectedRoute>} />
        <Route path="profile" element={<ProtectedRoute roles={['customer']}><ProfilePage /></ProtectedRoute>} />
      </Route>

      {/* Shop Owner */}
      <Route path="/shop-owner" element={<ProtectedRoute roles={['shopowner']}><ShopOwnerLayout /></ProtectedRoute>}>
        <Route index element={<ShopDashboard />} />
        <Route path="setup" element={<ShopSetup />} />
        <Route path="products" element={<ShopProducts />} />
        <Route path="orders" element={<ShopOrders />} />
        <Route path="analytics" element={<ShopAnalytics />} />
        <Route path="coupons" element={<ShopCoupons />} />
        <Route path="returns" element={<ShopReturns />} />
      </Route>

      {/* Admin */}
      <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminLayout /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="shops" element={<AdminShops />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="banners" element={<AdminBanners />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: { background: '#1e3a8a', color: '#fff', borderRadius: '12px', fontFamily: 'Plus Jakarta Sans, sans-serif' },
              success: { style: { background: '#059669' } },
              error: { style: { background: '#dc2626' } },
            }}
          />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
