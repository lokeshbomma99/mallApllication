import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GitCompare, Trash2, Star, ShoppingCart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';

export default function ComparePage() {
  const [compareList, setCompareList] = useState([]);
  const { addToCart } = useCart();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('compareList') || '[]');
    setCompareList(stored);
  }, []);

  const removeFromCompare = (productId) => {
    const updated = compareList.filter(p => p._id !== productId);
    setCompareList(updated);
    localStorage.setItem('compareList', JSON.stringify(updated));
  };

  const clearAll = () => { setCompareList([]); localStorage.removeItem('compareList'); };

  if (compareList.length === 0) return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center animate-fade-in">
      <GitCompare size={48} className="mx-auto text-gray-200 mb-3" />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">No products to compare</h2>
      <p className="text-gray-500 mb-6">Browse products and click the compare icon to add them here.</p>
      <Link to="/shop" className="btn-primary inline-block">Browse Products</Link>
    </div>
  );

  const fields = [
    { label: 'Price', render: p => <span className="font-bold text-blue-700">₹{(p.salePrice || p.price)?.toLocaleString()}</span> },
    { label: 'Rating', render: p => <div className="flex items-center gap-1 justify-center"><Star size={14} className="text-yellow-400 fill-yellow-400" /><span className="text-sm">{p.rating || 'N/A'}</span></div> },
    { label: 'Category', render: p => <span className="text-sm text-gray-600">{p.category}</span> },
    { label: 'Discount', render: p => p.salePrice && p.salePrice < p.price ? <span className="badge bg-green-100 text-green-700">{Math.round(((p.price - p.salePrice) / p.price) * 100)}% OFF</span> : <span className="text-gray-400 text-sm">—</span> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <GitCompare size={24} className="text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Compare Products</h1>
        </div>
        <button onClick={clearAll} className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1"><Trash2 size={14} /> Clear All</button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <td className="p-4 w-32 text-sm font-medium text-gray-500">Product</td>
              {compareList.map(p => (
                <td key={p._id} className="p-4 text-center">
                  <div className="relative">
                    <button onClick={() => removeFromCompare(p._id)} className="absolute -top-2 -right-2 w-6 h-6 bg-red-100 text-red-500 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors text-xs">✕</button>
                    <div className="w-20 h-20 mx-auto rounded-xl overflow-hidden bg-gray-50 mb-2">
                      {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" /> : <ShoppingCart size={24} className="m-auto mt-6 text-gray-200" />}
                    </div>
                    <Link to={`/product/${p._id}`} className="text-sm font-semibold text-gray-800 hover:text-blue-600 line-clamp-2">{p.name}</Link>
                  </div>
                </td>
              ))}
            </tr>
          </thead>
          <tbody>
            {fields.map(f => (
              <tr key={f.label} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="p-4 text-sm font-medium text-gray-500">{f.label}</td>
                {compareList.map(p => (
                  <td key={p._id} className="p-4 text-center">{f.render(p)}</td>
                ))}
              </tr>
            ))}
            <tr>
              <td className="p-4" />
              {compareList.map(p => (
                <td key={p._id} className="p-4 text-center">
                  <Link to={`/product/${p._id}`} className="btn-primary text-sm px-4 py-2 inline-block">View Product</Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-400 mt-3 text-center">Tip: Visit any product and click the compare icon (⇄) to add it here</p>
    </div>
  );
}
