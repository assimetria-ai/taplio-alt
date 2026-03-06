import { Component } from 'react'

/**
 * Async Error Boundary
 * Handles errors from async operations (promises, fetch, etc.)
 * Wraps components that make async calls
 */
class AsyncErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      isLoading: false,
    }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Async Error Boundary caught an error:', error, errorInfo)
    this.setState({ error, isLoading: false })

    // Log to error tracking service
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  componentDidMount() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', this.handlePromiseRejection)
  }

  componentWillUnmount() {
    window.removeEventListener('unhandledrejection', this.handlePromiseRejection)
  }

  handlePromiseRejection = (event) => {
    // Prevent default error handling
    event.preventDefault()
    
    console.error('Unhandled promise rejection:', event.reason)
    this.setState({
      hasError: true,
      error: event.reason,
      isLoading: false,
    })
  }

  handleRetry = async () => {
    this.setState({ hasError: false, error: null, isLoading: true })
    
    try {
      if (this.props.onRetry) {
        await this.props.onRetry()
      }
      this.setState({ isLoading: false })
    } catch (error) {
      this.setState({
        hasError: true,
        error,
        isLoading: false,
      })
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-[200px] bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="text-center max-w-md">
            <svg
              className="mx-auto h-10 w-10 text-yellow-500 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Failed to Load Data
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {this.state.error?.message || 'An error occurred while loading the data. Please try again.'}
            </p>
            <button
              onClick={this.handleRetry}
              disabled={this.state.isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {this.state.isLoading ? (
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
          </div>
        </div>
      )
    }

    if (this.state.isLoading) {
      return (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      )
    }

    return this.props.children
  }
}

export default AsyncErrorBoundary
