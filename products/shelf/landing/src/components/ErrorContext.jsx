import { createContext, useContext, useCallback, useState, useEffect } from 'react'

/**
 * Error Context for Centralized Error Tracking
 * 
 * Features:
 * - Tracks all errors across the application
 * - Provides error history and statistics
 * - Integrates with analytics/monitoring services
 * - Supports custom error handlers and transformers
 * 
 * Usage:
 * ```jsx
 * import { ErrorProvider, useError } from './ErrorContext'
 * 
 * // Wrap your app
 * <ErrorProvider>
 *   <App />
 * </ErrorProvider>
 * 
 * // Use in components
 * const { logError, errors, clearErrors } = useError()
 * ```
 */

const ErrorContext = createContext(null)

export function ErrorProvider({ 
  children, 
  maxErrors = 50,
  onError,
  enableAnalytics = false,
}) {
  const [errors, setErrors] = useState([])
  const [errorStats, setErrorStats] = useState({
    total: 0,
    byType: {},
    byComponent: {},
  })

  // Log error to context
  const logError = useCallback((error, metadata = {}) => {
    const errorEntry = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      message: error.message || String(error),
      stack: error.stack,
      name: error.name || 'Error',
      type: metadata.type || 'unknown',
      component: metadata.component || 'unknown',
      severity: metadata.severity || 'error',
      metadata,
      userAgent: navigator.userAgent,
      url: window.location.href,
    }

    setErrors(prev => {
      const updated = [errorEntry, ...prev].slice(0, maxErrors)
      return updated
    })

    // Update statistics
    setErrorStats(prev => ({
      total: prev.total + 1,
      byType: {
        ...prev.byType,
        [errorEntry.type]: (prev.byType[errorEntry.type] || 0) + 1,
      },
      byComponent: {
        ...prev.byComponent,
        [errorEntry.component]: (prev.byComponent[errorEntry.component] || 0) + 1,
      },
    }))

    // Call external error handler
    if (onError) {
      onError(errorEntry)
    }

    // Send to analytics if enabled
    if (enableAnalytics) {
      sendToAnalytics(errorEntry)
    }

    console.error('Error logged:', errorEntry)
  }, [maxErrors, onError, enableAnalytics])

  // Clear all errors
  const clearErrors = useCallback(() => {
    setErrors([])
  }, [])

  // Clear specific error
  const clearError = useCallback((errorId) => {
    setErrors(prev => prev.filter(e => e.id !== errorId))
  }, [])

  // Get errors by filter
  const getErrorsByType = useCallback((type) => {
    return errors.filter(e => e.type === type)
  }, [errors])

  const getErrorsByComponent = useCallback((component) => {
    return errors.filter(e => e.component === component)
  }, [errors])

  // Global error handler
  useEffect(() => {
    const handleWindowError = (event) => {
      logError(event.error || new Error(event.message), {
        type: 'uncaught',
        component: 'window',
        severity: 'critical',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      })
    }

    const handleUnhandledRejection = (event) => {
      logError(event.reason || new Error('Unhandled Promise Rejection'), {
        type: 'unhandled-rejection',
        component: 'promise',
        severity: 'error',
      })
    }

    window.addEventListener('error', handleWindowError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleWindowError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [logError])

  const value = {
    errors,
    errorStats,
    logError,
    clearErrors,
    clearError,
    getErrorsByType,
    getErrorsByComponent,
  }

  return (
    <ErrorContext.Provider value={value}>
      {children}
    </ErrorContext.Provider>
  )
}

// Hook to use error context
export function useError() {
  const context = useContext(ErrorContext)
  if (!context) {
    throw new Error('useError must be used within ErrorProvider')
  }
  return context
}

// Helper function to send errors to analytics
function sendToAnalytics(errorEntry) {
  // Example integrations:
  
  // Sentry
  // if (window.Sentry) {
  //   window.Sentry.captureException(new Error(errorEntry.message), {
  //     tags: {
  //       type: errorEntry.type,
  //       component: errorEntry.component,
  //     },
  //     extra: errorEntry.metadata,
  //   })
  // }

  // Google Analytics 4
  // if (window.gtag) {
  //   window.gtag('event', 'exception', {
  //     description: errorEntry.message,
  //     fatal: errorEntry.severity === 'critical',
  //   })
  // }

  // LogRocket
  // if (window.LogRocket) {
  //   window.LogRocket.captureException(new Error(errorEntry.message), {
  //     tags: {
  //       type: errorEntry.type,
  //       component: errorEntry.component,
  //     },
  //   })
  // }

  // Custom endpoint
  // fetch('/api/errors', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(errorEntry),
  // }).catch(console.error)

  console.log('Would send to analytics:', errorEntry)
}

// HOC to wrap components with error logging
export function withErrorLogging(Component, componentName) {
  return function ErrorLoggedComponent(props) {
    const { logError } = useError()

    const handleError = (error, errorInfo) => {
      logError(error, {
        type: 'component',
        component: componentName || Component.displayName || Component.name,
        errorInfo,
      })
    }

    return (
      <ErrorBoundary onError={handleError}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}
