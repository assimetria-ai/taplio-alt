import { Component } from 'react'

/**
 * Network Error Boundary
 * Specialized for handling network-related errors
 * Features:
 * - Detects offline/online status
 * - Provides smart retry with exponential backoff
 * - Shows appropriate UI for different network conditions
 */
class NetworkErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      isOnline: navigator.onLine,
      retryCount: 0,
      isRetrying: false,
    }
    
    this.maxRetries = props.maxRetries || 3
    this.retryDelay = props.retryDelay || 1000
  }

  static getDerivedStateFromError(error) {
    // Check if it's a network-related error
    const isNetworkError = 
      error.name === 'NetworkError' ||
      error.message?.toLowerCase().includes('network') ||
      error.message?.toLowerCase().includes('fetch') ||
      error.message?.toLowerCase().includes('timeout') ||
      error instanceof TypeError && error.message.includes('Failed to fetch')

    return {
      hasError: isNetworkError,
    }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Network Error:', error, errorInfo)
    this.setState({ error })

    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  componentDidMount() {
    // Listen for online/offline events
    window.addEventListener('online', this.handleOnline)
    window.addEventListener('offline', this.handleOffline)
  }

  componentWillUnmount() {
    window.removeEventListener('online', this.handleOnline)
    window.removeEventListener('offline', this.handleOffline)
  }

  handleOnline = () => {
    this.setState({ isOnline: true })
    
    // Auto-retry when coming back online
    if (this.state.hasError && this.props.autoRetryOnline) {
      this.handleRetry()
    }
  }

  handleOffline = () => {
    this.setState({ isOnline: false })
  }

  handleRetry = async () => {
    if (this.state.retryCount >= this.maxRetries) {
      console.warn('Max retry attempts reached')
      return
    }

    this.setState({ isRetrying: true })

    try {
      // Exponential backoff: delay * 2^retryCount
      const delay = this.retryDelay * Math.pow(2, this.state.retryCount)
      await new Promise(resolve => setTimeout(resolve, delay))

      // Call retry handler if provided
      if (this.props.onRetry) {
        await this.props.onRetry()
      }

      // Success - reset error state
      this.setState({
        hasError: false,
        error: null,
        retryCount: 0,
        isRetrying: false,
      })
    } catch (error) {
      console.error('Retry failed:', error)
      this.setState({
        error,
        retryCount: this.state.retryCount + 1,
        isRetrying: false,
      })
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      retryCount: 0,
      isRetrying: false,
    })

    if (this.props.onReset) {
      this.props.onReset()
    }
  }

  render() {
    if (this.state.hasError) {
      const canRetry = this.state.retryCount < this.maxRetries
      const { isOnline, isRetrying, retryCount } = this.state

      return (
        <div className="flex items-center justify-center min-h-[200px] bg-orange-50 border border-orange-200 rounded-lg p-6">
          <div className="text-center max-w-md">
            {/* Icon */}
            <svg
              className="mx-auto h-10 w-10 text-orange-500 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isOnline ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
                />
              )}
            </svg>

            {/* Status Badge */}
            <div className="mb-3">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  isOnline 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}
              >
                <span
                  className={`w-2 h-2 mr-1 rounded-full ${
                    isOnline ? 'bg-green-400' : 'bg-red-400'
                  }`}
                />
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>

            {/* Title and Message */}
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {isOnline ? 'Connection Issue' : 'No Internet Connection'}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {isOnline
                ? this.state.error?.message || 'Unable to complete the request. Please try again.'
                : 'Please check your internet connection and try again.'}
            </p>

            {/* Retry Info */}
            {retryCount > 0 && (
              <p className="text-xs text-gray-500 mb-4">
                Retry attempt {retryCount} of {this.maxRetries}
              </p>
            )}

            {/* Actions */}
            <div className="flex items-center justify-center gap-3">
              {canRetry && (
                <button
                  onClick={this.handleRetry}
                  disabled={isRetrying || !isOnline}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRetrying ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Retrying...
                    </>
                  ) : (
                    'Try Again'
                  )}
                </button>
              )}
              
              <button
                onClick={this.handleReset}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default NetworkErrorBoundary
