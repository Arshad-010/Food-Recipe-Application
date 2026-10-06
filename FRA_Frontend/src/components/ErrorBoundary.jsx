import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-stone-100 text-stone-800">
          <div className="max-w-lg w-full bg-white p-8 rounded-3xl shadow-xl border border-stone-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertCircle className="w-8 h-8 shrink-0" />
              <h2 className="text-xl font-bold">Something went wrong</h2>
            </div>
            <p className="text-sm text-stone-600">
              An unexpected error occurred while rendering this page:
            </p>
            <div className="p-3 bg-stone-900 text-rose-400 font-mono text-xs rounded-xl overflow-x-auto">
              {this.state.error?.toString() || 'Unknown error'}
            </div>
            {this.state.errorInfo?.componentStack && (
              <pre className="p-3 bg-stone-100 text-stone-700 font-mono text-[11px] rounded-xl overflow-x-auto max-h-40">
                {this.state.errorInfo.componentStack}
              </pre>
            )}
            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-semibold flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Page
              </button>
              <button
                type="button"
                onClick={this.handleReload}
                className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl text-sm font-semibold cursor-pointer"
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
