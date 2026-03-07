import { Component } from 'react'

/**
 * Form Error Boundary
 * Specialized error boundary for form components
 * Handles validation errors, submission errors, and field-level errors
 * Provides user-friendly error messages and recovery options
 */
class FormErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      isValidationError: false,
      isNetworkError: false,
      fieldErrors: {},
    }
  }

  static getDerivedStateFromError(error) {
    // Categorize error types
    const isValidationError = error.name === 'ValidationError' || 
                              error.message?.includes('validation')
    
    const isNetworkError = error.name === 'NetworkError' ||
                          error.message?.includes('fetch') ||
                          error.message?.includes('network')

    return {
      hasError: true,
      isValidationError,
      isNetworkError,
    }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Form Error:', error, errorInfo)
    this.setState({ error })

    // Extract field-level errors if available
    if (error.fields) {
      this.setState({ fieldErrors: error.fields })
    }

    // Log to error tracking
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      isValidationError: false,
      isNetworkError: false,
      fieldErrors: {},
    })

    // Call parent reset handler if provided
    if (this.props.onReset) {
      this.props.onReset()
    }
  }

  getErrorMessage() {
    const { error, isValidationError, isNetworkError } = this.state

    if (isValidationError) {
      return 'Please check your input and try again.'
    }

    if (isNetworkError) {
      return 'Unable to submit form. Please check your connection and try again.'
    }

    return error?.message || 'An error occurred while processing your form.'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div 
          role="alert" 
          className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4"
          aria-live="assertive"
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-red-800">
                {this.state.isValidationError 
                  ? 'Validation Error' 
                  : this.state.isNetworkError 
                  ? 'Connection Error'
                  : 'Form Error'}
              </h3>
              <p className="mt-1 text-sm text-red-700">
                {this.getErrorMessage()}
              </p>

              {/* Field-level errors */}
              {Object.keys(this.state.fieldErrors).length > 0 && (
                <ul className="mt-2 text-sm text-red-600 list-disc list-inside">
                  {Object.entries(this.state.fieldErrors).map(([field, message]) => (
                    <li key={field}>
                      <strong>{field}:</strong> {message}
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-4 flex gap-3">
                <button
                  onClick={this.handleReset}
                  className="text-sm font-medium text-red-800 hover:text-red-900 underline"
                >
                  Dismiss
                </button>
                {this.state.isNetworkError && (
                  <button
                    onClick={() => window.location.reload()}
                    className="text-sm font-medium text-red-800 hover:text-red-900 underline"
                  >
                    Reload Page
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default FormErrorBoundary
