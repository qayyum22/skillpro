'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to our server
    this.logErrorToServer(error, errorInfo);
  }

  logErrorToServer = async (error: Error, errorInfo: ErrorInfo) => {
    try {
      const user = localStorage.getItem('user') 
        ? JSON.parse(localStorage.getItem('user') || '{}')
        : null;
      
      await fetch('/api/log-client-error', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          error: {
            message: error.message,
            name: error.name,
            stack: error.stack,
          },
          componentStack: errorInfo.componentStack,
          url: window.location.href,
          userId: user?.uid,
          userEmail: user?.email,
        }),
      });
    } catch (e) {
      // If logging failed, just log to console as fallback
      console.error('Failed to log error to server:', e);
    }
  };

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.fallback || (
        <div className="p-6 max-w-lg mx-auto my-8 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">Something went wrong</h2>
          <p className="text-gray-700 mb-4">
            We've logged this error and our team is working to fix it.
          </p>
          <p className="text-gray-500 text-sm mb-4">
            Error: {this.state.error?.message || 'Unknown error'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Reload page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 