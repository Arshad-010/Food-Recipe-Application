import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Check,
  X,
} from 'lucide-react';

export default function ResetPassword() {
  const { token: urlToken } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { resetPasswordWithOtp, resetPassword } = useAuth();
  const { showToast } = useToast();

  const email = location.state?.email || '';
  const resetToken = location.state?.resetToken || urlToken || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Guard: Protect reset step, redirect if opened without valid session token
  useEffect(() => {
    if (!resetToken) {
      showToast('Please verify your 6-digit code first.', 'warning');
      navigate('/forgot-password', { replace: true });
    }
  }, [resetToken, navigate, showToast]);

  // Compute password criteria
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const passwordsMatch = confirmPassword ? password === confirmPassword : true;

  const strengthScore = [hasMinLength, hasUpper, hasLower, hasNumber].filter(Boolean).length;

  const getStrengthLabel = () => {
    if (!password) return { label: 'None', color: 'bg-stone-200', text: 'text-stone-400' };
    if (strengthScore <= 1) return { label: 'Weak', color: 'bg-rose-500', text: 'text-rose-600' };
    if (strengthScore === 2) return { label: 'Fair', color: 'bg-amber-500', text: 'text-amber-600' };
    if (strengthScore === 3) return { label: 'Good', color: 'bg-blue-500', text: 'text-blue-600' };
    return { label: 'Strong & Secure', color: 'bg-emerald-500', text: 'text-emerald-600' };
  };

  const strength = getStrengthLabel();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!password || !confirmPassword) {
      setError('Please complete both password fields.');
      return;
    }

    if (password.length < 8) {
      setError('New password must contain at least 8 characters.');
      return;
    }

    if (!hasUpper || !hasLower || !hasNumber) {
      setError('Password must contain at least one uppercase letter, one lowercase letter, and one number.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setSubmitting(true);

    let result;
    if (location.state?.resetToken) {
      result = await resetPasswordWithOtp({
        email,
        resetToken: location.state.resetToken,
        newPassword: password,
        confirmPassword,
      });
    } else {
      // Legacy URL token support
      result = await resetPassword(urlToken, { password, confirmPassword });
    }

    setSubmitting(false);

    if (result.success) {
      setSuccess(true);
      showToast('Your password has been reset successfully! Please sign in.', 'success');
      setTimeout(() => {
        navigate('/login?role=user', { replace: true });
      }, 2000);
    } else {
      setError(result.error || 'Failed to update password. Your reset authorization may have expired.');
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-amber-50/60 via-stone-50 to-orange-50/40">
      <div className="max-w-md w-full space-y-6 bg-white p-6 sm:p-8 rounded-3xl shadow-xl shadow-stone-200/50 border border-stone-200/80">
        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
            ✓
          </span>
          <span className="w-8 h-1 bg-emerald-600 rounded-full" />
          <span className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
            ✓
          </span>
          <span className="w-8 h-1 bg-amber-600 rounded-full" />
          <span className="w-8 h-8 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
            3
          </span>
        </div>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-500 items-center justify-center text-white shadow-lg shadow-orange-500/25 mb-2">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Create a new password
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 max-w-xs mx-auto">
            Choose a new, strong password for <br />
            <strong className="text-stone-800 font-semibold">{email || 'your account'}</strong>
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium flex items-center gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="font-bold text-lg">Password changed successfully.</h3>
            <p className="text-xs text-emerald-800">
              Your password has been securely reset. Redirecting you to the sign-in page...
            </p>
            <div className="pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors shadow-xs"
              >
                <span>Back to Login</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 chars, 1 uppercase, 1 number"
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

              {/* Password Strength Meter */}
              {password && (
                <div className="mt-2.5 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-stone-500">Strength:</span>
                    <span className={`font-bold ${strength.text}`}>{strength.label}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 h-1.5">
                    <div className={`rounded-full transition-all ${strengthScore >= 1 ? strength.color : 'bg-stone-200'}`} />
                    <div className={`rounded-full transition-all ${strengthScore >= 2 ? strength.color : 'bg-stone-200'}`} />
                    <div className={`rounded-full transition-all ${strengthScore >= 3 ? strength.color : 'bg-stone-200'}`} />
                    <div className={`rounded-full transition-all ${strengthScore >= 4 ? strength.color : 'bg-stone-200'}`} />
                  </div>

                  {/* Checklist */}
                  <div className="grid grid-cols-2 gap-1 pt-1 text-[11px] text-stone-500">
                    <span className={`flex items-center gap-1 ${hasMinLength ? 'text-emerald-700 font-semibold' : ''}`}>
                      {hasMinLength ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-stone-300" />}
                      8+ Characters
                    </span>
                    <span className={`flex items-center gap-1 ${hasUpper ? 'text-emerald-700 font-semibold' : ''}`}>
                      {hasUpper ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-stone-300" />}
                      1 Uppercase Letter
                    </span>
                    <span className={`flex items-center gap-1 ${hasLower ? 'text-emerald-700 font-semibold' : ''}`}>
                      {hasLower ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-stone-300" />}
                      1 Lowercase Letter
                    </span>
                    <span className={`flex items-center gap-1 ${hasNumber ? 'text-emerald-700 font-semibold' : ''}`}>
                      {hasNumber ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-stone-300" />}
                      1 Number (0-9)
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl bg-stone-50/80 border text-stone-900 text-sm transition-all outline-hidden ${
                    confirmPassword && !passwordsMatch
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                      : 'border-stone-200 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword && !passwordsMatch && (
                <p className="text-xs text-rose-600 mt-1 font-medium">Passwords do not match.</p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting || !hasMinLength || !hasUpper || !hasLower || !hasNumber || !passwordsMatch}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold text-sm shadow-md shadow-amber-500/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Resetting Password...</span>
                </>
              ) : (
                <>
                  <span>Reset Password</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-2 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-amber-700"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Cancel and Return to Sign In</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
