import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = 'info', duration = 4000) => {
      const id = Date.now() + Math.random().toString(36).substring(2, 5);
      const newToast = { id, message, type };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}

      {/* Floating Toast Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl shadow-lg border transition-all animate-slide-in ${
                isSuccess
                  ? 'bg-stone-900/95 text-stone-100 border-emerald-500/40 shadow-emerald-950/20'
                  : isError
                  ? 'bg-stone-900/95 text-stone-100 border-rose-500/40 shadow-rose-950/20'
                  : 'bg-stone-900/95 text-stone-100 border-amber-500/40 shadow-amber-950/20'
              } backdrop-blur-md`}
            >
              <div className="flex items-center gap-2.5 text-sm">
                {isSuccess && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                )}
                {isError && (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                {!isSuccess && !isError && (
                  <Info className="w-4 h-4 text-amber-400 shrink-0" />
                )}
                <span className="font-medium text-stone-200">{toast.message}</span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-stone-400 hover:text-stone-100 transition-colors p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
