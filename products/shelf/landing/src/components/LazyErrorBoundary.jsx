import { Component, Suspense } from 'react'

/**
 * Lazy Loading Error Boundary
 * Handles errors from dynamically imported components (React.lazy)
 * Provides fallback UI for loading states and errors
 */
class LazyErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      isChunkError: false,
    }
  }

  static getDerivedStateFromError(error) {
    // Check if it's a chunk loading error (common with React.lazy)
    const isChunkError = 
      error.name === 'ChunkLoadError' ||
      error.message?.includes('Loading chunk') ||
      error.message?.includes('Failed to fetch dynamically imported module')

    return { 
      hasError: true,
      isChunkError 
    }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Lazy Loading Error:', error, errorInfo)
    this.setState({ error })

    // Log to error tracking
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  handleReload = () => {
    // For chunk errors, reload the page to get fresh chunks
    if (this.state.isChunkError) {
      window.location.reload()
    } else {
      this.setState({ hasError: false, error: null, isChunkError: false })
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-[300px] bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="text-center max-w-md">
            <svg
              className="mx-auto h-10 w-10 text-blue-500 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {this.state.isChunkError ? 'Update Available' : 'Failed to Load Component'}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {this.state.isChunkError
                ? 'A newer version of this page is available. Please reload to continue.'
                : 'The component failed to load. This might be due to a network issue.'}
            </p>
            <button
              onClick={this.handleReload}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {this.state.isChunkError ? 'Reload Page' : 'Try Again'}
            </button>
          </div>
        </div>
      )
    }

    // Wrap children in Suspense with loading fallback
    return (
      <Suspense
        fallback={
          this.props.loadingFallback || (
            <div className="flex items-center justify-center min-h-[300px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Loading...</p>
              </div>
            </div>
          )
        }
      >
        {this.props.children}
      </Suspense>
    )
  }
}

export default LazyErrorBoundary
