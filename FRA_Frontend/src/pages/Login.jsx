import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import GoogleSignInButton from '../components/GoogleSignInButton';
import {
  ChefHat,
  Shield,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  Sparkles,
} from 'lucide-react';

export default function Login() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'admin' ? 'admin' : 'user';
  const [activeRoleTab, setActiveRoleTab] = useState(initialRole);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || (activeRoleTab === 'admin' ? '/admin/dashboard' : '/dashboard');

  const roleParam = searchParams.get('role');

  // Sync tab if URL param changes without prefilling credentials
  useEffect(() => {
    const targetRole = roleParam === 'admin' ? 'admin' : 'user';
    setActiveRoleTab((prev) => {
      if (prev !== targetRole) {
        setEmail('');
        setPassword('');
        return targetRole;
      }
      return prev;
    });
  }, [roleParam]);

  const handleTabChange = (role) => {
    setActiveRoleTab(role);
    setError('');
    setSearchParams({ role });
    // Keep inputs clean on tab switch
    setEmail('');
    setPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in both your email address and password.');
      return;
    }

    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);

    if (result.success) {
      const roleLabel = result.user.role === 'admin' ? 'Administrator' : 'Home Chef';
      showToast(`Welcome back, ${result.user.name} (${roleLabel})!`, 'success');

      // Navigate to admin dashboard if admin and no explicit return path
      if (result.user.role === 'admin' && (from === '/' || from === '/dashboard')) {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } else {
      setError(result.error || 'Failed to sign in. Please verify your credentials.');
    }
  };

  const handleFillDemoUser = () => {
    setActiveRoleTab('user');
    setEmail('chef@recipehaven.com');
    setPassword('Password@123');
    setError('');
    showToast('Demo User credentials loaded', 'info');
  };

  const handleFillDemoAdmin = () => {
    setActiveRoleTab('admin');
    setEmail('admin@recipehaven.com');
    setPassword('Password@123');
    setError('');
    showToast('Demo Admin credentials loaded', 'info');
  };

  return (
    <div className="flex-1 flex items-center justify-center py-6 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-amber-50/60 via-stone-50 to-orange-50/40 min-h-[calc(100vh-4rem)]">
      <div className="max-w-5xl w-full bg-white rounded-3xl shadow-2xl shadow-stone-300/50 border border-stone-200/80 overflow-hidden grid grid-cols-1 md:grid-cols-12">
        {/* Left Visual & Features Column */}
        <div className="hidden md:flex md:col-span-5 bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 text-white p-8 lg:p-10 flex-col justify-between relative">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/25">
                <ChefHat className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl tracking-tight text-white">
                  Recipe<span className="text-amber-500">Haven</span>
                </span>
                <span className="text-[11px] uppercase tracking-wider font-semibold text-stone-400 -mt-0.5">
                  Culinary Studio
                </span>
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{activeRoleTab === 'admin' ? 'Administrative Access' : 'Home Chef Community'}</span>
              </div>
              <h3 className="text-2xl lg:text-3xl font-black text-white tracking-tight leading-snug">
                {activeRoleTab === 'admin'
                  ? 'Manage & Elevate Culinary Standards'
                  : 'Cook, Discover & Savor Great Dishes'}
              </h3>
              <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">
                {activeRoleTab === 'admin'
                  ? 'Access operational metrics, review recipe submissions, and moderate home chef discussions.'
                  : 'Bookmark favorite recipes, organize groceries, and share your signature recipes with food lovers worldwide.'}
              </p>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-stone-300">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-lg bg-stone-800 flex items-center justify-center text-amber-400 text-xs font-bold shrink-0">
                  ✓
                </div>
                <span>50+ Authentic global dishes & cuisines</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-lg bg-stone-800 flex items-center justify-center text-amber-400 text-xs font-bold shrink-0">
                  ✓
                </div>
                <span>Instant Google Sign-In with 1-click access</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-lg bg-stone-800 flex items-center justify-center text-amber-400 text-xs font-bold shrink-0">
                  ✓
                </div>
                <span>Smart grocery planning & nutrition tracking</span>
              </div>
            </div>
          </div>

          {/* 1-Click Fast Demo Credentials Buttons in Left Panel */}
          <div className="pt-6 border-t border-stone-800 space-y-2">
            <span className="text-[11px] uppercase tracking-wider font-bold text-stone-400 block">
              Instant 1-Click Demo Credentials
            </span>
            {activeRoleTab === 'user' ? (
              <button
                type="button"
                onClick={handleFillDemoUser}
                className="w-full py-2.5 px-3.5 rounded-xl bg-stone-800/90 hover:bg-stone-700 border border-stone-700 text-stone-200 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer group"
              >
                <span className="flex items-center gap-2 text-amber-400 font-bold">
                  <User className="w-4 h-4" />
                  <span>Fill User Demo</span>
                </span>
                <span className="text-[11px] text-stone-400 font-mono">chef@recipehaven.com</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFillDemoAdmin}
                className="w-full py-2.5 px-3.5 rounded-xl bg-orange-950/40 hover:bg-orange-900/50 border border-orange-800/60 text-orange-200 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer group"
              >
                <span className="flex items-center gap-2 text-orange-400 font-bold">
                  <Shield className="w-4 h-4" />
                  <span>Fill Admin Demo</span>
                </span>
                <span className="text-[11px] text-stone-400 font-mono">admin@recipehaven.com</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Form Column */}
        <div className="md:col-span-7 p-7 sm:p-9 lg:p-10 flex flex-col justify-between space-y-4">
          <div>
            {/* Dual Role Selector Tabs */}
            <div className="p-1 rounded-2xl bg-stone-100 border border-stone-200 grid grid-cols-2 gap-1 mb-5">
              <button
                type="button"
                onClick={() => handleTabChange('user')}
                className={`py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeRoleTab === 'user'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                <User className={`w-4 h-4 ${activeRoleTab === 'user' ? 'text-amber-600' : ''}`} />
                <span>Regular User</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('admin')}
                className={`py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeRoleTab === 'admin'
                    ? 'bg-white text-orange-700 shadow-sm'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                <Shield className={`w-4 h-4 ${activeRoleTab === 'admin' ? 'text-orange-600' : ''}`} />
                <span>Admin Portal</span>
              </button>
            </div>

            <div className="mb-4">
              <h2 className="text-2xl font-black text-stone-900 tracking-tight">
                {activeRoleTab === 'admin' ? 'Administrator Login' : 'Sign In to RecipeHaven'}
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 mt-1">
                {activeRoleTab === 'admin'
                  ? 'Enter admin credentials to access the moderation console.'
                  : 'Enter your credentials or continue with Google.'}
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-medium animate-shake">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-stone-50/80 border border-stone-200 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-stone-900 text-sm transition-all outline-hidden"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-amber-600 hover:text-amber-700 hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password..."
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-stone-50/80 border border-stone-200 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-stone-900 text-sm transition-all outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className={`w-full py-3 px-5 rounded-xl text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer ${
                  activeRoleTab === 'admin'
                    ? 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 shadow-orange-500/20'
                    : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-amber-500/20'
                }`}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {activeRoleTab === 'admin' ? 'Sign In as Administrator' : 'Sign In as Home Chef'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Google OAuth & Social Sign-In */}
            <div className="relative flex py-2.5 items-center">
              <div className="grow border-t border-stone-200"></div>
              <span className="shrink mx-3 text-stone-400 text-xs font-semibold uppercase tracking-wider">
                Or continue with
              </span>
              <div className="grow border-t border-stone-200"></div>
            </div>

            <GoogleSignInButton redirectPath={from} label="Continue with Google" />
          </div>

          {/* Footer links inside card */}
          <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs sm:text-sm text-stone-500">
            <button
              type="button"
              onClick={() => handleTabChange(activeRoleTab === 'admin' ? 'user' : 'admin')}
              className="font-bold text-amber-700 hover:text-amber-800 hover:underline cursor-pointer"
            >
              Switch to {activeRoleTab === 'admin' ? 'User Login' : 'Admin Login'}
            </button>
            <p>
              New here?{' '}
              <Link to="/register" className="font-bold text-amber-600 hover:underline">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
