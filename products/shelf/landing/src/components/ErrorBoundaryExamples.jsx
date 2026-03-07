import { lazy } from 'react'
import { ErrorProvider, useError } from './ErrorContext'
import LazyErrorBoundary from './LazyErrorBoundary'
import FormErrorBoundary from './FormErrorBoundary'
import NetworkErrorBoundary from './NetworkErrorBoundary'
import SectionErrorBoundary from './SectionErrorBoundary'

/**
 * Error Boundary Usage Examples
 * 
 * This file demonstrates how to use the different error boundaries
 * in various scenarios for context-aware error handling
 */

// Example 1: Lazy Loading with Error Boundary
const LazyComponent = lazy(() => import('./SomeLazyComponent'))

export function LazyLoadingExample() {
  return (
    <LazyErrorBoundary
      loadingFallback={<div>Loading component...</div>}
      onError={(error) => console.error('Lazy load failed:', error)}
    >
      <LazyComponent />
    </LazyErrorBoundary>
  )
}

// Example 2: Form with Error Boundary
export function FormExample() {
  const handleSubmit = async (e) => {
    e.preventDefault()
    // Form submission logic
    throw new Error('Simulated form error')
  }

  return (
    <FormErrorBoundary
      onError={(error) => console.error('Form error:', error)}
      onReset={() => console.log('Form reset')}
    >
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Name" />
        <input type="email" placeholder="Email" />
        <button type="submit">Submit</button>
      </form>
    </FormErrorBoundary>
  )
}

// Example 3: Network Request with Error Boundary
export function NetworkRequestExample() {
  const fetchData = async () => {
    const response = await fetch('https://api.example.com/data')
    if (!response.ok) throw new Error('Network request failed')
    return response.json()
  }

  return (
    <NetworkErrorBoundary
      maxRetries={3}
      retryDelay={1000}
      autoRetryOnline={true}
      onRetry={fetchData}
    >
      <DataComponent />
    </NetworkErrorBoundary>
  )
}

function DataComponent() {
  // Component that makes network requests
  return <div>Data content</div>
}

// Example 4: Section-level Error Isolation
export function DashboardExample() {
  return (
    <div className="dashboard">
      {/* Each section has its own error boundary */}
      <SectionErrorBoundary sectionName="Header">
        <Header />
      </SectionErrorBoundary>

      <SectionErrorBoundary sectionName="Statistics">
        <StatisticsPanel />
      </SectionErrorBoundary>

      <SectionErrorBoundary sectionName="Activity Feed">
        <ActivityFeed />
      </SectionErrorBoundary>
    </div>
  )
}

function Header() {
  return <header>Dashboard Header</header>
}

function StatisticsPanel() {
  return <div>Statistics</div>
}

function ActivityFeed() {
  return <div>Activity Feed</div>
}

// Example 5: Nested Error Boundaries with Context
export function CompleteExample() {
  return (
    <ErrorProvider 
      maxErrors={100}
      enableAnalytics={true}
      onError={(error) => {
        // Custom error handler
        console.log('Error tracked:', error)
      }}
    >
      {/* Network boundary at the top level */}
      <NetworkErrorBoundary maxRetries={3} autoRetryOnline={true}>
        {/* Section boundaries for individual sections */}
        <div className="app-layout">
          <SectionErrorBoundary sectionName="Navigation">
            <Navigation />
          </SectionErrorBoundary>

          <main>
            <SectionErrorBoundary sectionName="Content">
              {/* Form boundary for forms */}
              <FormErrorBoundary>
                <ContactForm />
              </FormErrorBoundary>

              {/* Lazy boundary for code-split components */}
              <LazyErrorBoundary>
                <LazyFeature />
              </LazyErrorBoundary>
            </SectionErrorBoundary>
          </main>

          <SectionErrorBoundary sectionName="Footer">
            <Footer />
          </SectionErrorBoundary>
        </div>
      </NetworkErrorBoundary>

      {/* Error Dashboard (dev mode) */}
      <ErrorDashboard />
    </ErrorProvider>
  )
}

function Navigation() {
  return <nav>Navigation</nav>
}

function ContactForm() {
  return (
    <form>
      <input type="text" placeholder="Your message" />
      <button type="submit">Send</button>
    </form>
  )
}

const LazyFeature = lazy(() => Promise.resolve({ default: () => <div>Lazy Feature</div> }))

function Footer() {
  return <footer>Footer</footer>
}

// Example 6: Error Dashboard (for development)
function ErrorDashboard() {
  const { errors, errorStats, clearErrors } = useError()

  // Only show in development
  if (process.env.NODE_ENV !== 'development' || errors.length === 0) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 max-w-md bg-white shadow-lg rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">
          Error Log ({errors.length})
        </h3>
        <button
          onClick={clearErrors}
          className="text-xs text-gray-600 hover:text-gray-900"
        >
          Clear
        </button>
      </div>

      <div className="text-xs text-gray-600 mb-3">
        <div>Total: {errorStats.total}</div>
        <div>Types: {Object.keys(errorStats.byType).join(', ')}</div>
      </div>

      <div className="max-h-48 overflow-y-auto space-y-2">
        {errors.map((error) => (
          <div
            key={error.id}
            className="text-xs bg-red-50 border border-red-200 rounded p-2"
          >
            <div className="font-semibold text-red-900">{error.name}</div>
            <div className="text-red-700">{error.message}</div>
            <div className="text-red-600 mt-1">
              {error.component} | {error.type}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Best Practices:
 * 
 * 1. Use ErrorProvider at the root level for centralized tracking
 * 
 * 2. Layer error boundaries by context:
 *    - NetworkErrorBoundary: for data-fetching layers
 *    - FormErrorBoundary: around forms
 *    - LazyErrorBoundary: for code-split routes/components
 *    - SectionErrorBoundary: for independent UI sections
 * 
 * 3. Provide meaningful context in error metadata
 * 
 * 4. Configure retry strategies based on error type
 * 
 * 5. Use error statistics to identify problem areas
 * 
 * 6. Integrate with monitoring services in production
 * 
 * 7. Show user-friendly messages while logging technical details
 */
