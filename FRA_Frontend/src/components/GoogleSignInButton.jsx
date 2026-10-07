import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Loader2, AlertCircle } from 'lucide-react';

/**
 * Production Firebase Google Authentication Button
 * Uses Firebase signInWithPopup to authenticate with Google,
 * retrieves verified ID token, and synchronizes session with backend MongoDB.
 */
export default function GoogleSignInButton({
  redirectPath = '/dashboard',
  label = 'Continue with Google',
}) {
  const { loginWithGoogle } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGoogleSignIn = async () => {
    if (loading) return;

    try {
      setLoading(true);
      setError(null);

      // Trigger Firebase Google Sign-In Popup
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      if (!user) {
        throw new Error('Google sign-in did not return user information.');
      }

      // Retrieve cryptographic Firebase ID Token
      const idToken = await user.getIdToken();

      // Synchronize with RecipeHaven backend
      const res = await loginWithGoogle({ credential: idToken });

      setLoading(false);

      if (res && res.success && res.user) {
        showToast(`Welcome back, ${res.user.name || 'Chef'}!`, 'success');
        if (res.user.role === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else {
          navigate(redirectPath, { replace: true });
        }
      } else {
        const errMsg = res?.error || 'Authentication with server failed. Please try again.';
        setError(errMsg);
        showToast(errMsg, 'error');
      }
    } catch (err) {
      setLoading(false);

      // Gracefully handle user cancellation without noisy error banners
      if (
        err.code === 'auth/popup-closed-by-user' ||
        err.code === 'auth/cancelled-popup-request'
      ) {
        return;
      }

      if (err.code === 'auth/popup-blocked') {
        const msg = 'Popup was blocked by your browser. Please allow popups for localhost.';
        setError(msg);
        showToast(msg, 'error');
        return;
      }

      if (err.code === 'auth/configuration-not-found' || err.code === 'auth/operation-not-allowed') {
        const msg = 'Google Sign-In is not enabled yet in Firebase Console under Authentication > Sign-in method.';
        setError(msg);
        showToast(msg, 'error');
        return;
      }

      const errMsg = err.message || 'Google sign-in encountered an unexpected issue.';
      setError(errMsg);
      showToast(errMsg, 'error');
    }
  };

  return (
    <div className="w-full space-y-2">
      {error && (
        <div className="flex items-start gap-2 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs font-medium animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="w-full py-2.5 px-4 rounded-xl bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700/60 border border-stone-200 dark:border-stone-700 hover:border-amber-400 dark:hover:border-amber-500 text-stone-700 dark:text-stone-200 font-semibold text-xs sm:text-sm transition-all shadow-xs hover:shadow-sm flex items-center justify-center gap-3 cursor-pointer group disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99]"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-amber-600 dark:text-amber-400" />
            <span className="font-semibold text-stone-700 dark:text-stone-300">
              Signing in with Google...
            </span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span className="font-bold text-stone-800 dark:text-stone-100 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
              {label}
            </span>
          </>
        )}
      </button>
    </div>
  );
}
