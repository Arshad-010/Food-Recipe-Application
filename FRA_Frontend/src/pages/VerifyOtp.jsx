import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  RefreshCw,
  Clock,
  KeyRound,
  Sparkles,
} from 'lucide-react';

export default function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyOtp, forgotPassword } = useAuth();
  const { showToast } = useToast();

  const email = location.state?.email || '';
  const devOtp = location.state?.devOtp || '';

  // 6 boxes for OTP
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');

  // 10-minute validity timer (600 seconds)
  const [expireSeconds, setExpireSeconds] = useState(600);

  // 60-second cooldown timer for resend
  const [cooldownSeconds, setCooldownSeconds] = useState(60);

  const inputRefs = useRef([]);

  // Guard: Protect verify step, redirect if no email
  useEffect(() => {
    if (!email) {
      navigate('/forgot-password', { replace: true });
    }
  }, [email, navigate]);

  // Auto-focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // 10-minute countdown timer
  useEffect(() => {
    if (expireSeconds <= 0) return;
    const timer = setInterval(() => {
      setExpireSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [expireSeconds]);

  // 60-second cooldown timer for resend button
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = setInterval(() => {
      setCooldownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle individual box change
  const handleChange = (index, value) => {
    // Only accept numeric digits
    const cleaned = value.replace(/\D/g, '');

    if (!cleaned) {
      const updated = [...otpDigits];
      updated[index] = '';
      setOtpDigits(updated);
      return;
    }

    // Handle single digit input
    const char = cleaned.slice(-1);
    const updated = [...otpDigits];
    updated[index] = char;
    setOtpDigits(updated);
    setError('');

    // Advance to next box if available
    if (index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Handle keyboard navigation (backspace, arrows)
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0 && inputRefs.current[index - 1]) {
        // Move to previous box on backspace if current is empty
        inputRefs.current[index - 1].focus();
        const updated = [...otpDigits];
        updated[index - 1] = '';
        setOtpDigits(updated);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle clipboard paste of full 6-digit code
  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim().replace(/\D/g, '');
    if (!pasteData) return;

    const digits = pasteData.slice(0, 6).split('');
    const updated = ['', '', '', '', '', ''];
    digits.forEach((d, i) => {
      updated[i] = d;
    });
    setOtpDigits(updated);
    setError('');

    // Focus either the next empty box or the 6th box
    const focusIndex = Math.min(digits.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  // Auto-fill dev code helper if in development
  const handleFillDevOtp = () => {
    if (!devOtp) return;
    const digits = devOtp.slice(0, 6).split('');
    const updated = [...digits];
    while (updated.length < 6) updated.push('');
    setOtpDigits(updated);
    showToast('Loaded demo OTP code', 'info');
    inputRefs.current[5]?.focus();
  };

  // Submit OTP for verification
  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError('');

    const fullOtp = otpDigits.join('');
    if (fullOtp.length !== 6) {
      setError('Please enter all 6 digits of your verification code.');
      return;
    }

    if (expireSeconds <= 0) {
      setError('Your verification code has expired. Please request a new code.');
      return;
    }

    setSubmitting(true);
    const result = await verifyOtp(email, fullOtp);
    setSubmitting(false);

    if (result.success && result.resetToken) {
      showToast('Verification code verified! Please set your new password.', 'success');
      navigate('/reset-password', {
        state: {
          email,
          resetToken: result.resetToken,
        },
      });
    } else {
      setError(result.error || 'Verification code failed. Please double-check the digits.');
    }
  };

  // Resend code handler with 60-second cooldown
  const handleResend = async () => {
    if (cooldownSeconds > 0 || resending) return;

    setResending(true);
    setError('');
    const result = await forgotPassword(email);
    setResending(false);

    if (result.success) {
      showToast('A fresh 6-digit verification code has been dispatched.', 'success');
      setExpireSeconds(600); // Reset 10-minute expiry
      setCooldownSeconds(60); // Reset 60s cooldown
      setOtpDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } else {
      setError(result.error || 'Failed to resend code. Please try again.');
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
          <span className="w-8 h-1 bg-amber-600 rounded-full" />
          <span className="w-8 h-8 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
            2
          </span>
          <span className="w-8 h-1 bg-stone-200 rounded-full" />
          <span className="w-8 h-8 rounded-full bg-stone-100 text-stone-400 font-bold text-xs flex items-center justify-center">
            3
          </span>
        </div>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-500 items-center justify-center text-white shadow-lg shadow-orange-500/25 mb-2">
            <KeyRound className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Verify your email
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 max-w-xs mx-auto">
            Enter the 6-digit verification code sent to your email.
            {email && (
              <>
                <br />
                <strong className="text-stone-800 font-semibold">{email}</strong>
              </>
            )}
          </p>
        </div>

        {/* Development Helper Badge */}
        {devOtp && (
          <button
            type="button"
            onClick={handleFillDevOtp}
            className="w-full py-2 px-3 rounded-2xl bg-amber-50 hover:bg-amber-100/70 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Development Code Available</span>
            </span>
            <span className="font-mono bg-white px-2 py-0.5 rounded-lg border border-amber-300 text-amber-900 font-bold">
              {devOtp} (Click to fill)
            </span>
          </button>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium flex items-center gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* 6-Box OTP Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                Enter 6-Digit Code
              </label>
              <div className="flex items-center gap-1 text-xs font-semibold text-stone-500">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span className={expireSeconds < 60 ? 'text-rose-600 font-bold' : ''}>
                  {expireSeconds > 0 ? formatTimer(expireSeconds) : 'Expired'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-6 gap-2 sm:gap-3" onPaste={handlePaste}>
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputRefs.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  disabled={submitting}
                  className={`w-full aspect-square text-center text-xl sm:text-2xl font-black rounded-2xl border transition-all outline-hidden ${
                    digit
                      ? 'border-amber-500 bg-amber-50/50 text-amber-950 ring-2 ring-amber-500/20 shadow-xs'
                      : 'border-stone-200 bg-stone-50 text-stone-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                  }`}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || otpDigits.join('').length !== 6 || expireSeconds <= 0}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold text-sm shadow-md shadow-amber-500/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying Code...</span>
              </>
            ) : (
              <>
                <span>Verify Code</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Resend OTP Section with 60s countdown */}
        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-center space-y-1 text-xs">
          <p className="text-stone-500">Didn't receive the verification email?</p>
          <button
            type="button"
            onClick={handleResend}
            disabled={cooldownSeconds > 0 || resending}
            className="inline-flex items-center gap-1.5 font-bold text-amber-700 hover:text-amber-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            {resending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Requesting code...</span>
              </>
            ) : cooldownSeconds > 0 ? (
              <>
                <Clock className="w-3.5 h-3.5" />
                <span>Resend Code in {cooldownSeconds}s</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Resend Code</span>
              </>
            )}
          </button>
        </div>

        {/* Navigation Footer */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
          <Link
            to="/forgot-password"
            className="inline-flex items-center gap-1 font-bold text-stone-600 hover:text-amber-700"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Change Email</span>
          </Link>

          <Link
            to="/login"
            className="font-semibold text-stone-500 hover:text-stone-800"
          >
            Return to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
