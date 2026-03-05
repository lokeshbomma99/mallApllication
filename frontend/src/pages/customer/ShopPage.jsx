import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import api from '../../utils/api';
import ProductCard from '../../components/common/ProductCard';

const CATEGORIES = ['Fashion', 'Electronics', 'Home & Garden', 'Sports', 'Beauty', 'Books', 'Toys', 'Food', 'Jewelry', 'Automotive'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    minPrice: '', maxPrice: '',
    sort: 'newest',
    flashSale: searchParams.get('flashSale') || '',
    page: 1,
  });

  const fetchProducts = async (f = filters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (f.search) params.set('search', f.search);
      if (f.category) params.set('category', f.category);
      if (f.minPrice) params.set('minPrice', f.minPrice);
      if (f.maxPrice) params.set('maxPrice', f.maxPrice);
      if (f.sort) params.set('sort', f.sort);
      if (f.flashSale) params.set('flashSale', f.flashSale);
      params.set('page', f.page);
      params.set('limit', '24');
      const { data } = await api.get(`/products?${params}`);
      setProducts(data.products || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const applyFilters = (newFilters) => {
    const updated = { ...filters, ...newFilters, page: 1 };
    setFilters(updated);
    fetchProducts(updated);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Products</h1>
          <p className="text-gray-500 text-sm mt-1">{total.toLocaleString()} products found</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Sort */}
          <select value={filters.sort} onChange={e => applyFilters({ sort: e.target.value })}
            className="input w-auto text-sm py-2">
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button onClick={() => setShowFilters(!showFilters)} className="btn-outline flex items-center gap-2 py-2">
            <SlidersHorizontal size={16} /> Filters
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Filters */}
        <aside className={`shrink-0 w-64 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          <div className="card p-5 sticky top-24">
            <h3 className="font-semibold text-gray-900 mb-4">Filters</h3>

            {/* Search */}
            <div className="mb-5">
              <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">Search</label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={filters.search} onChange={e => applyFilters({ search: e.target.value })}
                  className="input pl-8 text-sm py-2" placeholder="Search..." />
              </div>
            </div>

            {/* Category */}
            <div className="mb-5">
              <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">Category</label>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                <button onClick={() => applyFilters({ category: '' })} className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${!filters.category ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                  All Categories
                </button>
                {CATEGORIES.map(c => (
                  <button key={c} onClick={() => applyFilters({ category: c })} className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${filters.category === c ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="mb-5">
              <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">Price Range</label>
              <div className="flex gap-2">
                <input type="number" value={filters.minPrice} onChange={e => setFilters({...filters, minPrice: e.target.value})} onBlur={() => applyFilters({})} className="input text-sm py-2" placeholder="Min" />
                <input type="number" value={filters.maxPrice} onChange={e => setFilters({...filters, maxPrice: e.target.value})} onBlur={() => applyFilters({})} className="input text-sm py-2" placeholder="Max" />
              </div>
            </div>

            {/* Flash Sale */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={filters.flashSale === 'true'} onChange={e => applyFilters({ flashSale: e.target.checked ? 'true' : '' })} className="rounded text-blue-600" />
                <span className="text-sm text-gray-700">Flash Sale Only ⚡</span>
              </label>
            </div>

            {/* Clear */}
            {(filters.category || filters.minPrice || filters.maxPrice || filters.search || filters.flashSale) && (
              <button onClick={() => applyFilters({ category: '', minPrice: '', maxPrice: '', search: '', flashSale: '' })} className="w-full mt-4 text-sm text-red-500 hover:text-red-700 flex items-center justify-center gap-1">
                <X size={14} /> Clear Filters
              </button>
            )}
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array(24).fill(0).map((_, i) => <div key={i} className="card h-64 animate-pulse bg-gray-100" />)}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <Search size={48} className="mx-auto mb-3 opacity-30" />
              <p className="text-lg font-medium">No products found</p>
              <p className="text-sm mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map(p => <ProductCard key={p._id} product={p} />)}
              </div>
              {/* Pagination */}
              {pages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {Array(pages).fill(0).map((_, i) => (
                    <button key={i} onClick={() => { const p = {...filters, page: i + 1}; setFilters(p); fetchProducts(p); }}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${filters.page === i + 1 ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-400'}`}>
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
