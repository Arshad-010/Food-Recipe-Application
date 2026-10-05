import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import GoogleSignInButton from '../components/GoogleSignInButton';
import {
  ChefHat,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  AlertCircle,
} from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError('');
  };

  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: 'bg-stone-200', text: '' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/\d/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 1;

    switch (score) {
      case 1:
        return { score: 1, label: 'Weak', color: 'bg-rose-500', text: 'text-rose-600' };
      case 2:
        return { score: 2, label: 'Fair', color: 'bg-amber-500', text: 'text-amber-600' };
      case 3:
        return { score: 3, label: 'Good', color: 'bg-blue-500', text: 'text-blue-600' };
      case 4:
        return { score: 4, label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-600' };
      default:
        return { score: 0, label: 'Too short', color: 'bg-stone-300', text: 'text-stone-400' };
    }
  };

  const strength = getPasswordStrength(formData.password);
  const passwordsMatch = formData.confirmPassword
    ? formData.password === formData.confirmPassword
    : true;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const { name, email, password, confirmPassword } = formData;

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Please complete all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your confirmation.');
      return;
    }

    setSubmitting(true);
    const result = await register({
      name: name.trim(),
      email: email.trim(),
      password,
      confirmPassword,
    });
    setSubmitting(false);

    if (result.success) {
      showToast('Account registered successfully! Welcome to RecipeHaven.', 'success');
      navigate('/dashboard', { replace: true });
    } else {
      setError(result.error || 'Registration failed. An account with this email may already exist.');
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-amber-50/60 via-stone-50 to-orange-50/40">
      <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-3xl shadow-xl shadow-stone-200/50 border border-stone-200/80">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-500 items-center justify-center text-white shadow-lg shadow-orange-500/25 mb-2">
            <ChefHat className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Create Chef Account
          </h2>
          <p className="text-sm text-stone-500">
            Join thousands of home chefs sharing, saving, and discovering mouthwatering recipes.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium flex items-center gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Julia Child"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50/80 border border-stone-200 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-stone-900 text-sm transition-all outline-hidden"
              />
            </div>
          </div>

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
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="chef@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50/80 border border-stone-200 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-stone-900 text-sm transition-all outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
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

            {/* Live Password Strength Indicator */}
            {formData.password && (
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-stone-500">Password strength:</span>
                  <span className={`font-bold ${strength.text}`}>{strength.label}</span>
                </div>
                <div className="grid grid-cols-4 gap-1 h-1.5">
                  <div className={`rounded-full transition-all ${strength.score >= 1 ? strength.color : 'bg-stone-200'}`} />
                  <div className={`rounded-full transition-all ${strength.score >= 2 ? strength.color : 'bg-stone-200'}`} />
                  <div className={`rounded-full transition-all ${strength.score >= 3 ? strength.color : 'bg-stone-200'}`} />
                  <div className={`rounded-full transition-all ${strength.score >= 4 ? strength.color : 'bg-stone-200'}`} />
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter password"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50/80 border text-stone-900 text-sm transition-all outline-hidden ${
                  formData.confirmPassword && !passwordsMatch
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                    : 'border-stone-200 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                }`}
              />
            </div>
            {formData.confirmPassword && !passwordsMatch && (
              <p className="text-xs text-rose-600 mt-1 font-medium">Passwords do not match.</p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold text-sm shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating your account...</span>
              </>
            ) : (
              <>
                <span>Complete Registration</span>
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

        <GoogleSignInButton redirectPath="/dashboard" label="Sign up with Google" />

        {/* Footer */}
        <div className="text-center pt-2 border-t border-stone-100">
          <p className="text-sm text-stone-500">
            Already have an account?{' '}
            <Link to="/login?role=user" className="font-semibold text-amber-600 hover:text-amber-700 hover:underline">
              Sign in to your account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
