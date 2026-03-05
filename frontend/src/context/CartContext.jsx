import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!user) return;
    try {
      const { data } = await api.get('/cart');
      setCartItems(data.items || []);
    } catch {}
  };

  useEffect(() => { fetchCart(); }, [user]);

  const addToCart = async (product, quantity = 1) => {
    if (!user) { toast.error('Please login first'); return; }
    try {
      await api.post('/cart/add', { productId: product._id, price: product.salePrice || product.price, quantity });
      await fetchCart();
      toast.success('Added to cart!');
    } catch { toast.error('Failed to add to cart'); }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      await api.put('/cart/update', { productId, quantity });
      await fetchCart();
    } catch {}
  };

  const removeFromCart = async (productId) => {
    try {
      await api.delete(`/cart/remove/${productId}`);
      await fetchCart();
      toast.success('Removed from cart');
    } catch {}
  };

  const clearCart = async () => {
    try { await api.delete('/cart/clear'); setCartItems([]); } catch {}
  };

  const cartCount = cartItems.reduce((a, i) => a + i.quantity, 0);
  const cartTotal = cartItems.reduce((a, i) => a + (i.price * i.quantity), 0);

  return (
    <CartContext.Provider value={{ cartItems, cartCount, cartTotal, loading, addToCart, updateQuantity, removeFromCart, clearCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
