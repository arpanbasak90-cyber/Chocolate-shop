import React from 'react';
import { AlertCircle, RefreshCw, Home, ShieldAlert } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ZORA SHOP Runtime Error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetSession = () => {
    try {
      localStorage.removeItem('zora_auth_token');
      localStorage.removeItem('zora_auth_role');
      localStorage.removeItem('zora_cart');
    } catch (e) {
      // ignore
    }
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#1c0c07] flex flex-col items-center justify-center p-4 sm:p-6 text-cream-100 font-sans selection:bg-caramel-500 selection:text-white">
          <div className="max-w-md w-full bg-[#2c130b] border-2 border-[#522c1b] rounded-3xl p-6 sm:p-8 text-center shadow-2xl space-y-6">
            
            <div className="w-16 h-16 mx-auto rounded-3xl bg-[#3c1b11] border border-gold-500/30 flex items-center justify-center text-3xl shadow-lg">
              🍫
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-widest text-gold-400">
                Zora Shop • Recovery
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                Something Went Wrong
              </h1>
              <p className="text-xs text-caramel-200 leading-relaxed">
                An unexpected error occurred while loading this view. You can reload or reset your browsing session to recover.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3 rounded-2xl bg-black/40 border border-[#522c1b] text-left">
                <span className="text-[10px] font-mono text-stone-400 block uppercase tracking-wider mb-1">
                  Diagnostics:
                </span>
                <p className="text-xs font-mono text-red-300 break-words line-clamp-3">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-caramel-600 to-caramel-700 hover:from-caramel-500 hover:to-caramel-600 text-white font-bold text-xs tracking-wide shadow-md transition flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Page</span>
              </button>

              <button
                type="button"
                onClick={this.handleResetSession}
                className="flex-1 py-3 px-4 rounded-xl bg-[#3c1b11] hover:bg-[#4a2114] border border-gold-500/30 text-gold-300 hover:text-white font-bold text-xs tracking-wide shadow-md transition flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                <span>Reset Session</span>
              </button>
            </div>

            <div className="text-[11px] text-stone-400">
              Need assistance? WhatsApp support at <strong>+91 6289760577</strong>
            </div>

          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
