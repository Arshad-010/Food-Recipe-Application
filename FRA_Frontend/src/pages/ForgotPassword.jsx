import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Mail,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  ShieldCheck,
  KeyRound,
} from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { forgotPassword } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Please provide your registered email address.');
      return;
    }

    setSubmitting(true);
    const result = await forgotPassword(cleanEmail);
    setSubmitting(false);

    if (result.success) {
      showToast('A 6-digit verification code has been dispatched to your email.', 'success');
      navigate('/verify-otp', {
        state: {
          email: cleanEmail,
          devOtp: result.devOtp,
        },
      });
    } else {
      setError(result.error || 'Unable to request verification code. Please try again.');
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-amber-50/60 via-stone-50 to-orange-50/40 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950 transition-colors">
      <div className="max-w-md w-full space-y-6 bg-white dark:bg-stone-900 p-6 sm:p-8 rounded-3xl shadow-xl shadow-stone-200/50 dark:shadow-none border border-stone-200/80 dark:border-stone-800 transition-colors">
        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="w-8 h-8 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
            1
          </span>
          <span className="w-8 h-1 bg-stone-200 dark:bg-stone-800 rounded-full" />
          <span className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-400 font-bold text-xs flex items-center justify-center">
            2
          </span>
          <span className="w-8 h-1 bg-stone-200 dark:bg-stone-800 rounded-full" />
          <span className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-400 font-bold text-xs flex items-center justify-center">
            3
          </span>
        </div>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-500 items-center justify-center text-white shadow-lg shadow-orange-500/25 mb-2">
            <KeyRound className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white tracking-tight">
            Forgot your password?
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 max-w-xs mx-auto">
            Enter your email and we'll send you a verification code.
          </p>
        </div>

        {/* Security Badge */}
        <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/50 flex items-center gap-2.5 text-xs text-amber-900 dark:text-amber-200">
          <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>We protect your account with cryptographically hashed one-time codes.</span>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm font-medium flex items-center gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400 dark:text-stone-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="chef@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50/80 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:bg-white dark:focus:bg-stone-750 focus:border-amber-500 dark:focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 text-sm transition-all outline-hidden"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold text-sm shadow-md shadow-amber-500/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sending Verification Code...</span>
              </>
            ) : (
              <>
                <span>Send Verification Code</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Links */}
        <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 font-bold text-stone-600 dark:text-stone-400 hover:text-amber-700 dark:hover:text-amber-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Sign In</span>
          </Link>

          <Link
            to="/verify-otp"
            className="font-semibold text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 hover:underline"
          >
            Already have a code?
          </Link>
        </div>
      </div>
    </div>
  );
}
