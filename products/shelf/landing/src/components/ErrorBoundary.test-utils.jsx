/**
 * Error Boundary Test Utilities
 * Helper functions for testing components with error boundaries
 */

import React from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import SectionErrorBoundary from './SectionErrorBoundary'
import AsyncErrorBoundary from './AsyncErrorBoundary'
import { DefaultErrorFallback, MinimalErrorFallback } from './ErrorFallback'

/**
 * Wraps a component with a root-level error boundary for testing
 * @param {React.Component} Component - Component to wrap
 * @param {Object} options - Error boundary options
 * @returns {React.Component} Wrapped component
 */
export function withErrorBoundary(Component, options = {}) {
  const {
    onError = console.error,
    FallbackComponent = DefaultErrorFallback,
    ...restProps
  } = options

  return function WrappedComponent(props) {
    return (
      <ErrorBoundary
        FallbackComponent={FallbackComponent}
        onError={onError}
        {...restProps}
      >
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}

/**
 * Wraps a component with a section error boundary for testing
 * @param {React.Component} Component - Component to wrap
 * @param {string} sectionName - Name of the section
 * @returns {React.Component} Wrapped component
 */
export function withSectionErrorBoundary(Component, sectionName = 'Test Section') {
  return function WrappedComponent(props) {
    return (
      <SectionErrorBoundary sectionName={sectionName}>
        <Component {...props} />
      </SectionErrorBoundary>
    )
  }
}

/**
 * Wraps a component with an async error boundary for testing
 * @param {React.Component} Component - Component to wrap
 * @param {Function} onRetry - Retry handler
 * @returns {React.Component} Wrapped component
 */
export function withAsyncErrorBoundary(Component, onRetry = null) {
  return function WrappedComponent(props) {
    return (
      <AsyncErrorBoundary onRetry={onRetry}>
        <Component {...props} />
      </AsyncErrorBoundary>
    )
  }
}

/**
 * Creates a component that throws an error for testing
 * @param {string} errorMessage - Error message to throw
 * @returns {React.Component} Component that throws
 */
export function createThrowingComponent(errorMessage = 'Test error') {
  return function ThrowingComponent() {
    throw new Error(errorMessage)
  }
}

/**
 * Creates a component that throws an async error
 * @param {string} errorMessage - Error message to throw
 * @param {number} delay - Delay before throwing (ms)
 * @returns {React.Component} Component that throws asynchronously
 */
export function createAsyncThrowingComponent(errorMessage = 'Async test error', delay = 100) {
  return function AsyncThrowingComponent() {
    React.useEffect(() => {
      const timer = setTimeout(() => {
        throw new Error(errorMessage)
      }, delay)
      return () => clearTimeout(timer)
    }, [])

    return <div>Loading...</div>
  }
}

/**
 * Mock error logger for testing
 */
export class MockErrorLogger {
  constructor() {
    this.errors = []
  }

  log(error, errorInfo) {
    this.errors.push({ error, errorInfo, timestamp: Date.now() })
  }

  getErrors() {
    return this.errors
  }

  getLastError() {
    return this.errors[this.errors.length - 1]
  }

  clear() {
    this.errors = []
  }

  hasErrors() {
    return this.errors.length > 0
  }

  errorCount() {
    return this.errors.length
  }
}

/**
 * Suppress console errors during testing
 * Useful when testing error boundaries to avoid cluttering test output
 */
export function suppressConsoleError(callback) {
  const originalError = console.error
  console.error = () => {} // Suppress errors

  try {
    callback()
  } finally {
    console.error = originalError // Restore
  }
}

/**
 * Example usage in tests:
 * 
 * ```jsx
 * import { render } from '@testing-library/react'
 * import { withErrorBoundary, createThrowingComponent, MockErrorLogger } from './ErrorBoundary.test-utils'
 * 
 * test('error boundary catches component errors', () => {
 *   const logger = new MockErrorLogger()
 *   const ThrowingComponent = createThrowingComponent('Test error')
 *   const WrappedComponent = withErrorBoundary(ThrowingComponent, {
 *     onError: logger.log.bind(logger)
 *   })
 *   
 *   render(<WrappedComponent />)
 *   
 *   expect(logger.hasErrors()).toBe(true)
 *   expect(logger.getLastError().error.message).toBe('Test error')
 * })
 * ```
 */
