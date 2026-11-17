import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ExplorerCard, ExplorerButton } from './UiCore';
import { RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-amber-50 flex items-center justify-center p-6">
          <ExplorerCard className="max-w-md w-full text-center">
            <div className="text-8xl mb-6">🩹</div>
            <h2 className="text-3xl font-black text-amber-950 mb-2 tracking-tight">Oops! Something wobbled.</h2>
            <p className="text-stone-500 font-bold mb-8">
              Barnaby Bear is working on fixing this. Let's try refreshing the page!
            </p>

            <div className="flex flex-col gap-3">
              <ExplorerButton variant="primary" onClick={this.handleReset} fullWidth>
                <RefreshCw className="w-5 h-5" />
                <span>Try Again</span>
              </ExplorerButton>

              <button
                onClick={() => window.location.href = '/'}
                className="text-stone-400 font-bold text-sm flex items-center justify-center gap-2 hover:text-stone-600 transition-colors"
              >
                <Home className="w-4 h-4" />
                Back to Safety
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <div className="mt-8 p-4 bg-rose-50 border border-rose-100 rounded-xl text-left overflow-auto max-h-32">
                <code className="text-[10px] text-rose-800 leading-tight">
                  {this.state.error?.toString()}
                </code>
              </div>
            )}
          </ExplorerCard>
        </div>
      );
    }

    return this.props.children;
  }
}
