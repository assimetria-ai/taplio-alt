/**
 * Error Boundary Components - Central Export
 * 
 * Import all error boundaries from a single location:
 * import { ErrorProvider, LazyErrorBoundary, ... } from './components/error-boundaries'
 */

export { default as ErrorBoundary } from '../ErrorBoundary'
export { default as SectionErrorBoundary } from '../SectionErrorBoundary'
export { default as AsyncErrorBoundary } from '../AsyncErrorBoundary'
export { default as LazyErrorBoundary } from '../LazyErrorBoundary'
export { default as FormErrorBoundary } from '../FormErrorBoundary'
export { default as NetworkErrorBoundary } from '../NetworkErrorBoundary'

export { 
  ErrorProvider, 
  useError, 
  withErrorLogging 
} from '../ErrorContext'

export {
  DefaultErrorFallback,
  MinimalErrorFallback,
  InlineErrorFallback,
} from '../ErrorFallback'

/**
 * Quick reference guide:
 * 
 * Basic error catching:
 *   <ErrorBoundary>...</ErrorBoundary>
 * 
 * Section isolation:
 *   <SectionErrorBoundary sectionName="Header">...</SectionErrorBoundary>
 * 
 * Async operations:
 *   <AsyncErrorBoundary onRetry={fetchData}>...</AsyncErrorBoundary>
 * 
 * Lazy loading:
 *   <LazyErrorBoundary>
 *     <LazyComponent />
 *   </LazyErrorBoundary>
 * 
 * Forms:
 *   <FormErrorBoundary onReset={resetForm}>...</FormErrorBoundary>
 * 
 * Network requests:
 *   <NetworkErrorBoundary maxRetries={3} autoRetryOnline>...</NetworkErrorBoundary>
 * 
 * Centralized tracking:
 *   <ErrorProvider>
 *     <App />
 *   </ErrorProvider>
 */
