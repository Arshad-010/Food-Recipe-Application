import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Loader2, AlertCircle, HelpCircle, X, ExternalLink } from 'lucide-react';

/**
 * Production-ready Google Identity Services (GIS) Sign-In Button
 * Cryptographically authenticates users via official Google OAuth2 ID tokens.
 */
export default function GoogleSignInButton({
  redirectPath = '/dashboard',
  text = 'continue_with', // 'continue_with' | 'signin_with' | 'signup_with'
}) {
  const { loginWithGoogle } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [gisLoaded, setGisLoaded] = useState(false);

  const containerRef = useRef(null);
  const isSubmittingRef = useRef(false);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // Process verified ID token returned by Google Identity Services
  const handleGoogleCredentialResponse = useCallback(
    async (response) => {
      if (!response || !response.credential) {
        showToast('Google authentication was cancelled or encountered an error.', 'error');
        return;
      }

      if (isSubmittingRef.current) return;
      isSubmittingRef.current = true;

      try {
        setLoading(true);
        setError(null);

        // Send official Google ID token to backend for cryptographic verification
        const res = await loginWithGoogle({ credential: response.credential });

        setLoading(false);
        isSubmittingRef.current = false;

        if (res.success && res.user) {
          showToast(`Welcome, ${res.user.name}! Signed in with Google.`, 'success');
          // Navigate to role-appropriate dashboard
          if (res.user.role === 'admin') {
            navigate('/admin/dashboard', { replace: true });
          } else {
            navigate(redirectPath, { replace: true });
          }
        } else {
          const errMsg = res.error || 'Google sign-in failed. Please try again.';
          setError(errMsg);
          showToast(errMsg, 'error');
        }
      } catch (err) {
        setLoading(false);
        isSubmittingRef.current = false;
        const errMsg = err.message || 'Google authentication error occurred.';
        setError(errMsg);
        showToast(errMsg, 'error');
      }
    },
    [loginWithGoogle, navigate, redirectPath, showToast]
  );

  // Load and initialize Google Identity Services SDK
  useEffect(() => {
    if (!googleClientId) return;

    let isMounted = true;

    function renderGisButton() {
      if (!isMounted || !window.google?.accounts?.id || !containerRef.current) return;

      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Compute safe width strictly within Google's allowed range (200-400px)
        const measuredWidth = containerRef.current.parentElement?.offsetWidth || 340;
        const safeWidth = Math.min(Math.max(measuredWidth, 200), 400);

        // Render official, secure Google Sign-In button
        window.google.accounts.id.renderButton(containerRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: text,
          shape: 'rectangular',
          logo_alignment: 'left',
          width: safeWidth,
        });

        if (isMounted) setGisLoaded(true);
      } catch (err) {
        console.error('[Google GIS Error]:', err);
        if (isMounted) setError('Failed to initialize Google Sign-In button.');
      }
    }

    if (window.google?.accounts?.id) {
      renderGisButton();
    } else {
      const existingScript = document.getElementById('google-gsi-client');
      if (!existingScript) {
        const script = document.createElement('script');
        script.id = 'google-gsi-client';
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
          renderGisButton();
        };
        script.onerror = () => {
          if (isMounted) setError('Unable to load Google Identity Services library.');
        };
        document.body.appendChild(script);
      } else {
        existingScript.addEventListener('load', renderGisButton);
      }
    }

    return () => {
      isMounted = false;
    };
  }, [googleClientId, handleGoogleCredentialResponse, text]);

  // If Google Client ID is configured, render Google button container
  if (googleClientId) {
    return (
      <div className="w-full space-y-2">
        {loading && (
          <div className="flex items-center justify-center gap-2 py-2 text-xs font-semibold text-stone-600 bg-stone-50 rounded-xl border border-stone-200 animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
            <span>Verifying Google account with server...</span>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading state indicator as sibling to avoid React DOM unmounting conflicts */}
        {!gisLoaded && !loading && (
          <div className="w-full py-2.5 px-4 rounded-xl bg-stone-50 border border-stone-200 text-stone-500 font-semibold text-xs flex items-center justify-center gap-2 animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin text-stone-400" />
            <span>Loading Google Sign-In...</span>
          </div>
        )}

        {/* Isolated leaf container strictly for Google iframe rendering */}
        <div
          ref={containerRef}
          id="google-signin-container"
          className={`w-full flex justify-center min-h-[44px] overflow-hidden rounded-xl ${
            gisLoaded ? 'block' : 'hidden'
          }`}
        />
      </div>
    );
  }

  // If Google Client ID is NOT configured, show explicit setup prompt instead of mock accounts
  return (
    <>
      <div className="w-full space-y-2">
        <button
          type="button"
          onClick={() => setShowConfigModal(true)}
          className="w-full py-2.5 px-4 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 hover:border-amber-400 text-stone-700 font-semibold text-xs transition-all shadow-2xs flex items-center justify-between cursor-pointer group"
        >
          <span className="flex items-center gap-2.5">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
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
            <span className="font-bold text-stone-800">Continue with Google</span>
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-md">
            <HelpCircle className="w-3 h-3" />
            <span>Setup Client ID</span>
          </span>
        </button>

        <p className="text-[11px] text-stone-400 text-center">
          Google OAuth is enabled in code. Add your Google Client ID to activate live sign-in.
        </p>
      </div>

      {/* Instructions Modal explaining how to configure Google OAuth */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
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
                <h3 className="font-bold text-stone-900 text-base">Google OAuth Configuration</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-stone-600 leading-relaxed">
              <p>
                To complete real Google authentication without mock data, configure your Google Cloud Web Client:
              </p>

              <ol className="list-decimal pl-4 space-y-2">
                <li>
                  Open{' '}
                  <a
                    href="https://console.cloud.google.com/apis/credentials"
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-amber-700 hover:underline inline-flex items-center gap-0.5"
                  >
                    Google Cloud Console <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  Create an <strong>OAuth 2.0 Client ID</strong> (Web Application).
                </li>
                <li>
                  Under <strong>Authorized JavaScript origins</strong>, add:
                  <div className="mt-1 p-2 bg-stone-100 rounded-lg font-mono text-[11px] text-stone-800">
                    http://localhost:5173
                  </div>
                </li>
                <li>
                  Paste your Client ID into both environment files:
                  <div className="mt-1 p-2 bg-stone-100 rounded-lg font-mono text-[11px] text-stone-800 space-y-0.5">
                    <div>FRA_Frontend/.env: VITE_GOOGLE_CLIENT_ID=your_id</div>
                    <div>FRA_Backend/.env: GOOGLE_CLIENT_ID=your_id</div>
                  </div>
                </li>
              </ol>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
