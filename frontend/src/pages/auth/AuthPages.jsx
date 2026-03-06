import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShoppingBag, Eye, EyeOff, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

export function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);

const handleSubmit = async (e) => {
  e.preventDefault();

  const res = await login(form.email, form.password);

  if (res.success) {
    toast.success("Welcome back!", { duration: 2000 });

    if (res.role === "admin") navigate("/admin");
    else if (res.role === "shopowner") navigate("/shop-owner");
    else navigate("/");
  } else {
    toast.error(res.message || "Invalid email or password", {
      duration: 2000
    });
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <ShoppingBag size={22} className="text-white" />
            </div>
            <span className="font-bold text-2xl text-blue-700">SuperMall</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-500 mt-1">Sign in to your account</p>
        </div>

        <div className="card p-8 animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="input" placeholder="you@example.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="input pr-10" placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? <><Loader size={16} className="animate-spin" /> Signing in...</> : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg text-xs text-blue-600">
            <p className="font-semibold mb-1">Demo Accounts:</p>
            <p>Admin: admin@supermall.com / admin123</p>
            <p>Shop Owner: shop@supermall.com / shop123</p>
            <p>Customer: user@supermall.com / user123</p>
          </div>

          <p className="text-center text-sm text-gray-500 mt-4">
            Don't have an account? <Link to="/register" className="text-blue-600 font-medium hover:underline">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export function RegisterPage() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'customer' });
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await register(form.name, form.email, form.password, form.role);
    if (res.success) {
      toast.success('Account created!');
      if (res.role === 'shopowner') navigate('/shop-owner/setup');
      else navigate('/');
    } else toast.error(res.message);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <ShoppingBag size={22} className="text-white" />
            </div>
            <span className="font-bold text-2xl text-blue-700">SuperMall</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Create an account</h1>
          <p className="text-gray-500 mt-1">Join SuperMall today</p>
        </div>

        <div className="card p-8 animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input" placeholder="John Doe" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="input" placeholder="you@example.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="input pr-10" placeholder="Min 6 characters" minLength={6} required />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><EyeOff size={16} /></button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">I want to</label>
              <div className="grid grid-cols-2 gap-3">
                {[{ value: 'customer', label: '🛍️ Shop', sub: 'Browse & buy products' }, { value: 'shopowner', label: '🏪 Sell', sub: 'Open my own shop' }].map(opt => (
                  <button key={opt.value} type="button" onClick={() => setForm({...form, role: opt.value})}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${form.role === opt.value ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-200'}`}>
                    <p className="font-semibold text-sm">{opt.label}</p>
                    <p className="text-xs text-gray-500">{opt.sub}</p>
                  </button>
                ))}
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? <><Loader size={16} className="animate-spin" /> Creating...</> : 'Create Account'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account? <Link to="/login" className="text-blue-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
