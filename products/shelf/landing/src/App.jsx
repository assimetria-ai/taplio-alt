import { ErrorBoundary } from 'react-error-boundary'
import { DefaultErrorFallback } from './components/ErrorFallback'
import { LandingPage } from './components/LandingPage'

/**
 * Root App Component with Top-Level Error Boundary
 * 
 * Error Boundary Strategy:
 * 1. Root-level ErrorBoundary catches all uncaught errors
 * 2. Section-level boundaries isolate errors to specific UI sections
 * 3. Async boundaries handle promise rejections and data fetching errors
 * 
 * This multi-layered approach ensures the app remains usable even when errors occur
 */
export default function App() {
  const handleError = (error, errorInfo) => {
    // Log to error tracking service (e.g., Sentry, LogRocket)
    console.error('Application Error:', error)
    console.error('Error Info:', errorInfo)
    
    // In production, send to error tracking service:
    // trackError(error, errorInfo)
  }

  const handleReset = () => {
    // Clear any error state, reset app state if needed
    console.log('Resetting application after error')
    
    // In production, you might want to:
    // - Clear local storage
    // - Reset Redux/Zustand state
    // - Redirect to home page
  }

  return (
    <ErrorBoundary
      FallbackComponent={DefaultErrorFallback}
      onError={handleError}
      onReset={handleReset}
      resetKeys={['route']} // Reset when route changes
    >
      <LandingPage />
    </ErrorBoundary>
  )
}
