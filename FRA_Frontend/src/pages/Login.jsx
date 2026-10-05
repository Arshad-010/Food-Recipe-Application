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

  // Sync tab if URL param changes without prefilling credentials
  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'admin') {
      setActiveRoleTab('admin');
    } else if (roleParam === 'user') {
      setActiveRoleTab('user');
    }
    // Do not prefill inputs by default
    setEmail('');
    setPassword('');
  }, [searchParams]);

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
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-amber-50/60 via-stone-50 to-orange-50/40">
      <div className="max-w-md w-full space-y-6 bg-white p-6 sm:p-8 rounded-3xl shadow-xl shadow-stone-200/50 border border-stone-200/80">
        {/* Dual Role Selector Tabs */}
        <div className="p-1 rounded-2xl bg-stone-100 border border-stone-200 grid grid-cols-2 gap-1">
          <button
            type="button"
            onClick={() => handleTabChange('user')}
            className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeRoleTab === 'user'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <User className={`w-4 h-4 ${activeRoleTab === 'user' ? 'text-amber-600' : ''}`} />
            <span>Regular User Login</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('admin')}
            className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeRoleTab === 'admin'
                ? 'bg-white text-orange-700 shadow-sm'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <Shield className={`w-4 h-4 ${activeRoleTab === 'admin' ? 'text-orange-600' : ''}`} />
            <span>Admin Portal Login</span>
          </button>
        </div>

        {/* Dynamic Header Based on Selected Role */}
        <div className="text-center space-y-2">
          <div
            className={`inline-flex w-14 h-14 rounded-2xl items-center justify-center text-white shadow-lg mb-2 transition-all ${
              activeRoleTab === 'admin'
                ? 'bg-gradient-to-tr from-orange-600 to-red-600 shadow-red-500/25'
                : 'bg-gradient-to-tr from-amber-600 to-orange-500 shadow-orange-500/25'
            }`}
          >
            {activeRoleTab === 'admin' ? (
              <Shield className="w-8 h-8" />
            ) : (
              <ChefHat className="w-8 h-8" />
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            {activeRoleTab === 'admin' ? 'Administrator Portal' : 'User / Chef Sign In'}
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 max-w-xs mx-auto">
            {activeRoleTab === 'admin'
              ? 'Access administrative stats, approve/reject recipes, moderate community discussions, and manage users.'
              : 'Sign in to bookmark favorites, create custom recipes, adjust servings, and manage your grocery shopping list.'}
          </p>
        </div>

        {/* 1-Click Fast Demo Credentials Buttons */}
        <div className="space-y-2">
          {activeRoleTab === 'user' ? (
            <button
              type="button"
              onClick={handleFillDemoUser}
              className="w-full py-2.5 px-3 rounded-2xl bg-stone-50 hover:bg-amber-50 border border-stone-200 hover:border-amber-300 text-stone-700 hover:text-amber-900 font-semibold text-xs transition-colors flex items-center justify-between cursor-pointer group"
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Fill User Demo (Home Chef)</span>
              </span>
              <span className="text-[11px] text-stone-500 group-hover:text-amber-800 bg-stone-100 group-hover:bg-amber-200/60 px-2 py-0.5 rounded-lg font-mono">
                chef@recipehaven.com
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFillDemoAdmin}
              className="w-full py-2.5 px-3 rounded-2xl bg-stone-50 hover:bg-orange-50 border border-stone-200 hover:border-orange-300 text-stone-700 hover:text-orange-900 font-semibold text-xs transition-colors flex items-center justify-between cursor-pointer group"
            >
              <span className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-orange-600" />
                <span>Fill Admin Demo (Administrator)</span>
              </span>
              <span className="text-[11px] text-stone-500 group-hover:text-orange-800 bg-stone-100 group-hover:bg-orange-200/60 px-2 py-0.5 rounded-lg font-mono">
                admin@recipehaven.com
              </span>
            </button>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium animate-shake">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
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
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50/80 border border-stone-200 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-stone-900 text-sm transition-all outline-hidden"
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
                placeholder="Enter your password..."
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
            className={`w-full mt-2 py-3 px-4 rounded-xl text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer ${
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
        <div className="relative flex py-1 items-center">
          <div className="grow border-t border-stone-200"></div>
          <span className="shrink mx-3 text-stone-400 text-xs font-semibold uppercase tracking-wider">Or continue with</span>
          <div className="grow border-t border-stone-200"></div>
        </div>

        <GoogleSignInButton redirectPath={from} label="Continue with Google" />

        {/* Switch Account Quick Toggles */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
          <span>Need a different role?</span>
          <button
            type="button"
            onClick={() => handleTabChange(activeRoleTab === 'admin' ? 'user' : 'admin')}
            className="font-bold text-amber-700 hover:text-amber-800 hover:underline cursor-pointer"
          >
            Switch to {activeRoleTab === 'admin' ? 'User Login' : 'Admin Login'}
          </button>
        </div>

        {/* Registration Link */}
        <div className="text-center pt-2">
          <p className="text-sm text-stone-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-semibold text-amber-600 hover:text-amber-700 hover:underline">
              Create a free Chef account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
