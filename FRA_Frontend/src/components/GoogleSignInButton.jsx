import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Loader2, Sparkles, X } from 'lucide-react';

export default function GoogleSignInButton({ redirectPath = '/dashboard', label = 'Continue with Google' }) {
  const { loginWithGoogle } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [demoEmail, setDemoEmail] = useState('demo.chef@gmail.com');
  const [demoName, setDemoName] = useState('Alex Google Chef');

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const handleGoogleCredentialResponse = React.useCallback(
    async (response) => {
      if (!response || !response.credential) {
        showToast('Google sign-in was cancelled or failed.', 'error');
        return;
      }

      try {
        setLoading(true);
        const res = await loginWithGoogle({ credential: response.credential });
        setLoading(false);

        if (res.success) {
          showToast(`Welcome, ${res.user.name}! Signed in via Google.`, 'success');
          navigate(redirectPath, { replace: true });
        } else {
          showToast(res.error || 'Google sign-in failed', 'error');
        }
      } catch (err) {
        setLoading(false);
        showToast(err.message || 'Google authentication error', 'error');
      }
    },
    [loginWithGoogle, navigate, redirectPath, showToast]
  );

  // Initialize official Google Identity Services if client ID is configured
  useEffect(() => {
    if (!googleClientId) return;

    function initializeGoogleSignIn() {
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });
      } catch (err) {
        console.warn('Google Identity initialization notice:', err);
      }
    }

    // Load Google GIS script dynamically if not present
    if (!window.google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        initializeGoogleSignIn();
      };
      document.body.appendChild(script);
    } else {
      initializeGoogleSignIn();
    }
  }, [googleClientId, handleGoogleCredentialResponse]);

  const handleButtonClick = () => {
    if (googleClientId && window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // Fallback to one-click demo Google sign-in
            setShowDemoModal(true);
          }
        });
      } catch (e) {
        setShowDemoModal(true);
      }
    } else {
      // Demo / development mode when Google OAuth Client ID is not yet provided
      setShowDemoModal(true);
    }
  };

  const handleDemoGoogleLogin = async (e) => {
    e?.preventDefault();
    if (!demoEmail.trim()) return;

    try {
      setLoading(true);
      const res = await loginWithGoogle({
        email: demoEmail.trim(),
        name: demoName.trim() || 'Google Home Chef',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        googleId: `google_demo_${Date.now()}`,
      });
      setLoading(false);
      setShowDemoModal(false);

      if (res.success) {
        showToast(`Welcome, ${res.user.name}! Signed in via Google.`, 'success');
        navigate(redirectPath, { replace: true });
      } else {
        showToast(res.error || 'Google sign-in failed', 'error');
      }
    } catch (err) {
      setLoading(false);
      showToast(err.message || 'Google sign-in failed', 'error');
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleButtonClick}
        disabled={loading}
        className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 hover:border-stone-300 text-stone-700 font-semibold text-sm transition-all shadow-xs flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin text-stone-400" />
        ) : (
          <svg className="w-5 h-5 transition-transform group-hover:scale-105" viewBox="0 0 24 24">
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
        )}
        <span>{label}</span>
      </button>

      {/* Demo / Config Modal when testing without live Google Client ID */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                <h3 className="font-bold text-stone-900 text-base">Google Sign In</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDemoModal(false)}
                className="text-stone-400 hover:text-stone-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-500 leading-relaxed">
              {!googleClientId
                ? 'To test Google OAuth in this demo environment, continue with one-click Google demo account, or enter any Google email.'
                : 'Select or confirm your Google account to proceed with sign-in:'}
            </p>

            <form onSubmit={handleDemoGoogleLogin} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                  Google Account Name
                </label>
                <input
                  type="text"
                  value={demoName}
                  onChange={(e) => setDemoName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:border-amber-500 outline-hidden"
                  placeholder="Alex Google Chef"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                  Google Account Email
                </label>
                <input
                  type="email"
                  required
                  value={demoEmail}
                  onChange={(e) => setDemoEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:border-amber-500 outline-hidden"
                  placeholder="demo.chef@gmail.com"
                />
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>Sign In with Google Account</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowDemoModal(false)}
                  className="w-full py-2 px-3 text-xs font-semibold text-stone-500 hover:text-stone-700 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
