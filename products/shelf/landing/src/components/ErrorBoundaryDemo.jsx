/**
 * Error Boundary Demo Components
 * Use these to test error boundaries during development
 * Remove or comment out in production
 */

import { useState } from 'react'

// Component that throws an error when clicked
export function ThrowErrorButton() {
  const [shouldThrow, setShouldThrow] = useState(false)

  if (shouldThrow) {
    throw new Error('Test error: This is a simulated component error!')
  }

  return (
    <button
      onClick={() => setShouldThrow(true)}
      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
    >
      Throw Error (Test Error Boundary)
    </button>
  )
}

// Component that simulates an async error
export function AsyncErrorButton() {
  const [loading, setLoading] = useState(false)

  const handleAsyncError = async () => {
    setLoading(true)
    // Simulate async operation that fails
    await new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Async operation failed!')), 1000)
    )
  }

  return (
    <button
      onClick={handleAsyncError}
      disabled={loading}
      className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
    >
      {loading ? 'Loading...' : 'Trigger Async Error'}
    </button>
  )
}

// Component that throws on first render
export function ImmediateErrorComponent() {
  throw new Error('This component always throws an error on render!')
}

// Demo showcase
export function ErrorBoundaryDemoSection() {
  return (
    <div className="bg-gray-100 p-8 my-8 rounded-lg">
      <h3 className="text-2xl font-bold mb-4">Error Boundary Demo</h3>
      <p className="text-gray-600 mb-6">
        Click the buttons below to test different error scenarios:
      </p>
      <div className="flex gap-4">
        <ThrowErrorButton />
        <AsyncErrorButton />
      </div>
      <div className="mt-4 text-sm text-gray-500">
        Note: Remove this section in production
      </div>
    </div>
  )
}

/**
 * Usage Example:
 * 
 * import SectionErrorBoundary from './SectionErrorBoundary'
 * import { ThrowErrorButton, ErrorBoundaryDemoSection } from './ErrorBoundaryDemo'
 * 
 * function TestPage() {
 *   return (
 *     <>
 *       <SectionErrorBoundary sectionName="Demo Section">
 *         <ErrorBoundaryDemoSection />
 *       </SectionErrorBoundary>
 *       
 *       <SectionErrorBoundary sectionName="Button Section">
 *         <ThrowErrorButton />
 *       </SectionErrorBoundary>
 *     </>
 *   )
 * }
 */
